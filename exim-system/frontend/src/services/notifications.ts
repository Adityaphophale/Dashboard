import { apiRequest } from './api';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  readStatus: boolean;
  createdAt: string;
}

export async function fetchNotifications(): Promise<Notification[]> {
  return apiRequest<Notification[]>('/notifications');
}

export async function markNotificationRead(id: string): Promise<Notification> {
  return apiRequest<Notification>(`/notifications/${id}/read`, {
    method: 'PUT',
  });
}
