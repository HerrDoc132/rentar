import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { propiedades, propietarios } from '@/db/schema';
import { badRequest, conflict, notFound } from '@/lib/errores';

export async function listar() {
  return db.select().from(propietarios).orderBy(propietarios.nombre);
}

export async function getById(id: number) {
  const [fila] = await db.select().from(propietarios).where(eq(propietarios.id, id)).limit(1);
  if (!fila) throw notFound('Propietario no encontrado.');
  return fila;
}

export interface DatosPropietario {
  nombre: string;
  dni: string;
  telefono?: string | null;
  email?: string | null;
}

export async function crear(dto: DatosPropietario) {
  if (!dto.nombre?.trim() || !dto.dni?.trim()) {
    throw badRequest('Nombre y DNI son obligatorios.');
  }
  try {
    const [nuevo] = await db.insert(propietarios).values({
      nombre: dto.nombre.trim(),
      dni: dto.dni.trim(),
      telefono: dto.telefono || null,
      email: dto.email || null,
    }).returning();
    return nuevo;
  } catch {
    throw conflict('Ya existe un propietario con ese DNI o email.');
  }
}

export async function actualizar(id: number, dto: DatosPropietario) {
  await getById(id);
  try {
    const [editado] = await db.update(propietarios).set({
      nombre: dto.nombre,
      dni: dto.dni,
      telefono: dto.telefono ?? null,
      email: dto.email ?? null,
    }).where(eq(propietarios.id, id)).returning();
    return editado;
  } catch {
    throw conflict('Ya existe un propietario con ese DNI o email.');
  }
}

export async function eliminar(id: number) {
  await getById(id);
  await db.delete(propietarios).where(eq(propietarios.id, id));
}

export async function getPropiedades(id: number) {
  await getById(id);
  return db.select().from(propiedades)
    .where(eq(propiedades.propietarioId, id))
    .orderBy(propiedades.nombre);
}
