from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Use environment variable for database URL or default to local MySQL
# Force SQLite for demo stability
SQLALCHEMY_DATABASE_URL = "sqlite:///./mediroute.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    # SQLite specific connect_args
    connect_args={"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
