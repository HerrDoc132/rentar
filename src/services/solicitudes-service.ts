import { desc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { propiedades, solicitudes, type EstadoSolicitud } from '@/db/schema';
import { badRequest } from '@/lib/errores';

export async function listar() {
  return db
    .select({
      solicitud: solicitudes,
      propiedadNombre: propiedades.nombre,
    })
    .from(solicitudes)
    .innerJoin(propiedades, eq(solicitudes.propiedadId, propiedades.id))
    .orderBy(desc(solicitudes.creadoEn));
}

export async function crear(dto: {
  propiedadId: number;
  usuarioId?: number | null;
  visitanteNombre?: string | null;
  visitanteEmail?: string | null;
}) {
  if (!dto.propiedadId) throw badRequest('propiedadId es obligatorio.');
  const [nueva] = await db.insert(solicitudes).values({
    propiedadId: dto.propiedadId,
    usuarioId: dto.usuarioId ?? null,
    visitanteNombre: dto.visitanteNombre || null,
    visitanteEmail: dto.visitanteEmail || null,
    estado: 'nueva',
  }).returning();
  return nueva.id;
}

export async function actualizarEstado(id: number, estado: string) {
  if (!['nueva', 'contactado', 'cerrada'].includes(estado)) {
    throw badRequest('Estado inválido.');
  }
  await db.update(solicitudes)
    .set({ estado: estado as EstadoSolicitud })
    .where(eq(solicitudes.id, id));
}
