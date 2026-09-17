from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Index, ForeignKey
from sqlalchemy.sql import func
from .database import Base

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class GarageTenant(Base):
    __tablename__ = "garage_tenants"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("admins.id"), nullable=False)
    garage_code = Column(String, unique=True, index=True, nullable=False)
    garage_name = Column(String, nullable=False)
    address = Column(String, default="Jaipur, Rajasthan, India")
    base_rate = Column(Float, default=50.0)
    subsequent_rate = Column(Float, default=30.0)
    daily_cap = Column(Float, default=250.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Attendant(Base):
    __tablename__ = "attendants"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("garage_tenants.id"), nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    badge_number = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ParkingSpot(Base):
    __tablename__ = "parking_spots"

    id = Column(String, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("garage_tenants.id"), nullable=False, default=1)
    code = Column(String, index=True, nullable=False)
    type = Column(String, nullable=False)
    is_occupied = Column(Boolean, default=False, index=True)
    current_plate = Column(String, index=True, nullable=True)
    vehicle_type = Column(String, nullable=True)
    entry_time = Column(String, nullable=True)

    __table_args__ = (
        Index("ix_spots_tenant_occupied_type", "tenant_id", "is_occupied", "type"),
        Index("ix_spots_tenant_plate", "tenant_id", "current_plate"),
    )

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(String, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("garage_tenants.id"), nullable=False, default=1)
    ticket_number = Column(String, index=True, nullable=False)
    plate_number = Column(String, index=True, nullable=False)
    vehicle_type = Column(String, nullable=False)
    spot_id = Column(String, nullable=False)
    spot_code = Column(String, nullable=False)
    entry_time = Column(String, nullable=False)
    exit_time = Column(String, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    billable_hours = Column(Integer, nullable=True)
    base_fee = Column(Float, default=0.0)
    subsequent_fee = Column(Float, default=0.0)
    cap_adjustment = Column(Float, default=0.0)
    total_fee = Column(Float, default=0.0)
    status = Column(String, index=True, default="ACTIVE")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index("ix_tickets_tenant_plate", "tenant_id", "plate_number"),
        Index("ix_tickets_tenant_status", "tenant_id", "status"),
    )
