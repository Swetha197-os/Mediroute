from fastapi import FastAPI, Depends, HTTPException, status, Body, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text, or_
from datetime import datetime, timedelta
import models, schemas, auth, database
import sys, os, shutil, requests
from typing import List, Optional
from math import radians, sin, cos, sqrt, atan2
from dotenv import load_dotenv

load_dotenv()

# Paths
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ai_models")))
try:
    import engine as ai_engine
except ImportError:
    print("[SYS WARNING] AI engine not found, using fallback")
    class ai_engine:
        @staticmethod
        def predict_severity(s, a, t): return "medium", 5.0

app = FastAPI(title="MediRoute AI API")

# Ensure CORS is added immediately after app initialization
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://mediroute-navy.vercel.app",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# HELPER FUNCTIONS
def calculate_distance(lat1, lon1, lat2, lon2):
    try:
        if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
            return 999.0

        lat1 = float(lat1)
        lon1 = float(lon1)
        lat2 = float(lat2)
        lon2 = float(lon2)

        R = 6371

        dlat = radians(lat2 - lat1)
        dlon = radians(lon2 - lon1)

        a = (
            sin(dlat / 2) ** 2
            + cos(radians(lat1))
            * cos(radians(lat2))
            * sin(dlon / 2) ** 2
        )

        return R * (2 * atan2(sqrt(a), sqrt(1 - a)))

    except Exception as e:
        print(f"[DISTANCE ERROR] {e}")
        return 999.0

# DEPENDENCIES
def get_current_user(token: str = Depends(auth.oauth2_scheme), db: Session = Depends(database.get_db)):
    payload = auth.decode_access_token(token)
    if not payload: raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(models.User).filter(models.User.id == payload.get("id")).first()
    if not user: raise HTTPException(status_code=401, detail="User not found")
    return user

# SEED DATA
def seed_hospitals(db: Session):
    if db.query(models.Hospital).count() == 0:
        h_data = [
            {"name": "Apollo Hospitals Chennai", "lat": 13.0632, "lng": 80.2517, "addr": "Greams Road, Chennai"},
            {"name": "MIOT International Chennai", "lat": 13.0213, "lng": 80.1852, "addr": "Mount Poonamallee Road, Chennai"},
            {"name": "Kauvery Hospital Chennai", "lat": 13.0337, "lng": 80.2565, "addr": "Alwarpet, Chennai"},
            {"name": "Govt Villupuram Medical College", "lat": 11.9401, "lng": 79.4861, "addr": "Mundiyampakkam, Villupuram"},
            {"name": "JIPMER Puducherry", "lat": 11.9535, "lng": 79.7983, "addr": "Dhanvantari Nagar, Puducherry"}
        ]
        for item in h_data:
            email = f"{item['name'].lower().replace(' ', '_')}@hospital.com"
            user = db.query(models.User).filter(models.User.email == email).first()
            if not user:
                user = models.User(email=email, full_name=item['name'], hashed_password=auth.get_password_hash("hospital123"), role="hospital")
                db.add(user); db.commit(); db.refresh(user)
            
            h = db.query(models.Hospital).filter(models.Hospital.user_id == user.id).first()
            if not h:
                h = models.Hospital(user_id=user.id, name=item["name"], latitude=item["lat"], longitude=item["lng"], address=item["addr"])
                db.add(h); db.commit(); db.refresh(h)
                if not h.resources:
                    db.add(models.HospitalResource(hospital_id=h.id)); db.commit()

