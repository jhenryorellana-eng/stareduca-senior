import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAuthFromRequest, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('blocked_users')
      .select(`
        blocked_id,
        created_at,
        blocked:parents!blocked_users_blocked_id_fkey(id, first_name, last_name, avatar_url)
      `)
      .eq('blocker_id', auth.sub)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching blocked users:', error);
      return NextResponse.json({ error: 'Error al obtener bloqueados' }, { status: 500 });
    }

    const users = data?.map((item: any) => ({
      id: item.blocked?.id || item.blocked_id,
      firstName: item.blocked?.first_name || '',
      lastName: item.blocked?.last_name || '',
      avatarUrl: item.blocked?.avatar_url || null,
      blockedAt: item.created_at,
    })) || [];

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Blocked users API error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
