import { db } from '@/db/client';
import { auditoria } from '@/db/schema';

export async function registrarAuditoria(usuario: string, accion: string): Promise<void> {
  await db.insert(auditoria).values({ usuario, accion });
}
