import { NextRequest, NextResponse } from "next/server";
import { guardarAjustesApp, obtenerAjustesApp } from "@/lib/ajustes";
import type { AjustesAppConfig, TextosUI } from "@/types";

export async function GET() {
  try {
    const datos = await obtenerAjustesApp();
    return NextResponse.json({ ok: true, ...datos });
  } catch (error) {
    console.error("Error en GET /api/ajustes:", error);
    return NextResponse.json(
      { ok: false, error: "Error al cargar los ajustes." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const config = body.config as Partial<AjustesAppConfig> | undefined;
    const textos = body.textos as TextosUI | undefined;
    const restablecerTextos = Boolean(body.restablecerTextos);

    const resultado = await guardarAjustesApp({
      config,
      textos,
      restablecerTextos,
    });

    return NextResponse.json({
      ok: true,
      ...resultado,
      mensaje: restablecerTextos
        ? "Textos originales restablecidos correctamente."
        : "Ajustes guardados correctamente.",
    });
  } catch (error) {
    console.error("Error en PUT /api/ajustes:", error);
    return NextResponse.json(
      { ok: false, error: "Error al guardar los ajustes." },
      { status: 500 }
    );
  }
}