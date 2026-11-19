import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categorias, presupuestos, transacciones } from "@/db/schema";
import { guardarAjustesApp } from "@/lib/ajustes";
import { esFechaISOValida, obtenerHoyPeruISO } from "@/lib/format";
import { obtenerPerfilActivo } from "@/lib/perfil";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { perfilActual } = await obtenerPerfilActivo();

    const listaCat = Array.isArray(body.categorias) ? body.categorias : [];
    const listaTx = Array.isArray(body.transacciones) ? body.transacciones : [];
    const listaPres = Array.isArray(body.presupuestos) ? body.presupuestos : [];

    let insertadas = 0;

    await db.transaction(async (tx) => {
      for (const c of listaCat) {
        const nombre = String(c.nombre ?? "").trim().slice(0, 60);
        const tipo = c.tipo === "ingreso" ? "ingreso" : "egreso";
        if (!nombre) continue;

        await tx
          .insert(categorias)
          .values({
            perfil_id: perfilActual.id,
            nombre,
            tipo,
            atajo: c.atajo ? String(c.atajo).slice(0, 10) : null,
            color: /^#[0-9a-fA-F]{6}$/.test(String(c.color ?? ""))
              ? String(c.color)
              : "#3b82f6",
          })
          .onConflictDoNothing({
            target: [categorias.perfil_id, categorias.nombre],
          });
      }

      for (const p of listaPres) {
        const categoria = String(p.categoria ?? "").trim().slice(0, 60);
        const mesAnio = String(p.mes_anio ?? "BASE").trim().slice(0, 10) || "BASE";
        const limite = Number(p.limite_monto);
        if (!categoria || !Number.isFinite(limite) || limite <= 0) continue;

        await tx
          .insert(presupuestos)
          .values({
            perfil_id: perfilActual.id,
            mes_anio: mesAnio,
            categoria,
            limite_monto: limite.toFixed(2),
          })
          .onConflictDoNothing({
            target: [
              presupuestos.perfil_id,
              presupuestos.mes_anio,
              presupuestos.categoria,
            ],
          });
      }

      for (const t of listaTx) {
        const monto = Number(t.monto);
        const tipo = t.tipo === "ingreso" ? "ingreso" : "egreso";
        const categoria = String(t.categoria ?? "Otros Gastos").trim().slice(0, 60);
        const fechaRaw = String(t.fecha ?? t.fecha_iso ?? "").slice(0, 10);
        const fecha = esFechaISOValida(fechaRaw) ? fechaRaw : obtenerHoyPeruISO();
        if (!Number.isFinite(monto) || monto <= 0) continue;

        const estado =
          t.estado === "pendiente" || t.estado === "programado"
            ? t.estado
            : "pagado";

        await tx.insert(transacciones).values({
          perfil_id: perfilActual.id,
          tipo,
          monto: monto.toFixed(2),
          categoria,
          descripcion: String(t.descripcion ?? "").slice(0, 240),
          fecha,
          estado,
          eliminado: Boolean(t.eliminado),
        });
        insertadas += 1;
      }
    });

    if (body.ajustes && typeof body.ajustes === "object") {
      const { authPinActivo: _a, pinConfigurado: _p, ...resto } = body.ajustes;
      await guardarAjustesApp({
        config: resto,
        textos: body.textos && typeof body.textos === "object" ? body.textos : undefined,
      });
    }

    return NextResponse.json({
      ok: true,
      mensaje: `Respaldo restaurado: ${insertadas} movimiento(s) importado(s).`,
    });
  } catch (error) {
    console.error("Error en POST /api/importar/json:", error);
    return NextResponse.json(
      { ok: false, error: "El archivo JSON no tiene un formato válido." },
      { status: 400 }
    );
  }
}