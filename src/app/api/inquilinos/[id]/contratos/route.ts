import { NextResponse } from 'next/server';
import { requireAdmin, requireAuth } from '@/lib/auth';
import { errorResponse } from '@/lib/errores';
import * as service from '@/services/inquilinos-service';
type Ctx = { params: Promise<{ id: string }> };

export async function GET(_r: Request, { params }: Ctx) {
  try {
    const u = await requireAuth(); requireAdmin(u);
    const { id } = await params;
    const filas = await service.getContratos(Number(id));
    return NextResponse.json({ contratos: filas.map(f => ({ ...f.contrato, propiedadNombre: f.propiedadNombre })) });
  } catch (e) { return errorResponse(e); }
}
