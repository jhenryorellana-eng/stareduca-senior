import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MINI_APP_ID = process.env.MINI_APP_ID || 'stareduca_senior';

export async function POST(request: Request) {
  // Only allow from localhost (host header check)
  const host = request.headers.get('host') || '';
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');

  if (!isLocalhost) {
    return NextResponse.json(
      { error: 'Dev login solo disponible en localhost' },
      { status: 403 }
    );
  }

  // Additional check: only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Solo disponible en desarrollo' },
      { status: 403 }
    );
  }

  try {
    // Create or get demo parent
    const demoParent = {
      external_id: 'dev_parent_001',
      first_name: 'María',
      last_name: 'García',
      email: 'maria.garcia@example.com',
      code: 'STAR-PAD-DEV001',
      family_id: 'dev_family_001',
      last_activity_date: new Date().toISOString().split('T')[0],
    };

    const { data: parent, error: upsertError } = await supabaseAdmin
      .from('parents')
      .upsert(demoParent, {
        onConflict: 'external_id',
      })
      .select()
      .single();

    if (upsertError) {
      console.error('Error creating demo parent:', upsertError);
      return NextResponse.json(
        { error: 'Error al crear usuario de prueba' },
        { status: 500 }
      );
    }

    // Create JWT token
    const token = await createToken({
      sub: parent.id,
      family_id: parent.family_id,
      first_name: parent.first_name,
      last_name: parent.last_name,
      email: parent.email,
      code: parent.code,
      role: 'parent',
      mini_app: MINI_APP_ID,
    });

    return NextResponse.json({
      token,
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
    console.error('Dev login error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
