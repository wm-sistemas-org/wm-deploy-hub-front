import axios from 'axios';

/** Base da API — build-time (VITE_API_URL) ou runtime (config.json / window.__ENV__). Inclua `/api/v1` se for o prefixo do backend. */
function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const env = (window as unknown as { __ENV__?: { VITE_API_URL?: string } }).__ENV__;
    if (env?.VITE_API_URL) return env.VITE_API_URL;
  }
  return import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Atualiza a baseURL em runtime (útil após carregar config.json) */
export function setApiBaseUrl(url: string): void {
  api.defaults.baseURL = url;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);
