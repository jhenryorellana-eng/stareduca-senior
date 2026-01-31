'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { BookOpen, AlertCircle, X } from 'lucide-react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(
        errorParam === 'session_expired'
          ? 'Tu sesión ha expirado. Vuelve a abrir la app desde Padres 3.0.'
          : 'Ha ocurrido un error de autenticación.'
      );
      setIsLoading(false);
      return;
    }

    if (!code) {
      setError('No se proporcionó un código de acceso. Abre la app desde Padres 3.0.');
      setIsLoading(false);
      return;
    }

    async function authenticate() {
      try {
        const response = await fetch('/api/auth/exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error || 'Código inválido o expirado. Intenta de nuevo.');
          setIsLoading(false);
          return;
        }

        const { token, parent } = await response.json();
        setAuth(token, parent);
        router.replace('/');
      } catch (err) {
        console.error('Auth error:', err);
        setError('Error de conexión. Verifica tu internet e intenta de nuevo.');
        setIsLoading(false);
      }
    }

    authenticate();
  }, [searchParams, router, setAuth]);

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Error de autenticación
          </h1>
          <p className="text-slate-500 mb-8">{error}</p>
          <button
            onClick={() => {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(
                  JSON.stringify({ type: 'CLOSE' })
                );
              }
            }}
            className="w-full gradient-primary text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-primary/30 transition-all duration-200 hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">StarEduca Senior</h1>
          <p className="text-slate-500">Iniciando sesión...</p>
          <div className="mt-6 flex justify-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
