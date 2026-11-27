import { and, count, eq, like, or, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import {
  propiedades, propietarios,
  type EstadoPropiedad, type TipoPropiedad, type UsuarioPublico,
} from '@/db/schema';
import { registrarAuditoria } from '@/lib/auditoria';
import { aCentavos } from '@/lib/dinero';
import { badRequest, conflict, notFound } from '@/lib/errores';

export interface FiltroPropiedades {
  q?: string;
  tipo?: string;
  estado?: string;
  precioMin?: number;
  precioMax?: number;
  habitaciones?: number;
  banos?: number;
  garage?: boolean;
  page: number;
  limit: number;
}

export async function listar(
  filtro: FiltroPropiedades,
  usuario: UsuarioPublico | null,
) {
  const condiciones = [];

  const catalogoPublico = !usuario || usuario.rol === 'inquilino' || usuario.rol === 'pendiente';

  if (catalogoPublico) {
    condiciones.push(eq(propiedades.estado, 'disponible'));
  } else if (usuario.rol === 'propietario' || usuario.rol === 'vendedor') {
    condiciones.push(eq(propiedades.propietarioId, usuario.propietarioId ?? -1));
  }
  // admin: sin condición de visibilidad

  if (filtro.q?.trim()) {
    const patron = `%${filtro.q.trim()}%`;
    condiciones.push(or(like(propiedades.nombre, patron), like(propiedades.direccion, patron))!);
  }
  if (filtro.tipo) {
    condiciones.push(eq(propiedades.tipo, filtro.tipo as TipoPropiedad));
  }
  // En catálogo público el estado está forzado; el filtro del cliente se ignora.
  if (filtro.estado && !catalogoPublico) {
    condiciones.push(eq(propiedades.estado, filtro.estado as EstadoPropiedad));
  }
  if (filtro.precioMin !== undefined) {
    condiciones.push(sql`${propiedades.precioCentavos} >= ${aCentavos(filtro.precioMin)}`);
  }
  if (filtro.precioMax !== undefined) {
    condiciones.push(sql`${propiedades.precioCentavos} <= ${aCentavos(filtro.precioMax)}`);
  }
  if (filtro.habitaciones !== undefined) {
    condiciones.push(sql`${propiedades.habitaciones} >= ${filtro.habitaciones}`);
  }
  if (filtro.banos !== undefined) {
    condiciones.push(sql`${propiedades.banos} >= ${filtro.banos}`);
  }
  if (filtro.garage) {
    condiciones.push(eq(propiedades.garage, true));
  }

  const where = condiciones.length ? and(...condiciones) : undefined;
  const [{ total }] = await db.select({ total: count() }).from(propiedades).where(where);

  const filas = await db
    .select({
      id: propiedades.id,
      nombre: propiedades.nombre,
      direccion: propiedades.direccion,
      tipo: propiedades.tipo,
      precioCentavos: propiedades.precioCentavos,
      estado: propiedades.estado,
      habitaciones: propiedades.habitaciones,
      banos: propiedades.banos,
      garage: propiedades.garage,
      propietarioId: propiedades.propietarioId,
      propietarioNombre: propietarios.nombre,
      imagenSeed: propiedades.imagenSeed,
      imagenUrl: propiedades.imagenUrl,
      creadoEn: propiedades.creadoEn,
    })
    .from(propiedades)
    .innerJoin(propietarios, eq(propiedades.propietarioId, propietarios.id))
    .where(where)
    .orderBy(propiedades.nombre)
    .limit(filtro.limit)
    .offset((filtro.page - 1) * filtro.limit);

  return {
    propiedades: filas,
    total,
    page: filtro.page,
    limit: filtro.limit,
    totalPages: Math.max(1, Math.ceil(total / filtro.limit)),
  };
}

export async function getById(id: number) {
  const [fila] = await db
    .select({
      id: propiedades.id,
      nombre: propiedades.nombre,
      direccion: propiedades.direccion,
      tipo: propiedades.tipo,
      precioCentavos: propiedades.precioCentavos,
      estado: propiedades.estado,
      habitaciones: propiedades.habitaciones,
      banos: propiedades.banos,
      garage: propiedades.garage,
      propietarioId: propiedades.propietarioId,
      propietarioNombre: propietarios.nombre,
      imagenSeed: propiedades.imagenSeed,
      imagenUrl: propiedades.imagenUrl,
      creadoEn: propiedades.creadoEn,
    })
    .from(propiedades)
    .innerJoin(propietarios, eq(propiedades.propietarioId, propietarios.id))
    .where(eq(propiedades.id, id))
    .limit(1);
  if (!fila) throw notFound('Propiedad no encontrada.');
  return fila;
}

export interface DatosPropiedad {
  nombre: string;
  direccion: string;
  tipo?: string;
  precio: number | string;
  estado?: string;
  habitaciones?: number;
  banos?: number;
  garage?: boolean;
  propietarioId: number;
  imagenSeed?: string;
  imagenUrl?: string | null;
}

export async function crear(dto: DatosPropiedad, adminNombre: string) {
  if (!dto.nombre?.trim() || !dto.direccion?.trim() || !dto.precio || !dto.propietarioId) {
    throw badRequest('Nombre, dirección, precio y propietario son obligatorios.');
  }
  const [nueva] = await db.insert(propiedades).values({
    nombre: dto.nombre.trim(),
    direccion: dto.direccion.trim(),
    tipo: (dto.tipo ?? 'Casa') as TipoPropiedad,
    precioCentavos: aCentavos(dto.precio),
    estado: (dto.estado ?? 'disponible') as EstadoPropiedad,
    habitaciones: dto.habitaciones ?? 1,
    banos: dto.banos ?? 1,
    garage: dto.garage ?? false,
    propietarioId: dto.propietarioId,
    imagenSeed: dto.imagenSeed ?? `prop${Date.now()}`,
    imagenUrl: dto.imagenUrl ?? null,
  }).returning();

  await registrarAuditoria(adminNombre, `Registró la propiedad "${nueva.nombre}"`);
  return nueva;
}

export async function actualizar(id: number, dto: DatosPropiedad, adminNombre: string) {
  const [actual] = await db.select().from(propiedades).where(eq(propiedades.id, id)).limit(1);
  if (!actual) throw notFound('Propiedad no encontrada.');

  const [editada] = await db.update(propiedades).set({
    nombre: dto.nombre,
    direccion: dto.direccion,
    tipo: (dto.tipo ?? 'Casa') as TipoPropiedad,
    precioCentavos: aCentavos(dto.precio),
    estado: (dto.estado ?? actual.estado) as EstadoPropiedad,
    habitaciones: dto.habitaciones ?? 1,
    banos: dto.banos ?? 1,
    garage: dto.garage ?? false,
    propietarioId: dto.propietarioId,
    ...(dto.imagenUrl !== undefined ? { imagenUrl: dto.imagenUrl } : {}),
  }).where(eq(propiedades.id, id)).returning();

  await registrarAuditoria(adminNombre, `Editó la propiedad "${editada.nombre}"`);
  return editada;
}

export async function eliminar(id: number, adminNombre: string) {
  const [fila] = await db.select().from(propiedades).where(eq(propiedades.id, id)).limit(1);
  if (!fila) throw notFound('Propiedad no encontrada.');
  await db.delete(propiedades).where(eq(propiedades.id, id));
  await registrarAuditoria(adminNombre, `Eliminó la propiedad "${fila.nombre}"`);
}

export async function existePropietario(id: number): Promise<boolean> {
  const [fila] = await db.select({ id: propietarios.id }).from(propietarios)
    .where(eq(propietarios.id, id)).limit(1);
  if (!fila) throw conflict('El propietario indicado no existe.');
  return true;
}
