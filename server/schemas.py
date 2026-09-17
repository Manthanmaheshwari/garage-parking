from pydantic import BaseModel, EmailStr
from typing import Optional, List

class LoginRequest(BaseModel):
    username: str
    password: str
    garageCode: Optional[str] = "AURIGA-01"

class RegisterRequest(BaseModel):
    username: str
    password: str
    role: Optional[str] = "ATTENDANT"

class AdminRegisterRequest(BaseModel):
    email: str
    password: str
    fullName: str
    garageName: str
    garageCode: str

class AdminLoginRequest(BaseModel):
    email: str
    password: str

class AttendantRegisterRequest(BaseModel):
    username: str
    password: str
    fullName: str
    badgeNumber: str
    garageCode: str

class AttendantLoginRequest(BaseModel):
    username: str
    password: str
    garageCode: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    role: str
    tenant_id: int
    garage_code: str

class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    tenant_id: Optional[int] = 1

class TenantResponse(BaseModel):
    id: int
    garage_code: str
    garage_name: str
    address: Optional[str] = "Jaipur, Rajasthan, India"
    base_rate: float
    subsequent_rate: float
    daily_cap: float

class SpotResponse(BaseModel):
    id: str
    code: str
    type: str
    is_occupied: bool
    current_plate: Optional[str] = None
    vehicle_type: Optional[str] = None
    entry_time: Optional[str] = None

class FeeBreakdownResponse(BaseModel):
    durationMinutes: int
    billableHours: int
    firstHourFee: float
    subsequentHoursCount: int
    subsequentHoursFee: float
    uncappedFee: float
    capAdjustment: float
    totalFee: float

class TicketResponse(BaseModel):
    id: str
    plateNumber: str
    vehicleType: str
    spotId: str
    spotCode: str
    entryTime: str
    exitTime: Optional[str] = None
    feeBreakdown: Optional[FeeBreakdownResponse] = None
    totalFee: Optional[float] = None
    status: str

class CheckInRequest(BaseModel):
    plateNumber: str
    vehicleType: str
    requestedSpotId: Optional[str] = None

class CheckOutRequest(BaseModel):
    identifier: str

class ValetTransferRequest(BaseModel):
    ticketId: str
    newPlateNumber: str

class AICommandRequest(BaseModel):
    prompt: str

class MessyRatesRequest(BaseModel):
    rawText: str

class TariffConfigRequest(BaseModel):
    firstHourRate: float
    subsequentHourRate: float
    dailyCap: float

class GarageConfigRequest(BaseModel):
    code: str
    evSpots: int
    compactSpots: int
    standardSpots: int

class AvailabilityResponse(BaseModel):
    totalSpots: int
    occupiedSpots: int
    availableSpots: int
    evTotal: int
    evAvailable: int
    compactTotal: int
    compactAvailable: int
    standardTotal: int
    standardAvailable: int
    spots: List[SpotResponse]

class OCRResultResponse(BaseModel):
    success: bool
    plateNumber: Optional[str] = None
    confidence: float
    message: str
