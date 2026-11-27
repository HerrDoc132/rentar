import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { usuarios, type UsuarioPublico } from '@/db/schema';
import { registrarAuditoria } from '@/lib/auditoria';
import { crearSesion, datosPublicos } from '@/lib/auth';
import { badRequest, conflict, notFound, unauthorized } from '@/lib/errores';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registrar(dto: {
  nombre: string;
  email: string;
  password: string;
}): Promise<{ token: string; usuario: UsuarioPublico }> {
  if (!dto.nombre?.trim()) throw badRequest('El nombre es obligatorio.');
  const email = (dto.email ?? '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) throw badRequest('Ingresá un email válido.');
  if (!dto.password || dto.password.length < 6) {
    throw badRequest('La contraseña debe tener al menos 6 caracteres.');
  }

  const existe = await db.select({ id: usuarios.id }).from(usuarios)
    .where(eq(usuarios.email, email)).limit(1);
  if (existe.length) throw conflict('Ya existe una cuenta con ese email.');

  const passwordHash = await bcrypt.hash(dto.password, 10);
  const [nuevo] = await db.insert(usuarios).values({
    nombre: dto.nombre.trim(),
    email,
    passwordHash,
    rol: 'pendiente',
    activo: true,
  }).returning();

  await registrarAuditoria(nuevo.nombre, 'Se registró en el sistema (rol pendiente de asignación)');
  const token = await crearSesion(nuevo.id);
  return { token, usuario: datosPublicos(nuevo) };
}

export async function login(dto: {
  email: string;
  password: string;
}): Promise<{ token: string; usuario: UsuarioPublico }> {
  const email = (dto.email ?? '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) throw badRequest('Ingresá un email válido.');
  if (!dto.password) throw badRequest('Ingresá tu contraseña.');

  const [usuario] = await db.select().from(usuarios).where(eq(usuarios.email, email)).limit(1);
  if (!usuario) throw notFound('No encontramos una cuenta con ese email.');
  if (!usuario.activo) {
    throw unauthorized('Esta cuenta está desactivada. Contactá al administrador.');
  }

  const passwordOk = await bcrypt.compare(dto.password, usuario.passwordHash);
  if (!passwordOk) throw unauthorized('Contraseña incorrecta.');

  await db.update(usuarios).set({ ultimoAcceso: new Date() }).where(eq(usuarios.id, usuario.id));
  const token = await crearSesion(usuario.id);
  return { token, usuario: datosPublicos(usuario) };
}
