import { requireAuth } from '@/lib/auth';
import { errorResponse } from '@/lib/errores';
import { cabecerasPdf, generarRecibo } from '@/lib/pdf-recibo';
type Ctx = { params: Promise<{ id: string }> };

export async function GET(_r: Request, { params }: Ctx) {
  try {
    const usuario = await requireAuth();
    const { id } = await params;
    const pdf = await generarRecibo(Number(id), usuario);
    return new Response(pdf as BodyInit, { headers: cabecerasPdf(Number(id)) });
  } catch (e) { return errorResponse(e); }
}
