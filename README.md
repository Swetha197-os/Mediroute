# MediRoute AI: Professional Healthcare Emergency Platform

MediRoute AI is a state-of-the-art full-stack emergency hospital routing and management system. It leverages AI to analyze emergency severity and recommend the most optimal hospital based on distance, bed availability, and specialized resources.

## 🚀 Key Features

- **Smart Routing Engine**: AI-driven hospital recommendations using live resource tracking.
- **AI Triage Analysis**: Automated severity classification (Low to Critical) based on patient symptoms.
- **Real-time Dashboards**: Professional interfaces for Patients, Hospitals, and System Admin.
- **Ambulance Management**: Live tracking and unit dispatch coordination.
- **Advanced Analytics**: System-wide performance metrics and emergency trend analysis.

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS 4, Framer Motion, Recharts, Lucide Icons.
- **Backend**: FastAPI (Python), SQLAlchemy.
- **Database**: MySQL (Default) / SQLite (Demo).
- **AI/ML**: Scikit-Learn based severity prediction models.
- **Auth**: JWT-based Secure Authentication with RBAC.

## 📂 Project Structure

```bash
MediRoute/
├── backend/            # FastAPI Application
│   ├── main.py         # Entry point & Routes
│   ├── models.py       # SQLAlchemy Database Models
│   ├── auth.py         # JWT & Security Logic
│   └── database.py     # DB Configuration
├── frontend/           # React Web Application
│   ├── src/pages/      # Dashboard & Form Pages
│   ├── src/components/ # Reusable UI Components
│   └── src/layouts/    # Application Layouts
├── ai_models/          # Intelligent Modules
│   └── engine.py       # Prediction & Recommendation Algorithms
└── README.md
```

## ⚙️ Setup Instructions

### Backend (Python)
1. Navigate to backend: `cd backend`
2. Create virtual environment: `python -m venv venv`
3. Activate venv: `source venv/bin/activate` (Linux) or `venv\Scripts\activate` (Windows)
4. Install dependencies: `pip install -r requirements.txt`
5. Run server: `uvicorn main:app --reload`

### Frontend (React)
1. Navigate to frontend: `cd frontend`
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`

### Database
- The backend defaults to MySQL. Update `DATABASE_URL` in `backend/database.py` with your credentials.
- Set `USE_SQLITE=True` in environment variables to run without a MySQL server for local testing.

## 🚢 Deployment Guidance

### Backend (FastAPI)
- **Containerization**: Use Docker with `tiangolo/uvicorn-gunicorn-fastapi` image.
- **Platform**: Deploy on AWS App Runner, Heroku, or DigitalOcean App Platform.
- **DB**: Use managed databases like AWS RDS (MySQL).

### Frontend (React)
- **Build**: Run `npm run build` to generate static assets.
- **Platform**: Deploy on Vercel, Netlify, or AWS S3 + CloudFront.

---
Built with ❤️ for saving lives through technology.
