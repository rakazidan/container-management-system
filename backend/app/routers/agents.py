from fastapi import APIRouter, Depends
from app.database import get_pool
from app.services import agent_service

router = APIRouter()


@router.get("/shipping-agents")
async def get_shipping_agents(pool=Depends(get_pool)):
    """Ambil semua master data shipping agent."""
    agents = await agent_service.get_all_agents(pool)
    return {"status": "success", "data": agents, "total": len(agents)}
