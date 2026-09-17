from fastapi import APIRouter, UploadFile, File, HTTPException
from ..schemas import OCRResultResponse
from ..ocr_engine import extract_indian_plate_from_bytes

router = APIRouter(prefix="/api/ocr", tags=["AI / OCR Engine"])

@router.post("/extract-plate", response_model=OCRResultResponse)
async def extract_plate(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a valid image format (JPEG, PNG, WEBP).")

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    plate, confidence, message = extract_indian_plate_from_bytes(contents, file.filename or "")

    return OCRResultResponse(
        success=bool(plate),
        plateNumber=plate,
        confidence=confidence,
        message=message
    )
