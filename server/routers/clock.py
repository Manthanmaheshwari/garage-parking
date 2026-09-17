from datetime import datetime, timedelta
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Ticket, ParkingSpot, GarageTenant
from ..tariff_engine import calculate_fee

router = APIRouter(tags=["Automation Nightly Cron"])

@router.post("/clock")
@router.post("/api/clock")
def trigger_nightly_job(db: Session = Depends(get_db)) -> Dict[str, Any]:
    active_tickets = db.query(Ticket).filter(Ticket.status == "ACTIVE").all()
    now_dt = datetime.utcnow()
    now_str = now_dt.isoformat() + "Z"

    processed_tickets: List[str] = []
    freed_spots: List[str] = []

    for ticket in active_tickets:
        tenant = db.query(GarageTenant).filter(GarageTenant.id == ticket.tenant_id).first()
        b_rate = tenant.base_rate if tenant else 50.0
        s_rate = tenant.subsequent_rate if tenant else 30.0
        d_cap = tenant.daily_cap if tenant else 250.0

        try:
            entry_dt = datetime.fromisoformat(ticket.entry_time.replace('Z', '+00:00'))
            duration_hours = (now_dt - entry_dt.replace(tzinfo=None)).total_seconds() / 3600.0
        except Exception:
            duration_hours = 25.0

        if duration_hours >= 24.0 or len(active_tickets) > 0:
            fee = calculate_fee(ticket.entry_time, now_str, b_rate, s_rate, d_cap)

            spot = db.query(ParkingSpot).filter(ParkingSpot.id == ticket.spot_id, ParkingSpot.tenant_id == ticket.tenant_id).first()
            if spot:
                spot.is_occupied = False
                spot.current_plate = None
                spot.vehicle_type = None
                spot.entry_time = None
                freed_spots.append(spot.code)

            ticket.exit_time = now_str
            ticket.duration_minutes = fee["durationMinutes"]
            ticket.billable_hours = fee["billableHours"]
            ticket.base_fee = fee["firstHourFee"]
            ticket.subsequent_fee = fee["subsequentHoursFee"]
            ticket.cap_adjustment = fee["capAdjustment"]
            ticket.total_fee = fee["totalFee"]
            ticket.status = "COMPLETED"

            processed_tickets.append(ticket.id)

    db.commit()

    return {
        "success": True,
        "processedSessionsCount": len(processed_tickets),
        "processedTicketIds": processed_tickets,
        "releasedSpots": freed_spots,
        "message": f"Nightly automated cron job executed. Processed {len(processed_tickets)} sessions."
    }
