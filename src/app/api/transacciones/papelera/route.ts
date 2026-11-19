import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { transacciones } from "@/db/schema";
import { obtenerPerfilActivo } from "@/lib/perfil";

export async function DELETE() {
  try {
    const { perfilActual } = await obtenerPerfilActivo();

    await db
      .delete(transacciones)
      .where(
        and(
          eq(transacciones.perfil_id, perfilActual.id),
          eq(transacciones.eliminado, true)
        )
      );

    return NextResponse.json({
      ok: true,
      mensaje: "Papelera vaciada definitivamente.",
    });
  } catch (error) {
    console.error("Error en DELETE /api/transacciones/papelera:", error);
    return NextResponse.json(
      { ok: false, error: "Error al vaciar la papelera." },
      { status: 500 }
    );
  }
}