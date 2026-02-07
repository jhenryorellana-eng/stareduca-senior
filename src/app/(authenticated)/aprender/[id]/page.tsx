'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/stores/auth-store';
import { ModuleList } from '@/components/courses';
import { ArrowLeft, Share2, Clock, BookMarked, Layers, Lock, GraduationCap, ArrowRight } from 'lucide-react';
import { formatDuration, cn } from '@/lib/utils';
import type { CourseWithProgress, ModuleWithChapters } from '@/types';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const [course, setCourse] = useState<CourseWithProgress | null>(null);
  const [modules, setModules] = useState<ModuleWithChapters[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const courseId = params.id as string;

  useEffect(() => {
    async function fetchCourse() {
      if (!token || !courseId) return;

      try {
        const response = await fetch(`/api/courses/${courseId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCourse(data.course);
          setModules(data.modules);
          setCurrentModuleIndex(data.currentModuleIndex);
          setCurrentChapterIndex(data.currentChapterIndex);
        } else {
          router.push('/aprender');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCourse();
  }, [token, courseId, router]);

  const handleEnroll = async () => {
    if (!token || !courseId) return;

    setIsEnrolling(true);
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Refresh course data
        const dataResponse = await fetch(`/api/courses/${courseId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (dataResponse.ok) {
          const data = await dataResponse.json();
          setCourse(data.course);
          setModules(data.modules);
          setCurrentModuleIndex(data.currentModuleIndex);
          setCurrentChapterIndex(data.currentChapterIndex);
        }
      }
    } catch (error) {
      console.error('Error enrolling:', error);
    } finally {
      setIsEnrolling(false);
    }
  };

  // Check if all chapters across all modules are completed
  const allChaptersCompleted = modules.length > 0 && modules.every((m) => m.isCompleted);

  // Get current chapter for the CTA button
  const currentModule = modules[currentModuleIndex];
  const currentChapter = currentModule?.chapters?.[currentChapterIndex];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light">
        <div className="animate-pulse">
          <div className="h-80 bg-gray-200" />
          <div className="px-4 -mt-8">
            <div className="bg-white rounded-2xl h-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background-light pb-32">
      {/* Hero Section */}
      <div className="relative h-80 tablet:h-96 w-full overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          {course.thumbnailUrl ? (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/40 to-brand-pink/40" />
          )}
        </div>

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, #2d0a31 100%)',
          }}
        />

        {/* Top Buttons */}
        <div className="relative z-10 flex items-center justify-between p-4 pt-8">
          <Link
            href="/aprender"
            className="flex items-center justify-center size-10 rounded-full bg-white/20 backdrop-blur-md text-white"
          >
            <ArrowLeft size={20} />
          </Link>
          <button className="flex items-center justify-center size-10 rounded-full bg-white/20 backdrop-blur-md text-white">
            <Share2 size={20} />
          </button>
        </div>

        {/* Title */}
        <div className="absolute bottom-16 left-0 w-full px-6 tablet:px-8 z-10">
          <h1 className="text-white text-3xl font-bold leading-tight tracking-tight">
            {course.title}
          </h1>
          <p className="text-white/80 text-sm mt-1 font-medium">
            {course.description?.substring(0, 50)}...
          </p>
        </div>
      </div>

      {/* Stats Card */}
      <div className="relative z-20 -mt-8 px-4 tablet:px-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 tablet:p-6 shadow-ios flex justify-center items-center gap-8">
          <div className="flex flex-col items-center">
            <Layers className="text-primary mb-1 w-6 h-6" />
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
              Módulos
            </p>
            <p className="text-base font-bold text-gray-900">
              {course.totalModules}
            </p>
          </div>
          <div className="w-[1px] h-8 bg-gray-100" />
          <div className="flex flex-col items-center">
            <BookMarked className="text-primary mb-1 w-6 h-6" />
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
              Capítulos
            </p>
            <p className="text-base font-bold text-gray-900">
              {course.totalChapters}
            </p>
          </div>
          <div className="w-[1px] h-8 bg-gray-100" />
          <div className="flex flex-col items-center">
            <Clock className="text-primary mb-1 w-6 h-6" />
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
              Duración
            </p>
            <p className="text-base font-bold text-gray-900">
              {formatDuration(course.totalDuration)}
            </p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="px-6 tablet:px-8 pt-8">
        <h2 className="text-lg font-bold mb-3 text-gray-900">Sobre este curso</h2>
        <p className="text-gray-700 text-[15px] font-medium leading-relaxed">
          {course.description}
        </p>
      </div>

      {/* Modules Section */}
      <div className="px-6 tablet:px-8 pt-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Contenido del curso</h2>
          <span className="text-xs font-semibold text-gray-400">
            {course.totalModules} módulos • {course.totalChapters} capítulos
          </span>
        </div>
        <ModuleList
          modules={modules}
          courseId={courseId}
        />
      </div>

      {/* Exam Section */}
      {course.hasEvaluation && (
        <div className="px-4 tablet:px-6 mt-10">
          <div className="bg-gradient-to-br from-[#2d0a31] via-[#4a1052] to-primary-light rounded-2xl p-7 text-white shadow-ios relative overflow-hidden">
            <div className="absolute -right-10 -top-10 size-40 bg-white/5 rounded-full blur-3xl" />
            <div className="relative z-10 flex justify-between items-start mb-4">
              <div className="flex-1 pr-4">
                <h3 className="text-2xl font-bold mb-3 tracking-tight">Examen Final</h3>
                <p className="text-white/80 text-[15px] leading-relaxed font-medium">
                  Ha llegado el momento de validar tu proceso. Una oportunidad para reflexionar
                  sobre lo aprendido y consolidar tu transformación.
                </p>
              </div>
              <div className="bg-white/15 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                <GraduationCap className="w-8 h-8" />
              </div>
            </div>
            {allChaptersCompleted ? (
              <Link
                href={`/aprender/${courseId}/evaluacion`}
                className="relative z-10 mt-4 w-full py-4 bg-white/20 backdrop-blur-md border border-white/15 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 tracking-wide"
              >
                Realizar examen
              </Link>
            ) : (
              <button
                disabled
                className="relative z-10 mt-4 w-full py-4 bg-white/10 backdrop-blur-md border border-white/15 rounded-xl font-bold text-sm text-white/70 flex items-center justify-center gap-2 tracking-wide cursor-not-allowed"
              >
                <Lock className="w-4 h-4" />
                Bloqueado hasta completar módulos
              </button>
            )}
          </div>
        </div>
      )}

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-background-light via-background-light/95 to-transparent flex justify-center z-50">
        {course.isEnrolled ? (
          <Link
            href={
              currentChapter
                ? `/aprender/${courseId}/capitulo/${currentChapter.id}`
                : `/aprender/${courseId}`
            }
            className="w-full max-w-sm tablet:max-w-md gradient-primary h-14 rounded-2xl flex items-center justify-center gap-3 text-white font-bold text-lg shadow-xl shadow-primary/30 active:scale-[0.98] transition-all"
          >
            <span>{course.isCompleted ? 'Repasar curso' : 'Continuar Aprendiendo'}</span>
            <ArrowRight size={20} />
          </Link>
        ) : (
          <button
            onClick={handleEnroll}
            disabled={isEnrolling}
            className={cn(
              'w-full max-w-sm gradient-primary h-14 rounded-2xl flex items-center justify-center gap-3 text-white font-bold text-lg shadow-xl shadow-primary/30 active:scale-[0.98] transition-all',
              isEnrolling && 'opacity-50'
            )}
          >
            {isEnrolling ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Inscribiendo...
              </>
            ) : (
              <>
                <span>Inscribirse al curso</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
