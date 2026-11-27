import { NextResponse } from 'next/server';
import { requireAdmin, requireAuth } from '@/lib/auth';
import { errorResponse } from '@/lib/errores';
import * as service from '@/services/auditoria-service';

export async function GET() {
  try {
    const u = await requireAuth(); requireAdmin(u);
    return NextResponse.json({ auditoria: await service.listar() });
  } catch (e) { return errorResponse(e); }
}
