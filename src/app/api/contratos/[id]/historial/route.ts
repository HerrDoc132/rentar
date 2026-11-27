import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { errorResponse } from '@/lib/errores';
import * as service from '@/services/contratos-service';
type Ctx = { params: Promise<{ id: string }> };

export async function GET(_r: Request, { params }: Ctx) {
  try {
    await requireAuth();
    const { id } = await params;
    return NextResponse.json({ historial: await service.getHistorial(Number(id)) });
  } catch (e) { return errorResponse(e); }
}
