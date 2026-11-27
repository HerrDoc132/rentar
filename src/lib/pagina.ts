import { redirect } from 'next/navigation';
import { obtenerUsuarioOpcional } from './auth';
import type { UsuarioPublico } from '@/db/schema';

/** Valida la sesión en el servidor para las páginas del panel. */
export async function requerirPagina(admin = false): Promise<UsuarioPublico> {
  const usuario = await obtenerUsuarioOpcional();
  if (!usuario) redirect('/login');
  if (admin && usuario.rol !== 'admin') redirect('/dashboard');
  return usuario;
}

export const esAdmin = (usuario: UsuarioPublico) => usuario.rol === 'admin';
