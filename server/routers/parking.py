import time
import re
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status, Body
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import ParkingSpot, Ticket, GarageTenant
from ..schemas import (
    AvailabilityResponse, SpotResponse, CheckInRequest, CheckOutRequest,
    TicketResponse, FeeBreakdownResponse, ValetTransferRequest, AICommandRequest
)
from ..tariff_engine import calculate_fee, get_cached_tariff
from ..auth import get_current_tenant

router = APIRouter(tags=["Parking Operations"])

@router.get("/api/parking/availability", response_model=AvailabilityResponse)
@router.get("/api/availability", response_model=AvailabilityResponse)
def get_availability(tenant_id: int = Depends(get_current_tenant), db: Session = Depends(get_db)):
    spots = db.query(ParkingSpot).filter(ParkingSpot.tenant_id == tenant_id).all()
    total_spots = len(spots)
    occupied_spots = sum(1 for s in spots if s.is_occupied)
    available_spots = total_spots - occupied_spots

    ev_spots = [s for s in spots if s.type == "EV"]
    ev_total = len(ev_spots)
    ev_available = sum(1 for s in ev_spots if not s.is_occupied)

    compact_spots = [s for s in spots if s.type == "COMPACT"]
    compact_total = len(compact_spots)
    compact_available = sum(1 for s in compact_spots if not s.is_occupied)

    standard_spots = [s for s in spots if s.type == "STANDARD"]
    standard_total = len(standard_spots)
    standard_available = sum(1 for s in standard_spots if not s.is_occupied)

    spot_responses = [
        SpotResponse(
            id=s.id,
            code=s.code,
            type=s.type,
            is_occupied=s.is_occupied,
            current_plate=s.current_plate,
            vehicle_type=s.vehicle_type,
            entry_time=s.entry_time
        )
        for s in spots
    ]

    return AvailabilityResponse(
        totalSpots=total_spots,
        occupiedSpots=occupied_spots,
        availableSpots=available_spots,
        evTotal=ev_total,
        evAvailable=ev_available,
        compactTotal=compact_total,
        compactAvailable=compact_available,
        standardTotal=standard_total,
        standardAvailable=standard_available,
        spots=spot_responses
    )

