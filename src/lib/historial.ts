import { db } from '@/db/client';
import { contratoHistorial } from '@/db/schema';

export async function registrarHistorialContrato(
  contratoId: number,
  campo: string,
  valorAnterior: unknown,
  valorNuevo: unknown,
  usuario: string,
): Promise<void> {
  await db.insert(contratoHistorial).values({
    contratoId,
    campo,
    valorAnterior: valorAnterior === undefined || valorAnterior === null ? null : String(valorAnterior),
    valorNuevo: valorNuevo === undefined || valorNuevo === null ? null : String(valorNuevo),
    usuario,
  });
}
