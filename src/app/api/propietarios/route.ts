import { NextResponse } from 'next/server';
import { requireAdmin, requireAuth } from '@/lib/auth';
import { errorResponse } from '@/lib/errores';
import * as service from '@/services/propietarios-service';

export async function GET() {
  try {
    const u = await requireAuth(); requireAdmin(u);
    return NextResponse.json({ propietarios: await service.listar() });
  } catch (e) { return errorResponse(e); }
}

export async function POST(request: Request) {
  try {
    const u = await requireAuth(); requireAdmin(u);
    return NextResponse.json({ propietario: await service.crear(await request.json()) }, { status: 201 });
  } catch (e) { return errorResponse(e); }
}