@router.post("/api/parking/check-in", response_model=TicketResponse)
@router.post("/api/check-in", response_model=TicketResponse)
def check_in_vehicle(req: CheckInRequest, tenant_id: int = Depends(get_current_tenant), db: Session = Depends(get_db)):
    clean_plate = req.plateNumber.strip().upper()
    if not clean_plate:
        raise HTTPException(status_code=400, detail="License plate number is required.")

    existing = db.query(ParkingSpot).filter(
        ParkingSpot.tenant_id == tenant_id,
        ParkingSpot.is_occupied == True,
        ParkingSpot.current_plate == clean_plate
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Vehicle {clean_plate} is already parked in stall {existing.code}."
        )

    target_spot: Optional[ParkingSpot] = None

    if req.requestedSpotId:
        target_spot = db.query(ParkingSpot).filter(
            ParkingSpot.tenant_id == tenant_id,
            (ParkingSpot.id == req.requestedSpotId) | (ParkingSpot.code == req.requestedSpotId.upper())
        ).with_for_update().first()

        if not target_spot:
            raise HTTPException(status_code=404, detail=f"Spot {req.requestedSpotId} not found.")
        if target_spot.is_occupied:
            raise HTTPException(status_code=400, detail=f"Spot {target_spot.code} is already occupied.")

    if req.vehicleType.upper() == "EV":
        if target_spot and target_spot.type != "EV":
            raise HTTPException(
                status_code=400,
                detail=f"EV vehicles must be assigned to EV charger stalls. Spot {target_spot.code} is {target_spot.type}."
            )
        if not target_spot:
            target_spot = db.query(ParkingSpot).filter(
                ParkingSpot.tenant_id == tenant_id,
                ParkingSpot.is_occupied == False,
                ParkingSpot.type == "EV"
            ).with_for_update().first()

            if not target_spot:
                raise HTTPException(status_code=400, detail="No available EV charger stalls.")
    else:
        if target_spot and target_spot.type == "EV":
            raise HTTPException(
                status_code=400,
                detail=f"STRICT ENFORCEMENT: Non-EV vehicles are forbidden from parking in EV charger stalls ({target_spot.code})."
            )
        if not target_spot:
            pref_type = "COMPACT" if req.vehicleType.upper() == "COMPACT" else "STANDARD"
            target_spot = db.query(ParkingSpot).filter(
                ParkingSpot.tenant_id == tenant_id,
                ParkingSpot.is_occupied == False,
                ParkingSpot.type == pref_type
            ).with_for_update().first()

            if not target_spot:
                target_spot = db.query(ParkingSpot).filter(
                    ParkingSpot.tenant_id == tenant_id,
                    ParkingSpot.is_occupied == False,
                    ParkingSpot.type != "EV"
                ).with_for_update().first()

            if not target_spot:
                raise HTTPException(status_code=400, detail="Garage is at full capacity for non-EV vehicles.")

    entry_time = datetime.utcnow().isoformat() + "Z"

    target_spot.is_occupied = True
    target_spot.current_plate = clean_plate
    target_spot.vehicle_type = req.vehicleType.upper()
    target_spot.entry_time = entry_time

    t_id = f"TCK-{int(time.time() * 1000) % 1000000}"
    ticket = Ticket(
        id=t_id,
        tenant_id=tenant_id,
        ticket_number=f"TKN-{t_id}",
        plate_number=clean_plate,
        vehicle_type=req.vehicleType.upper(),
        spot_id=target_spot.id,
        spot_code=target_spot.code,
        entry_time=entry_time,
        status="ACTIVE"
    )

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return TicketResponse(
        id=ticket.id,
        plateNumber=ticket.plate_number,
        vehicleType=ticket.vehicle_type,
        spotId=ticket.spot_id,
        spotCode=ticket.spot_code,
        entryTime=ticket.entry_time,
        status="ACTIVE"
    )

@router.post("/api/parking/check-out", response_model=TicketResponse)
@router.post("/api/check-out", response_model=TicketResponse)
def check_out_vehicle(req: CheckOutRequest, tenant_id: int = Depends(get_current_tenant), db: Session = Depends(get_db)):
    clean_id = req.identifier.strip().upper()
    if not clean_id:
        raise HTTPException(status_code=400, detail="License plate, spot code, or ticket ID is required.")

    ticket = db.query(Ticket).filter(
        Ticket.tenant_id == tenant_id,
        Ticket.status == "ACTIVE",
        (Ticket.plate_number == clean_id) | (Ticket.spot_code == clean_id) | (Ticket.id == clean_id)
    ).first()

    if not ticket:
        raise HTTPException(status_code=404, detail=f"No active ticket found matching '{req.identifier}'.")

    tenant = db.query(GarageTenant).filter(GarageTenant.id == tenant_id).first()
    b_rate = tenant.base_rate if tenant else 50.0
    s_rate = tenant.subsequent_rate if tenant else 30.0
    d_cap = tenant.daily_cap if tenant else 250.0
    g_code = tenant.garage_code if tenant else "AURIGA-01"

    cached_rules = get_cached_tariff(g_code, b_rate, s_rate, d_cap)

    exit_time = datetime.utcnow().isoformat() + "Z"
    fee_dict = calculate_fee(
        ticket.entry_time,
        exit_time,
        cached_rules["firstHourRate"],
        cached_rules["subsequentHourRate"],
        cached_rules["dailyCap"]
    )

    spot = db.query(ParkingSpot).filter(ParkingSpot.id == ticket.spot_id, ParkingSpot.tenant_id == tenant_id).first()
    if spot:
        spot.is_occupied = False
        spot.current_plate = None
        spot.vehicle_type = None
        spot.entry_time = None

    ticket.exit_time = exit_time
    ticket.duration_minutes = fee_dict["durationMinutes"]
    ticket.billable_hours = fee_dict["billableHours"]
    ticket.base_fee = fee_dict["firstHourFee"]
    ticket.subsequent_fee = fee_dict["subsequentHoursFee"]
    ticket.cap_adjustment = fee_dict["capAdjustment"]
    ticket.total_fee = fee_dict["totalFee"]
    ticket.status = "COMPLETED"

    db.commit()
    db.refresh(ticket)

    breakdown = FeeBreakdownResponse(
        durationMinutes=fee_dict["durationMinutes"],
        billableHours=fee_dict["billableHours"],
        firstHourFee=fee_dict["firstHourFee"],
        subsequentHoursCount=fee_dict["subsequentHoursCount"],
        subsequentHoursFee=fee_dict["subsequentHoursFee"],
        uncappedFee=fee_dict["uncappedFee"],
        capAdjustment=fee_dict["capAdjustment"],
        totalFee=fee_dict["totalFee"]
    )

    return TicketResponse(
        id=ticket.id,
        plateNumber=ticket.plate_number,
        vehicleType=ticket.vehicle_type,
        spotId=ticket.spot_id,
        spotCode=ticket.spot_code,
        entryTime=ticket.entry_time,
        exitTime=ticket.exit_time,
        feeBreakdown=breakdown,
        totalFee=ticket.total_fee,
        status="COMPLETED"
    )

