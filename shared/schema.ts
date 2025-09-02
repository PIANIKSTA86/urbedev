import { sql } from "drizzle-orm";
import {
  mysqlTable,
  text,
  varchar,
  int,
  decimal,
  boolean,
  datetime,
  mysqlEnum,
  mysqlTableWithSchema,
  mysqlSchema,
  mysqlColumn,
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums para tipos de datos
export const tipoPersonaEnum = mysqlEnum('tipo_persona', ['natural', 'juridica']);
export const tipoTerceroEnum = mysqlEnum('tipo_tercero', ['propietario', 'inquilino', 'proveedor']);
export const tipoContribuyenteEnum = mysqlEnum('tipo_contribuyente', ['responsable_iva', 'no_responsable_iva', 'gran_contribuyente']);
export const tipoIdentificacionEnum = mysqlEnum('tipo_identificacion', ['cedula', 'nit', 'pasaporte', 'cedula_extranjeria']);
export const tipoUnidadEnum = mysqlEnum('tipo_unidad', ['apartamento', 'local_comercial', 'oficina', 'deposito', 'parqueadero']);
export const estadoOcupacionEnum = mysqlEnum('estado_ocupacion', ['ocupado', 'desocupado', 'en_mantenimiento']);
export const estadoPeriodoEnum = mysqlEnum('estado_periodo', ['abierto', 'cerrado']);
export const tipoTransaccionEnum = mysqlEnum('tipo_transaccion', ['ingreso', 'egreso', 'ajuste']);
export const rolUsuarioEnum = mysqlEnum('rol_usuario', ['superadmin', 'administrador', 'contador', 'revisor', 'auxiliar', 'propietario']);

export const usuarios = mysqlTable("usuarios", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  apellido: varchar("apellido", { length: 100 }).notNull(),
  rol_id: int("rol_id").notNull().default(1),
  activo: boolean("activo").default(true),
  fechaCreacion: datetime("fecha_creacion").default(sql`CURRENT_TIMESTAMP`),
  fechaActualizacion: datetime("fecha_actualizacion").default(sql`CURRENT_TIMESTAMP`),
});

export const terceros = mysqlTable("terceros", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  tipoPersona: tipoPersonaEnum.notNull(),
  tipoTercero: tipoTerceroEnum.notNull(),
  tipoContribuyente: tipoContribuyenteEnum.notNull(),
  tipoIdentificacion: tipoIdentificacionEnum.notNull(),
  numeroIdentificacion: varchar("numero_identificacion", { length: 20 }).unique().notNull(),
  primerNombre: varchar("primer_nombre", { length: 50 }),
  segundoNombre: varchar("segundo_nombre", { length: 50 }),
  primerApellido: varchar("primer_apellido", { length: 50 }),
  segundoApellido: varchar("segundo_apellido", { length: 50 }),
  razonSocial: varchar("razon_social", { length: 200 }),
  direccion: text("direccion").notNull(),
  pais: varchar("pais", { length: 50 }).notNull().default('Colombia'),
  departamento: varchar("departamento", { length: 50 }).notNull(),
  municipio: varchar("municipio", { length: 50 }).notNull(),
  municipioCodigoDane: varchar("municipio_codigo_dane", { length: 10 }),
  telefono: varchar("telefono", { length: 20 }),
  movil: varchar("movil", { length: 20 }),
  email: varchar("email", { length: 255 }),
  activo: boolean("activo").default(true),
  fechaCreacion: datetime("fecha_creacion").default(sql`CURRENT_TIMESTAMP`),
  fechaActualizacion: datetime("fecha_actualizacion").default(sql`CURRENT_TIMESTAMP`),
});

