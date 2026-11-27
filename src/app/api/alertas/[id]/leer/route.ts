import { NextResponse } from 'next/server';
import { requireAdmin, requireAuth } from '@/lib/auth';
import { errorResponse } from '@/lib/errores';
import * as service from '@/services/alertas-service';
type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(_r: Request, { params }: Ctx) {
  try {
    const u = await requireAuth(); requireAdmin(u);
    const { id } = await params;
    await service.marcarLeida(Number(id));
    return NextResponse.json({ ok: true });
  } catch (e) { return errorResponse(e); }
}
