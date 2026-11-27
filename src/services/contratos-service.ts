import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import {
  contratos, contratoHistorial, inquilinos, pagos, propiedades,
  type UsuarioPublico,
} from '@/db/schema';
import { registrarAuditoria } from '@/lib/auditoria';
import { registrarHistorialContrato } from '@/lib/historial';
import { aCentavos } from '@/lib/dinero';
import { badRequest, conflict, notFound } from '@/lib/errores';

async function listarFiltrados(usuario: UsuarioPublico) {
  const join = db
    .select({
      contrato: contratos,
      propiedadNombre: propiedades.nombre,
      inquilinoNombre: inquilinos.nombre,
    })
    .from(contratos)
    .innerJoin(propiedades, eq(contratos.propiedadId, propiedades.id))
    .innerJoin(inquilinos, eq(contratos.inquilinoId, inquilinos.id));

  if (usuario.rol === 'admin') {
    return join.orderBy(desc(contratos.fechaInicio));
  }
  if (usuario.rol === 'inquilino') {
    return join.where(eq(contratos.inquilinoId, usuario.inquilinoId ?? -1))
      .orderBy(desc(contratos.fechaInicio));
  }
  return join.where(eq(propiedades.propietarioId, usuario.propietarioId ?? -1))
    .orderBy(desc(contratos.fechaInicio));
}

export async function listar(usuario: UsuarioPublico) {
  const filas = await listarFiltrados(usuario);
  return filas.map((f) => ({
    ...f.contrato,
    propiedadNombre: f.propiedadNombre,
    inquilinoNombre: f.inquilinoNombre,
  }));
}

export async function getById(id: number) {
  const [fila] = await db.select().from(contratos).where(eq(contratos.id, id)).limit(1);
  if (!fila) throw notFound('Contrato no encontrado.');
  return fila;
}

export async function crear(
  dto: {
    propiedadId: number;
    inquilinoId: number;
    fechaInicio: string;
    fechaFin: string;
    monto: number | string;
  },
  adminNombre: string,
) {
  if (!dto.propiedadId || !dto.inquilinoId || !dto.fechaInicio || !dto.fechaFin || !dto.monto) {
    throw badRequest('Todos los campos son obligatorios.');
  }
  const [prop] = await db.select().from(propiedades).where(eq(propiedades.id, dto.propiedadId)).limit(1);
  if (prop?.estado === 'ocupada') throw conflict('Esa propiedad ya está ocupada.');

  const [nuevo] = await db.insert(contratos).values({
    propiedadId: dto.propiedadId,
    inquilinoId: dto.inquilinoId,
    fechaInicio: dto.fechaInicio,
    fechaFin: dto.fechaFin,
    montoCentavos: aCentavos(dto.monto),
    estado: 'activo',
  }).returning();

  await db.update(propiedades).set({ estado: 'ocupada' }).where(eq(propiedades.id, dto.propiedadId));
  await registrarAuditoria(adminNombre, `Creó el contrato #${nuevo.id}`);
  await registrarHistorialContrato(
    nuevo.id, 'creación', null,
    `Contrato creado del ${dto.fechaInicio} al ${dto.fechaFin} por $${dto.monto}`,
    adminNombre,
  );
  return nuevo;
}

export async function renovar(id: number, adminNombre: string) {
  const contrato = await getById(id);
  const anterior = new Date(contrato.fechaFin + 'T00:00:00Z');
  anterior.setUTCFullYear(anterior.getUTCFullYear() + 1);
  const nuevaFechaFin = anterior.toISOString().slice(0, 10);

  await db.update(contratos).set({ fechaFin: nuevaFechaFin, estado: 'activo' })
    .where(eq(contratos.id, id));
  await registrarAuditoria(adminNombre, `Renovó el contrato #${id} hasta ${nuevaFechaFin}`);
  await registrarHistorialContrato(id, 'fecha_fin', contrato.fechaFin, nuevaFechaFin, adminNombre);
  if (contrato.estado !== 'activo') {
    await registrarHistorialContrato(id, 'estado', contrato.estado, 'activo', adminNombre);
  }
  return nuevaFechaFin;
}

export async function actualizarMonto(
  id: number,
  dto: { monto: number | string; nota?: string },
  adminNombre: string,
) {
  if (!dto.monto || Number(dto.monto) <= 0) {
    throw badRequest('El monto tiene que ser mayor a cero.');
  }
  const contrato = await getById(id);
  await db.update(contratos).set({ montoCentavos: aCentavos(dto.monto) })
    .where(eq(contratos.id, id));
  await registrarAuditoria(adminNombre, `Actualizó el monto del contrato #${id} a $${dto.monto}`);
  await registrarHistorialContrato(id, 'monto', contrato.montoCentavos, aCentavos(dto.monto), adminNombre);
  if (dto.nota?.trim()) {
    await registrarHistorialContrato(id, 'nota', null, dto.nota.trim(), adminNombre);
  }
}

export async function finalizar(id: number, adminNombre: string) {
  const contrato = await getById(id);
  await db.update(contratos).set({ estado: 'finalizado' }).where(eq(contratos.id, id));
  await db.update(propiedades).set({ estado: 'disponible' })
    .where(eq(propiedades.id, contrato.propiedadId));
  await registrarAuditoria(adminNombre, `Finalizó el contrato #${id}`);
  await registrarHistorialContrato(id, 'estado', contrato.estado, 'finalizado', adminNombre);
}

export async function getHistorial(id: number) {
  await getById(id);
  return db.select().from(contratoHistorial)
    .where(eq(contratoHistorial.contratoId, id));
}

export async function esInquilinoDelContrato(inquilinoId: number, contratoId: number) {
  const [fila] = await db.select({ id: contratos.id }).from(contratos)
    .where(and(eq(contratos.id, contratoId), eq(contratos.inquilinoId, inquilinoId)))
    .limit(1);
  return Boolean(fila);
}

export async function tienePagos(contratoId: number) {
  const filas = await db.select({ id: pagos.id }).from(pagos)
    .where(eq(pagos.contratoId, contratoId)).limit(1);
  return filas.length > 0;
}
