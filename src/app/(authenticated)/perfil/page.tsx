'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { useUserStore } from '@/stores/user-store';
import { useAuth } from '@/hooks/use-auth';
import { Avatar } from '@/components/ui';
import { ChevronLeft, Settings, Lock, HelpCircle, LogOut, ChevronRight } from 'lucide-react';

export default function PerfilPage() {
  const { token, parent } = useAuthStore();
  const { activeCourses, completedCourses, chaptersViewed, setStats } = useUserStore();
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!token) return;

      try {
        const response = await fetch('/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [token, setStats]);

  // Calculate a simple progress metric
  const totalProgress = completedCourses > 0
    ? Math.min(Math.round((completedCourses / (activeCourses + completedCourses)) * 100), 100)
    : (activeCourses > 0 ? 10 : 0);

  const settingsItems = [
    { icon: Settings, label: 'Ajustes de cuenta', href: '#' },
    { icon: Lock, label: 'Privacidad y Seguridad', href: '#' },
    { icon: HelpCircle, label: 'Centro de ayuda', href: '#' },
  ];

  return (
    <div className="min-h-screen bg-background-light">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-[20px] bg-white/80 border-b border-primary/10">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="text-primary">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-lg font-bold">Perfil</h1>
          <div className="w-6" />
        </div>
      </header>

      {/* Header Gradient */}
      <div className="h-48 bg-gradient-to-r from-primary to-pink-400 opacity-90" />

      {/* Profile Card */}
      <div className="px-4 -mt-24 relative z-10">
        <div className="bg-white rounded-2xl p-6 shadow-ios text-center">
          {/* Avatar */}
          <div className="flex justify-center -mt-16 mb-4">
            <div className="p-1 rounded-full bg-gradient-to-br from-primary to-white">
              <Avatar
                src={parent?.avatarUrl}
                firstName={parent?.firstName || ''}
                lastName={parent?.lastName || ''}
                size="xl"
                className="border-4 border-white"
              />
            </div>
          </div>

          {/* Info */}
          <h2 className="text-[22px] font-bold text-gray-900">
            {parent?.firstName} {parent?.lastName}
          </h2>
          <p className="text-primary/70 text-sm mt-1">{parent?.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 mt-6">
        <div className="bg-gradient-to-b from-white to-primary/10 rounded-2xl p-4 border border-white shadow-sm">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/40 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-primary">{activeCourses + completedCourses}</p>
              <p className="text-xs text-gray-500 font-medium mt-1">Sesiones</p>
            </div>
            <div className="bg-white/40 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-primary">{chaptersViewed}</p>
              <p className="text-xs text-gray-500 font-medium mt-1">Módulos</p>
            </div>
            <div className="bg-white/40 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-primary">{totalProgress}%</p>
              <p className="text-xs text-gray-500 font-medium mt-1">Progreso</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="px-4 mt-8">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
          Configuración
        </h3>
        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          {settingsItems.map((item, index) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center justify-between px-4 py-4 hover:bg-primary/5 transition-colors ${
                index < settingsItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium text-gray-900">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          ))}
        </div>
      </div>

      {/* Logout Button */}
      <div className="px-4 mt-8 pb-8">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-red-500/30 text-red-500 font-semibold hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
