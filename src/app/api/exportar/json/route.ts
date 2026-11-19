import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categorias, presupuestos, transacciones } from "@/db/schema";
import { obtenerAjustesApp } from "@/lib/ajustes";
import { obtenerHoyPeruISO } from "@/lib/format";
import { obtenerPerfilActivo } from "@/lib/perfil";
import { estaAppBloqueada } from "@/lib/pin";

export async function GET() {
  try {
    if (await estaAppBloqueada()) {
      return NextResponse.json(
        { ok: false, error: "Sesión bloqueada por PIN." },
        { status: 401 }
      );
    }

    const { perfilActual } = await obtenerPerfilActivo();
    const { config, textos } = await obtenerAjustesApp();

    const listaCategorias = await db
      .select()
      .from(categorias)
      .where(eq(categorias.perfil_id, perfilActual.id));

    const listaTransacciones = await db
      .select()
      .from(transacciones)
      .where(eq(transacciones.perfil_id, perfilActual.id));

    const listaPresupuestos = await db
      .select()
      .from(presupuestos)
      .where(eq(presupuestos.perfil_id, perfilActual.id));

    const payload = {
      version: 2,
      exportado_en: new Date().toISOString(),
      perfil: perfilActual,
      categorias: listaCategorias,
      transacciones: listaTransacciones,
      presupuestos: listaPresupuestos,
      ajustes: config,
      textos,
    };

    const slug = perfilActual.nombre.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const nombreArchivo = `backup_${slug || "perfil"}_${obtenerHoyPeruISO()}.json`;

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${nombreArchivo}"`,
      },
    });
  } catch (error) {
    console.error("Error en GET /api/exportar/json:", error);
    return NextResponse.json(
      { ok: false, error: "Error al generar respaldo JSON." },
      { status: 500 }
    );
  }
}