export const unidades = mysqlTable("unidades", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  tipoUnidad: tipoUnidadEnum.notNull(),
  codigoUnidad: varchar("codigo_unidad", { length: 20 }).unique().notNull(),
  propietarioId: varchar("propietario_id", { length: 36 }),
  inquilinoId: varchar("inquilino_id", { length: 36 }),
  area: decimal("area", { precision: 10, scale: 2 }).notNull(),
  coeficiente: decimal("coeficiente", { precision: 8, scale: 6 }).notNull(),
  cuotaAdministracion: decimal("cuota_administracion", { precision: 10, scale: 2 }).notNull(),
  tieneParqueadero: boolean("tiene_parqueadero").default(false),
  cuotaParqueadero: decimal("cuota_parqueadero", { precision: 10, scale: 2 }).default('0'),
  generaIntereses: boolean("genera_intereses").default(true),
  estadoOcupacion: estadoOcupacionEnum.notNull().default('desocupado'),
  activo: boolean("activo").default(true),
  fechaCreacion: datetime("fecha_creacion").default(sql`CURRENT_TIMESTAMP`),
  fechaActualizacion: datetime("fecha_actualizacion").default(sql`CURRENT_TIMESTAMP`),
});

export const planCuentas = mysqlTable("plan_cuentas", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  codigo: varchar("codigo", { length: 20 }).unique().notNull(),
  clase: varchar("clase", { length: 1 }).notNull(), // 1-9
  grupo: varchar("grupo", { length: 2 }),
  cuenta: varchar("cuenta", { length: 4 }),
  subcuenta: varchar("subcuenta", { length: 6 }),
  auxiliar: varchar("auxiliar", { length: 8 }),
  nombre: varchar("nombre", { length: 200 }).notNull(),
  nivel: int("nivel").notNull(), // 1-6
  esDebito: boolean("es_debito").notNull(), // true para débito, false para crédito
  nombreClase: varchar("nombre_clase", { length: 50 }).notNull(),
  registraTercero: boolean("registra_tercero").default(false),
  activa: boolean("activa").default(true),
  fechaCreacion: datetime("fecha_creacion").default(sql`CURRENT_TIMESTAMP`),
});

export const periodosContables = mysqlTable("periodos_contables", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  ano: int("ano").notNull(),
  mes: int("mes").notNull(),
  nombre: varchar("nombre", { length: 50 }).notNull(),
  fechaInicio: datetime("fecha_inicio").notNull(),
  fechaCierre: datetime("fecha_cierre").notNull(),
  estado: estadoPeriodoEnum.notNull().default('abierto'),
  fechaCreacion: datetime("fecha_creacion").default(sql`CURRENT_TIMESTAMP`),
});

export const comprobantesContables = mysqlTable("comprobantes_contables", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  numeroComprobante: varchar("numero_comprobante", { length: 20 }).notNull(),
  periodoId: varchar("periodo_id", { length: 36 }).notNull(),
  fecha: datetime("fecha").notNull(),
  concepto: text("concepto").notNull(),
  tipoTransaccion: tipoTransaccionEnum.notNull(),
  totalDebito: decimal("total_debito", { precision: 15, scale: 2 }).notNull(),
  totalCredito: decimal("total_credito", { precision: 15, scale: 2 }).notNull(),
  usuarioId: varchar("usuario_id", { length: 36 }).notNull(),
  fechaCreacion: datetime("fecha_creacion").default(sql`CURRENT_TIMESTAMP`),
});

export const movimientosContables = mysqlTable("movimientos_contables", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  comprobanteId: varchar("comprobante_id", { length: 36 }).notNull(),
  cuentaId: varchar("cuenta_id", { length: 36 }).notNull(),
  terceroId: varchar("tercero_id", { length: 36 }),
  descripcion: text("descripcion").notNull(),
  valorDebito: decimal("valor_debito", { precision: 15, scale: 2 }).default('0'),
  valorCredito: decimal("valor_credito", { precision: 15, scale: 2 }).default('0'),
  fechaCreacion: datetime("fecha_creacion").default(sql`CURRENT_TIMESTAMP`),
});

