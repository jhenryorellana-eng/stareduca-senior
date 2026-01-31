import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAuthFromRequest, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    const { data: notifications, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('parent_id', auth.sub)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json({ error: 'Error' }, { status: 500 });
    }

    const formattedNotifications = notifications?.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      isRead: n.is_read,
      data: n.data,
      createdAt: n.created_at,
    })) || [];

    return NextResponse.json({ notifications: formattedNotifications });
  } catch (error) {
    console.error('Notifications error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
