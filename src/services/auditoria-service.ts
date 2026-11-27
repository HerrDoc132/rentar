import { desc } from 'drizzle-orm';
import { db } from '@/db/client';
import { auditoria } from '@/db/schema';

export async function listar() {
  return db.select().from(auditoria).orderBy(desc(auditoria.creadoEn)).limit(100);
}
