import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { AjustesAppConfig, TextosUI } from "@/types";

export const perfiles = pgTable("perfiles", {
  id: serial("id").primaryKey(),
  nombre: varchar("nombre", { length: 80 }).notNull().unique(),
  descripcion: varchar("descripcion", { length: 160 }).default(
    "Cuenta principal en Soles (S/)"
  ),
  moneda: varchar("moneda", { length: 10 }).default("PEN"),
  orden: integer("orden").notNull().default(0),
  creado_en: timestamp("creado_en").defaultNow(),
});

export const subperfiles = pgTable(
  "subperfiles",
  {
    id: serial("id").primaryKey(),
    perfil_id: integer("perfil_id")
      .notNull()
      .references(() => perfiles.id, { onDelete: "cascade" }),
    nombre: varchar("nombre", { length: 40 }).notNull(),
    atajo: varchar("atajo", { length: 10 }).notNull(),
    icono: varchar("icono", { length: 10 }).notNull().default("💳"),
    orden: integer("orden").notNull().default(0),
  },
  (table) => [
    unique("subperfiles_perfil_id_nombre_key").on(table.perfil_id, table.nombre),
    index("idx_subperf_perfil").on(table.perfil_id),
  ]
);

export const categorias = pgTable(
  "categorias",
  {
    id: serial("id").primaryKey(),
    perfil_id: integer("perfil_id")
      .notNull()
      .references(() => perfiles.id, { onDelete: "cascade" }),
    nombre: varchar("nombre", { length: 60 }).notNull(),
    tipo: varchar("tipo", { length: 10 }).notNull(),
    atajo: varchar("atajo", { length: 10 }),
    color: varchar("color", { length: 20 }).notNull().default("#3b82f6"),
  },
  (table) => [
    unique("categorias_perfil_id_nombre_key").on(table.perfil_id, table.nombre),
    index("idx_cat_perfil").on(table.perfil_id),
    check("categorias_tipo_check", sql`${table.tipo} IN ('ingreso', 'egreso')`),
  ]
);

export const transacciones = pgTable(
  "transacciones",
  {
    id: serial("id").primaryKey(),
    perfil_id: integer("perfil_id")
      .notNull()
      .references(() => perfiles.id, { onDelete: "cascade" }),
    subperfil_id: integer("subperfil_id").references(() => subperfiles.id, {
      onDelete: "set null",
    }),
    tipo: varchar("tipo", { length: 10 }).notNull(),
    monto: numeric("monto", { precision: 12, scale: 2 }).notNull(),
    categoria: varchar("categoria", { length: 60 }).notNull(),
    descripcion: varchar("descripcion", { length: 240 }).default(""),
    fecha: date("fecha", { mode: "string" }).notNull().defaultNow(),
    estado: varchar("estado", { length: 15 }).notNull().default("pagado"),
    eliminado: boolean("eliminado").notNull().default(false),
    creado_en: timestamp("creado_en").defaultNow(),
  },
  (table) => [
    index("idx_tx_perfil_fecha").on(table.perfil_id, table.fecha),
    index("idx_tx_perfil_eliminado").on(table.perfil_id, table.eliminado),
    check("transacciones_tipo_check", sql`${table.tipo} IN ('ingreso', 'egreso')`),
    check(
      "transacciones_estado_check",
      sql`${table.estado} IN ('pagado', 'pendiente', 'programado')`
    ),
    check("transacciones_monto_check", sql`${table.monto} >= 0`),
  ]
);

export const presupuestos = pgTable(
  "presupuestos",
  {
    id: serial("id").primaryKey(),
    perfil_id: integer("perfil_id")
      .notNull()
      .references(() => perfiles.id, { onDelete: "cascade" }),
    mes_anio: varchar("mes_anio", { length: 10 }).notNull().default("BASE"),
    categoria: varchar("categoria", { length: 60 }).notNull(),
    limite_monto: numeric("limite_monto", { precision: 12, scale: 2 }).notNull(),
  },
  (table) => [
    unique("presupuestos_perfil_mes_cat_key").on(
      table.perfil_id,
      table.mes_anio,
      table.categoria
    ),
    index("idx_pres_perfil").on(table.perfil_id, table.mes_anio),
    check("presupuestos_monto_check", sql`${table.limite_monto} >= 0`),
  ]
);

export const ajustesApp = pgTable("ajustes_app", {
  id: serial("id").primaryKey(),
  clave: varchar("clave", { length: 60 }).notNull().unique(),
  config_json: jsonb("config_json").$type<AjustesAppConfig>().notNull(),
  textos_json: jsonb("textos_json").$type<TextosUI>().notNull(),
  actualizado_en: timestamp("actualizado_en").defaultNow(),
});