export const facturas = mysqlTable("facturas", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  numeroFactura: varchar("numero_factura", { length: 20 }).unique().notNull(),
  terceroId: varchar("tercero_id", { length: 36 }).notNull(),
  unidadId: varchar("unidad_id", { length: 36 }),
  periodoId: varchar("periodo_id", { length: 36 }).notNull(),
  fechaFactura: datetime("fecha_factura").notNull(),
  fechaVencimiento: datetime("fecha_vencimiento").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  iva: decimal("iva", { precision: 10, scale: 2 }).default('0'),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  pagada: boolean("pagada").default(false),
  fechaPago: datetime("fecha_pago"),
  observaciones: text("observaciones"),
  fechaCreacion: datetime("fecha_creacion").default(sql`CURRENT_TIMESTAMP`),
});

// Relaciones
export const tercerosRelations = relations(terceros, ({ many }) => ({
  unidadesPropias: many(unidades, { relationName: "propietario" }),
  unidadesArrendadas: many(unidades, { relationName: "inquilino" }),
  facturas: many(facturas),
  movimientos: many(movimientosContables),
}));

export const unidadesRelations = relations(unidades, ({ one, many }) => ({
  propietario: one(terceros, { 
    fields: [unidades.propietarioId], 
    references: [terceros.id],
    relationName: "propietario"
  }),
  inquilino: one(terceros, { 
    fields: [unidades.inquilinoId], 
    references: [terceros.id],
    relationName: "inquilino"
  }),
  facturas: many(facturas),
}));

export const comprobantesRelations = relations(comprobantesContables, ({ one, many }) => ({
  periodo: one(periodosContables, {
    fields: [comprobantesContables.periodoId],
    references: [periodosContables.id]
  }),
  usuario: one(usuarios, {
    fields: [comprobantesContables.usuarioId],
    references: [usuarios.id]
  }),
  movimientos: many(movimientosContables),
}));

export const movimientosRelations = relations(movimientosContables, ({ one }) => ({
  comprobante: one(comprobantesContables, {
    fields: [movimientosContables.comprobanteId],
    references: [comprobantesContables.id]
  }),
  cuenta: one(planCuentas, {
    fields: [movimientosContables.cuentaId],
    references: [planCuentas.id]
  }),
  tercero: one(terceros, {
    fields: [movimientosContables.terceroId],
    references: [terceros.id]
  }),
}));

// Schemas de inserción
export const insertUsuarioSchema = createInsertSchema(usuarios).omit({
  id: true,
  fechaCreacion: true,
  fechaActualizacion: true,
});

export const insertTerceroSchema = createInsertSchema(terceros).omit({
  id: true,
  fechaCreacion: true,
  fechaActualizacion: true,
});

export const insertUnidadSchema = createInsertSchema(unidades).omit({
  id: true,
  fechaCreacion: true,
  fechaActualizacion: true,
}).extend({
  area: z.number(),
  coeficiente: z.number(),
  cuotaAdministracion: z.number(),
  cuotaParqueadero: z.number().nullable(),
});

export const insertPlanCuentaSchema = createInsertSchema(planCuentas).omit({
  id: true,
  fechaCreacion: true,
});

export const insertComprobanteSchema = createInsertSchema(comprobantesContables).omit({
  id: true,
  fechaCreacion: true,
});

export const insertMovimientoSchema = createInsertSchema(movimientosContables).omit({
  id: true,
  fechaCreacion: true,
});

// Tipos de inferencia
export type Usuario = typeof usuarios.$inferSelect;
export type InsertUsuario = z.infer<typeof insertUsuarioSchema>;

export type Tercero = typeof terceros.$inferSelect;
export type InsertTercero = z.infer<typeof insertTerceroSchema>;

export type Unidad = typeof unidades.$inferSelect;
export type InsertUnidad = z.infer<typeof insertUnidadSchema>;

export type PlanCuenta = typeof planCuentas.$inferSelect;
export type InsertPlanCuenta = z.infer<typeof insertPlanCuentaSchema>;

export type PeriodoContable = typeof periodosContables.$inferSelect;
export type ComprobanteContable = typeof comprobantesContables.$inferSelect;
export type MovimientoContable = typeof movimientosContables.$inferSelect;
export type Factura = typeof facturas.$inferSelect;
