import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAuthFromRequest, unauthorizedResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  const { notificationIds } = await request.json();

  try {
    if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      await supabaseAdmin
        .from('notifications')
        .update({ is_read: true })
        .eq('parent_id', auth.sub)
        .in('id', notificationIds);
    } else {
      // Mark all as read
      await supabaseAdmin
        .from('notifications')
        .update({ is_read: true })
        .eq('parent_id', auth.sub)
        .eq('is_read', false);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
