/**
 * API Service Layer
 * Menggantikan mock data di frontend dengan real API calls ke backend CMS.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const getHeaders = (): HeadersInit => ({
    'Content-Type': 'application/json',
    // Tambahkan Authorization di sini setelah auth diimplementasi:
    // 'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
});

const handleResponse = async <T>(res: Response): Promise<T> => {
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.json();
};

// ─── Zones ───────────────────────────────────────────────────────────────────

export const getZones = async () => {
    const res = await fetch(`${API_BASE}/zones`, { headers: getHeaders() });
    return handleResponse(res);
};

export const getZoneById = async (zoneId: string) => {
    const res = await fetch(`${API_BASE}/zones/${zoneId}`, { headers: getHeaders() });
    return handleResponse(res);
};

// ─── Containers ──────────────────────────────────────────────────────────────

export const getContainersGrouped = async () => {
    const res = await fetch(`${API_BASE}/containers/grouped`, { headers: getHeaders() });
    return handleResponse(res);
};

export const getContainers = async (params?: {
    zone_id?: string;
    agent_id?: string;
    status?: string;
    page?: number;
    limit?: number;
}) => {
    const qs = new URLSearchParams();
    if (params?.zone_id) qs.set('zone_id', params.zone_id);
    if (params?.agent_id) qs.set('agent_id', params.agent_id);
    if (params?.status) qs.set('status', params.status);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));

    const res = await fetch(`${API_BASE}/containers?${qs}`, { headers: getHeaders() });
    return handleResponse(res);
};

export const searchContainer = async (params: {
    container_number?: string;
    shipping_agent?: string;
}) => {
    const qs = new URLSearchParams();
    if (params.container_number) qs.set('container_number', params.container_number);
    if (params.shipping_agent) qs.set('shipping_agent', params.shipping_agent);

    const res = await fetch(`${API_BASE}/containers/search?${qs}`, { headers: getHeaders() });
    return handleResponse(res);
};

// ─── Shipping Agents ─────────────────────────────────────────────────────────

export const getShippingAgents = async () => {
    const res = await fetch(`${API_BASE}/shipping-agents`, { headers: getHeaders() });
    return handleResponse(res);
};

// ─── Areas ───────────────────────────────────────────────────────────────────

export const getAreas = async () => {
    const res = await fetch(`${API_BASE}/areas`, { headers: getHeaders() });
    return handleResponse(res);
};

// ─── Dashboard ───────────────────────────────────────────────────────────────

export const getDashboardStats = async () => {
    const res = await fetch(`${API_BASE}/dashboard/stats`, { headers: getHeaders() });
    return handleResponse(res);
};

export const getMovementLogs = async (limit = 20) => {
    const res = await fetch(`${API_BASE}/dashboard/movement-logs?limit=${limit}`, {
        headers: getHeaders(),
    });
    return handleResponse(res);
};

export const getChartData = async (year: number) => {
    const res = await fetch(`${API_BASE}/dashboard/chart?year=${year}`, {
        headers: getHeaders(),
    });
    return handleResponse(res);
};
