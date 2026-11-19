import { cookies } from "next/headers";
import { and, asc, count, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { categorias, perfiles, transacciones } from "@/db/schema";
import { CATEGORIAS_DEFECTO } from "@/lib/format";
import type { CategoriaDTO, PerfilDTO, TipoMovimiento } from "@/types";

export const PERFIL_COOKIE_NAME = "perfil_id";

const PALETA_AUTO = [
  "#ec4899",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
];

function mapearPerfil(row: typeof perfiles.$inferSelect): PerfilDTO {
  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion ?? "",
    moneda: row.moneda ?? "PEN",
    creado_en: row.creado_en ? row.creado_en.toISOString() : "",
  };
}

export async function asegurarCategoriasPerfil(perfilId: number): Promise<void> {
  const [{ total }] = await db
    .select({ total: count() })
    .from(categorias)
    .where(eq(categorias.perfil_id, perfilId));

  if (Number(total) > 0) return;

  const existentes = await db
    .selectDistinct({
      categoria: sql<string>`TRIM(${transacciones.categoria})`,
      tipo: transacciones.tipo,
    })
    .from(transacciones)
    .where(
      and(
        eq(transacciones.perfil_id, perfilId),
        eq(transacciones.eliminado, false)
      )
    );

  if (existentes.length > 0) {
    let idx = 0;
    for (const row of existentes) {
      const nombre = row.categoria.slice(0, 60);
      if (!nombre) continue;
      const tipo: TipoMovimiento =
        row.tipo === "ingreso" ? "ingreso" : "egreso";
      const atajoAuto = nombre.slice(0, 2).toLowerCase();
      const defecto = CATEGORIAS_DEFECTO.find(
        (d) => d.nombre.toLowerCase() === nombre.toLowerCase()
      );
      const color = defecto?.color ?? PALETA_AUTO[idx % PALETA_AUTO.length];
      idx += 1;

      await db
        .insert(categorias)
        .values({
          perfil_id: perfilId,
          nombre,
          tipo,
          atajo: atajoAuto,
          color,
        })
        .onConflictDoNothing({
          target: [categorias.perfil_id, categorias.nombre],
        });
    }
    return;
  }

  for (const item of CATEGORIAS_DEFECTO) {
    await db
      .insert(categorias)
      .values({
        perfil_id: perfilId,
        nombre: item.nombre,
        tipo: item.tipo,
        atajo: item.atajo,
        color: item.color,
      })
      .onConflictDoNothing({
        target: [categorias.perfil_id, categorias.nombre],
      });
  }
}

export async function obtenerPerfilActivo(): Promise<{
  perfiles: PerfilDTO[];
  perfilActual: PerfilDTO;
}> {
  let listaPerfiles = await db
    .select()
    .from(perfiles)
    .orderBy(asc(perfiles.id));

  if (listaPerfiles.length === 0) {
    const [creado] = await db
      .insert(perfiles)
      .values({
        nombre: "Principal",
        descripcion: "Cuenta principal en Soles (S/)",
        moneda: "PEN",
      })
      .returning();
    listaPerfiles = [creado];
  }

  const cookieStore = await cookies();
  const rawCookie = cookieStore.get(PERFIL_COOKIE_NAME)?.value;
  const perfilCookieId = rawCookie ? Number(rawCookie) : NaN;

  const encontrado =
    Number.isInteger(perfilCookieId) && perfilCookieId > 0
      ? listaPerfiles.find((p) => p.id === perfilCookieId)
      : undefined;

  const perfilActualRow = encontrado ?? listaPerfiles[0];

  await asegurarCategoriasPerfil(perfilActualRow.id);

  return {
    perfiles: listaPerfiles.map(mapearPerfil),
    perfilActual: mapearPerfil(perfilActualRow),
  };
}

export async function obtenerCategoriasPerfil(perfilId: number): Promise<{
  todas: CategoriaDTO[];
  egresos: CategoriaDTO[];
  ingresos: CategoriaDTO[];
}> {
  const filas = await db
    .select()
    .from(categorias)
    .where(eq(categorias.perfil_id, perfilId))
    .orderBy(asc(categorias.nombre));

  const todas: CategoriaDTO[] = filas.map((c) => ({
    id: c.id,
    perfil_id: c.perfil_id,
    nombre: c.nombre,
    tipo: c.tipo === "ingreso" ? "ingreso" : "egreso",
    atajo: c.atajo ?? "",
    color: c.color ?? "#3b82f6",
  }));

  return {
    todas,
    egresos: todas.filter((c) => c.tipo === "egreso"),
    ingresos: todas.filter((c) => c.tipo === "ingreso"),
  };
}