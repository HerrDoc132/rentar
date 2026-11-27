import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

// ── Helper: timestamp guardado como segundos Unix ────────────
const timestamp = (name: string) =>
  integer(name, { mode: 'timestamp' }).default(sql`(unixepoch())`);

// ── PROPIETARIOS ─────────────────────────────────────────────
export const propietarios = sqliteTable('propietarios', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull(),
  dni: text('dni').notNull(),
  telefono: text('telefono'),
  email: text('email'),
  creadoEn: timestamp('creado_en'),
}, (t) => [
  uniqueIndex('propietarios_dni_unique').on(t.dni),
  uniqueIndex('propietarios_email_unique').on(t.email),
]);

// ── INQUILINOS ───────────────────────────────────────────────
export const inquilinos = sqliteTable('inquilinos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  dni: text('dni').notNull(),
  nombre: text('nombre').notNull(),
  telefono: text('telefono'),
  email: text('email'),
  estado: text('estado', { enum: ['activo', 'inactivo'] }).notNull().default('activo'),
}, (t) => [uniqueIndex('inquilinos_dni_unique').on(t.dni)]);

// ── USUARIOS ─────────────────────────────────────────────────
export const usuarios = sqliteTable('usuarios', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull(),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
  rol: text('rol', { enum: ['admin', 'propietario', 'vendedor', 'inquilino', 'pendiente'] })
    .notNull().default('pendiente'),
  propietarioId: integer('propietario_id').references(() => propietarios.id, { onDelete: 'set null' }),
  inquilinoId: integer('inquilino_id').references(() => inquilinos.id, { onDelete: 'set null' }),
  activo: integer('activo', { mode: 'boolean' }).notNull().default(true),
  creadoEn: timestamp('creado_en'),
  ultimoAcceso: integer('ultimo_acceso', { mode: 'timestamp' }),
}, (t) => [uniqueIndex('usuarios_email_unique').on(t.email)]);

// ── SESIONES ─────────────────────────────────────────────────
export const sesiones = sqliteTable('sesiones', {
  token: text('token').primaryKey(),
  usuarioId: integer('usuario_id').notNull()
    .references(() => usuarios.id, { onDelete: 'cascade' }),
  creadoEn: timestamp('creado_en'),
  expiraEn: integer('expira_en', { mode: 'timestamp' }).notNull(),
});

// ── PROPIEDADES ──────────────────────────────────────────────
export const propiedades = sqliteTable('propiedades', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull(),
  direccion: text('direccion').notNull(),
  tipo: text('tipo', { enum: ['Casa', 'Departamento', 'Dúplex', 'Monoambiente', 'Quinta'] })
    .notNull().default('Casa'),
  precioCentavos: integer('precio_centavos').notNull(),
  estado: text('estado', { enum: ['disponible', 'ocupada', 'mantenimiento'] })
    .notNull().default('disponible'),
  habitaciones: integer('habitaciones').notNull().default(1),
  banos: integer('banos').notNull().default(1),
  garage: integer('garage', { mode: 'boolean' }).notNull().default(false),
  propietarioId: integer('propietario_id').notNull()
    .references(() => propietarios.id, { onDelete: 'cascade' }),
  imagenSeed: text('imagen_seed'),
  imagenUrl: text('imagen_url'),
  creadoEn: timestamp('creado_en'),
});

// ── CONTRATOS ────────────────────────────────────────────────
export const contratos = sqliteTable('contratos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  propiedadId: integer('propiedad_id').notNull()
    .references(() => propiedades.id, { onDelete: 'cascade' }),
  inquilinoId: integer('inquilino_id').notNull()
    .references(() => inquilinos.id, { onDelete: 'cascade' }),
  fechaInicio: text('fecha_inicio').notNull(),
  fechaFin: text('fecha_fin').notNull(),
  montoCentavos: integer('monto_centavos').notNull(),
  estado: text('estado', { enum: ['activo', 'proximo', 'vencido', 'finalizado'] })
    .notNull().default('activo'),
});

// ── PAGOS ────────────────────────────────────────────────────
export const pagos = sqliteTable('pagos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  contratoId: integer('contrato_id').notNull()
    .references(() => contratos.id, { onDelete: 'cascade' }),
  mes: text('mes').notNull(),
  montoCentavos: integer('monto_centavos').notNull(),
  estado: text('estado', { enum: ['pagado', 'pendiente', 'atrasado'] })
    .notNull().default('pendiente'),
  fechaPago: text('fecha_pago'),
  interesCentavos: integer('interes_centavos').notNull().default(0),
});

// ── ALERTAS ──────────────────────────────────────────────────
export const alertas = sqliteTable('alertas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tipo: text('tipo', { enum: ['pago', 'contrato', 'propiedad'] }).notNull(),
  mensaje: text('mensaje').notNull(),
  detalle: text('detalle'),
  leido: integer('leido', { mode: 'boolean' }).notNull().default(false),
  creadoEn: timestamp('creado_en'),
});

// ── SOLICITUDES ──────────────────────────────────────────────
export const solicitudes = sqliteTable('solicitudes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  propiedadId: integer('propiedad_id').notNull()
    .references(() => propiedades.id, { onDelete: 'cascade' }),
  usuarioId: integer('usuario_id').references(() => usuarios.id, { onDelete: 'set null' }),
  visitanteNombre: text('visitante_nombre'),
  visitanteEmail: text('visitante_email'),
  estado: text('estado', { enum: ['nueva', 'contactado', 'cerrada'] })
    .notNull().default('nueva'),
  creadoEn: timestamp('creado_en'),
});

// ── CONTRATO_HISTORIAL ───────────────────────────────────────
export const contratoHistorial = sqliteTable('contrato_historial', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  contratoId: integer('contrato_id').notNull()
    .references(() => contratos.id, { onDelete: 'cascade' }),
  campo: text('campo').notNull(),
  valorAnterior: text('valor_anterior'),
  valorNuevo: text('valor_nuevo'),
  usuario: text('usuario').notNull(),
  creadoEn: timestamp('creado_en'),
});

// ── AUDITORÍA ────────────────────────────────────────────────
export const auditoria = sqliteTable('auditoria', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  usuario: text('usuario').notNull(),
  accion: text('accion').notNull(),
  creadoEn: timestamp('creado_en'),
});

// ── Tipos inferidos (se usan en services y DTOs) ─────────────
export type Usuario = typeof usuarios.$inferSelect;
export type UsuarioPublico = Pick<Usuario, 'id' | 'nombre' | 'email' | 'rol' | 'propietarioId' | 'inquilinoId'>;
export type Propietario = typeof propietarios.$inferSelect;
export type Inquilino = typeof inquilinos.$inferSelect;
export type Propiedad = typeof propiedades.$inferSelect;
export type Contrato = typeof contratos.$inferSelect;
export type Pago = typeof pagos.$inferSelect;
export type Alerta = typeof alertas.$inferSelect;
export type Solicitud = typeof solicitudes.$inferSelect;

// ── Uniones literales derivadas del schema (evitan casts frágiles) ──
export type Rol = Usuario['rol'];
export type EstadoInquilino = Inquilino['estado'];
export type TipoPropiedad = Propiedad['tipo'];
export type EstadoPropiedad = Propiedad['estado'];
export type EstadoContrato = Contrato['estado'];
export type EstadoPago = Pago['estado'];
export type TipoAlerta = Alerta['tipo'];
export type EstadoSolicitud = Solicitud['estado'];
