from database import SessionLocal, engine
import models, auth
import datetime

def seed_data():
    db = SessionLocal()
    
    # Clear existing data - ONLY DO THIS IF NECESSARY
    # Base.metadata.drop_all(bind=engine)
    # Base.metadata.create_all(bind=engine)

    # 1. Create Baseline Users
    def create_user(email, name, pwd, role):
        existing = db.query(models.User).filter(models.User.email == email).first()
        if existing: return existing
        user = models.User(
            email=email,
            hashed_password=auth.get_password_hash(pwd),
            full_name=name,
            role=role
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    admin = create_user("admin@mediroute.ai", "Master Admin", "admin123", "admin")
    h1_user = create_user("st_judes@hospital.com", "St. Judes Medical", "hospital123", "hospital")
    h2_user = create_user("city_clinic@hospital.com", "City Center Clinic", "hospital123", "hospital")
    pat_user = create_user("alex@gmail.com", "Alex Johnson", "patient123", "patient")

    # 2. Create Patient Profile
    patient = db.query(models.Patient).filter(models.Patient.user_id == pat_user.id).first()
    if not patient:
        patient = models.Patient(user_id=pat_user.id, age=28, gender="Male", blood_group="O+", contact_number="+1 202-555-0144")
        db.add(patient)

    # 3. Create Hospitals and Resources
    hospitals_data = [
        {
            "user_id": h1_user.id,
            "name": "St. Judes Medical",
            "address": "400 E 34th St, New York, NY 10016",
            "lat": 40.7441, "lng": -73.9741,
            "rating": 4.9,
            "res": {
                "total_beds": 200, "available_beds": 142,
                "total_icu_beds": 40, "available_icu_beds": 12,
                "on_duty": 24, "ambulances": 5, "wait": 10
            }
        },
        {
            "user_id": h2_user.id,
            "name": "City Center Clinic",
            "address": "550 1st Ave, New York, NY 10016",
            "lat": 40.7423, "lng": -73.9735,
            "rating": 4.6,
            "res": {
                "total_beds": 150, "available_beds": 12,
                "total_icu_beds": 20, "available_icu_beds": 1,
                "on_duty": 8, "ambulances": 2, "wait": 45
            }
        }
    ]

    for h_data in hospitals_data:
        h = db.query(models.Hospital).filter(models.Hospital.name == h_data["name"]).first()
        if not h:
            h = models.Hospital(
                user_id=h_data["user_id"],
                name=h_data["name"],
                address=h_data["address"],
                latitude=h_data["lat"],
                longitude=h_data["lng"],
                rating=h_data["rating"]
            )
            db.add(h)
            db.commit()
            db.refresh(h)
            
            res = models.HospitalResource(
                hospital_id=h.id,
                total_beds=h_data["res"]["total_beds"],
                available_beds=h_data["res"]["available_beds"],
                total_icu_beds=h_data["res"]["total_icu_beds"],
                available_icu_beds=h_data["res"]["available_icu_beds"],
                on_duty_doctors=h_data["res"]["on_duty"],
                ambulances_available=h_data["res"]["ambulances"],
                avg_wait_time=h_data["res"]["wait"]
            )
            db.add(res)
            
            # Add some ambulances
            for i in range(h_data["res"]["ambulances"]):
                amb = models.Ambulance(
                    hospital_id=h.id,
                    vehicle_number=f"UNIT-{h.id}-{i+1}",
                    status="available",
                    driver_name=f"Driver {i+1}"
                )
                db.add(amb)

    db.commit()
    print("Realistic demo database seeded successfully!")

if __name__ == "__main__":
    models.Base.metadata.create_all(bind=engine)
    seed_data()
