import { NextResponse } from 'next/server';
import { requireAdmin, requireAuth } from '@/lib/auth';
import { errorResponse } from '@/lib/errores';
import * as service from '@/services/contratos-service';
type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  try {
    const u = await requireAuth(); requireAdmin(u);
    const { id } = await params;
    await service.actualizarMonto(Number(id), await request.json(), u.nombre);
    return NextResponse.json({ ok: true });
  } catch (e) { return errorResponse(e); }
}
