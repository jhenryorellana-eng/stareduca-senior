'use client';

import { useState } from 'react';
import { Shield, CheckCircle, Users, AlertTriangle, Heart } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

interface TermsGateProps {
  onAccepted: () => void;
}

const communityRules = [
  {
    icon: Heart,
    title: 'Sé respetuoso',
    description: 'Trata a todos los miembros con respeto y empatía.',
  },
  {
    icon: Shield,
    title: 'Sin contenido ofensivo',
    description: 'No se tolera lenguaje ofensivo, discriminatorio o contenido inapropiado.',
  },
  {
    icon: Users,
    title: 'Protege la privacidad',
    description: 'No compartas información personal de otros miembros sin su consentimiento.',
  },
  {
    icon: AlertTriangle,
    title: 'Reporta contenido',
    description: 'Si ves algo inapropiado, repórtalo. Actuaremos dentro de 24 horas.',
  },
];

export function TermsGate({ onAccepted }: TermsGateProps) {
  const { token } = useAuthStore();
  const [isAccepting, setIsAccepting] = useState(false);

  async function handleAccept() {
    if (!token) return;

    setIsAccepting(true);
    try {
      const response = await fetch('/api/terms', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        onAccepted();
      }
    } catch (error) {
      console.error('Error accepting terms:', error);
    } finally {
      setIsAccepting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="gradient-header p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Normas de la Comunidad</h2>
          <p className="text-white/80 text-sm mt-2">
            Antes de participar, acepta nuestras normas
          </p>
        </div>

        {/* Rules */}
        <div className="p-6 space-y-4">
          {communityRules.map((rule) => (
            <div key={rule.title} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <rule.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{rule.title}</h3>
                <p className="text-gray-500 text-xs mt-0.5">{rule.description}</p>
              </div>
            </div>
          ))}

          <div className="bg-gray-50 rounded-xl p-4 mt-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              Al aceptar, te comprometes a seguir estas normas. El incumplimiento puede resultar
              en la eliminación de tu contenido o la suspensión de tu cuenta. Los usuarios que
              publiquen contenido objetable serán expulsados de la comunidad.
            </p>
          </div>
        </div>

        {/* Accept button */}
        <div className="px-6 pb-6">
          <button
            onClick={handleAccept}
            disabled={isAccepting}
            className="w-full py-3.5 rounded-xl gradient-primary text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isAccepting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            {isAccepting ? 'Aceptando...' : 'Acepto las normas de la comunidad'}
          </button>
        </div>
      </div>
    </div>
  );
}
