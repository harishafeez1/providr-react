import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchNotifications,
  markAsRead as apiMarkAsRead,
  markAllAsRead as apiMarkAllAsRead,
  type AdminNotification,
} from '@/services/notification-service';

const POLL_INTERVAL = 30_000;

export function useNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    } catch {
      // Silently fail — API interceptor handles 401
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: number) => {
    try {
      await apiMarkAsRead(id);
      await load();
    } catch {
      // ignore
    }
  }, [load]);

  const markAllRead = useCallback(async () => {
    try {
      await apiMarkAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, _justRead: true }) as AdminNotification)
      );
      await load();
    } catch {
      // ignore
    }
  }, [load]);

  useEffect(() => {
    load();
    intervalRef.current = setInterval(load, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [load]);

  return { notifications, unreadCount, isLoading, markAsRead, markAllRead };
}
