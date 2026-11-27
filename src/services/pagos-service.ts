import { desc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import {
  contratos, inquilinos, pagos, propiedades, propietarios, type UsuarioPublico,
} from '@/db/schema';
import { registrarAuditoria } from '@/lib/auditoria';
import { aCentavos } from '@/lib/dinero';
import { badRequest, notFound } from '@/lib/errores';

export async function listar(usuario: UsuarioPublico) {
  const base = db
    .select({
      pago: pagos,
      montoContratoCentavos: contratos.montoCentavos,
      propiedadNombre: propiedades.nombre,
      inquilinoNombre: inquilinos.nombre,
    })
    .from(pagos)
    .innerJoin(contratos, eq(pagos.contratoId, contratos.id))
    .innerJoin(propiedades, eq(contratos.propiedadId, propiedades.id))
    .innerJoin(inquilinos, eq(contratos.inquilinoId, inquilinos.id));

  const filas = usuario.rol === 'admin'
    ? await base.orderBy(desc(pagos.id))
    : usuario.rol === 'inquilino'
      ? await base.where(eq(contratos.inquilinoId, usuario.inquilinoId ?? -1)).orderBy(desc(pagos.id))
      : await base.where(eq(propiedades.propietarioId, usuario.propietarioId ?? -1)).orderBy(desc(pagos.id));

  return filas.map((f) => ({
    ...f.pago,
    montoContratoCentavos: f.montoContratoCentavos,
    propiedadNombre: f.propiedadNombre,
    inquilinoNombre: f.inquilinoNombre,
  }));
}

export interface DatosPago {
  contratoId: number;
  mes: string;
  monto: number | string;
  interes?: number | string;
  fechaPago?: string;
}

export async function registrar(dto: DatosPago, adminNombre: string) {
  if (!dto.contratoId || !dto.mes || !dto.monto) {
    throw badRequest('Contrato, mes y monto son obligatorios.');
  }
  const hoy = new Date().toISOString().slice(0, 10);
  const [nuevo] = await db.insert(pagos).values({
    contratoId: dto.contratoId,
    mes: dto.mes,
    montoCentavos: aCentavos(dto.monto),
    estado: 'pagado',
    fechaPago: dto.fechaPago || hoy,
    interesCentavos: aCentavos(dto.interes ?? 0),
  }).returning();

  await registrarAuditoria(adminNombre, `Registró pago de ${dto.mes} para contrato #${dto.contratoId}`);
  return nuevo;
}

export async function cobrar(id: number) {
  const hoy = new Date().toISOString().slice(0, 10);
  const [editado] = await db.update(pagos)
    .set({ estado: 'pagado', fechaPago: hoy })
    .where(eq(pagos.id, id)).returning();
  if (!editado) throw notFound('Pago no encontrado.');
  return editado;
}

export async function getRecibo(id: number) {
  const [fila] = await db
    .select({
      pago: pagos,
      fechaInicio: contratos.fechaInicio,
      fechaFin: contratos.fechaFin,
      propiedadNombre: propiedades.nombre,
      propiedadDireccion: propiedades.direccion,
      propietarioId: propiedades.propietarioId,
      inquilinoNombre: inquilinos.nombre,
      inquilinoDni: inquilinos.dni,
      propietarioNombre: propietarios.nombre,
    })
    .from(pagos)
    .innerJoin(contratos, eq(pagos.contratoId, contratos.id))
    .innerJoin(propiedades, eq(contratos.propiedadId, propiedades.id))
    .innerJoin(inquilinos, eq(contratos.inquilinoId, inquilinos.id))
    .innerJoin(propietarios, eq(propiedades.propietarioId, propietarios.id))
    .where(eq(pagos.id, id))
    .limit(1);
  if (!fila) throw notFound('Pago no encontrado.');
  return fila;
}
