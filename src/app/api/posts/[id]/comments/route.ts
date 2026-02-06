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

  const { id: postId } = await params;

  try {
    const { data: comments, error } = await supabaseAdmin
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        parent:parents!comments_parent_id_fkey(id, first_name, last_name, avatar_url)
      `)
      .eq('post_id', postId)
      .eq('is_hidden', false)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json({ error: 'Error al obtener comentarios' }, { status: 500 });
    }

    const formattedComments = comments?.map((comment: any) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.created_at,
      author: comment.parent ? {
        id: comment.parent.id,
        firstName: comment.parent.first_name,
        lastName: comment.parent.last_name,
        avatarUrl: comment.parent.avatar_url,
      } : null,
    })) || [];

    const response = NextResponse.json({ comments: formattedComments });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  } catch (error) {
    console.error('Comments API error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthFromRequest(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  const { id: postId } = await params;
  const { content } = await request.json();

  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: 'El contenido es requerido' }, { status: 400 });
  }

  try {
    const { data: comment, error } = await supabaseAdmin
      .from('comments')
      .insert({
        post_id: postId,
        parent_id: auth.sub,
        content: content.trim(),
      })
      .select(`
        id,
        content,
        created_at,
        parent:parents!comments_parent_id_fkey(id, first_name, last_name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json({ error: 'Error al crear comentario' }, { status: 500 });
    }

    const parentData = comment.parent as any;

    // Create notification for post author
    const { data: post } = await supabaseAdmin
      .from('posts')
      .select('parent_id')
      .eq('id', postId)
      .single();

    // Only notify if the commenter is not the post author
    if (post && post.parent_id !== auth.sub) {
      const commenterName = parentData
        ? `${parentData.first_name} ${parentData.last_name}`
        : 'Alguien';

      await supabaseAdmin.from('notifications').insert({
        parent_id: post.parent_id,
        type: 'comment',
        title: 'Nuevo comentario',
        message: `${commenterName} comento en tu publicacion`,
        data: { postId, commentId: comment.id },
      });
    }

    return NextResponse.json({
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.created_at,
        author: parentData ? {
          id: parentData.id,
          firstName: parentData.first_name,
          lastName: parentData.last_name,
          avatarUrl: parentData.avatar_url,
        } : null,
      },
    });
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
