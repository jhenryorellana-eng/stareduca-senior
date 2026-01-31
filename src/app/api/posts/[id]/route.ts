import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAuthFromRequest, unauthorizedResponse } from '@/lib/auth';

const BUCKET_NAME = 'stareduca-senior';

function extractStoragePath(url: string): string | null {
  if (!url) return null;
  const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
  return match ? match[1] : null;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthFromRequest(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  const { id: postId } = await params;

  try {
    // First, get the post to verify ownership and get image URL
    const { data: post, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('id, parent_id, image_url')
      .eq('id', postId)
      .single();

    if (fetchError || !post) {
      return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 });
    }

    // Verify the post belongs to the authenticated user
    if (post.parent_id !== auth.sub) {
      return NextResponse.json({ error: 'No tienes permiso para eliminar este post' }, { status: 403 });
    }

    // Delete image from storage if exists
    if (post.image_url) {
      const imagePath = extractStoragePath(post.image_url);
      if (imagePath) {
        await supabaseAdmin.storage
          .from(BUCKET_NAME)
          .remove([imagePath]);
      }
    }

    // Delete the post (cascades to reactions and comments due to FK)
    const { error: deleteError } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', postId);

    if (deleteError) {
      console.error('Delete post error:', deleteError);
      return NextResponse.json({ error: 'Error al eliminar post' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete API error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
