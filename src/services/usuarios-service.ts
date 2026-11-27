import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { usuarios, type Rol } from '@/db/schema';
import { registrarAuditoria } from '@/lib/auditoria';
import { badRequest, notFound } from '@/lib/errores';

const ROLES = ['admin', 'propietario', 'vendedor', 'inquilino', 'pendiente'] as const;

export async function listar() {
  return db.select({
    id: usuarios.id,
    nombre: usuarios.nombre,
    email: usuarios.email,
    rol: usuarios.rol,
    propietarioId: usuarios.propietarioId,
    inquilinoId: usuarios.inquilinoId,
    activo: usuarios.activo,
    creadoEn: usuarios.creadoEn,
    ultimoAcceso: usuarios.ultimoAcceso,
  }).from(usuarios);
}

export async function actualizar(
  id: number,
  dto: { rol?: string; propietarioId?: number | null; inquilinoId?: number | null; activo?: boolean },
  adminNombre: string,
) {
  const [existe] = await db.select().from(usuarios).where(eq(usuarios.id, id)).limit(1);
  if (!existe) throw notFound('Usuario no encontrado.');

  if (dto.rol !== undefined) {
    if (!ROLES.includes(dto.rol as (typeof ROLES)[number])) {
      throw badRequest('Rol inválido. Opciones: ' + ROLES.join(', '));
    }
    await db.update(usuarios).set({
      rol: dto.rol as Rol,
      propietarioId: dto.rol === 'propietario' ? (dto.propietarioId ?? null) : null,
      inquilinoId: dto.rol === 'inquilino' ? (dto.inquilinoId ?? null) : null,
    }).where(eq(usuarios.id, id));
    await registrarAuditoria(adminNombre, `Asignó el rol "${dto.rol}" a ${existe.nombre}`);
  }

  if (dto.activo !== undefined) {
    await db.update(usuarios).set({ activo: dto.activo }).where(eq(usuarios.id, id));
    await registrarAuditoria(
      adminNombre,
      `${dto.activo ? 'Activó' : 'Desactivó'} la cuenta de ${existe.nombre}`,
    );
  }

  const [actualizado] = await db.select({
    id: usuarios.id,
    nombre: usuarios.nombre,
    email: usuarios.email,
    rol: usuarios.rol,
    propietarioId: usuarios.propietarioId,
    inquilinoId: usuarios.inquilinoId,
    activo: usuarios.activo,
    creadoEn: usuarios.creadoEn,
    ultimoAcceso: usuarios.ultimoAcceso,
  }).from(usuarios).where(eq(usuarios.id, id)).limit(1);
  return actualizado;
}

export async function eliminar(id: number) {
  await db.delete(usuarios).where(eq(usuarios.id, id));
}
