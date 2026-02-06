import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAuthFromRequest, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthFromRequest(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  const { id: postId } = await params;

  try {
    // Check if already reacted
    const { data: existing } = await supabaseAdmin
      .from('reactions')
      .select('parent_id')
      .eq('parent_id', auth.sub)
      .eq('post_id', postId)
      .single();

    if (existing) {
      // Remove reaction
      await supabaseAdmin
        .from('reactions')
        .delete()
        .eq('parent_id', auth.sub)
        .eq('post_id', postId);

      return NextResponse.json({ hasReacted: false });
    } else {
      // Add reaction
      await supabaseAdmin
        .from('reactions')
        .insert({
          parent_id: auth.sub,
          post_id: postId,
        });

      // Create notification for post author
      const { data: post } = await supabaseAdmin
        .from('posts')
        .select('parent_id')
        .eq('id', postId)
        .single();

      // Only notify if the reactor is not the post author
      if (post && post.parent_id !== auth.sub) {
        // Get reactor's name
        const { data: reactor } = await supabaseAdmin
          .from('parents')
          .select('first_name, last_name')
          .eq('id', auth.sub)
          .single();

        const reactorName = reactor
          ? `${reactor.first_name} ${reactor.last_name}`
          : 'Alguien';

        await supabaseAdmin.from('notifications').insert({
          parent_id: post.parent_id,
          type: 'reaction',
          title: 'Nueva reaccion',
          message: `${reactorName} reacciono a tu publicacion`,
          data: { postId },
        });
      }

      return NextResponse.json({ hasReacted: true });
    }
  } catch (error) {
    console.error('Reaction error:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
