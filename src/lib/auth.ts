import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { and, eq, gt } from 'drizzle-orm';
import { db } from '@/db/client';
import { sesiones, usuarios, type UsuarioPublico } from '@/db/schema';
import { forbidden, unauthorized } from './errores';

export const COOKIE_SESION = 'rentar_sesion';
const DIAS_SESION = 7;

export function generarToken(): string {
  return randomBytes(32).toString('hex');
}

export function datosPublicos(usuario: {
  id: number;
  nombre: string;
  email: string;
  rol: UsuarioPublico['rol'];
  propietarioId: number | null;
  inquilinoId: number | null;
}): UsuarioPublico {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
    propietarioId: usuario.propietarioId,
    inquilinoId: usuario.inquilinoId,
  };
}

export async function crearSesion(usuarioId: number): Promise<string> {
  const token = generarToken();
  const expiraEn = new Date(Date.now() + DIAS_SESION * 24 * 60 * 60 * 1000);
  await db.insert(sesiones).values({ token, usuarioId, expiraEn });

  const jar = await cookies();
  jar.set(COOKIE_SESION, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiraEn,
  });

  return token;
}

export async function borrarSesion(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE_SESION)?.value;
  if (token) {
    await db.delete(sesiones).where(eq(sesiones.token, token));
  }
  jar.delete(COOKIE_SESION);
}

/** Devuelve el usuario autenticado o lanza HttpError 401/403. */
export async function requireAuth(): Promise<UsuarioPublico> {
  const jar = await cookies();
  const token = jar.get(COOKIE_SESION)?.value;
  if (!token) throw unauthorized('No autenticado. Falta el token.');

  const filas = await db
    .select({
      id: usuarios.id,
      nombre: usuarios.nombre,
      email: usuarios.email,
      rol: usuarios.rol,
      propietarioId: usuarios.propietarioId,
      inquilinoId: usuarios.inquilinoId,
      activo: usuarios.activo,
    })
    .from(sesiones)
    .innerJoin(usuarios, eq(sesiones.usuarioId, usuarios.id))
    .where(and(eq(sesiones.token, token), gt(sesiones.expiraEn, new Date())))
    .limit(1);

  if (filas.length === 0) {
    throw unauthorized('Sesión inválida o vencida. Iniciá sesión de nuevo.');
  }
  if (!filas[0].activo) {
    throw forbidden('Esta cuenta está desactivada.');
  }

  return datosPublicos(filas[0]);
}

/** Opcional: devuelve el usuario si hay sesión válida, si no null. */
export async function obtenerUsuarioOpcional(): Promise<UsuarioPublico | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_SESION)?.value;
  if (!token) return null;

  const filas = await db
    .select({
      id: usuarios.id,
      nombre: usuarios.nombre,
      email: usuarios.email,
      rol: usuarios.rol,
      propietarioId: usuarios.propietarioId,
      inquilinoId: usuarios.inquilinoId,
    })
    .from(sesiones)
    .innerJoin(usuarios, eq(sesiones.usuarioId, usuarios.id))
    .where(and(eq(sesiones.token, token), gt(sesiones.expiraEn, new Date())))
    .limit(1);

  return filas.length ? datosPublicos(filas[0]) : null;
}

export function requireAdmin(usuario: UsuarioPublico): void {
  if (usuario.rol !== 'admin') throw forbidden();
}
