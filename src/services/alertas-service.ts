import { desc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { alertas } from '@/db/schema';

export async function listar() {
  return db.select().from(alertas).orderBy(desc(alertas.creadoEn));
}

export async function marcarLeida(id: number) {
  await db.update(alertas).set({ leido: true }).where(eq(alertas.id, id));
}

export async function marcarTodasLeidas() {
  await db.update(alertas).set({ leido: true });
}
