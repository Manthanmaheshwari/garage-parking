from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .database import SessionLocal, engine, Base
from .models import Admin, GarageTenant, Attendant, ParkingSpot, Ticket
from .auth import get_password_hash
from .tariff_engine import calculate_fee

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    admin = db.query(Admin).filter(Admin.email == "admin@auriga.com").first()
    if not admin:
        admin = Admin(
            email="admin@auriga.com",
            hashed_password=get_password_hash("admin123"),
            full_name="Auriga Owner"
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

    tenant = db.query(GarageTenant).filter(GarageTenant.garage_code == "AURIGA-01").first()
    if not tenant:
        tenant = GarageTenant(
            admin_id=admin.id,
            garage_code="AURIGA-01",
            garage_name="Jaipur Central Hub",
            address="Jaipur, Rajasthan, India",
            base_rate=50.0,
            subsequent_rate=30.0,
            daily_cap=250.0
        )
        db.add(tenant)
        db.commit()
        db.refresh(tenant)

    attendant = db.query(Attendant).filter(Attendant.username == "attendant_raj").first()
    if not attendant:
        attendant = Attendant(
            tenant_id=tenant.id,
            username="attendant_raj",
            hashed_password=get_password_hash("pass123"),
            full_name="Raj Kumar",
            badge_number="ATT-101",
            is_active=True
        )
        db.add(attendant)
        db.commit()

    if db.query(ParkingSpot).filter(ParkingSpot.tenant_id == tenant.id).count() == 0:
        now = datetime.utcnow()
        hours_ago = lambda h: (now - timedelta(hours=h)).isoformat() + "Z"

        spots = []
        for i in range(1, 6):
            spots.append(ParkingSpot(id=f"ev-{i}", tenant_id=tenant.id, code=f"EV-{i}", type="EV", is_occupied=False))
        for i in range(1, 6):
            spots.append(ParkingSpot(id=f"cp-{i}", tenant_id=tenant.id, code=f"CP-{i}", type="COMPACT", is_occupied=False))
        for i in range(1, 11):
            spots.append(ParkingSpot(id=f"st-{i}", tenant_id=tenant.id, code=f"ST-{i}", type="STANDARD", is_occupied=False))

        db.add_all(spots)
        db.commit()

        active_seed = [
            ("ev-1", "MH-02-EV-1001", "EV", 2.5),
            ("ev-3", "KA-01-EV-9999", "EV", 3.8),
            ("cp-2", "RJ-14-CZ-1234", "COMPACT", 1.2),
            ("cp-4", "DL-3C-AB-5678", "COMPACT", 0.5),
            ("st-1", "KA-05-MH-8888", "STANDARD", 4.5),
            ("st-4", "HR-26-DQ-5555", "STANDARD", 0.75),
        ]

        for sid, plate, vtype, h_ago in active_seed:
            sp = db.query(ParkingSpot).filter(ParkingSpot.id == sid, ParkingSpot.tenant_id == tenant.id).first()
            if sp:
                sp.is_occupied = True
                sp.current_plate = plate
                sp.vehicle_type = vtype
                sp.entry_time = hours_ago(h_ago)

        db.commit()

        active_spots = db.query(ParkingSpot).filter(ParkingSpot.is_occupied == True, ParkingSpot.tenant_id == tenant.id).all()
        for idx, s in enumerate(active_spots):
            t = Ticket(
                id=f"TCK-ACT-{100 + idx}",
                tenant_id=tenant.id,
                ticket_number=f"TKN-{1000 + idx}",
                plate_number=s.current_plate,
                vehicle_type=s.vehicle_type,
                spot_id=s.id,
                spot_code=s.code,
                entry_time=s.entry_time,
                status="ACTIVE"
            )
            db.add(t)

        completed_data = [
            ("TCK-CMP-001", "TN-09-AX-7788", "STANDARD", "st-2", "ST-2", 5.0, 3.0),
            ("TCK-CMP-002", "UP-32-EF-4321", "COMPACT", "cp-1", "CP-1", 2.0, 1.0),
            ("TCK-CMP-003", "GJ-01-AB-9000", "STANDARD", "st-5", "ST-5", 14.0, 0.5),
            ("TCK-CMP-004", "AP-09-EV-2020", "EV", "ev-2", "EV-2", 6.0, 4.0),
            ("TCK-CMP-005", "MH-12-AB-3333", "STANDARD", "st-3", "ST-3", 10.0, 2.0),
            ("TCK-CMP-006", "TS-07-EV-4444", "EV", "ev-4", "EV-4", 18.0, 1.0),
            ("TCK-CMP-007", "WB-02-CD-5555", "COMPACT", "cp-3", "CP-3", 3.5, 1.5),
            ("TCK-CMP-008", "KL-07-EF-6666", "STANDARD", "st-6", "ST-6", 7.0, 0.25),
        ]

        for cid, plate, vtype, sid, scode, entry_h, exit_h in completed_data:
            entry_t = hours_ago(entry_h)
            exit_t = hours_ago(exit_h)
            fee = calculate_fee(entry_t, exit_t, tenant.base_rate, tenant.subsequent_rate, tenant.daily_cap)
            ct = Ticket(
                id=cid,
                tenant_id=tenant.id,
                ticket_number=f"TKN-{cid}",
                plate_number=plate,
                vehicle_type=vtype,
                spot_id=sid,
                spot_code=scode,
                entry_time=entry_t,
                exit_time=exit_t,
                duration_minutes=fee["durationMinutes"],
                billable_hours=fee["billableHours"],
                base_fee=fee["firstHourFee"],
                subsequent_fee=fee["subsequentHoursFee"],
                cap_adjustment=fee["capAdjustment"],
                total_fee=fee["totalFee"],
                status="COMPLETED"
            )
            db.add(ct)

        db.commit()

    db.close()

if __name__ == "__main__":
    seed_database()
