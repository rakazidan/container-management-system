"""
Yard Configuration Router
API endpoints untuk manage yard boundary settings
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.database import get_pool
from app.services import yard_service

router = APIRouter()


class GPSPoint(BaseModel):
    latitude: float
    longitude: float


class YardConfigUpdate(BaseModel):
    yard_name: Optional[str] = None
    area_id: Optional[str] = None
    top_left_lat: Optional[float] = None
    top_left_lng: Optional[float] = None
    bottom_right_lat: Optional[float] = None
    bottom_right_lng: Optional[float] = None
    polygon_points: Optional[List[dict]] = None
    canvas_width: Optional[int] = None
    canvas_height: Optional[int] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


@router.get("/yard-config")
async def get_active_yard_config(pool=Depends(get_pool)):
    """
    Get the currently active yard configuration.
    Returns yard boundary settings for GPS-based canvas rendering.
    """
    config = await yard_service.get_active_yard(pool)
    
    if not config:
        raise HTTPException(status_code=404, detail="No active yard configuration found")
    
    return {
        "status": "success",
        "data": config
    }


@router.get("/yard-config/all")
async def get_all_yard_configs(pool=Depends(get_pool)):
    """Get all yard configurations (active and inactive)."""
    configs = await yard_service.get_all_yards(pool)
    
    return {
        "status": "success",
        "data": configs,
        "total": len(configs)
    }


@router.get("/yard-config/{config_id}")
async def get_yard_config_by_id(config_id: str, pool=Depends(get_pool)):
    """Get specific yard configuration by ID."""
    config = await yard_service.get_yard_by_id(pool, config_id)
    
    if not config:
        raise HTTPException(status_code=404, detail=f"Yard config '{config_id}' not found")
    
    return {
        "status": "success",
        "data": config
    }


@router.patch("/yard-config/{config_id}")
async def update_yard_config(
    config_id: str,
    update: YardConfigUpdate,
    pool=Depends(get_pool)
):
    """
    Update yard configuration.
    Can update boundary coordinates, polygon points, canvas size, etc.
    Setting is_active=true will deactivate all other yards.
    """
    updated = await yard_service.update_yard_config(
        pool=pool,
        config_id=config_id,
        yard_name=update.yard_name,
        area_id=update.area_id,
        top_left_lat=update.top_left_lat,
        top_left_lng=update.top_left_lng,
        bottom_right_lat=update.bottom_right_lat,
        bottom_right_lng=update.bottom_right_lng,
        polygon_points=update.polygon_points,
        canvas_width=update.canvas_width,
        canvas_height=update.canvas_height,
        description=update.description,
        is_active=update.is_active
    )
    
    if not updated:
        raise HTTPException(status_code=404, detail=f"Yard config '{config_id}' not found")
    
    return {
        "status": "success",
        "message": "Yard configuration updated successfully",
        "data": updated
    }
