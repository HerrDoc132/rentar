import { NextResponse } from 'next/server';
import { requireAdmin, requireAuth } from '@/lib/auth';
import { errorResponse } from '@/lib/errores';
import * as service from '@/services/pagos-service';

export async function GET() {
  try {
    return NextResponse.json({ pagos: await service.listar(await requireAuth()) });
  } catch (e) { return errorResponse(e); }
}
export async function POST(request: Request) {
  try {
    const u = await requireAuth(); requireAdmin(u);
    return NextResponse.json({ pago: await service.registrar(await request.json(), u.nombre) }, { status: 201 });
  } catch (e) { return errorResponse(e); }
}
