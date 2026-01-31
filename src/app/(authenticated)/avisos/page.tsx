'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useUserStore } from '@/stores/user-store';
import { ArrowLeft, Settings, MessageCircle, Heart, BookOpen, Bell, CheckCheck } from 'lucide-react';
import { formatRelativeTime, cn } from '@/lib/utils';
import type { Notification } from '@/types';

const typeIcons = {
  comment: MessageCircle,
  reaction: Heart,
  resource: BookOpen,
  reminder: Bell,
  system: Bell,
};

const typeColors = {
  comment: 'bg-blue-100 text-blue-600',
  reaction: 'bg-pink-100 text-pink-600',
  resource: 'bg-purple-100 text-purple-600',
  reminder: 'bg-amber-100 text-amber-600',
  system: 'bg-gray-100 text-gray-600',
};

export default function AvisosPage() {
  const { token } = useAuthStore();
  const { setUnreadNotifications } = useUserStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  async function fetchNotifications() {
    if (!token) return;

    try {
      const response = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function markAllAsRead() {
    if (!token) return;

    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setUnreadNotifications(0);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Group notifications by date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const todayNotifications = notifications.filter(
    (n) => new Date(n.createdAt) >= today
  );
  const thisWeekNotifications = notifications.filter(
    (n) => new Date(n.createdAt) >= weekAgo && new Date(n.createdAt) < today
  );
  const olderNotifications = notifications.filter(
    (n) => new Date(n.createdAt) < weekAgo
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-background-avisos">
      {/* Header */}
      <header className="gradient-avisos pt-12 pb-8 px-6">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white"
          >
            <ArrowLeft size={20} />
          </Link>
          <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
            <Settings size={20} />
          </button>
        </div>
        <h1 className="text-white text-3xl font-bold">Notificaciones</h1>
        <p className="text-white/70 text-sm mt-1">Tu camino de transformación personal</p>
      </header>

      {/* Content */}
      <div className="bg-white rounded-t-3xl -mt-6 min-h-[calc(100vh-200px)]">
        {/* Mark all read button */}
        {unreadCount > 0 && (
          <div className="px-6 py-4 border-b border-gray-100">
            <button
              onClick={markAllAsRead}
              className="text-primary-avisos text-sm font-semibold flex items-center gap-2"
            >
              <CheckCheck size={16} />
              Marcar todo como leído ({unreadCount})
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-12 h-12 rounded-xl bg-gray-200" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <CheckCheck className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500">Has revisado todas tus actualizaciones importantes.</p>
          </div>
        ) : (
          <div className="pb-24">
            {/* Today */}
            {todayNotifications.length > 0 && (
              <NotificationSection title="Hoy" notifications={todayNotifications} />
            )}

            {/* This week */}
            {thisWeekNotifications.length > 0 && (
              <NotificationSection title="Esta semana" notifications={thisWeekNotifications} />
            )}

            {/* Older */}
            {olderNotifications.length > 0 && (
              <NotificationSection title="Anteriores" notifications={olderNotifications} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationSection({
  title,
  notifications,
}: {
  title: string;
  notifications: Notification[];
}) {
  return (
    <div>
      <h2 className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
        {title}
      </h2>
      <div className="space-y-1">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  );
}

function NotificationItem({ notification }: { notification: Notification }) {
  const router = useRouter();
  const Icon = typeIcons[notification.type as keyof typeof typeIcons] || Bell;
  const colorClass = typeColors[notification.type as keyof typeof typeColors] || typeColors.system;

  function handleClick() {
    const data = notification.data as Record<string, string> | null;

    if (notification.type === 'comment' || notification.type === 'reaction') {
      // Navigate to community page
      router.push('/comunidad');
    } else if (notification.type === 'resource' && data?.courseId) {
      // Navigate to course page
      router.push(`/aprender/${data.courseId}`);
    }
  }

  const isClickable = ['comment', 'reaction', 'resource'].includes(notification.type);

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex items-start gap-3 px-6 py-4 transition-colors',
        !notification.isRead && 'bg-primary-avisos/5',
        isClickable && 'cursor-pointer hover:bg-gray-50 active:bg-gray-100'
      )}
    >
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', colorClass)}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-base', notification.isRead ? 'font-medium' : 'font-bold')}>
          {notification.title}
        </p>
        <p className="text-sm text-gray-500 line-clamp-2">{notification.message}</p>
        <p
          className={cn(
            'text-[11px] mt-1 font-medium',
            notification.isRead ? 'text-gray-400' : 'text-primary-avisos'
          )}
        >
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
      {!notification.isRead && (
        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary-avisos to-purple-600 flex-shrink-0 mt-2" />
      )}
    </div>
  );
}
