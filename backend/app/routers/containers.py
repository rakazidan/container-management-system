from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from app.database import get_pool
from app.services import container_service

router = APIRouter()


@router.get("/containers")
async def get_containers(
    zone_id: Optional[str] = Query(None),
    agent_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None, description="IN_YARD | MOVED | OUT"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    pool=Depends(get_pool),
):
    """Ambil daftar containers dengan filter opsional."""
    result = await container_service.get_containers(pool, zone_id, agent_id, status, page, limit)
    return result


@router.get("/containers/grouped")
async def get_containers_grouped(pool=Depends(get_pool)):
    """
    Ambil containers yang sudah di-group per zone.
    1 zone = 1 stack position. Digunakan untuk GPS canvas visualization.
    """
    result = await container_service.get_containers_grouped(pool)
    return result


@router.get("/containers/search")
async def search_container(
    container_number: Optional[str] = Query(None, description="Exact match, case-insensitive"),
    shipping_agent: Optional[str] = Query(None, description="Partial match, case-insensitive"),
    pool=Depends(get_pool),
):
    """Search container berdasarkan container number atau shipping agent."""
    if not container_number and not shipping_agent:
        raise HTTPException(status_code=400, detail="At least one search parameter required")

    result = await container_service.search_container(pool, container_number, shipping_agent)
    if result is None:
        raise HTTPException(status_code=404, detail="Container not found")
    return {"status": "success", "data": result}


@router.get("/containers/{container_id}")
async def get_container(container_id: str, pool=Depends(get_pool)):
    """Ambil detail satu container."""
    container = await container_service.get_container_by_id(pool, container_id)
    if not container:
        raise HTTPException(status_code=404, detail="Container not found")
    return {"status": "success", "data": container}
