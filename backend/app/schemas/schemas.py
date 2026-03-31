from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


# ─── Common ────────────────────────────────────────────────────────────────────

class GPSCoordinate(BaseModel):
    latitude: float
    longitude: float


class SuccessResponse(BaseModel):
    status: str = "success"
    data: Any = None
    total: Optional[int] = None
    message: Optional[str] = None


class ErrorResponse(BaseModel):
    status: str = "error"
    message: str


# ─── Area ──────────────────────────────────────────────────────────────────────

class AreaResponse(BaseModel):
    area_id: str
    area_name: str
    description: Optional[str] = None


# ─── Shipping Agent ─────────────────────────────────────────────────────────────

class ShippingAgentResponse(BaseModel):
    agent_id: str
    agent_name: str
    code: Optional[str] = None


# ─── Zone ──────────────────────────────────────────────────────────────────────

class ZoneResponse(BaseModel):
    zone_id: str
    zone_name: str
    area_id: str
    latlong_upleft: GPSCoordinate
    latlong_downleft: GPSCoordinate
    latlong_upright: GPSCoordinate
    latlong_downright: GPSCoordinate
    center_latitude: Optional[float] = None
    center_longitude: Optional[float] = None
    is_active: bool = True


# ─── Container ─────────────────────────────────────────────────────────────────

class ContainerInGroup(BaseModel):
    id: str
    container_number: str
    shipping_agent: str
    agent_id: str
    stack_level: int
    yard_in_date: str
    zone_id: str
    zone_name: str


class GroupedContainerResponse(BaseModel):
    id: str
    zone_id: str
    zone_name: str
    gps_coordinate: GPSCoordinate
    total_stacks: int
    rotation: int = 0
    containers: List[ContainerInGroup]


class GroupedContainersListResponse(BaseModel):
    status: str = "success"
    data: List[GroupedContainerResponse]
    total_groups: int
    total_containers: int
    empty_zones: int


class ContainerResponse(BaseModel):
    container_id: str
    container_number: str
    agent_id: str
    shipping_agent: str
    zone_id: str
    zone_name: str
    stack_level: int
    yard_in_date: str
    yard_out_date: Optional[str] = None
    status: str
    gps_coordinate: Optional[GPSCoordinate] = None


class ContainersListResponse(BaseModel):
    status: str = "success"
    data: List[ContainerResponse]
    total: int


# ─── Search ────────────────────────────────────────────────────────────────────

class StackInfoItem(BaseModel):
    container_number: str
    stack_level: int
    shipping_agent: str


class StackInfo(BaseModel):
    total_stacks: int
    containers_in_stack: List[StackInfoItem]


class SearchResult(BaseModel):
    zone_id: str
    zone_name: str
    gps_coordinate: GPSCoordinate
    container: ContainerInGroup
    stack_info: StackInfo


class SearchResponse(BaseModel):
    status: str = "success"
    data: SearchResult


# ─── Dashboard ─────────────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_containers: int
    total_zones: int
    used_zones: int
    empty_zones: int
    space_usage_percent: float
    average_stack: float
    device_status: str = "connected"


class MovementLog(BaseModel):
    time: str
    operator: str
    container: str
    from_location: str
    to_location: str


class ChartDataPoint(BaseModel):
    date: str
    count: int


class DashboardStatsResponse(BaseModel):
    status: str = "success"
    data: DashboardStats


class MovementLogsResponse(BaseModel):
    status: str = "success"
    data: List[MovementLog]
    total: int


class ChartResponse(BaseModel):
    status: str = "success"
    data: List[ChartDataPoint]
    year: int
