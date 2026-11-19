import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categorias, perfiles, transacciones } from "@/db/schema";
import { esFechaISOValida, obtenerHoyPeruISO } from "@/lib/format";
import { obtenerPerfilActivo } from "@/lib/perfil";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const destinoId = Number(body.destino_perfil_id);
    const montoNum = Number(String(body.monto ?? "0").replace(",", "."));
    const fechaStr = String(body.fecha ?? obtenerHoyPeruISO()).trim();
    const descripcionExtra = String(body.descripcion ?? "").trim();

    if (
      !Number.isInteger(destinoId) ||
      destinoId <= 0 ||
      !Number.isFinite(montoNum) ||
      montoNum <= 0 ||
      !esFechaISOValida(fechaStr)
    ) {
      return NextResponse.json(
        { ok: false, error: "Datos inválidos para realizar la transferencia." },
        { status: 400 }
      );
    }

    const { perfilActual } = await obtenerPerfilActivo();
    if (perfilActual.id === destinoId) {
      return NextResponse.json(
        { ok: false, error: "El perfil destino debe ser distinto al actual." },
        { status: 400 }
      );
    }

    const [perfilDestino] = await db
      .select()
      .from(perfiles)
      .where(eq(perfiles.id, destinoId));

    if (!perfilDestino) {
      return NextResponse.json(
        { ok: false, error: "Perfil destino no encontrado." },
        { status: 404 }
      );
    }

    const montoFmt = montoNum.toFixed(2);
    const notaSuffix = descripcionExtra ? ` — ${descripcionExtra}` : "";

    await db.transaction(async (tx) => {
      await tx
        .insert(categorias)
        .values({
          perfil_id: perfilActual.id,
          nombre: "Transferencias",
          tipo: "egreso",
          atajo: "tf",
          color: "#38bdf8",
        })
        .onConflictDoNothing({
          target: [categorias.perfil_id, categorias.nombre],
        });

      await tx
        .insert(categorias)
        .values({
          perfil_id: perfilDestino.id,
          nombre: "Transferencias",
          tipo: "ingreso",
          atajo: "tf",
          color: "#10b981",
        })
        .onConflictDoNothing({
          target: [categorias.perfil_id, categorias.nombre],
        });

      await tx.insert(transacciones).values({
        perfil_id: perfilActual.id,
        tipo: "egreso",
        monto: montoFmt,
        categoria: "Transferencias",
        descripcion: `Transferencia hacia ${perfilDestino.nombre}${notaSuffix}`.slice(0, 240),
        fecha: fechaStr,
        estado: "pagado",
        eliminado: false,
      });

      await tx.insert(transacciones).values({
        perfil_id: perfilDestino.id,
        tipo: "ingreso",
        monto: montoFmt,
        categoria: "Transferencias",
        descripcion: `Transferencia desde ${perfilActual.nombre}${notaSuffix}`.slice(0, 240),
        fecha: fechaStr,
        estado: "pagado",
        eliminado: false,
      });
    });

    return NextResponse.json({
      ok: true,
      mensaje: `Transferencia de S/ ${montoFmt} enviada a '${perfilDestino.nombre}'.`,
    });
  } catch (error) {
    console.error("Error en POST /api/perfiles/transferir:", error);
    return NextResponse.json(
      { ok: false, error: "Error al procesar la transferencia." },
      { status: 500 }
    );
  }
}