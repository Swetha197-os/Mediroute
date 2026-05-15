from math import radians, cos, sin, asin, sqrt

def haversine(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    """
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 9999.0 # Large distance fallback
        
    R = 6371 # km
    dLat = radians(lat2 - lat1)
    dLon = radians(lon2 - lon1)
    a = sin(dLat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dLon/2)**2
    c = 2 * asin(sqrt(a))
    return R * c

def predict_severity(symptoms: str, age: int, emergency_type: str):
    """
    Predicts emergency severity based on symptoms and patient data.
    """
    symptoms_lower = symptoms.lower()
    score = 0
    
    # High priority keywords
    critical_keywords = ["chest pain", "unconscious", "stroke", "bleeding", "cardiac", "breath", "seizure", "paralysis"]
    for word in critical_keywords:
        if word in symptoms_lower:
            score += 5
            
    # Age factor
    if age and (age > 70 or age < 5):
        score += 2
        
    # Emergency type factor
    emergency_weights = {
        "Accident": 5,
        "Cardiac": 6,
        "Respiratory": 5,
        "Neurological": 6,
        "General": 1,
        "Maternity": 3
    }
    score += emergency_weights.get(emergency_type, 1)
    
    if score >= 10:
        return "critical", score
    elif score >= 7:
        return "high", score
    elif score >= 4:
        return "medium", score
    else:
        return "low", score

def recommend_hospital(hospitals, patient_lat, patient_lon):
    """
    Scores hospitals based on distance and resource availability.
    """
    scored_hospitals = []
    for h in hospitals:
        dist = haversine(patient_lat, patient_lon, h.latitude, h.longitude)
        
        # Scoring logic
        res = h.resources
        if not res:
            score = -dist * 5 # Only distance if no info
        else:
            bed_avail = res.available_beds / res.total_beds if res.total_beds > 0 else 0
            icu_avail = res.available_icu_beds / res.total_icu_beds if res.total_icu_beds > 0 else 0
            
            # Score = (Resources availability weight) - (Distance weight)
            resource_score = (bed_avail * 40) + (icu_avail * 60)
            distance_penalty = dist * 10
            
            score = resource_score - distance_penalty
            
        scored_hospitals.append({
            "hospital": h,
            "distance": dist,
            "score": score
        })
        
    # Sort by score descending
    return sorted(scored_hospitals, key=lambda x: x["score"], reverse=True)
