import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAuthFromRequest, unauthorizedResponse } from '@/lib/auth';

const BUCKET_NAME = 'stareduca-senior';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string || 'posts';

    if (!file) {
      return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'El archivo es muy grande (máximo 10MB)' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 400 });
    }

    // Generate unique filename
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const path = `${folder}/${timestamp}-${randomId}.${ext}`;

    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(path, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
