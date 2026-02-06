import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAuthFromRequest, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthFromRequest(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  const { id } = await params;

  try {
    // Get chapter with materials and module info
    const { data: chapter, error: chapterError } = await supabaseAdmin
      .from('chapters')
      .select(`
        id,
        course_id,
        module_id,
        title,
        description,
        video_url,
        duration_minutes,
        order_index,
        materials(
          id,
          title,
          type,
          url,
          description,
          order_index
        )
      `)
      .eq('id', id)
      .single();

    if (chapterError || !chapter) {
      return NextResponse.json(
        { error: 'Capítulo no encontrado' },
        { status: 404 }
      );
    }

    // Get course info
    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('id, title, slug')
      .eq('id', chapter.course_id)
      .single();

    // Get module info
    let moduleInfo = null;
    if (chapter.module_id) {
      const { data: module } = await supabaseAdmin
        .from('modules')
        .select('id, title, order_index')
        .eq('id', chapter.module_id)
        .single();
      moduleInfo = module;
    }

    // Get all modules with chapters for cross-module navigation
    const { data: allModules } = await supabaseAdmin
      .from('modules')
      .select('id, title, order_index')
      .eq('course_id', chapter.course_id)
      .order('order_index', { ascending: true });

    // Get all chapters across all modules for navigation
    const moduleIds = (allModules || []).map((m) => m.id);
    let allChapters: { id: string; module_id: string; order_index: number }[] = [];

    if (moduleIds.length > 0) {
      const { data } = await supabaseAdmin
        .from('chapters')
        .select('id, module_id, order_index')
        .in('module_id', moduleIds)
        .order('order_index', { ascending: true });
      allChapters = data || [];
    }

    // Build a flat ordered list of all chapters across modules (sorted by module order, then chapter order)
    const sortedModuleIds = (allModules || [])
      .sort((a, b) => a.order_index - b.order_index)
      .map((m) => m.id);

    const flatChapters: { id: string; moduleId: string }[] = [];
    for (const modId of sortedModuleIds) {
      const moduleChapters = allChapters
        .filter((ch) => ch.module_id === modId)
        .sort((a, b) => a.order_index - b.order_index);
      for (const ch of moduleChapters) {
        flatChapters.push({ id: ch.id, moduleId: ch.module_id });
      }
    }

    // Find current position in flat list
    const currentFlatIndex = flatChapters.findIndex((ch) => ch.id === id);
    const prevChapterId = currentFlatIndex > 0 ? flatChapters[currentFlatIndex - 1].id : null;
    const nextChapterId = currentFlatIndex < flatChapters.length - 1 ? flatChapters[currentFlatIndex + 1].id : null;

    // Calculate chapter index within its module
    const chaptersInModule = allChapters
      .filter((ch) => ch.module_id === chapter.module_id)
      .sort((a, b) => a.order_index - b.order_index);
    const chapterIndexInModule = chaptersInModule.findIndex((ch) => ch.id === id);

    // Get chapter progress
    const { data: progress } = await supabaseAdmin
      .from('chapter_progress')
      .select('is_completed, watch_time_seconds')
      .eq('parent_id', auth.sub)
      .eq('chapter_id', id)
      .single();

    // Sort materials
    const sortedMaterials = (chapter.materials || []).sort(
      (a, b) => a.order_index - b.order_index
    );

    const response = NextResponse.json({
      chapter: {
        id: chapter.id,
        courseId: chapter.course_id,
        moduleId: chapter.module_id,
        title: chapter.title,
        description: chapter.description,
        videoUrl: chapter.video_url,
        durationMinutes: chapter.duration_minutes,
        orderIndex: chapter.order_index,
        isCompleted: progress?.is_completed || false,
        watchTimeSeconds: progress?.watch_time_seconds || 0,
        materials: sortedMaterials.map((m) => ({
          id: m.id,
          title: m.title,
          type: m.type,
          url: m.url,
          description: m.description,
        })),
      },
      course: course ? {
        id: course.id,
        title: course.title,
        slug: course.slug,
      } : null,
      module: moduleInfo ? {
        id: moduleInfo.id,
        title: moduleInfo.title,
        orderIndex: moduleInfo.order_index,
      } : null,
      navigation: {
        currentIndex: currentFlatIndex + 1,
        totalChapters: flatChapters.length,
        chapterIndexInModule: chapterIndexInModule + 1,
        totalChaptersInModule: chaptersInModule.length,
        prevChapterId,
        nextChapterId,
      },
    });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  } catch (error) {
    console.error('Chapter detail error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
