import api from '@/services/api';

export interface AdminNotification {
  id: number;
  type: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'success';
  link: string | null;
  read_by: number[];
  is_read: boolean;
  notifiable_type: string | null;
  notifiable_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationsResponse {
  notifications: AdminNotification[];
  unread_count: number;
}

export async function fetchNotifications(): Promise<NotificationsResponse> {
  const { data } = await api.get<NotificationsResponse>('/admin/notifications');
  return data;
}

export async function markAsRead(id: number): Promise<void> {
  await api.post(`/admin/notifications/${id}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await api.post('/admin/notifications/read-all');
}

export async function reportServiceAlert(
  service: string,
  status: 'active' | 'warning' | 'inactive'
): Promise<void> {
  await api.post('/admin/notifications/service-alert', { service, status });
}
