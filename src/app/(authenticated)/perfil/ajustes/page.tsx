'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { Avatar } from '@/components/ui';
import { ChevronLeft, User, Mail, Info } from 'lucide-react';

export default function AjustesPage() {
  const { parent } = useAuthStore();

  const infoItems = [
    { icon: User, label: 'Nombre', value: `${parent?.firstName || ''} ${parent?.lastName || ''}` },
    { icon: Mail, label: 'Correo electrónico', value: parent?.email || '' },
  ];

  return (
    <div className="min-h-screen bg-background-light">
      <header className="sticky top-0 z-50 backdrop-blur-[20px] bg-white/80 border-b border-primary/10">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/perfil" className="text-primary">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-lg font-bold">Ajustes de cuenta</h1>
          <div className="w-6" />
        </div>
      </header>

      <div className="px-4 tablet:px-6 py-6">
        {/* Profile card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center mb-6">
          <div className="flex justify-center mb-4">
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
          <h2 className="text-xl font-bold text-gray-900">
            {parent?.firstName} {parent?.lastName}
          </h2>
        </div>

        {/* Info items */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          {infoItems.map((item, index) => (
            <div
              key={item.label}
              className={`flex items-center gap-4 px-4 py-4 ${
                index < infoItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                <p className="text-gray-900 font-medium">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <div className="mt-6 bg-blue-50 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            Para modificar tu información personal, accede desde la app <strong>Padres 3.0</strong> en la sección de perfil.
          </p>
        </div>
      </div>
    </div>
  );
}
