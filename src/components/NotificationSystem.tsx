import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

const typeConfig: Record<NotificationType, { icon: any; color: string; bgColor: string }> = {
  success: { icon: CheckCircle, color: 'text-green-400', bgColor: 'bg-green-500/10 border-green-500/20' },
  error: { icon: XCircle, color: 'text-red-400', bgColor: 'bg-red-500/10 border-red-500/20' },
  warning: { icon: AlertTriangle, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10 border-yellow-500/20' },
  info: { icon: Info, color: 'text-blue-400', bgColor: 'bg-blue-500/10 border-blue-500/20' },
};

export default function NotificationSystem({ notifications, onRemove }: NotificationSystemProps) {
  return (
    <div className="fixed top-4 left-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={onRemove}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function NotificationItem({ notification, onRemove }: { notification: Notification; onRemove: (id: string) => void }) {
  const config = typeConfig[notification.type];
  const Icon = config.icon;
  const duration = notification.duration || 5000;

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(notification.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [notification.id, duration, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      className={`p-3 rounded-lg border ${config.bgColor} backdrop-blur-sm shadow-lg`}
    >
      <div className="flex items-start gap-2">
        <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#e2e8f0]">{notification.title}</p>
          {notification.message && (
            <p className="text-xs text-[#94a3b8] mt-0.5">{notification.message}</p>
          )}
        </div>
        <button
          onClick={() => onRemove(notification.id)}
          className="p-0.5 rounded hover:bg-[#252530] transition-colors text-[#94a3b8]"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification = { ...notification, id };
    setNotifications(prev => [...prev, newNotification]);
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const success = (title: string, message?: string, duration?: number) => {
    return addNotification({ type: 'success', title, message, duration });
  };

  const error = (title: string, message?: string, duration?: number) => {
    return addNotification({ type: 'error', title, message, duration });
  };

  const warning = (title: string, message?: string, duration?: number) => {
    return addNotification({ type: 'warning', title, message, duration });
  };

  const info = (title: string, message?: string, duration?: number) => {
    return addNotification({ type: 'info', title, message, duration });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
  };
}
