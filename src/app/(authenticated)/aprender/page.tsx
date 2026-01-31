'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { CourseCard } from '@/components/courses';
import { Input } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CourseWithProgress, CourseCategory } from '@/types';

const categories: { value: CourseCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'maternidad', label: 'Maternidad' },
  { value: 'comunicacion', label: 'Comunicación' },
  { value: 'limites', label: 'Límites' },
  { value: 'emociones', label: 'Emociones' },
  { value: 'adolescencia', label: 'Adolescencia' },
];

export default function AprenderPage() {
  const { token } = useAuthStore();
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | 'all'>('all');

  useEffect(() => {
    async function fetchCourses() {
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
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCourses();
  }, [token]);

  // Filter courses
  const filteredCourses = useMemo(() => {
    let result = courses;

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter((c) => c.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [courses, selectedCategory, searchQuery]);

  // Separate enrolled and available courses
  const enrolledCourses = filteredCourses.filter((c) => c.isEnrolled);
  const availableCourses = filteredCourses.filter((c) => !c.isEnrolled);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-aprender">
        <div className="animate-pulse">
          <div className="h-32 gradient-header" />
          <div className="px-4 -mt-8">
            <div className="bg-white rounded-xl h-14" />
          </div>
          <div className="p-4 space-y-4 mt-6">
            <div className="bg-white rounded-xl h-40" />
            <div className="bg-white rounded-xl h-40" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-aprender">
      {/* Header */}
      <header className="gradient-header pt-12 pb-16 px-6 relative">
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="text-white flex items-center">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-white text-2xl font-bold tracking-tight">Aprender</h1>
          <div className="size-6" />
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-4 -mt-8 relative z-10">
        <div className="shadow-lg">
          <Input
            icon="search"
            placeholder="Buscar cursos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white h-14"
          />
        </div>
      </div>

      {/* Category Chips */}
      <div className="mt-6">
        <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar pb-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={cn(
                'flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 shadow-sm transition-all',
                selectedCategory === cat.value
                  ? 'bg-gradient-to-r from-primary-aprender to-brand-pink text-white'
                  : 'bg-white text-gray-900 border border-gray-100'
              )}
            >
              <p
                className={cn(
                  'text-sm leading-normal',
                  selectedCategory === cat.value ? 'font-semibold' : 'font-medium'
                )}
              >
                {cat.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Enrolled Courses */}
      {enrolledCourses.length > 0 && (
        <div className="px-4 mt-6">
          <h3 className="text-gray-900 text-lg font-bold leading-tight tracking-tight mb-4">
            Mis Cursos
          </h3>
          <div className="flex flex-col gap-4">
            {enrolledCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      )}

      {/* Available Courses */}
      {availableCourses.length > 0 && (
        <div className="px-4 mt-6">
          <h3 className="text-gray-900 text-lg font-bold leading-tight tracking-tight mb-4">
            Explora Cursos
          </h3>
          <div className="flex flex-col gap-4 pb-6">
            {availableCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="px-4 mt-12 text-center">
          <p className="text-gray-500 text-sm">
            {searchQuery
              ? 'No se encontraron cursos con ese nombre'
              : 'No hay cursos disponibles en esta categoría'}
          </p>
        </div>
      )}
    </div>
  );
}
