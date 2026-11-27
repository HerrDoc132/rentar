import { NextResponse } from 'next/server';
import { requireAdmin, requireAuth } from '@/lib/auth';
import { errorResponse } from '@/lib/errores';
import * as service from '@/services/alertas-service';

export async function PATCH() {
  try {
    const u = await requireAuth(); requireAdmin(u);
    await service.marcarTodasLeidas();
    return NextResponse.json({ ok: true });
  } catch (e) { return errorResponse(e); }
}
