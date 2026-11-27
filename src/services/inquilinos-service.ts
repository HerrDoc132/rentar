import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { contratos, propiedades, inquilinos, type EstadoInquilino } from '@/db/schema';
import { badRequest, conflict, notFound } from '@/lib/errores';

export async function listar() {
  return db.select().from(inquilinos).orderBy(inquilinos.nombre);
}

export async function getById(id: number) {
  const [fila] = await db.select().from(inquilinos).where(eq(inquilinos.id, id)).limit(1);
  if (!fila) throw notFound('Inquilino no encontrado.');
  return fila;
}

export interface DatosInquilino {
  dni: string;
  nombre: string;
  telefono?: string | null;
  email?: string | null;
  estado?: string;
}

export async function crear(dto: DatosInquilino) {
  if (!dto.dni?.trim() || !dto.nombre?.trim()) {
    throw badRequest('DNI y nombre son obligatorios.');
  }
  try {
    const [nuevo] = await db.insert(inquilinos).values({
      dni: dto.dni.trim(),
      nombre: dto.nombre.trim(),
      telefono: dto.telefono || null,
      email: dto.email || null,
      estado: 'activo',
    }).returning();
    return nuevo;
  } catch {
    throw conflict('Ya existe un inquilino con ese DNI.');
  }
}

export async function actualizar(id: number, dto: DatosInquilino) {
  await getById(id);
  if (dto.estado && !['activo', 'inactivo'].includes(dto.estado)) {
    throw badRequest('Estado inválido.');
  }
  try {
    const [editado] = await db.update(inquilinos).set({
      dni: dto.dni,
      nombre: dto.nombre,
      telefono: dto.telefono ?? null,
      email: dto.email ?? null,
      estado: (dto.estado ?? 'activo') as EstadoInquilino,
    }).where(eq(inquilinos.id, id)).returning();
    return editado;
  } catch {
    throw conflict('Ya existe un inquilino con ese DNI.');
  }
}

export async function eliminar(id: number) {
  await getById(id);
  await db.delete(inquilinos).where(eq(inquilinos.id, id));
}

export async function getContratos(id: number) {
  await getById(id);
  return db
    .select({
      contrato: contratos,
      propiedadNombre: propiedades.nombre,
    })
    .from(contratos)
    .innerJoin(propiedades, eq(contratos.propiedadId, propiedades.id))
    .where(eq(contratos.inquilinoId, id));
}