@router.post("/api/parking/valet-transfer")
@router.post("/api/valet-transfer")
def valet_transfer(req: ValetTransferRequest, tenant_id: int = Depends(get_current_tenant), db: Session = Depends(get_db)):
    t_clean = req.ticketId.strip().upper()
    p_clean = req.newPlateNumber.strip().upper()

    ticket = db.query(Ticket).filter(
        Ticket.tenant_id == tenant_id,
        Ticket.status == "ACTIVE",
        (Ticket.id == t_clean) | (Ticket.plate_number == t_clean) | (Ticket.spot_code == t_clean)
    ).first()

    if not ticket:
        raise HTTPException(status_code=404, detail=f"Active ticket '{req.ticketId}' not found.")

    old_plate = ticket.plate_number
    ticket.plate_number = p_clean

    spot = db.query(ParkingSpot).filter(ParkingSpot.id == ticket.spot_id, ParkingSpot.tenant_id == tenant_id).first()
    if spot:
        spot.current_plate = p_clean

    db.commit()

    return {
        "success": True,
        "ticketId": ticket.id,
        "spotCode": ticket.spot_code,
        "oldPlateNumber": old_plate,
        "newPlateNumber": p_clean,
        "entryTime": ticket.entry_time,
        "message": f"Valet hand-off successful. Session transferred from {old_plate} to {p_clean}."
    }

@router.post("/api/ai/command")
def process_ai_command(req: AICommandRequest, tenant_id: int = Depends(get_current_tenant), db: Session = Depends(get_db)):
    prompt = req.prompt.strip()

    if re.search(r"handover|transfer|valet", prompt, re.IGNORECASE):
        ticket_match = re.search(r"(?:ticket|tck)[-\s]*([a-z0-9-]+)", prompt, re.IGNORECASE)
        plate_match = re.search(r"(?:plate|to)[-\s]*([a-z0-9-]+)", prompt, re.IGNORECASE)

        t_id = ticket_match.group(1) if ticket_match else "TCK-ACT-100"
        p_num = plate_match.group(1) if plate_match else "RJ-14-CZ-9999"

        try:
            res = valet_transfer(ValetTransferRequest(ticketId=t_id, newPlateNumber=p_num), tenant_id=tenant_id, db=db)
            return {"success": True, "intent": "VALET_TRANSFER", "message": res["message"]}
        except Exception as e:
            return {"success": False, "intent": "VALET_TRANSFER", "message": str(e)}

    if re.search(r"check\s*out|release|exit", prompt, re.IGNORECASE):
        target = re.search(r"(?:plate|spot|ticket)[-\s]*([a-z0-9-]+)", prompt, re.IGNORECASE)
        identifier = target.group(1) if target else prompt.split()[-1]
        try:
            t_res = check_out_vehicle(CheckOutRequest(identifier=identifier), tenant_id=tenant_id, db=db)
            return {"success": True, "intent": "CHECK_OUT", "message": f"Checked out {t_res.plateNumber} from {t_res.spotCode}."}
        except Exception as e:
            return {"success": False, "intent": "CHECK_OUT", "message": str(e)}

    v_type = "EV" if "ev" in prompt.lower() else "COMPACT" if "compact" in prompt.lower() else "STANDARD"
    plate_match = re.search(r"(?:plate|car|vehicle)[-\s]*([a-z0-9-]+)", prompt, re.IGNORECASE)
    plate = plate_match.group(1) if plate_match else "MH-02-EV-8888"

    try:
        c_res = check_in_vehicle(CheckInRequest(plateNumber=plate, vehicleType=v_type), tenant_id=tenant_id, db=db)
        return {"success": True, "intent": "CHECK_IN", "message": f"Checked in {v_type} ({c_res.plateNumber}) to spot {c_res.spotCode}."}
    except Exception as e:
        return {"success": False, "intent": "CHECK_IN", "message": str(e)}

