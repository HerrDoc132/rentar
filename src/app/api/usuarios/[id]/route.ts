import { NextResponse } from 'next/server';
import { requireAdmin, requireAuth } from '@/lib/auth';
import { errorResponse } from '@/lib/errores';
import * as service from '@/services/usuarios-service';
type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  try {
    const u = await requireAuth(); requireAdmin(u);
    const { id } = await params;
    return NextResponse.json({ usuario: await service.actualizar(Number(id), await request.json(), u.nombre) });
  } catch (e) { return errorResponse(e); }
}
export async function DELETE(_r: Request, { params }: Ctx) {
  try {
    const u = await requireAuth(); requireAdmin(u);
    const { id } = await params;
    await service.eliminar(Number(id));
    return NextResponse.json({ ok: true });
  } catch (e) { return errorResponse(e); }
}
