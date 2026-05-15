import requests
import json

BASE_URL = "http://localhost:8000"

def verify():
    # 1. Login as hospital
    login_payload = {
        "email": "apollo_hospitals_chennai@hospital.com",
        "password": "hospital123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_payload)
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # 2. Submit emergency request
        request_payload = {
            "patient_name": "Verification Test",
            "age": 33,
            "phone": "1112223333",
            "symptoms": "Test symptoms",
            "emergency_type": "General",
            "patient_lat": 13.0827,
            "patient_lng": 80.2707,
            "hospital_id": 1 # Apollo
        }
        requests.post(f"{BASE_URL}/emergency/request", json=request_payload, headers=headers)
        
        # 3. Get queue
        response = requests.get(f"{BASE_URL}/emergency/queue", headers=headers)
        print("QUEUE JSON RESPONSE:")
        print(json.dumps(response.json(), indent=2))
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    verify()
