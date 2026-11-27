import { put, del } from '@vercel/blob';
import { badRequest } from './errores';

const MIME_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 5 * 1024 * 1024;

/** Sube un archivo de FormData a Vercel Blob. Devuelve null si no hay archivo. */
export async function subirImagen(archivo: FormDataEntryValue | null): Promise<string | null> {
  if (!archivo || !(archivo instanceof File) || archivo.size === 0) return null;
  if (!MIME_PERMITIDOS.includes(archivo.type)) {
    throw badRequest('Formato de imagen no soportado. Usá JPG, PNG, WEBP o GIF.');
  }
  if (archivo.size > MAX_BYTES) {
    throw badRequest('La imagen no puede pesar más de 5 MB.');
  }

  const ext = archivo.type.split('/')[1].replace('jpeg', 'jpg');
  const nombre = `prop_${Date.now()}_${Math.round(Math.random() * 1e9)}.${ext}`;
  const blob = await put(nombre, archivo, { access: 'public' });
  return blob.url;
}

/** Borra una imagen de Vercel Blob si la URL es propia. */
export async function borrarImagen(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith('https://')) return;
  try {
    await del(url);
  } catch {
    // Si ya no existe, se ignora.
  }
}
