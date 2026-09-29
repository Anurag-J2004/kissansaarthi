import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({ baseURL: BASE });

// Attach JWT token from localStorage on every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('km_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ── Auth ───────────────────────────────────────────────────
export async function apiRegister(data: {
  name: string; email: string; password: string; phone?: string;
  role?: string; district?: string; block?: string; panchayat_name?: string; language?: string;
}) {
  const r = await api.post('/auth/register', data);
  return r.data as { access_token: string; token_type: string; user: any };
}

export async function apiLogin(email: string, password: string) {
  const r = await api.post('/auth/login', { email, password });
  return r.data as { access_token: string; token_type: string; user: any };
}

export async function apiGetMe() {
  const r = await api.get('/auth/me');
  return r.data;
}

// ── User Profile ───────────────────────────────────────────
export async function apiUpdateProfile(data: {
  name?: string; phone?: string; district?: string;
  block?: string; panchayat_name?: string; language?: string; sms_alerts?: boolean;
}) {
  const r = await api.patch('/users/me', data);
  return r.data;
}

// ── User Crops ─────────────────────────────────────────────
export async function apiGetCrops() {
  const r = await api.get('/users/me/crops');
  return r.data as any[];
}

export async function apiAddCrop(data: {
  crop_name: string; sowing_date?: string; area_acres?: number; variety?: string;
}) {
  const r = await api.post('/users/me/crops', data);
  return r.data;
}

export async function apiDeleteCrop(crop_id: string) {
  const r = await api.delete(`/users/me/crops/${crop_id}`);
  return r.data;
}

export default api;
