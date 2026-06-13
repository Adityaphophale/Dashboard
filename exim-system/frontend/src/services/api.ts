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
  const token = localStorage.getItem('token');
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

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
}
