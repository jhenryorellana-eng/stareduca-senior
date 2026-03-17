'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { Avatar } from '@/components/ui';
import { ChevronLeft, ExternalLink, UserX, Shield } from 'lucide-react';

interface BlockedUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export default function PrivacidadPage() {
  const { token } = useAuthStore();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBlocked() {
      if (!token) return;
      try {
        const response = await fetch('/api/users/blocked', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setBlockedUsers(data.users);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBlocked();
  }, [token]);

  async function handleUnblock(userId: string) {
    if (!token || !confirm('¿Deseas desbloquear a este usuario?')) return;

    try {
      const response = await fetch(`/api/users/${userId}/block`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setBlockedUsers(blockedUsers.filter(u => u.id !== userId));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  return (
    <div className="min-h-screen bg-background-light">
      <header className="sticky top-0 z-50 backdrop-blur-[20px] bg-white/80 border-b border-primary/10">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/perfil" className="text-primary">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-lg font-bold">Privacidad y Seguridad</h1>
          <div className="w-6" />
        </div>
      </header>

      <div className="px-4 tablet:px-6 py-6 space-y-6">
        {/* Privacy Policy Link */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <a
            href="https://starbizacademy.com/padres-30/politica-de-privacidad"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-4 hover:bg-primary/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium text-gray-900">Política de privacidad</span>
            </div>
            <ExternalLink className="w-5 h-5 text-gray-400" />
          </a>
        </div>

        {/* Blocked Users */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Usuarios bloqueados
          </h3>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : blockedUsers.length === 0 ? (
              <div className="p-8 text-center">
                <UserX className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No has bloqueado a ningún usuario</p>
              </div>
            ) : (
              blockedUsers.map((user, index) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between px-4 py-3 ${
                    index < blockedUsers.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={user.avatarUrl}
                      firstName={user.firstName}
                      lastName={user.lastName}
                      size="sm"
                    />
                    <span className="font-medium text-gray-900 text-sm">
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                  <button
                    onClick={() => handleUnblock(user.id)}
                    className="text-xs font-semibold text-red-500 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                  >
                    Desbloquear
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