# --- HEALTH & DIAGNOSTICS ---
@app.get("/health")
def health(db: Session = Depends(database.get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "server": "MediRoute AI"}
    except Exception as e: return {"status": "error", "detail": str(e)}

# --- AUTH ROUTES ---
@app.post("/auth/login")
def login(form: schemas.UserLogin, db: Session = Depends(database.get_db)):
    seed_hospitals(db)
    user = db.query(models.User).filter(models.User.email == form.email).first()
    if not user or not auth.verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = auth.create_access_token(data={"sub": user.email, "role": user.role, "id": user.id})
    return {"access_token": token, "token_type": "bearer", "role": user.role, "user_id": user.id, "name": user.full_name}

@app.post("/auth/register")
def register(data: schemas.UserRegister, db: Session = Depends(database.get_db)):
    existing = db.query(models.User).filter(models.User.email == data.email).first()
    if existing: raise HTTPException(status_code=400, detail="Email already registered")
    hashed = auth.get_password_hash(data.password)
    user = models.User(email=data.email, full_name=data.full_name, hashed_password=hashed, role=data.role)
    db.add(user); db.commit(); db.refresh(user)
    
    if data.role == "patient":
        db.add(models.Patient(user_id=user.id, contact_number=data.phone or "", blood_group=data.blood_group or "Unknown", address=data.address or ""))
    elif data.role == "hospital":
        h = models.Hospital(user_id=user.id, name=data.hospital_name or data.full_name, address=data.address or "Unknown Location", latitude=13.0827, longitude=80.2707)
        db.add(h); db.commit(); db.refresh(h)
        db.add(models.HospitalResource(hospital_id=h.id))
    
    db.commit()
    token = auth.create_access_token(data={"sub": user.email, "role": user.role, "id": user.id})
    return {"access_token": token, "token_type": "bearer", "role": user.role, "user_id": user.id, "name": user.full_name}

@app.get("/auth/me")
@app.get("/me")
def auth_me(current_user: models.User = Depends(get_current_user)): 
    print(f"[API RESPONSE] 200 /auth/me - {current_user.email}")
    return {
        "id": current_user.id,
        "name": current_user.full_name,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role
    }

# --- HOSPITAL DISCOVERY ---
@app.get("/hospitals/nearby")
def get_nearby_hospitals(lat: float, lng: float, radius: float = 50, db: Session = Depends(database.get_db)):
    # 1. Force seed if empty
    if db.query(models.Hospital).count() == 0: seed_hospitals(db)
    
    hospitals = db.query(models.Hospital).all()
    print(f"[HOSPITAL DISCOVERY] Center: {lat},{lng}, Radius: {radius}km, DB Total: {len(hospitals)}")
    
    results = []
    for h in hospitals:
        d = calculate_distance(lat, lng, h.latitude, h.longitude)
        if d == 999.0: continue
        
        # STRICT RADIUS FILTERING (radius 0 means no limit)
        if radius > 0 and d > radius:
            continue
            
        res = h.resources
        if not res:
            res = models.HospitalResource(hospital_id=h.id)
            db.add(res); db.commit(); db.refresh(res)
        
        data = {
            "id": h.id, "name": h.name, "address": h.address, "latitude": h.latitude, "longitude": h.longitude,
            "available_beds": res.available_beds, "total_beds": res.total_beds,
            "available_icu": res.available_icu, "total_icu": res.total_icu,
            "available_ambulances": res.available_ambulances, "total_ambulances": res.total_ambulances,
            "wait_time": res.wait_time, 
            "distance": round(d, 2), 
            "distance_km": round(d, 2),
            "rating": h.rating, 
            "is_registered": True
        }
        results.append(data)
    
    results.sort(key=lambda x: x["distance"])
    print(f"[API RETURN] {len(results)} hospitals within {radius}km")
    return results

# --- PATIENT SERVICES ---
@app.get("/patient/health-profile", response_model=schemas.PatientHealthProfile)
def get_health(user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    p = db.query(models.Patient).filter(models.Patient.user_id == user.id).first()
    if not p:
        p = models.Patient(user_id=user.id, contact_number="", blood_group="Unknown")
        db.add(p); db.commit(); db.refresh(p)
    return {
        "full_name": user.full_name, "age": p.age, "gender": p.gender, "contact_number": p.contact_number,
        "blood_group": p.blood_group, "emergency_contact_name": p.emergency_contact_name,
        "emergency_contact_phone": p.emergency_contact_phone, "allergies": p.allergies,
        "existing_conditions": p.existing_conditions, "current_medications": p.current_medications
    }

@app.put("/patient/health-profile")
def update_health(data: schemas.PatientHealthProfile, user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    p = db.query(models.Patient).filter(models.Patient.user_id == user.id).first()
    user.full_name = data.full_name
    for k, v in data.dict().items():
        if k != "full_name": setattr(p, k, v)
    db.commit()
    return {"status": "ok"}

# --- EMERGENCY WORKFLOW ---
@app.post("/emergency/request")
def create_emergency_request(payload: dict, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    
    try:
        emergency = models.EmergencyRequest(
            patient_id=current_user.id,
            hospital_id=payload.get("hospital_id"),
            patient_name=payload.get("patient_name") or current_user.full_name or current_user.email,
            patient_age=payload.get("patient_age") or payload.get("age"),
            patient_phone=payload.get("patient_phone") or payload.get("phone"),
            symptoms=payload.get("symptoms", ""),
            emergency_type=payload.get("emergency_type", "General Emergency"),
            severity_level=payload.get("severity_level", "Medium"),
            urgency_score=float(payload.get("urgency_score", 5)),
            patient_lat=payload.get("patient_lat") or payload.get("latitude"),
            patient_lng=payload.get("patient_lng") or payload.get("longitude"),
            status="requested"
        )

        db.add(emergency)
        db.commit()
        db.refresh(emergency)

        print("[EMERGENCY SAVED]", emergency.id, emergency.patient_name, emergency.hospital_id)

        return {
            "id": emergency.id,
            "status": emergency.status,
            "hospital_id": emergency.hospital_id,
            "severity_level": emergency.severity_level
        }

    except Exception as e:
        db.rollback()
        print("[EMERGENCY REQUEST ERROR]", repr(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/emergency/queue")
def get_emergency_queue(user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    if user.role != "hospital": return []
    h = db.query(models.Hospital).filter(models.Hospital.user_id == user.id).first()
    if not h: return []
    requests = db.query(models.EmergencyRequest).filter(models.EmergencyRequest.hospital_id == h.id).order_by(models.EmergencyRequest.created_at.desc()).all()
    return [{
        "id": req.id, "patient_name": req.patient_name, "age": req.patient_age, "phone": req.patient_phone,
        "emergency_type": req.emergency_type, "symptoms": req.symptoms, "severity_level": req.severity_level,
        "status": req.status, "created_at": req.created_at.isoformat() if req.created_at else None
    } for req in requests]

@app.put("/emergency/request/{req_id}/status")
def update_status(req_id: int, payload: dict = Body(...), db: Session = Depends(database.get_db)):
    req = db.query(models.EmergencyRequest).filter(models.EmergencyRequest.id == req_id).first()
    if not req: raise HTTPException(status_code=404)
    req.status = payload.get("status")
    db.commit()
    return {"status": "updated", "current_status": req.status}

@app.get("/emergency/track/{req_id}")
def track_emergency(req_id: int, db: Session = Depends(database.get_db)):
    req = db.query(models.EmergencyRequest).filter(models.EmergencyRequest.id == req_id).first()
    return req if req else HTTPException(status_code=404)

# --- HOSPITAL SERVICES ---
@app.get("/hospitals/profile")
def get_hosp_profile(user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    h = db.query(models.Hospital).filter(models.Hospital.user_id == user.id).first()
    if not h: raise HTTPException(status_code=404)
    res = h.resources
    if not res:
        res = models.HospitalResource(hospital_id=h.id)
        db.add(res); db.commit(); db.refresh(res)
    
    data = {
        "id": h.id, "name": h.name, "address": h.address, "latitude": h.latitude, "longitude": h.longitude,
        "total_beds": res.total_beds, "available_beds": res.available_beds, "total_icu": res.total_icu,
        "available_icu": res.available_icu, "on_duty_staff": res.on_duty_staff, "total_ambulances": res.total_ambulances,
        "available_ambulances": res.available_ambulances, "wait_time": res.wait_time, "er_status": res.er_status
    }
    print(f"[PROFILE RESOURCE RETURN] {h.name}: {res.available_beds}/{res.total_beds} beds")
    return data

@app.put("/hospitals/resources")
def update_res(data: schemas.HospitalResourceBase, user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    h = db.query(models.Hospital).filter(models.Hospital.user_id == user.id).first()
    if not h: raise HTTPException(status_code=404)
    res = h.resources
    if not res:
        res = models.HospitalResource(hospital_id=h.id)
        db.add(res)
    
    for k, v in data.dict().items(): setattr(res, k, v)
    db.commit(); db.refresh(res)
    
    print(f"[RESOURCE UPDATE SAVED] hospital_id={h.id}, beds={res.available_beds}/{res.total_beds}, icu={res.available_icu}/{res.total_icu}, ambulances={res.available_ambulances}, wait={res.wait_time}")
    
    return get_hosp_profile(user, db)

# --- CHATBOT ---
@app.post("/chatbot/message")
def chat(data: schemas.ChatbotRequest, user: models.User = Depends(get_current_user)):
    msg = data.message.lower()
    if "emergency" in msg: return {"response": "I've detected an emergency. Please use the triage tool on your dashboard."}
    return {"response": f"Hello {user.full_name}, I'm MediRoute AI. I can help you with hospital discovery and emergency tracking."}

# models.Base.metadata.create_all(bind=database.engine)

@app.get("/")
def root():
    return {"status": "working"}

# render redeploy trigger

