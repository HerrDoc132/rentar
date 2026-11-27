import { NextResponse } from 'next/server';
import { requireAdmin, requireAuth } from '@/lib/auth';
import { errorResponse } from '@/lib/errores';
import * as service from '@/services/solicitudes-service';

export async function GET() {
  try {
    const u = await requireAuth(); requireAdmin(u);
    const filas = await service.listar();
    return NextResponse.json({ solicitudes: filas.map(f => ({ ...f.solicitud, propiedadNombre: f.propiedadNombre })) });
  } catch (e) { return errorResponse(e); }
}
export async function POST(request: Request) {
  try {
    return NextResponse.json({ id: await service.crear(await request.json()) }, { status: 201 });
  } catch (e) { return errorResponse(e); }
}
