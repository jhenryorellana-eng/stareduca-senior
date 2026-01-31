import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAuthFromRequest, unauthorizedResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  let notificationIds: string[] | undefined;

  try {
    const body = await request.json();
    notificationIds = body.notificationIds;
  } catch {
    // No body sent, will mark all as read
  }

  try {
    if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
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
