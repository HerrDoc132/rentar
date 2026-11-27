/**
 * Seed de RentAr v2 — mismos datos de ejemplo que el legacy Express/MySQL.
 * Ejecutar UNA VEZ sobre una base ya migrada:
 *
 *   npm run db:seed
 *
 * Borra y recarga las 11 tablas en orden seguro (respetando FKs).
 * Los montos se guardan en centavos; acá se convierten desde los pesos del seed original.
 */
import bcrypt from 'bcryptjs';
import { db } from '../src/db/client';
import {
  alertas, auditoria, contratoHistorial, contratos, inquilinos,
  pagos, propiedades, propietarios, sesiones, solicitudes, usuarios,
} from '../src/db/schema';

const centavos = (pesos: number) => Math.round(pesos * 100);

async function seed() {
  console.log('🧹 Limpiando tablas...');
  await db.delete(solicitudes);
  await db.delete(contratoHistorial);
  await db.delete(pagos);
  await db.delete(alertas);
  await db.delete(auditoria);
  await db.delete(contratos);
  await db.delete(propiedades);
  await db.delete(sesiones);
  await db.delete(usuarios);
  await db.delete(inquilinos);
  await db.delete(propietarios);

  console.log('🏠 Cargando propietarios...');
  const props = await db.insert(propietarios).values([
    { nombre: 'Juan Gómez', dni: '20123456', telefono: '381-444-0001', email: 'jgomez@gmail.com' },
    { nombre: 'Silvia Romero', dni: '24567890', telefono: '381-444-0002', email: 'sromero@gmail.com' },
    { nombre: 'Héctor Villalba', dni: '18345678', telefono: '381-444-0003', email: 'hvillalba@gmail.com' },
    { nombre: 'Patricia Leiva', dni: '26789012', telefono: '381-444-0004', email: 'pleiva@gmail.com' },
  ]).returning({ id: propietarios.id });

  console.log('👥 Cargando inquilinos...');
  const inqs = await db.insert(inquilinos).values([
    { dni: '44555666', nombre: 'Juan Pérez', telefono: '381-555-0001', email: 'juan@mail.com', estado: 'activo' },
    { dni: '33211444', nombre: 'María González', telefono: '381-555-0002', email: 'maria@mail.com', estado: 'activo' },
    { dni: '27890123', nombre: 'Carlos Ruiz', telefono: '381-555-0003', email: 'carlos@mail.com', estado: 'inactivo' },
    { dni: '38765432', nombre: 'Laura Medina', telefono: '381-555-0004', email: 'laura@mail.com', estado: 'activo' },
    { dni: '41234567', nombre: 'Roberto Sosa', telefono: '381-555-0005', email: 'roberto@mail.com', estado: 'activo' },
    { dni: '29876543', nombre: 'Ana Torres', telefono: '381-555-0006', email: 'ana@mail.com', estado: 'inactivo' },
  ]).returning({ id: inquilinos.id });

  console.log('🔐 Cargando usuarios...');
  const PASS_ADMIN = 'admin123';
  const PASS_PROP = 'propietario123';
  const PASS_INQ = 'inquilino123';
  const [hashAdmin, hashProp, hashInq] = await Promise.all([
    bcrypt.hash(PASS_ADMIN, 10),
    bcrypt.hash(PASS_PROP, 10),
    bcrypt.hash(PASS_INQ, 10),
  ]);

  await db.insert(usuarios).values([
    { nombre: 'Administrador General', email: 'admin@gmail.com', passwordHash: hashAdmin, rol: 'admin', activo: true },
    { nombre: 'Juan Gómez', email: 'jgomez@gmail.com', passwordHash: hashProp, rol: 'propietario', propietarioId: props[0].id, activo: true },
    { nombre: 'Silvia Romero', email: 'sromero@gmail.com', passwordHash: hashProp, rol: 'propietario', propietarioId: props[1].id, activo: true },
    { nombre: 'Héctor Villalba', email: 'hvillalba@gmail.com', passwordHash: hashProp, rol: 'propietario', propietarioId: props[2].id, activo: true },
    { nombre: 'Patricia Leiva', email: 'pleiva@gmail.com', passwordHash: hashProp, rol: 'propietario', propietarioId: props[3].id, activo: true },
    { nombre: 'Juan Pérez', email: 'jperez@gmail.com', passwordHash: hashInq, rol: 'inquilino', inquilinoId: inqs[0].id, activo: true },
    { nombre: 'María González', email: 'mgonzalez@gmail.com', passwordHash: hashInq, rol: 'inquilino', inquilinoId: inqs[1].id, activo: true },
  ]);

  console.log('🏘  Cargando propiedades...');
  const pis = await db.insert(propiedades).values([
    { nombre: 'Casa Familiar', direccion: 'Los Robles 240, Yerba Buena', tipo: 'Casa', precioCentavos: centavos(300000), estado: 'disponible', habitaciones: 3, banos: 2, garage: true, propietarioId: props[0].id, imagenSeed: 'house1' },
    { nombre: 'Casa Premium Los Lapachos', direccion: 'Los Lapachos 580, S.M. Tucumán', tipo: 'Casa', precioCentavos: centavos(480000), estado: 'ocupada', habitaciones: 4, banos: 3, garage: true, propietarioId: props[0].id, imagenSeed: 'house2' },
    { nombre: 'Departamento Norte', direccion: 'Av. Aconquija 1200, Yerba Buena', tipo: 'Departamento', precioCentavos: centavos(210000), estado: 'disponible', habitaciones: 2, banos: 1, garage: false, propietarioId: props[1].id, imagenSeed: 'house3' },
    { nombre: 'Casa Centro', direccion: 'Córdoba 450, S.M. Tucumán', tipo: 'Casa', precioCentavos: centavos(310000), estado: 'ocupada', habitaciones: 3, banos: 2, garage: true, propietarioId: props[1].id, imagenSeed: 'house4' },
    { nombre: 'Dúplex Tafí Viejo', direccion: 'San Martín 78, Tafí Viejo', tipo: 'Dúplex', precioCentavos: centavos(265000), estado: 'mantenimiento', habitaciones: 3, banos: 2, garage: true, propietarioId: props[2].id, imagenSeed: 'house5' },
    { nombre: 'Monoambiente Centro', direccion: 'Laprida 320, S.M. Tucumán', tipo: 'Monoambiente', precioCentavos: centavos(140000), estado: 'disponible', habitaciones: 1, banos: 1, garage: false, propietarioId: props[2].id, imagenSeed: 'house6' },
    { nombre: 'Casa con Pileta Lules', direccion: 'Las Magnolias 12, Lules', tipo: 'Casa', precioCentavos: centavos(350000), estado: 'disponible', habitaciones: 4, banos: 2, garage: true, propietarioId: props[2].id, imagenSeed: 'house7' },
    { nombre: 'Departamento Yerba Buena', direccion: 'Burruyacu 890, Yerba Buena', tipo: 'Departamento', precioCentavos: centavos(240000), estado: 'ocupada', habitaciones: 2, banos: 2, garage: true, propietarioId: props[3].id, imagenSeed: 'house8' },
    { nombre: 'Casa Quinta Cerro San Javier', direccion: 'Camino al Cerro 34, Tafí Viejo', tipo: 'Quinta', precioCentavos: centavos(520000), estado: 'mantenimiento', habitaciones: 5, banos: 3, garage: true, propietarioId: props[3].id, imagenSeed: 'house9' },
  ]).returning({ id: propiedades.id });

  console.log('📄 Cargando contratos e historial...');
  const contratosSeed: Array<[number, number, string, string, number, 'activo' | 'proximo' | 'vencido']> = [
    [1, 0, '2025-01-01', '2027-01-01', 480000, 'activo'],
    [3, 1, '2025-03-15', '2026-03-15', 310000, 'proximo'],
    [7, 3, '2024-06-01', '2026-06-01', 240000, 'proximo'],
    [0, 4, '2025-02-01', '2027-02-01', 300000, 'activo'],
    [2, 2, '2023-10-10', '2024-10-10', 180000, 'vencido'],
    [5, 5, '2025-07-01', '2027-07-01', 140000, 'activo'],
  ];
  const contratosInsertados = await db.insert(contratos).values(
    contratosSeed.map(([pi, ii, inicio, fin, monto, estado]) => ({
      propiedadId: pis[pi].id,
      inquilinoId: inqs[ii].id,
      fechaInicio: inicio,
      fechaFin: fin,
      montoCentavos: centavos(monto),
      estado,
    })),
  ).returning({ id: contratos.id, propiedadId: contratos.propiedadId, inquilinoId: contratos.inquilinoId, fechaInicio: contratos.fechaInicio, fechaFin: contratos.fechaFin, montoCentavos: contratos.montoCentavos });

  await db.insert(contratoHistorial).values(
    contratosInsertados.map((c) => ({
      contratoId: c.id,
      campo: 'creación',
      valorAnterior: null,
      valorNuevo: `Contrato creado del ${c.fechaInicio} al ${c.fechaFin} por $${c.montoCentavos / 100}`,
      usuario: 'Sistema',
    })),
  );

  console.log('💰 Cargando pagos...');
  await db.insert(pagos).values([
    [0, 'Enero 2026', 480000, 'pagado', '2026-01-05', 0],
    [0, 'Febrero 2026', 480000, 'pagado', '2026-02-04', 0],
    [0, 'Marzo 2026', 480000, 'pagado', '2026-03-06', 0],
    [1, 'Enero 2026', 310000, 'pagado', '2026-01-03', 0],
    [1, 'Febrero 2026', 310000, 'atrasado', null, 18600],
    [1, 'Marzo 2026', 310000, 'pendiente', null, 0],
    [2, 'Enero 2026', 240000, 'pagado', '2026-01-07', 0],
    [2, 'Febrero 2026', 240000, 'atrasado', null, 14400],
    [3, 'Enero 2026', 300000, 'pagado', '2026-01-02', 0],
    [3, 'Febrero 2026', 300000, 'pagado', '2026-02-03', 0],
    [5, 'Enero 2026', 140000, 'pagado', '2026-01-08', 0],
  ].map(([ci, mes, monto, estado, fecha, interes]) => ({
    contratoId: contratosInsertados[ci as number].id,
    mes: mes as string,
    montoCentavos: centavos(monto as number),
    estado: estado as 'pagado' | 'atrasado' | 'pendiente',
    fechaPago: fecha as string | null,
    interesCentavos: centavos(interes as number),
  })));

  console.log('🔔 Cargando alertas...');
  await db.insert(alertas).values([
    { tipo: 'pago', mensaje: '8 pagos atrasados', detalle: 'Requieren seguimiento esta semana', leido: false },
    { tipo: 'contrato', mensaje: 'Contrato #2 vence en 30 días', detalle: 'Vence el 15/03/2026', leido: false },
    { tipo: 'contrato', mensaje: 'Contrato #3 vence en 30 días', detalle: 'Vence el 01/06/2026', leido: false },
    { tipo: 'propiedad', mensaje: 'Casa Familiar — disponible para alquilar', detalle: 'Desde enero 2026', leido: true },
  ]);

  console.log('📩 Cargando solicitudes...');
  await db.insert(solicitudes).values([
    { propiedadId: pis[6].id, visitanteNombre: 'María Fernández', visitanteEmail: 'mfernandez@gmail.com', estado: 'nueva' },
    { propiedadId: pis[0].id, visitanteNombre: 'Diego Romero', visitanteEmail: 'dromero@gmail.com', estado: 'contactado' },
  ]);

  await db.insert(auditoria).values({
    usuario: 'Sistema',
    accion: 'Base de datos inicializada con datos de ejemplo',
  });

  console.log('');
  console.log('🎉 Datos de ejemplo cargados correctamente.');
  console.log('');
  console.log('  admin@gmail.com       / admin123');
  console.log('  jgomez@gmail.com      / propietario123');
  console.log('  jperez@gmail.com      / inquilino123');
  console.log('  mgonzalez@gmail.com   / inquilino123');
  console.log('');
}

seed().catch((error) => {
  console.error('❌ Error durante la carga:', error);
  process.exitCode = 1;
});
