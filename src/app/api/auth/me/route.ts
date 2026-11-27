import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { errorResponse } from '@/lib/errores';

export async function GET() {
  try {
    return NextResponse.json({ usuario: await requireAuth() });
  } catch (error) {
    return errorResponse(error);
  }
}
