import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { presupuestos } from "@/db/schema";
import type { CategoriaDTO, PresupuestoItemDTO, TransaccionDTO } from "@/types";

export async function compilarPresupuestos(params: {
  perfilId: number;
  fechaRef: string;
  modoPresupuesto: "base_mensual" | "por_mes";
  transaccionesPagadas: TransaccionDTO[];
  categorias: CategoriaDTO[];
}): Promise<PresupuestoItemDTO[]> {
  const mesAnioActual = params.fechaRef.slice(0, 7);
  const claves =
    params.modoPresupuesto === "por_mes"
      ? [mesAnioActual]
      : [mesAnioActual, "BASE"];

  const filas = await db
    .select()
    .from(presupuestos)
    .where(
      and(
        eq(presupuestos.perfil_id, params.perfilId),
        inArray(presupuestos.mes_anio, claves)
      )
    );

  if (filas.length === 0) return [];

  // Si modo es base_mensual, una regla específica del mes sobrescribe a BASE
  const reglaPorCategoria = new Map<string, typeof filas[number]>();
  for (const f of filas) {
    const existente = reglaPorCategoria.get(f.categoria);
    if (!existente || f.mes_anio === mesAnioActual) {
      reglaPorCategoria.set(f.categoria, f);
    }
  }

  const gastoPorCategoria = new Map<string, number>();
  for (const tx of params.transaccionesPagadas) {
    if (tx.tipo !== "egreso") continue;
    gastoPorCategoria.set(
      tx.categoria,
      (gastoPorCategoria.get(tx.categoria) ?? 0) + tx.monto
    );
  }

  const colorMap = new Map<string, string>();
  for (const c of params.categorias) {
    colorMap.set(c.nombre, c.color || "#3b82f6");
  }

  return Array.from(reglaPorCategoria.values())
    .map((regla) => {
      const limite = Number(regla.limite_monto);
      const gastado = Number(
        (gastoPorCategoria.get(regla.categoria) ?? 0).toFixed(2)
      );
      const restante = Number((limite - gastado).toFixed(2));
      const porcentaje =
        limite > 0 ? Number(((gastado / limite) * 100).toFixed(1)) : 0;

      return {
        id: regla.id,
        mes_anio: regla.mes_anio,
        categoria: regla.categoria,
        color: colorMap.get(regla.categoria) ?? "#3b82f6",
        limite,
        gastado,
        restante,
        porcentaje,
      };
    })
    .sort((a, b) => b.porcentaje - a.porcentaje);
}