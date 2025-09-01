import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  integer, 
  decimal, 
  boolean, 
  timestamp, 
  uuid,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums para tipos de datos
export const tipoPersonaEnum = pgEnum('tipo_persona', ['natural', 'juridica']);
export const tipoTerceroEnum = pgEnum('tipo_tercero', ['propietario', 'inquilino', 'proveedor']);
export const tipoContribuyenteEnum = pgEnum('tipo_contribuyente', ['responsable_iva', 'no_responsable_iva', 'gran_contribuyente']);
export const tipoIdentificacionEnum = pgEnum('tipo_identificacion', ['cedula', 'nit', 'pasaporte', 'cedula_extranjeria']);
export const tipoUnidadEnum = pgEnum('tipo_unidad', ['apartamento', 'local_comercial', 'oficina', 'deposito', 'parqueadero']);
export const estadoOcupacionEnum = pgEnum('estado_ocupacion', ['ocupado', 'desocupado', 'en_mantenimiento']);
export const estadoPeriodoEnum = pgEnum('estado_periodo', ['abierto', 'cerrado']);
export const tipoTransaccionEnum = pgEnum('tipo_transaccion', ['ingreso', 'egreso', 'ajuste']);
export const rolUsuarioEnum = pgEnum('rol_usuario', ['superadmin', 'administrador', 'contador', 'revisor', 'auxiliar', 'propietario']);

// Tabla de usuarios del sistema
export const usuarios = pgTable("usuarios", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  apellido: varchar("apellido", { length: 100 }).notNull(),
  rol: rolUsuarioEnum("rol").notNull().default('auxiliar'),
  activo: boolean("activo").default(true),
  fechaCreacion: timestamp("fecha_creacion").defaultNow(),
  fechaActualizacion: timestamp("fecha_actualizacion").defaultNow(),
});

// Tabla de terceros (propietarios, inquilinos, proveedores)
export const terceros = pgTable("terceros", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tipoPersona: tipoPersonaEnum("tipo_persona").notNull(),
  tipoTercero: tipoTerceroEnum("tipo_tercero").notNull(),
  tipoContribuyente: tipoContribuyenteEnum("tipo_contribuyente").notNull(),
  tipoIdentificacion: tipoIdentificacionEnum("tipo_identificacion").notNull(),
  numeroIdentificacion: varchar("numero_identificacion", { length: 20 }).unique().notNull(),
  primerNombre: varchar("primer_nombre", { length: 50 }).notNull(),
  segundoNombre: varchar("segundo_nombre", { length: 50 }),
  primerApellido: varchar("primer_apellido", { length: 50 }).notNull(),
  segundoApellido: varchar("segundo_apellido", { length: 50 }),
  razonSocial: varchar("razon_social", { length: 200 }),
  direccion: text("direccion").notNull(),
  pais: varchar("pais", { length: 50 }).notNull().default('Colombia'),
  departamento: varchar("departamento", { length: 50 }).notNull(),
  municipio: varchar("municipio", { length: 50 }).notNull(),
  telefono: varchar("telefono", { length: 20 }),
  movil: varchar("movil", { length: 20 }),
  email: varchar("email", { length: 255 }),
  activo: boolean("activo").default(true),
  fechaCreacion: timestamp("fecha_creacion").defaultNow(),
  fechaActualizacion: timestamp("fecha_actualizacion").defaultNow(),
});

// Tabla de unidades habitacionales
export const unidadesHabitacionales = pgTable("unidades_habitacionales", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tipoUnidad: tipoUnidadEnum("tipo_unidad").notNull(),
  codigoUnidad: varchar("codigo_unidad", { length: 20 }).unique().notNull(),
  propietarioId: uuid("propietario_id").references(() => terceros.id),
  inquilinoId: uuid("inquilino_id").references(() => terceros.id),
  area: decimal("area", { precision: 10, scale: 2 }).notNull(),
  coeficiente: decimal("coeficiente", { precision: 8, scale: 6 }).notNull(),
  cuotaAdministracion: decimal("cuota_administracion", { precision: 10, scale: 2 }).notNull(),
  tieneParqueadero: boolean("tiene_parqueadero").default(false),
  cuotaParqueadero: decimal("cuota_parqueadero", { precision: 10, scale: 2 }).default('0'),
  generaIntereses: boolean("genera_intereses").default(true),
  estadoOcupacion: estadoOcupacionEnum("estado_ocupacion").notNull().default('desocupado'),
  activo: boolean("activo").default(true),
  fechaCreacion: timestamp("fecha_creacion").defaultNow(),
  fechaActualizacion: timestamp("fecha_actualizacion").defaultNow(),
});

