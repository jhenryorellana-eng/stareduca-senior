import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const HUB_CENTRAL_API = process.env.HUB_CENTRAL_API_URL;
const MINI_APP_ID = process.env.MINI_APP_ID || 'stareduca_senior';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Código requerido' },
        { status: 400 }
      );
    }

    // In development, accept mock codes
    const isDev = process.env.NODE_ENV === 'development';
    let userData;

    if (isDev && code.startsWith('dev_')) {
      // Mock data for development
      userData = {
        id: 'dev_parent_001',
        family_id: 'dev_family_001',
        first_name: 'María',
        last_name: 'García',
        email: 'maria.garcia@example.com',
        code: 'STAR-PAD-DEV001',
        role: 'parent',
      };
    } else {
      // Exchange code with Hub Central (same pattern as StarEduca Junior)
      const hubResponse = await fetch(`${HUB_CENTRAL_API}/auth/mini-app-exchange`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Mini-App-Id': MINI_APP_ID,
        },
        body: JSON.stringify({ code }),
      });

      if (!hubResponse.ok) {
        const errorData = await hubResponse.json().catch(() => ({}));
        return NextResponse.json(
          { error: errorData.message || 'Código inválido o expirado' },
          { status: 401 }
        );
      }

      const hubData = await hubResponse.json();

      // Map camelCase fields from Hub Central to snake_case
      userData = {
        id: hubData.user.id,
        family_id: hubData.user.familyId,
        first_name: hubData.user.firstName,
        last_name: hubData.user.lastName,
        email: hubData.user.email || null,
        code: hubData.user.code,
        role: 'parent',
      };

      // Verify it's a PARENT code (P-XXXXXXXX)
      if (!userData.code?.startsWith('P-')) {
        return NextResponse.json(
          { error: 'Este código no es válido para StarEduca Senior' },
          { status: 403 }
        );
      }
    }

    // Upsert parent in Supabase
    const { data: parent, error: upsertError } = await supabaseAdmin
      .from('parents')
      .upsert(
        {
          external_id: userData.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email || null,
          code: userData.code,
          family_id: userData.family_id,
          last_activity_date: new Date().toISOString().split('T')[0],
        },
        {
          onConflict: 'external_id',
        }
      )
      .select()
      .single();

    if (upsertError) {
      console.error('Error upserting parent:', upsertError);
      return NextResponse.json(
        { error: 'Error al procesar usuario' },
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
    console.error('Auth exchange error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
