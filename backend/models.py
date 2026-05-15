from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Enum, Text
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    full_name = Column(String(255))
    role = Column(Enum("patient", "hospital", "admin"), default="patient")
    is_active = Column(Boolean, default=True)

class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    blood_group = Column(String(10), nullable=True)
    contact_number = Column(String(15), nullable=True)
    address = Column(Text, nullable=True)
    
    emergency_contact_name = Column(String(255), nullable=True)
    emergency_contact_phone = Column(String(15), nullable=True)
    allergies = Column(Text, nullable=True)
    existing_conditions = Column(Text, nullable=True)
    current_medications = Column(Text, nullable=True)
    
    user = relationship("User")
    requests = relationship("EmergencyRequest", back_populates="patient")
    reports = relationship("PatientReport", back_populates="patient")

class PatientReport(Base):
    __tablename__ = "patient_reports"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    filename = Column(String(255))
    original_filename = Column(String(255))
    file_type = Column(String(50))
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)
    
    patient = relationship("Patient", back_populates="reports")

class Hospital(Base):
    __tablename__ = "hospitals"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(255), index=True)
    address = Column(Text)
    latitude = Column(Float)
    longitude = Column(Float)
    rating = Column(Float, default=0.0)
    
    user = relationship("User")
    resources = relationship("HospitalResource", back_populates="hospital", uselist=False)
    ambulances = relationship("Ambulance", back_populates="hospital")

class HospitalResource(Base):
    __tablename__ = "hospital_resources"
    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    total_beds = Column(Integer, default=100)
    available_beds = Column(Integer, default=50)
    total_icu = Column(Integer, default=20)
    available_icu = Column(Integer, default=5)
    on_duty_staff = Column(Integer, default=10)
    total_ambulances = Column(Integer, default=5)
    available_ambulances = Column(Integer, default=3)
    wait_time = Column(Integer, default=15)
    er_status = Column(Enum("normal", "busy", "critical"), default="normal")
    last_updated = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    hospital = relationship("Hospital", back_populates="resources")

class Ambulance(Base):
    __tablename__ = "ambulances"
    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    vehicle_number = Column(String(50))
    status = Column(Enum("available", "assigned", "en_route", "arrived", "completed", "maintenance"), default="available")
    driver_name = Column(String(255))
    driver_contact = Column(String(15))
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    
    hospital = relationship("Hospital", back_populates="ambulances")

class EmergencyRequest(Base):
    __tablename__ = "emergency_requests"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    ambulance_id = Column(Integer, ForeignKey("ambulances.id"), nullable=True)
    
    # External Hospital Support
    is_external = Column(Boolean, default=False)
    external_place_id = Column(String(255), nullable=True)
    external_hospital_name = Column(String(255), nullable=True)
    external_hospital_address = Column(Text, nullable=True)
    external_hospital_lat = Column(Float, nullable=True)
    external_hospital_lng = Column(Float, nullable=True)
    
    # Patient Info at time of request (support reporting for others)
    patient_name = Column(String(255), nullable=True)
    patient_age = Column(Integer, nullable=True)
    patient_phone = Column(String(20), nullable=True)
    
    symptoms = Column(Text)
    emergency_type = Column(String(100))
    severity_level = Column(String(20), default="medium")
    urgency_score = Column(Float, default=0.0)
    
    patient_lat = Column(Float, nullable=True)
    patient_lng = Column(Float, nullable=True)
    
    status = Column(String(50), default="pending")
    estimated_arrival_time = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    patient = relationship("Patient", back_populates="requests")
    hospital = relationship("Hospital")
    ambulance = relationship("Ambulance")

class ChatbotHistory(Base):
    __tablename__ = "chatbot_history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(Text)
    response = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
