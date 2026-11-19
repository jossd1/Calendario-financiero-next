import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { presupuestos } from "@/db/schema";
import { obtenerPerfilActivo } from "@/lib/perfil";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const categoria = String(body.categoria ?? "").trim().slice(0, 60);
    const mesAnio = String(body.mes_anio ?? "BASE").trim().slice(0, 10) || "BASE";
    const limiteNum = Number(String(body.limite_monto ?? "0").replace(",", "."));

    if (!categoria || !Number.isFinite(limiteNum) || limiteNum <= 0) {
      return NextResponse.json(
        { ok: false, error: "Categoría y monto límite mayor a 0 son obligatorios." },
        { status: 400 }
      );
    }

    const { perfilActual } = await obtenerPerfilActivo();

    await db
      .insert(presupuestos)
      .values({
        perfil_id: perfilActual.id,
        mes_anio: mesAnio,
        categoria,
        limite_monto: limiteNum.toFixed(2),
      })
      .onConflictDoUpdate({
        target: [
          presupuestos.perfil_id,
          presupuestos.mes_anio,
          presupuestos.categoria,
        ],
        set: { limite_monto: limiteNum.toFixed(2) },
      });

    return NextResponse.json({
      ok: true,
      mensaje: `Presupuesto de '${categoria}' guardado.`,
    });
  } catch (error) {
    console.error("Error en POST /api/presupuestos:", error);
    return NextResponse.json(
      { ok: false, error: "Error al guardar el presupuesto." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { ok: false, error: "ID de presupuesto inválido." },
        { status: 400 }
      );
    }

    const { perfilActual } = await obtenerPerfilActivo();

    await db
      .delete(presupuestos)
      .where(
        and(
          eq(presupuestos.id, id),
          eq(presupuestos.perfil_id, perfilActual.id)
        )
      );

    return NextResponse.json({
      ok: true,
      mensaje: "Presupuesto eliminado.",
    });
  } catch (error) {
    console.error("Error en DELETE /api/presupuestos:", error);
    return NextResponse.json(
      { ok: false, error: "Error al eliminar presupuesto." },
      { status: 500 }
    );
  }
}