// Plan Único de Cuentas (PUC)
export const planCuentas = pgTable("plan_cuentas", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  codigo: varchar("codigo", { length: 20 }).unique().notNull(),
  clase: varchar("clase", { length: 1 }).notNull(), // 1-9
  grupo: varchar("grupo", { length: 2 }),
  cuenta: varchar("cuenta", { length: 4 }),
  subcuenta: varchar("subcuenta", { length: 6 }),
  auxiliar: varchar("auxiliar", { length: 8 }),
  nombre: varchar("nombre", { length: 200 }).notNull(),
  nivel: integer("nivel").notNull(), // 1-6
  esDebito: boolean("es_debito").notNull(), // true para débito, false para crédito
  nombreClase: varchar("nombre_clase", { length: 50 }).notNull(),
  registraTercero: boolean("registra_tercero").default(false),
  activa: boolean("activa").default(true),
  fechaCreacion: timestamp("fecha_creacion").defaultNow(),
});

// Períodos contables
export const periodosContables = pgTable("periodos_contables", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ano: integer("ano").notNull(),
  mes: integer("mes").notNull(),
  nombre: varchar("nombre", { length: 50 }).notNull(),
  fechaInicio: timestamp("fecha_inicio").notNull(),
  fechaCierre: timestamp("fecha_cierre").notNull(),
  estado: estadoPeriodoEnum("estado").notNull().default('abierto'),
  fechaCreacion: timestamp("fecha_creacion").defaultNow(),
});

// Comprobantes contables
export const comprobantesContables = pgTable("comprobantes_contables", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  numeroComprobante: varchar("numero_comprobante", { length: 20 }).notNull(),
  periodoId: uuid("periodo_id").references(() => periodosContables.id).notNull(),
  fecha: timestamp("fecha").notNull(),
  concepto: text("concepto").notNull(),
  tipoTransaccion: tipoTransaccionEnum("tipo_transaccion").notNull(),
  totalDebito: decimal("total_debito", { precision: 15, scale: 2 }).notNull(),
  totalCredito: decimal("total_credito", { precision: 15, scale: 2 }).notNull(),
  usuarioId: uuid("usuario_id").references(() => usuarios.id).notNull(),
  fechaCreacion: timestamp("fecha_creacion").defaultNow(),
});

// Movimientos contables (detalles de los comprobantes)
export const movimientosContables = pgTable("movimientos_contables", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  comprobanteId: uuid("comprobante_id").references(() => comprobantesContables.id).notNull(),
  cuentaId: uuid("cuenta_id").references(() => planCuentas.id).notNull(),
  terceroId: uuid("tercero_id").references(() => terceros.id),
  descripcion: text("descripcion").notNull(),
  valorDebito: decimal("valor_debito", { precision: 15, scale: 2 }).default('0'),
  valorCredito: decimal("valor_credito", { precision: 15, scale: 2 }).default('0'),
  fechaCreacion: timestamp("fecha_creacion").defaultNow(),
});

// Facturas
export const facturas = pgTable("facturas", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  numeroFactura: varchar("numero_factura", { length: 20 }).unique().notNull(),
  terceroId: uuid("tercero_id").references(() => terceros.id).notNull(),
  unidadId: uuid("unidad_id").references(() => unidadesHabitacionales.id),
  periodoId: uuid("periodo_id").references(() => periodosContables.id).notNull(),
  fechaFactura: timestamp("fecha_factura").notNull(),
  fechaVencimiento: timestamp("fecha_vencimiento").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  iva: decimal("iva", { precision: 10, scale: 2 }).default('0'),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  pagada: boolean("pagada").default(false),
  fechaPago: timestamp("fecha_pago"),
  observaciones: text("observaciones"),
  fechaCreacion: timestamp("fecha_creacion").defaultNow(),
});

// Relaciones
export const tercerosRelations = relations(terceros, ({ many }) => ({
  unidadesPropias: many(unidadesHabitacionales, { relationName: "propietario" }),
  unidadesArrendadas: many(unidadesHabitacionales, { relationName: "inquilino" }),
  facturas: many(facturas),
  movimientos: many(movimientosContables),
}));

export const unidadesRelations = relations(unidadesHabitacionales, ({ one, many }) => ({
  propietario: one(terceros, { 
    fields: [unidadesHabitacionales.propietarioId], 
    references: [terceros.id],
    relationName: "propietario"
  }),
  inquilino: one(terceros, { 
    fields: [unidadesHabitacionales.inquilinoId], 
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

export const insertUnidadSchema = createInsertSchema(unidadesHabitacionales).omit({
  id: true,
  fechaCreacion: true,
  fechaActualizacion: true,
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

export type UnidadHabitacional = typeof unidadesHabitacionales.$inferSelect;
export type InsertUnidad = z.infer<typeof insertUnidadSchema>;

export type PlanCuenta = typeof planCuentas.$inferSelect;
export type InsertPlanCuenta = z.infer<typeof insertPlanCuentaSchema>;

export type PeriodoContable = typeof periodosContables.$inferSelect;
export type ComprobanteContable = typeof comprobantesContables.$inferSelect;
export type MovimientoContable = typeof movimientosContables.$inferSelect;
export type Factura = typeof facturas.$inferSelect;
