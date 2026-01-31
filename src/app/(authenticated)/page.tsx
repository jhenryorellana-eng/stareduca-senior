'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/stores/auth-store';
import { useUserStore } from '@/stores/user-store';
import { Card, Avatar, ProgressBar } from '@/components/ui';
import { Bell, Play, Clock, BookMarked } from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import type { CourseWithProgress } from '@/types';

export default function HomePage() {
  const { token, parent } = useAuthStore();
  const { setStats, setUnreadNotifications, activeCourses, completedCourses, chaptersViewed } = useUserStore();
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!token) return;

      try {
        const response = await fetch('/api/courses', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCourses(data.courses);
          setStats(data.stats);
        }

        // Fetch profile for notifications count
        const profileRes = await fetch('/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUnreadNotifications(profileData.unreadNotifications);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [token, setStats, setUnreadNotifications]);

  // Get course in progress
  const courseInProgress = courses.find(
    (c) => c.isEnrolled && !c.isCompleted && c.progressPercent > 0
  );

  // Get recommended courses (not enrolled)
  const recommendedCourses = courses.filter((c) => !c.isEnrolled).slice(0, 5);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-inicio">
        <div className="animate-pulse">
          <div className="h-48 bg-gradient-to-br from-brand-blue to-brand-pink rounded-b-[2rem]" />
          <div className="px-4 -mt-16">
            <div className="bg-white rounded-xl h-40" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-inicio pb-6">
      {/* Header with gradient */}
      <header className="gradient-header pt-8 pb-24 px-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar
              src={parent?.avatarUrl}
              firstName={parent?.firstName || ''}
              lastName={parent?.lastName || ''}
              size="lg"
              className="border-2 border-white/30"
            />
            <div>
              <p className="text-white/80 text-xs font-light">Bienvenida,</p>
              <h1 className="text-white text-xl font-bold">
                {parent?.firstName} {parent?.lastName}
              </h1>
            </div>
          </div>
          <Link
            href="/avisos"
            className="size-10 flex items-center justify-center bg-white/10 rounded-full text-white"
          >
            <Bell size={20} />
          </Link>
        </div>
      </header>

      {/* Continue Learning Card */}
      <div className="px-4 -mt-16">
        {courseInProgress ? (
          <Card className="shadow-xl shadow-primary-inicio/10 border border-white/20">
            <p className="text-primary-inicio text-[10px] font-bold tracking-widest uppercase mb-3">
              Continuar Aprendiendo
            </p>
            <div className="flex gap-4">
              <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {courseInProgress.thumbnailUrl ? (
                  <Image
                    src={courseInProgress.thumbnailUrl}
                    alt={courseInProgress.title}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-inicio/20 to-brand-pink/20" />
                )}
              </div>
              <div className="flex flex-col justify-between py-1 flex-1">
                <div>
                  <h3 className="text-gray-900 text-base font-bold leading-tight">
                    {courseInProgress.title}
                  </h3>
                  <p className="text-gray-500 text-xs mt-1">
                    {courseInProgress.progressPercent}% completado
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Link
                    href={`/aprender/${courseInProgress.id}`}
                    className="bg-primary-inicio text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-1"
                  >
                    Continuar <Play size={14} className="fill-white" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-end mb-1">
                <p className="text-gray-400 text-[10px] font-medium">Progreso total del curso</p>
                <p className="text-primary-inicio text-xs font-bold">{courseInProgress.progressPercent}%</p>
              </div>
              <ProgressBar value={courseInProgress.progressPercent} size="md" />
            </div>
          </Card>
        ) : (
          <Card className="shadow-xl shadow-primary-inicio/10 border border-white/20">
            <p className="text-primary-inicio text-[10px] font-bold tracking-widest uppercase mb-3">
              Comienza tu aprendizaje
            </p>
            <p className="text-gray-600 text-sm mb-4">
              Explora nuestros cursos y comienza tu transformación como padre.
            </p>
            <Link
              href="/aprender"
              className="bg-primary-inicio text-white text-xs font-bold py-2 px-4 rounded-lg inline-flex items-center gap-1"
            >
              Explorar cursos <Play size={14} className="fill-white" />
            </Link>
          </Card>
        )}
      </div>

      {/* Stats Section */}
      <section className="mt-8 px-4">
        <h3 className="text-gray-900 text-lg font-bold mb-4">Tu progreso</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-b from-white to-primary-inicio/10 p-3 rounded-xl border border-primary-inicio/5 flex flex-col items-center text-center shadow-sm">
            <span className="text-primary-inicio font-bold text-xl">{activeCourses}</span>
            <p className="text-gray-600 text-[10px] font-medium leading-tight mt-1">
              Cursos activos
            </p>
          </div>
          <div className="bg-gradient-to-b from-white to-primary-inicio/10 p-3 rounded-xl border border-primary-inicio/5 flex flex-col items-center text-center shadow-sm">
            <span className="text-primary-inicio font-bold text-xl">{chaptersViewed}</span>
            <p className="text-gray-600 text-[10px] font-medium leading-tight mt-1">
              Capítulos vistos
            </p>
          </div>
          <div className="bg-gradient-to-b from-white to-primary-inicio/10 p-3 rounded-xl border border-primary-inicio/5 flex flex-col items-center text-center shadow-sm">
            <span className="text-primary-inicio font-bold text-xl">{completedCourses}</span>
            <p className="text-gray-600 text-[10px] font-medium leading-tight mt-1">
              Cursos completados
            </p>
          </div>
        </div>
      </section>

      {/* Recommended Courses */}
      {recommendedCourses.length > 0 && (
        <section className="mt-10">
          <div className="flex justify-between items-center px-4 mb-4">
            <h3 className="text-gray-900 text-lg font-bold">Recomendado para ti</h3>
            <Link href="/aprender" className="text-primary-inicio text-sm font-bold">
              Ver todo
            </Link>
          </div>
          <div className="flex overflow-x-auto gap-4 px-4 hide-scrollbar">
            {recommendedCourses.map((course) => (
              <Link
                key={course.id}
                href={`/aprender/${course.id}`}
                className="min-w-[240px] w-[240px] bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
              >
                <div className="h-32 bg-gray-100 relative">
                  {course.thumbnailUrl ? (
                    <Image
                      src={course.thumbnailUrl}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-inicio/20 to-brand-pink/20" />
                  )}
                </div>
                <div className="p-3">
                  <span className="text-[10px] font-bold text-primary-inicio uppercase">
                    {course.category}
                  </span>
                  <h4 className="text-gray-900 text-sm font-bold leading-tight mt-1">
                    {course.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-3 text-gray-400 text-[10px]">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatDuration(course.totalDuration)}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookMarked size={14} />
                      {course.totalChapters} Lecciones
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
