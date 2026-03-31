from fastapi import APIRouter, Depends
from app.database import get_pool
from app.services import area_service

router = APIRouter()


@router.get("/areas")
async def get_areas(pool=Depends(get_pool)):
    """Ambil semua area (grup dari beberapa zone)."""
    areas = await area_service.get_all_areas(pool)
    return {"status": "success", "data": areas, "total": len(areas)}
