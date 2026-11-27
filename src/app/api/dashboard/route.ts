import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { errorResponse } from '@/lib/errores';
import * as service from '@/services/dashboard-service';

export async function GET() {
  try {
    return NextResponse.json({ stats: await service.getStats(await requireAuth()) });
  } catch (e) { return errorResponse(e); }
}
