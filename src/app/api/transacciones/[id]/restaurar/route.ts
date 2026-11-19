import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { transacciones } from "@/db/schema";
import { obtenerPerfilActivo } from "@/lib/perfil";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const txId = Number(id);
    if (!Number.isInteger(txId) || txId <= 0) {
      return NextResponse.json(
        { ok: false, error: "ID inválido." },
        { status: 400 }
      );
    }

    const { perfilActual } = await obtenerPerfilActivo();

    await db
      .update(transacciones)
      .set({ eliminado: false })
      .where(
        and(
          eq(transacciones.id, txId),
          eq(transacciones.perfil_id, perfilActual.id)
        )
      );

    return NextResponse.json({
      ok: true,
      mensaje: "Movimiento restaurado correctamente.",
    });
  } catch (error) {
    console.error("Error en POST /api/transacciones/[id]/restaurar:", error);
    return NextResponse.json(
      { ok: false, error: "Error al restaurar el movimiento." },
      { status: 500 }
    );
  }
}