import { NextResponse } from 'next/server';
import { requireAdmin, requireAuth } from '@/lib/auth';
import { errorResponse } from '@/lib/errores';
import * as service from '@/services/propietarios-service';
type Ctx = { params: Promise<{ id: string }> };

export async function GET(_r: Request, { params }: Ctx) {
  try {
    const u = await requireAuth(); requireAdmin(u);
    const { id } = await params;
    return NextResponse.json({ propiedades: await service.getPropiedades(Number(id)) });
  } catch (e) { return errorResponse(e); }
}
