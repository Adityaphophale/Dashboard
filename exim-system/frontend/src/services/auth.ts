import { apiRequest } from './api';

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}



export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchProfile(): Promise<any> {
  const res = await apiRequest('/auth/profile');
  return res.data;
}

export async function updateProfileDetails(firstName: string, lastName: string): Promise<any> {
  return apiRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify({ firstName, lastName })
  });
}

export async function updatePasswordDetails(currentPassword: string, newPassword: string): Promise<any> {
  return apiRequest('/auth/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword })
  });
}

export async function fetchRbacMatrix(): Promise<any> {
  const res = await apiRequest('/auth/rbac');
  return res.data;
}

export async function fetchAuditLogs(): Promise<any> {
  const res = await apiRequest('/auth/audit-logs');
  return res.data;
}
