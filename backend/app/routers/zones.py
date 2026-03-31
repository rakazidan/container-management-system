from fastapi import APIRouter, Depends, HTTPException
from app.database import get_pool
from app.services import zone_service

router = APIRouter()


@router.get("/zones")
async def get_all_zones(pool=Depends(get_pool)):
    """Ambil semua zone dengan 4 corner GPS points."""
    zones = await zone_service.get_all_zones(pool)
    return {"status": "success", "data": zones, "total": len(zones)}


@router.get("/zones/{zone_id}")
async def get_zone(zone_id: str, pool=Depends(get_pool)):
    """Ambil detail satu zone berdasarkan zone_id."""
    zone = await zone_service.get_zone_by_id(pool, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return {"status": "success", "data": zone}
