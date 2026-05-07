import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Bell, Trash2 } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { notifications, unreadCount, markAsRead, markAllRead, removeNotification, clearAll } = useNotifications();

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-end p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/50" />
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md glass rounded-2xl p-4 border border-white/[0.08] max-h-[80dvh] overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Bell size={18} className="text-xena-primary" />
                Bildirimler
                {unreadCount > 0 && (
                  <span className="bg-xena-danger text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={markAllRead} className="text-[11px] font-semibold text-xena-primary hover:text-white">
                  Tümünü Okundu
                </button>
                <button onClick={onClose} className="text-xena-muted hover:text-white">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-2 overflow-y-auto no-scrollbar max-h-[60dvh]">
              {notifications.length === 0 && (
                <div className="text-center py-10">
                  <Bell size={32} className="text-xena-muted mx-auto mb-2" />
                  <p className="text-sm text-xena-muted">Yeni bildirim yok</p>
                </div>
              )}
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    n.read
                      ? 'bg-xena-surface/50 border-white/[0.04]'
                      : 'bg-xena-primary/5 border-xena-primary/15'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{n.title}</h4>
                        {!n.read && <div className="w-2 h-2 rounded-full bg-xena-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-xena-muted mt-0.5 line-clamp-2">{n.body}</p>
                      <span className="text-[10px] text-xena-muted/60 mt-1">
                        {new Date(n.timestamp).toLocaleString('tr-TR')}
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }}
                      className="text-xena-muted hover:text-xena-danger shrink-0 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="w-full mt-3 py-2 text-xs font-semibold text-xena-muted hover:text-xena-danger transition-colors"
              >
                Tüm Bildirimleri Temizle
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
