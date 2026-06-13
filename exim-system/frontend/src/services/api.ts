import { handleMockRequest } from './mockDatabase';

const getBackendUrls = () => {
  const apiBase = import.meta.env.VITE_API_BASE_URL;
  if (apiBase) {
    const url = new URL(apiBase);
    return {
      apiBase,
      backendRoot: `${url.protocol}//${url.host}`
    };
  }

  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return {
    apiBase: `http://${hostname}:5000/api/v1`,
    backendRoot: `http://${hostname}:5000`
  };
};

export const { apiBase: API_BASE_URL, backendRoot: BACKEND_URL } = getBackendUrls();

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const demoModeEnabled = import.meta.env.VITE_DEMO_MODE === 'true';

  if (demoModeEnabled) {
    console.log(`[API] Demo Mode: Handling mock request for ${endpoint}`);
    return handleMockRequest(endpoint, options) as Promise<T>;
  }

  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.error || `Request failed with status ${response.status}`);
    }

    return data as T;
  } catch (error: any) {
    // Fallback to mock database if it is a network connection error (Failed to fetch)
    const isNetworkError = error instanceof TypeError || error?.message?.includes('fetch') || error?.message?.includes('NetworkError');
    if (isNetworkError) {
      console.warn(`[API] Network error. Falling back to client-side Mock Database:`, error);
      
      if (typeof window !== 'undefined' && !(window as any).__sogt_demo_warned) {
        (window as any).__sogt_demo_warned = true;
        console.log("%c SOGT Portal running in Client-Side Demo Mode (No backend connected) ", "background: #15803d; color: #fff; font-size: 14px; padding: 4px 10px; border-radius: 4px;");
      }
      
      return handleMockRequest(endpoint, options) as Promise<T>;
    }
    throw error;
  }
}
