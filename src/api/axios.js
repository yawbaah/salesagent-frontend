import axios from 'axios';
import Store from './auth-store';

const API_BASE = `http://${window.location.hostname}:8000/api/v1`;

const API = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ── Single refresh lock ──
let refreshCall = null;

// ── Request: attach token ──
API.interceptors.request.use((cfg) => {
  if (Store.isDead()) return cfg;
  const t = Store.access();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// ── Response: handle 401 ──
API.interceptors.response.use(
  (r) => r,
  async (err) => {
    const cfg = err.config;
    if (!cfg || Store.isDead()) return Promise.reject(err);

    // Skip auth endpoints
    if (/\/auth\/(login|signup|logout|token|forgot|reset)/.test(cfg.url || '')) {
      return Promise.reject(err);
    }

    if (err.response?.status !== 401 || cfg._done) {
      return Promise.reject(err);
    }
    cfg._done = true;

    // If no session nonce → don't even try to refresh
    if (!Store.hasSession()) return Promise.reject(err);

    try {
      // Reuse existing refresh call if one is in flight
      if (!refreshCall) {
        const rt = Store.refresh();
        if (!rt) throw new Error('no refresh token');
        refreshCall = axios
          .post(`${API_BASE}/auth/token/refresh/`, { refresh: rt })
          .finally(() => { refreshCall = null; });
      }

      const { data } = await refreshCall;

      // After await — check if session was killed while we waited
      if (Store.isDead() || !Store.hasSession()) {
        return Promise.reject(new Error('session ended'));
      }

      Store.writeTokens({
        access: data.access,
        refresh: data.refresh || Store.refresh(),
      });

      cfg.headers.Authorization = `Bearer ${data.access}`;
      return API(cfg);
    } catch (e) {
      refreshCall = null;
      // Don't redirect if already on a public page
      const p = window.location.pathname;
      if (p.startsWith('/dashboard')) {
        Store.destroy();
        window.location.href = '/login';
      }
      return Promise.reject(e);
    }
  },
);

export default API;
export { API_BASE };