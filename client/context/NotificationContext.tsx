import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Dexie from 'dexie';

const db = new Dexie('xenahub_notifications') as any;
db.version(1).stores({ notifications: 'id' });

export interface Notification {
  id: string;
  type: 'system' | 'prize' | 'message' | 'event';
  title: string;
  body: string;
  read: boolean;
  timestamp: number;
}

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await db.notifications.orderBy('timestamp').reverse().toArray();
      setNotifications(data);
    } catch { /* ignore */ }
  };

  const save = async (data: Notification[]) => {
    await db.notifications.clear();
    await db.notifications.bulkPut(data);
  };

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'read' | 'timestamp'>) => {
    const entry: Notification = { ...n, id: Date.now().toString(), read: false, timestamp: Date.now() };
    setNotifications((prev) => { const next = [entry, ...prev].slice(0, 100); save(next); return next; });
    if ('Notification' in window && Notification.permission === 'granted') {
      new window.Notification(n.title, { body: n.body, icon: '/icons/icon-192x192.png' });
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => { const next = prev.map((n) => n.id === id ? { ...n, read: true } : n); save(next); return next; });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => { const next = prev.map((n) => ({ ...n, read: true })); save(next); return next; });
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => { const next = prev.filter((n) => n.id !== id); save(next); return next; });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    db.notifications.clear();
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllRead, removeNotification, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be inside NotificationProvider');
  return ctx;
}

export default NotificationContext;
