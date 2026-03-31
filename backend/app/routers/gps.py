from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from app.database import get_pool
from app.services import gps_service

router = APIRouter()


class GPSPayload(BaseModel):
    lat: float
    lng: float
    device_id: str = "esp32-01"  # opsional, default esp32-01


@router.post("/gps")
async def receive_gps(payload: GPSPayload, pool=Depends(get_pool)):
    """
    Terima data GPS dari ESP32.
    Body: { "lat": float, "lng": float, "device_id": str (opsional) }
    """
    record = await gps_service.insert_gps(pool, payload.lat, payload.lng, payload.device_id)
    return {"status": "success", "data": record}


@router.get("/gps/latest")
async def get_latest_gps(
    device_id: str = Query("esp32-01"),
    pool=Depends(get_pool),
):
    """Ambil posisi GPS terbaru dari device tertentu."""
    record = await gps_service.get_latest(pool, device_id)
    if not record:
        return {"status": "error", "message": "No GPS data yet"}
    return {"status": "success", "data": record}


@router.get("/gps/history")
async def get_gps_history(
    device_id: str = Query("esp32-01"),
    limit: int = Query(50, ge=1, le=500),
    pool=Depends(get_pool),
):
    """Ambil history GPS readings."""
    records = await gps_service.get_history(pool, device_id, limit)
    return {"status": "success", "data": records, "total": len(records)}
