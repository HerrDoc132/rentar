import { NextResponse } from 'next/server';
import { borrarSesion, requireAuth } from '@/lib/auth';
import { errorResponse } from '@/lib/errores';

export async function POST() {
  try {
    await requireAuth();
    await borrarSesion();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
