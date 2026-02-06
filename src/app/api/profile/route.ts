import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAuthFromRequest, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    // Get parent profile
    const { data: parent, error: parentError } = await supabaseAdmin
      .from('parents')
      .select('*')
      .eq('id', auth.sub)
      .single();

    if (parentError) {
      console.error('Error fetching parent:', parentError);
      return NextResponse.json(
        { error: 'Error al obtener perfil' },
        { status: 500 }
      );
    }

    // Get stats
    const { data: enrollments } = await supabaseAdmin
      .from('enrollments')
      .select('status')
      .eq('parent_id', auth.sub);

    const { data: chaptersCompleted } = await supabaseAdmin
      .from('chapter_progress')
      .select('id')
      .eq('parent_id', auth.sub)
      .eq('is_completed', true);

    const activeCourses = enrollments?.filter((e) => e.status === 'active').length || 0;
    const completedCourses = enrollments?.filter((e) => e.status === 'completed').length || 0;
    const chaptersViewed = chaptersCompleted?.length || 0;

    // Get unread notifications count
    const { count: unreadCount } = await supabaseAdmin
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('parent_id', auth.sub)
      .eq('is_read', false);

    const response = NextResponse.json({
      parent: {
        id: parent.id,
        externalId: parent.external_id,
        firstName: parent.first_name,
        lastName: parent.last_name,
        email: parent.email,
        code: parent.code,
        familyId: parent.family_id,
        avatarUrl: parent.avatar_url,
      },
      stats: {
        activeCourses,
        completedCourses,
        chaptersViewed,
      },
      unreadNotifications: unreadCount || 0,
    });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    const updates = await request.json();

    // Only allow updating specific fields
    const allowedFields = ['avatar_url'];
    const filteredUpdates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No hay campos válidos para actualizar' },
        { status: 400 }
      );
    }

    const { data: parent, error } = await supabaseAdmin
      .from('parents')
      .update(filteredUpdates)
      .eq('id', auth.sub)
      .select()
      .single();

    if (error) {
      console.error('Error updating parent:', error);
      return NextResponse.json(
        { error: 'Error al actualizar perfil' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      parent: {
        id: parent.id,
        externalId: parent.external_id,
        firstName: parent.first_name,
        lastName: parent.last_name,
        email: parent.email,
        code: parent.code,
        familyId: parent.family_id,
        avatarUrl: parent.avatar_url,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
