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

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');
  const postType = searchParams.get('type');

  try {
    let query = supabaseAdmin
      .from('posts')
      .select(`
        id,
        content,
        image_url,
        post_type,
        reaction_count,
        comment_count,
        created_at,
        parent:parents!posts_parent_id_fkey(id, first_name, last_name, avatar_url)
      `)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (postType && postType !== 'all') {
      query = query.eq('post_type', postType);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      return NextResponse.json({ error: 'Error al obtener posts' }, { status: 500 });
    }

    // Get user's reactions
    const { data: userReactions } = await supabaseAdmin
      .from('reactions')
      .select('post_id')
      .eq('parent_id', auth.sub);

    const reactionSet = new Set(userReactions?.map((r) => r.post_id) || []);

    const formattedPosts = posts?.map((post: any) => ({
      id: post.id,
      content: post.content,
      imageUrl: post.image_url,
      postType: post.post_type,
      reactionCount: post.reaction_count,
      commentCount: post.comment_count,
      createdAt: post.created_at,
      author: post.parent ? {
        id: post.parent.id,
        firstName: post.parent.first_name,
        lastName: post.parent.last_name,
        avatarUrl: post.parent.avatar_url,
      } : null,
      hasReacted: reactionSet.has(post.id),
    })) || [];

    const response = NextResponse.json({ posts: formattedPosts });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  } catch (error) {
    console.error('Posts API error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  const { content, postType, imageUrl } = await request.json();

  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: 'El contenido es requerido' }, { status: 400 });
  }

  try {
    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .insert({
        parent_id: auth.sub,
        content: content.trim(),
        post_type: postType || 'experience',
        image_url: imageUrl || null,
      })
      .select(`
        id,
        content,
        image_url,
        post_type,
        reaction_count,
        comment_count,
        created_at,
        parent:parents!posts_parent_id_fkey(id, first_name, last_name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return NextResponse.json({ error: 'Error al crear post' }, { status: 500 });
    }

    const parentData = post.parent as any;
    return NextResponse.json({
      post: {
        id: post.id,
        content: post.content,
        imageUrl: post.image_url,
        postType: post.post_type,
        reactionCount: post.reaction_count,
        commentCount: post.comment_count,
        createdAt: post.created_at,
        author: parentData ? {
          id: parentData.id,
          firstName: parentData.first_name,
          lastName: parentData.last_name,
          avatarUrl: parentData.avatar_url,
        } : null,
        hasReacted: false,
      },
    });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
