from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .seed import seed_database
from .routers import auth, parking, admin, ocr, clock

Base.metadata.create_all(bind=engine)

try:
    seed_database()
except Exception as e:
    pass

app = FastAPI(
    title="ParkPulse Smart Garage Enterprise Engine",
    description="High-performance FastAPI backend with SQLite row locking, JWT RBAC, and AI OCR plate recognition.",
    version="2.4.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(parking.router)
app.include_router(admin.router)
app.include_router(ocr.router)
app.include_router(clock.router)

@app.get("/")
def root():
    return {
        "system": "ParkPulse Enterprise Engine",
        "status": "ONLINE",
        "currency": "INR (₹)",
        "version": "2.4.0"
    }
