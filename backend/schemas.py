from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class SeverityLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class UserRole(str, Enum):
    patient = "patient"
    hospital = "hospital"
    admin = "admin"

class RequestStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    dispatched = "dispatched"
    en_route = "en_route"
    arrived = "arrived"
    completed = "completed"

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(UserCreate):
    phone: Optional[str] = None
    blood_group: Optional[str] = None
    hospital_name: Optional[str] = None
    address: Optional[str] = None

class User(UserBase):
    id: int
    is_active: bool
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    name: str

class HospitalResourceBase(BaseModel):
    total_beds: int
    available_beds: int
    total_icu: int
    available_icu: int
    on_duty_staff: int
    total_ambulances: int
    available_ambulances: int
    wait_time: int
    er_status: Optional[str] = "normal"

class HospitalResource(HospitalResourceBase):
    last_updated: datetime
    class Config:
        from_attributes = True

class HospitalBase(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float

class Hospital(HospitalBase):
    id: int
    rating: float
    resources: Optional[HospitalResource]
    class Config:
        from_attributes = True

# PATIENT SCHEMAS
class PatientHealthProfile(BaseModel):
    full_name: str
    age: Optional[int]
    gender: Optional[str]
    contact_number: str
    blood_group: str
    emergency_contact_name: Optional[str]
    emergency_contact_phone: Optional[str]
    allergies: Optional[str] = ""
    existing_conditions: Optional[str] = ""
    current_medications: Optional[str] = ""

    class Config:
        from_attributes = True

class PatientReport(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_type: str
    upload_date: datetime
    class Config:
        from_attributes = True

# EMERGENCY SCHEMAS
class EmergencyRequestCreate(BaseModel):
    patient_name: str
    patient_age: int
    patient_phone: str
    symptoms: str
    emergency_type: str
    severity_level: str
    urgency_score: float
    patient_lat: float
    patient_lng: float
    hospital_id: Optional[int] = None
    is_external: Optional[bool] = False
    external_place_id: Optional[str] = None
    external_hospital_name: Optional[str] = None
    external_hospital_address: Optional[str] = None
    external_hospital_lat: Optional[float] = None
    external_hospital_lng: Optional[float] = None

class EmergencyRequest(BaseModel):
    id: int
    patient_id: int
    hospital_id: Optional[int]
    ambulance_id: Optional[int]
    is_external: bool = False
    external_hospital_name: Optional[str] = None
    severity_level: str
    urgency_score: float
    status: str
    created_at: datetime
    hospital: Optional[Hospital]
    class Config:
        from_attributes = True

class ChatbotRequest(BaseModel):
    message: str
    context: Optional[str] = "general" # patient, hospital, admin
    nearby_hospitals: Optional[List[dict]] = None
    location: Optional[dict] = None
