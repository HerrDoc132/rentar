import { relations } from 'drizzle-orm';
import {
  alertas, auditoria, contratoHistorial, contratos, inquilinos,
  pagos, propietarios, propiedades, sesiones, solicitudes, usuarios,
} from './schema';

export const propietariosRelations = relations(propietarios, ({ many }) => ({
  usuarios: many(usuarios),
  propiedades: many(propiedades),
}));

export const inquilinosRelations = relations(inquilinos, ({ many }) => ({
  usuarios: many(usuarios),
  contratos: many(contratos),
}));

export const usuariosRelations = relations(usuarios, ({ one, many }) => ({
  propietario: one(propietarios, {
    fields: [usuarios.propietarioId],
    references: [propietarios.id],
  }),
  inquilino: one(inquilinos, {
    fields: [usuarios.inquilinoId],
    references: [inquilinos.id],
  }),
  sesiones: many(sesiones),
  solicitudes: many(solicitudes),
}));

export const sesionesRelations = relations(sesiones, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [sesiones.usuarioId],
    references: [usuarios.id],
  }),
}));

export const propiedadesRelations = relations(propiedades, ({ one, many }) => ({
  propietario: one(propietarios, {
    fields: [propiedades.propietarioId],
    references: [propietarios.id],
  }),
  contratos: many(contratos),
  solicitudes: many(solicitudes),
}));

export const contratosRelations = relations(contratos, ({ one, many }) => ({
  propiedad: one(propiedades, {
    fields: [contratos.propiedadId],
    references: [propiedades.id],
  }),
  inquilino: one(inquilinos, {
    fields: [contratos.inquilinoId],
    references: [inquilinos.id],
  }),
  pagos: many(pagos),
  historial: many(contratoHistorial),
}));

export const pagosRelations = relations(pagos, ({ one }) => ({
  contrato: one(contratos, {
    fields: [pagos.contratoId],
    references: [contratos.id],
  }),
}));

export const contratoHistorialRelations = relations(contratoHistorial, ({ one }) => ({
  contrato: one(contratos, {
    fields: [contratoHistorial.contratoId],
    references: [contratos.id],
  }),
}));

export const alertasRelations = relations(alertas, () => ({}));
export const auditoriaRelations = relations(auditoria, () => ({}));

export const solicitudesRelations = relations(solicitudes, ({ one }) => ({
  propiedad: one(propiedades, {
    fields: [solicitudes.propiedadId],
    references: [propiedades.id],
  }),
  usuario: one(usuarios, {
    fields: [solicitudes.usuarioId],
    references: [usuarios.id],
  }),
}));
