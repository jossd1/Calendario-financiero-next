import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { transacciones } from "@/db/schema";
import { esFechaISOValida } from "@/lib/format";
import { obtenerPerfilActivo } from "@/lib/perfil";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const txId = Number(id);
    if (!Number.isInteger(txId) || txId <= 0) {
      return NextResponse.json(
        { ok: false, error: "ID de transacción inválido." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const tipo = String(body.tipo ?? "egreso").trim().toLowerCase();
    const categoria = String(body.categoria ?? "").trim().slice(0, 60);
    const descripcion = String(body.descripcion ?? "").trim().slice(0, 240);
    const fechaStr = String(body.fecha ?? "").trim();
    const estadoRaw = String(body.estado ?? "pagado").trim().toLowerCase();
    const estado =
      estadoRaw === "pendiente" || estadoRaw === "programado"
        ? estadoRaw
        : "pagado";
    const montoRaw = String(body.monto ?? "0").replace(",", ".");
    const montoNum = Number(montoRaw);
    const rawSubId =
      body.subperfil_id === null || body.subperfil_id === undefined
        ? null
        : Number(body.subperfil_id);
    const subperfilId =
      rawSubId !== null && Number.isInteger(rawSubId) && rawSubId > 0
        ? rawSubId
        : null;

    if (
      (tipo !== "ingreso" && tipo !== "egreso") ||
      !categoria ||
      !esFechaISOValida(fechaStr) ||
      !Number.isFinite(montoNum) ||
      montoNum <= 0
    ) {
      return NextResponse.json(
        { ok: false, error: "Monto, fecha o categoría inválidos." },
        { status: 400 }
      );
    }

    const { perfilActual } = await obtenerPerfilActivo();

    const actualizadas = await db
      .update(transacciones)
      .set({
        tipo,
        estado,
        subperfil_id: subperfilId,
        monto: montoNum.toFixed(2),
        categoria,
        descripcion,
        fecha: fechaStr,
      })
      .where(
        and(
          eq(transacciones.id, txId),
          eq(transacciones.perfil_id, perfilActual.id)
        )
      )
      .returning({ id: transacciones.id });

    if (actualizadas.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Transacción no encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      mensaje: "Transacción actualizada correctamente.",
    });
  } catch (error) {
    console.error("Error en PUT /api/transacciones/[id]:", error);
    return NextResponse.json(
      { ok: false, error: "Error al actualizar la transacción." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const txId = Number(id);
    if (!Number.isInteger(txId) || txId <= 0) {
      return NextResponse.json(
        { ok: false, error: "ID de transacción inválido." },
        { status: 400 }
      );
    }

    const { perfilActual } = await obtenerPerfilActivo();

    await db
      .update(transacciones)
      .set({ eliminado: true })
      .where(
        and(
          eq(transacciones.id, txId),
          eq(transacciones.perfil_id, perfilActual.id)
        )
      );

    return NextResponse.json({
      ok: true,
      mensaje: "Movimiento enviado a papelera.",
    });
  } catch (error) {
    console.error("Error en DELETE /api/transacciones/[id]:", error);
    return NextResponse.json(
      { ok: false, error: "Error al eliminar la transacción." },
      { status: 500 }
    );
  }
}
