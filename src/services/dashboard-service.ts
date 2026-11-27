import { and, count, eq, ne, sql, sum } from 'drizzle-orm';
import { db } from '@/db/client';
import {
  alertas, contratos, pagos, propiedades, solicitudes, type UsuarioPublico,
} from '@/db/schema';

const total = (campo: unknown) => sql<number>`cast(${campo} as integer)`;

export async function getStats(usuario: UsuarioPublico) {
  if (usuario.rol === 'admin') {
    const [props] = await db.select({ n: count() }).from(propiedades);
    const [disp] = await db.select({ n: count() }).from(propiedades)
      .where(eq(propiedades.estado, 'disponible'));
    const [activos] = await db.select({ n: count() }).from(contratos)
      .where(eq(contratos.estado, 'activo'));
    const [proximos] = await db.select({ n: count() }).from(contratos)
      .where(eq(contratos.estado, 'proximo'));
    const [pendientes] = await db.select({ n: count() }).from(pagos)
      .where(ne(pagos.estado, 'pagado'));
    const [atrasados] = await db.select({ n: count() }).from(pagos)
      .where(eq(pagos.estado, 'atrasado'));
    const [ingresos] = await db.select({ n: sum(pagos.montoCentavos) }).from(pagos)
      .where(eq(pagos.estado, 'pagado'));
    const [alertasN] = await db.select({ n: count() }).from(alertas).where(eq(alertas.leido, false));
    const [solicitudesN] = await db.select({ n: count() }).from(solicitudes)
      .where(eq(solicitudes.estado, 'nueva'));

    return {
      propiedades: props.n,
      disponibles: disp.n,
      contratosActivos: activos.n,
      proximosVencer: proximos.n,
      pagosPendientes: pendientes.n,
      pagosAtrasados: atrasados.n,
      ingresosCobrados: Number(ingresos.n ?? 0),
      alertasNuevas: alertasN.n,
      solicitudesNuevas: solicitudesN.n,
    };
  }

  if (usuario.rol === 'inquilino') {
    const iid = usuario.inquilinoId ?? -1;
    const [activos] = await db.select({ n: count() }).from(contratos)
      .where(and(eq(contratos.inquilinoId, iid), eq(contratos.estado, 'activo')));
    const [pendientes] = await db.select({ n: count() }).from(pagos)
      .innerJoin(contratos, eq(pagos.contratoId, contratos.id))
      .where(and(eq(contratos.inquilinoId, iid), ne(pagos.estado, 'pagado')));
    const [pagados] = await db.select({ n: sum(pagos.montoCentavos) }).from(pagos)
      .innerJoin(contratos, eq(pagos.contratoId, contratos.id))
      .where(and(eq(contratos.inquilinoId, iid), eq(pagos.estado, 'pagado')));

    return {
      contratosActivos: activos.n,
      pagosPendientes: pendientes.n,
      totalPagado: Number(pagados.n ?? 0),
    };
  }

  const pid = usuario.propietarioId ?? -1;
  const [props] = await db.select({ n: count() }).from(propiedades)
    .where(eq(propiedades.propietarioId, pid));
  const [activos] = await db.select({ n: count() }).from(contratos)
    .innerJoin(propiedades, eq(contratos.propiedadId, propiedades.id))
    .where(and(eq(propiedades.propietarioId, pid), eq(contratos.estado, 'activo')));
  const [pendientes] = await db.select({ n: count() }).from(pagos)
    .innerJoin(contratos, eq(pagos.contratoId, contratos.id))
    .innerJoin(propiedades, eq(contratos.propiedadId, propiedades.id))
    .where(and(eq(propiedades.propietarioId, pid), ne(pagos.estado, 'pagado')));
  const [ingresos] = await db.select({ n: sum(pagos.montoCentavos) }).from(pagos)
    .innerJoin(contratos, eq(pagos.contratoId, contratos.id))
    .innerJoin(propiedades, eq(contratos.propiedadId, propiedades.id))
    .where(and(eq(propiedades.propietarioId, pid), eq(pagos.estado, 'pagado')));

  return {
    propiedades: props.n,
    contratosActivos: activos.n,
    pagosPendientes: pendientes.n,
    ingresosCobrados: Number(ingresos.n ?? 0),
  };
}

export { total };
