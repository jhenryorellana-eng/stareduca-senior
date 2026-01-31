'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/stores/auth-store';
import { useUserStore } from '@/stores/user-store';
import { MaterialsList } from '@/components/courses';
import { ArrowLeft, MoreHorizontal, Play, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { formatDuration, formatVideoTime, cn } from '@/lib/utils';
import type { ChapterWithProgress, Material } from '@/types';

interface ChapterData extends ChapterWithProgress {
  materials: Material[];
}

interface CourseInfo {
  id: string;
  title: string;
  slug: string;
}

interface NavigationInfo {
  currentIndex: number;
  totalChapters: number;
  prevChapterId: string | null;
  nextChapterId: string | null;
}

export default function ChapterPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const { incrementChaptersViewed } = useUserStore();
  const [chapter, setChapter] = useState<ChapterData | null>(null);
  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [navigation, setNavigation] = useState<NavigationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);

  const courseId = params.id as string;
  const chapterId = params.capituloId as string;

  useEffect(() => {
    async function fetchChapter() {
      if (!token || !chapterId) return;

      try {
        const response = await fetch(`/api/chapters/${chapterId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setChapter(data.chapter);
          setCourse(data.course);
          setNavigation(data.navigation);
        } else {
          router.push(`/aprender/${courseId}`);
        }
      } catch (error) {
        console.error('Error fetching chapter:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchChapter();
  }, [token, chapterId, courseId, router]);

  const handleMarkComplete = async () => {
    if (!token || !chapterId || chapter?.isCompleted) return;

    setIsCompleting(true);
    try {
      const response = await fetch(`/api/chapters/${chapterId}/progress`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markCompleted: true }),
      });

      if (response.ok) {
        setChapter((prev) => prev ? { ...prev, isCompleted: true } : null);
        incrementChaptersViewed();
      }
    } catch (error) {
      console.error('Error marking complete:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-capitulo">
        <div className="animate-pulse">
          <div className="h-14 bg-white border-b" />
          <div className="aspect-video bg-gray-200" />
          <div className="p-6 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!chapter || !course || !navigation) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background-capitulo flex flex-col">
      {/* Header */}
      <header className="flex items-center bg-background-capitulo p-4 justify-between sticky top-0 z-10 border-b border-gray-100">
        <Link
          href={`/aprender/${courseId}`}
          className="text-gray-900 flex size-10 shrink-0 items-center justify-center cursor-pointer"
        >
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-gray-900 text-base font-bold leading-tight tracking-tight flex-1 text-center">
          {course.title}
        </h2>
        <div className="size-10 flex items-center justify-center">
          <MoreHorizontal className="text-gray-900" size={20} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Video Player */}
        <div className="w-full px-0">
          <div
            className="relative flex items-center justify-center bg-black aspect-video overflow-hidden shadow-lg"
          >
            {/* Video Thumbnail */}
            {chapter.videoUrl ? (
              <iframe
                src={chapter.videoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-primary-capitulo/40 to-primary-light/40" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <button className="flex shrink-0 items-center justify-center rounded-full size-20 bg-white/20 backdrop-blur-md text-white border border-white/30 transition-transform active:scale-95 shadow-xl">
                    <Play className="w-10 h-10 fill-white" />
                  </button>
                </div>
              </>
            )}

            {/* Video Controls Overlay */}
            {!chapter.videoUrl && (
              <div className="absolute inset-x-0 bottom-0 p-4 video-overlay">
                <div className="flex h-1.5 items-center justify-center mb-2">
                  <div
                    className="h-1 rounded-full bg-gradient-to-r from-primary-capitulo to-primary-light"
                    style={{ flex: 0.35 }}
                  />
                  <div className="relative">
                    <div className="absolute -left-1.5 -top-1.5 size-3 rounded-full bg-white shadow-lg" />
                  </div>
                  <div
                    className="h-1 rounded-full bg-white/20"
                    style={{ flex: 0.65 }}
                  />
                </div>
                <div className="flex items-center justify-between px-1">
                  <p className="text-white text-[10px] font-bold tracking-wide opacity-90">
                    {formatVideoTime(chapter.watchTimeSeconds)}
                  </p>
                  <p className="text-white text-[10px] font-bold tracking-wide opacity-90">
                    {formatVideoTime(chapter.durationMinutes * 60)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chapter Info */}
        <div className="px-6 py-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-gray-900 tracking-tight text-2xl font-bold leading-tight pb-1">
                {navigation.currentIndex}. {chapter.title}
              </h3>
              <p className="text-primary-capitulo/70 text-[11px] font-bold uppercase tracking-widest pb-5">
                Capítulo {navigation.currentIndex} de {navigation.totalChapters} • {formatDuration(chapter.durationMinutes)}
              </p>
            </div>
            {chapter.isCompleted && (
              <div className="flex items-center gap-1 bg-green-100 px-3 py-1.5 rounded-full">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs font-semibold text-green-600">Completado</span>
              </div>
            )}
          </div>
          <p className="text-gray-700 text-base font-normal leading-relaxed">
            {chapter.description}
          </p>
        </div>

        {/* Materials */}
        {chapter.materials && chapter.materials.length > 0 && (
          <div className="px-6 pb-6">
            <MaterialsList materials={chapter.materials} />
          </div>
        )}

        {/* Mark Complete Button */}
        {!chapter.isCompleted && (
          <div className="px-6 pb-4">
            <button
              onClick={handleMarkComplete}
              disabled={isCompleting}
              className={cn(
                'w-full py-4 rounded-2xl font-bold text-white transition-all active:scale-[0.98]',
                'bg-gradient-to-r from-primary-capitulo to-primary-light shadow-lg shadow-primary-capitulo/30',
                isCompleting && 'opacity-50'
              )}
            >
              {isCompleting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Marcar como completado
                </span>
              )}
            </button>
          </div>
        )}

        <div className="flex-grow" />

        {/* Navigation Buttons */}
        <div className="p-6 pb-12 grid grid-cols-2 gap-4 bg-background-capitulo">
          {navigation.prevChapterId ? (
            <Link
              href={`/aprender/${courseId}/capitulo/${navigation.prevChapterId}`}
              className="flex items-center justify-center gap-2 py-4 px-4 rounded-2xl border border-gray-200 bg-white text-gray-900 font-semibold transition-all active:bg-gray-50 active:scale-[0.98] shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Anterior</span>
            </Link>
          ) : (
            <div />
          )}
          {navigation.nextChapterId ? (
            chapter.isCompleted ? (
              <Link
                href={`/aprender/${courseId}/capitulo/${navigation.nextChapterId}`}
                className="flex items-center justify-center gap-2 py-4 px-4 rounded-2xl bg-white border border-gray-200 font-bold transition-all active:bg-gray-50 active:scale-[0.98] shadow-sm"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-capitulo to-primary-light">
                  Siguiente
                </span>
                <ChevronRight className="w-5 h-5 text-primary-light" />
              </Link>
            ) : (
              <div className="flex items-center justify-center gap-2 py-4 px-4 rounded-2xl bg-gray-100 border border-gray-200 font-bold text-gray-400 cursor-not-allowed">
                <span>Siguiente</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            )
          ) : (
            <Link
              href={`/aprender/${courseId}`}
              className="flex items-center justify-center gap-2 py-4 px-4 rounded-2xl bg-gradient-to-r from-primary-capitulo to-primary-light text-white font-bold transition-all active:scale-[0.98] shadow-sm"
            >
              <span>Volver al curso</span>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
