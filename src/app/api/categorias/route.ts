import { NextRequest, NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { categorias, transacciones } from "@/db/schema";
import { obtenerPerfilActivo } from "@/lib/perfil";

function validarColorHex(valor: unknown, fallback = "#3b82f6"): string {
  const texto = String(valor ?? "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(texto) ? texto : fallback;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tipo = String(body.tipo ?? "egreso").trim().toLowerCase();
    const nombre = String(body.nombre ?? "").trim().slice(0, 60);
    let atajo = String(body.atajo ?? "").trim().toLowerCase().slice(0, 10);
    const color = validarColorHex(body.color, "#3b82f6");

    if (!nombre || (tipo !== "ingreso" && tipo !== "egreso")) {
      return NextResponse.json(
        { ok: false, error: "El nombre y tipo de la categoría son obligatorios." },
        { status: 400 }
      );
    }

    if (!atajo) {
      atajo = nombre.slice(0, 2).toLowerCase();
    }

    const { perfilActual } = await obtenerPerfilActivo();

    await db
      .insert(categorias)
      .values({
        perfil_id: perfilActual.id,
        nombre,
        tipo,
        atajo,
        color,
      })
      .onConflictDoUpdate({
        target: [categorias.perfil_id, categorias.nombre],
        set: { atajo, tipo, color },
      });

    return NextResponse.json({
      ok: true,
      mensaje: `Categoría '${nombre}' guardada con atajo '${atajo}'.`,
    });
  } catch (error) {
    console.error("Error en POST /api/categorias:", error);
    return NextResponse.json(
      { ok: false, error: "Error al guardar la categoría." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const nombreAntiguo = String(body.nombre_antiguo ?? "").trim();
    const nombreNuevo = String(body.nombre_nuevo ?? "").trim().slice(0, 60);
    const atajoNuevo = String(body.atajo_nuevo ?? "")
      .trim()
      .toLowerCase()
      .slice(0, 10);
    const colorNuevo = validarColorHex(body.color_nuevo, "#3b82f6");

    if (!nombreAntiguo || !nombreNuevo) {
      return NextResponse.json(
        { ok: false, error: "Los nombres de categoría no pueden estar vacíos." },
        { status: 400 }
      );
    }

    const { perfilActual } = await obtenerPerfilActivo();

    await db.transaction(async (tx) => {
      await tx
        .update(categorias)
        .set({
          nombre: nombreNuevo,
          atajo: atajoNuevo || nombreNuevo.slice(0, 2).toLowerCase(),
          color: colorNuevo,
        })
        .where(
          and(
            eq(categorias.perfil_id, perfilActual.id),
            eq(categorias.nombre, nombreAntiguo)
          )
        );

      await tx
        .update(transacciones)
        .set({ categoria: nombreNuevo })
        .where(
          and(
            eq(transacciones.perfil_id, perfilActual.id),
            eq(transacciones.categoria, nombreAntiguo)
          )
        );
    });

    return NextResponse.json({
      ok: true,
      mensaje: "Categoría actualizada correctamente.",
    });
  } catch (error) {
    console.error("Error en PUT /api/categorias:", error);
    return NextResponse.json(
      { ok: false, error: "Error al actualizar la categoría." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const nombre = String(body.nombre ?? "").trim();

    if (!nombre) {
      return NextResponse.json(
        { ok: false, error: "Categoría no especificada." },
        { status: 400 }
      );
    }

    const { perfilActual } = await obtenerPerfilActivo();

    await db
      .delete(categorias)
      .where(
        and(
          eq(categorias.perfil_id, perfilActual.id),
          sql`TRIM(${categorias.nombre}) ILIKE TRIM(${nombre})`
        )
      );

    return NextResponse.json({
      ok: true,
      mensaje: `Categoría '${nombre}' eliminada.`,
    });
  } catch (error) {
    console.error("Error en DELETE /api/categorias:", error);
    return NextResponse.json(
      { ok: false, error: "Error al eliminar la categoría." },
      { status: 500 }
    );
  }
}