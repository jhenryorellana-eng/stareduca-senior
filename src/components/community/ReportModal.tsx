'use client';

import { useState } from 'react';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';

interface ReportModalProps {
  postId: string;
  commentId?: string;
  onClose: () => void;
}

const reportReasons = [
  { value: 'spam', label: 'Spam o publicidad' },
  { value: 'harassment', label: 'Acoso o bullying' },
  { value: 'inappropriate', label: 'Contenido inapropiado' },
  { value: 'misinformation', label: 'Información falsa' },
  { value: 'other', label: 'Otro motivo' },
];

export function ReportModal({ postId, commentId, onClose }: ReportModalProps) {
  const { token } = useAuthStore();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!reason || !token) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/posts/${postId}/report`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason, description, commentId }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(onClose, 2000);
      } else {
        const data = await response.json();
        setError(data.error || 'Error al enviar reporte');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Reporte enviado</h3>
          <p className="text-gray-500 text-sm">Revisaremos el contenido reportado dentro de las próximas 24 horas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-bold">Reportar contenido</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-500">
            ¿Por qué quieres reportar esta publicación?
          </p>

          {/* Reasons */}
          <div className="space-y-2">
            {reportReasons.map((r) => (
              <button
                key={r.value}
                onClick={() => setReason(r.value)}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-xl border transition-all',
                  reason === r.value
                    ? 'border-primary bg-primary/5 text-primary font-medium'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Optional description */}
          {reason && (
            <textarea
              placeholder="Descripción adicional (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none text-sm"
            />
          )}

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <button
            onClick={handleSubmit}
            disabled={!reason || isSubmitting}
            className={cn(
              'w-full py-3 rounded-xl font-semibold text-sm transition-all',
              reason && !isSubmitting
                ? 'gradient-primary text-white'
                : 'bg-gray-100 text-gray-400'
            )}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar reporte'}
          </button>
        </div>
      </div>
    </div>
  );
}
