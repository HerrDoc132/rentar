import { NextResponse } from 'next/server';
import { obtenerUsuarioOpcional, requireAdmin, requireAuth } from '@/lib/auth';
import { errorResponse } from '@/lib/errores';
import { subirImagen } from '@/lib/blob';
import * as service from '@/services/propiedades-service';

function num(v: string | null): number | undefined {
  if (v === null || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const pageRaw = num(params.get('page')) ?? 1;
    const limitRaw = num(params.get('limit')) ?? 12;
    const page = pageRaw < 1 ? 1 : pageRaw;
    const limit = Math.min(limitRaw < 1 ? 12 : limitRaw, 100);

    const resultado = await service.listar({
      q: params.get('q') ?? undefined,
      tipo: params.get('tipo') ?? undefined,
      estado: params.get('estado') ?? undefined,
      precioMin: num(params.get('precioMin')),
      precioMax: num(params.get('precioMax')),
      habitaciones: num(params.get('habitaciones')),
      banos: num(params.get('banos')),
      garage: params.get('garage') === '1' || params.get('garage') === 'true',
      page,
      limit,
    }, await obtenerUsuarioOpcional());

    return NextResponse.json(resultado);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const usuario = await requireAuth();
    requireAdmin(usuario);

    const formData = await request.formData();
    const imagenUrl = await subirImagen(formData.get('imagen'));

    const propiedad = await service.crear({
      nombre: String(formData.get('nombre') ?? ''),
      direccion: String(formData.get('direccion') ?? ''),
      tipo: String(formData.get('tipo') ?? 'Casa'),
      precio: String(formData.get('precio') ?? ''),
      estado: String(formData.get('estado') ?? 'disponible'),
      habitaciones: Number(formData.get('habitaciones') ?? 1),
      banos: Number(formData.get('banos') ?? 1),
      garage: formData.get('garage') === '1' || formData.get('garage') === 'true',
      propietarioId: Number(formData.get('propietarioId')),
      imagenSeed: String(formData.get('imagenSeed') ?? ''),
      imagenUrl,
    }, usuario.nombre);

    return NextResponse.json({ propiedad }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
