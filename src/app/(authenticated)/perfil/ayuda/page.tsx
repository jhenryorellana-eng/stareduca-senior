'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronDown, Mail, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: '¿Cómo cambio mi contraseña?',
    answer: 'Puedes cambiar tu contraseña desde la app Padres 3.0, en Perfil > Ajustes de cuenta > Cambiar contraseña.',
  },
  {
    question: '¿Cómo reporto contenido inapropiado?',
    answer: 'En la sección Comunidad, toca el ícono de tres puntos (...) en cualquier publicación y selecciona "Reportar". Nuestro equipo revisará el reporte dentro de 24 horas.',
  },
  {
    question: '¿Cómo bloqueo a un usuario?',
    answer: 'En cualquier publicación, toca los tres puntos (...) y selecciona "Bloquear usuario". Ya no verás su contenido. Puedes desbloquear desde Privacidad y Seguridad.',
  },
  {
    question: '¿Cómo cancelo mi membresía?',
    answer: 'Para cancelar, ve a la app Padres 3.0 > Perfil > Membresía > Cancelar suscripción. También puedes cancelar desde la configuración de suscripciones de tu dispositivo.',
  },
  {
    question: '¿Los cursos tienen certificado?',
    answer: 'Sí, al completar un curso recibirás un certificado digital que podrás descargar y compartir.',
  },
];

export default function AyudaPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background-light">
      <header className="sticky top-0 z-50 backdrop-blur-[20px] bg-white/80 border-b border-primary/10">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/perfil" className="text-primary">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-lg font-bold">Centro de ayuda</h1>
          <div className="w-6" />
        </div>
      </header>

      <div className="px-4 tablet:px-6 py-6 space-y-6">
        {/* FAQ */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Preguntas frecuentes
          </h3>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={index < faqs.length - 1 ? 'border-b border-gray-100' : ''}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900 text-sm pr-4">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 text-gray-400 transition-transform flex-shrink-0',
                      openFaq === index && 'rotate-180'
                    )}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-gray-500 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Contacto
          </h3>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <a
              href="mailto:soporte@starbizacademy.com"
              className="flex items-center gap-4 px-4 py-4 hover:bg-primary/5 transition-colors border-b border-gray-100"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Correo de soporte</p>
                <p className="text-xs text-gray-400">soporte@starbizacademy.com</p>
              </div>
            </a>
            <a
              href="https://wa.me/+1234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 px-4 py-4 hover:bg-primary/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">WhatsApp</p>
                <p className="text-xs text-gray-400">Respuesta en horario laboral</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
