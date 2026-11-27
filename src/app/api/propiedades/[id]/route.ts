import { NextResponse } from 'next/server';
import { requireAdmin, requireAuth } from '@/lib/auth';
import { borrarImagen, subirImagen } from '@/lib/blob';
import { errorResponse } from '@/lib/errores';
import * as service from '@/services/propiedades-service';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    return NextResponse.json({ propiedad: await service.getById(Number(id)) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request, { params }: Ctx) {
  try {
    const usuario = await requireAuth();
    requireAdmin(usuario);
    const { id } = await params;
    const propiedadId = Number(id);

    const anterior = await service.getById(propiedadId);
    const formData = await request.formData();
    const imagenUrl = await subirImagen(formData.get('imagen'));

    const propiedad = await service.actualizar(propiedadId, {
      nombre: String(formData.get('nombre') ?? ''),
      direccion: String(formData.get('direccion') ?? ''),
      tipo: String(formData.get('tipo') ?? 'Casa'),
      precio: String(formData.get('precio') ?? ''),
      estado: String(formData.get('estado') ?? undefined),
      habitaciones: Number(formData.get('habitaciones') ?? 1),
      banos: Number(formData.get('banos') ?? 1),
      garage: formData.get('garage') === '1' || formData.get('garage') === 'true',
      propietarioId: Number(formData.get('propietarioId')),
      imagenUrl: imagenUrl ?? undefined,
    }, usuario.nombre);

    if (imagenUrl && anterior.imagenUrl) await borrarImagen(anterior.imagenUrl);
    return NextResponse.json({ propiedad });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  try {
    const usuario = await requireAuth();
    requireAdmin(usuario);
    const { id } = await params;
    const propiedadId = Number(id);

    const anterior = await service.getById(propiedadId);
    await service.eliminar(propiedadId, usuario.nombre);
    if (anterior.imagenUrl) await borrarImagen(anterior.imagenUrl);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