@router.get("/api/parking/search", response_model=List[TicketResponse])
@router.get("/api/parking/logs", response_model=List[TicketResponse])
@router.get("/api/logs", response_model=List[TicketResponse])
def get_ticket_logs(
    search: Optional[str] = None,
    status_filter: Optional[str] = "ALL",
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    tenant_id: int = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    query = db.query(Ticket).filter(Ticket.tenant_id == tenant_id)

    if search:
        s_clean = f"%{search.strip().upper()}%"
        query = query.filter(
            (Ticket.plate_number.like(s_clean)) |
            (Ticket.spot_code.like(s_clean)) |
            (Ticket.id.like(s_clean))
        )

    if status_filter and status_filter.upper() != "ALL":
        query = query.filter(Ticket.status == status_filter.upper())

    tickets = query.order_by(Ticket.created_at.desc()).offset(skip).limit(limit).all()

    tenant = db.query(GarageTenant).filter(GarageTenant.id == tenant_id).first()
    b_rate = tenant.base_rate if tenant else 50.0
    s_rate = tenant.subsequent_rate if tenant else 30.0
    d_cap = tenant.daily_cap if tenant else 250.0

    res = []
    now_str = datetime.utcnow().isoformat() + "Z"

    for t in tickets:
        breakdown = None
        if t.status == "COMPLETED" and t.total_fee is not None:
            breakdown = FeeBreakdownResponse(
                durationMinutes=t.duration_minutes or 60,
                billableHours=t.billable_hours or 1,
                firstHourFee=t.base_fee or b_rate,
                subsequentHoursCount=max(0, (t.billable_hours or 1) - 1),
                subsequentHoursFee=t.subsequent_fee or 0.0,
                uncappedFee=(t.base_fee or b_rate) + (t.subsequent_fee or 0.0),
                capAdjustment=t.cap_adjustment or 0.0,
                totalFee=t.total_fee
            )
        elif t.status == "ACTIVE":
            fee_dict = calculate_fee(t.entry_time, now_str, b_rate, s_rate, d_cap)
            breakdown = FeeBreakdownResponse(
                durationMinutes=fee_dict["durationMinutes"],
                billableHours=fee_dict["billableHours"],
                firstHourFee=fee_dict["firstHourFee"],
                subsequentHoursCount=fee_dict["subsequentHoursCount"],
                subsequentHoursFee=fee_dict["subsequentHoursFee"],
                uncappedFee=fee_dict["uncappedFee"],
                capAdjustment=fee_dict["capAdjustment"],
                totalFee=fee_dict["totalFee"]
            )

        res.append(TicketResponse(
            id=t.id,
            plateNumber=t.plate_number,
            vehicleType=t.vehicle_type,
            spotId=t.spot_id,
            spotCode=t.spot_code,
            entryTime=t.entry_time,
            exitTime=t.exit_time,
            feeBreakdown=breakdown,
            totalFee=t.total_fee if t.status == "COMPLETED" else breakdown.totalFee if breakdown else 0.0,
            status=t.status
        ))

    return res
