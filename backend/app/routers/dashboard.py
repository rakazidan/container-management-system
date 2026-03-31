from fastapi import APIRouter, Depends, Query
from app.database import get_pool
from app.services import dashboard_service

router = APIRouter()


@router.get("/dashboard/stats")
async def get_dashboard_stats(pool=Depends(get_pool)):
    """Statistik utama dashboard: total containers, space usage, rata-rata stack."""
    stats = await dashboard_service.get_stats(pool)
    return {"status": "success", "data": stats}


@router.get("/dashboard/movement-logs")
async def get_movement_logs(
    limit: int = Query(20, ge=1, le=100),
    pool=Depends(get_pool),
):
    """Log pergerakan container terakhir."""
    logs = await dashboard_service.get_movement_logs(pool, limit)
    return {"status": "success", "data": logs, "total": len(logs)}


@router.get("/dashboard/chart")
async def get_chart_data(
    year: int = Query(2024, ge=2020, le=2030),
    pool=Depends(get_pool),
):
    """Data chart jumlah container per bulan untuk tahun tertentu."""
    data = await dashboard_service.get_chart_data(pool, year)
    return {"status": "success", "data": data, "year": year}
