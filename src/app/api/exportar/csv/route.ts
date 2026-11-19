import { NextResponse } from "next/server";
import { and, desc, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { transacciones } from "@/db/schema";
import { formatearHoraLima, obtenerHoyPeruISO } from "@/lib/format";
import { obtenerPerfilActivo } from "@/lib/perfil";
import { estaAppBloqueada } from "@/lib/pin";

function escaparCsv(valor: string): string {
  const texto = String(valor ?? "");
  if (/[",\n\r]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

export async function GET() {
  try {
    if (await estaAppBloqueada()) {
      return NextResponse.json(
        { ok: false, error: "Sesión bloqueada por PIN." },
        { status: 401 }
      );
    }

    const { perfilActual } = await obtenerPerfilActivo();

    const filas = await db
      .select()
      .from(transacciones)
      .where(
        and(
          eq(transacciones.perfil_id, perfilActual.id),
          eq(transacciones.eliminado, false),
          gt(transacciones.monto, "0")
        )
      )
      .orderBy(desc(transacciones.fecha), desc(transacciones.id));

    const lineas: string[] = [
      [
        "ID",
        "Fecha",
        "Hora",
        "Tipo",
        "Categoría",
        "Descripción",
        "Moneda",
        "Monto (S/)",
      ]
        .map(escaparCsv)
        .join(","),
    ];

    for (const f of filas) {
      lineas.push(
        [
          String(f.id),
          String(f.fecha),
          formatearHoraLima(f.creado_en),
          f.tipo === "ingreso" ? "Ingreso" : "Egreso",
          f.categoria,
          f.descripcion ?? "",
          "PEN (S/)",
          Number(f.monto).toFixed(2),
        ]
          .map(escaparCsv)
          .join(",")
      );
    }

    const bom = "\uFEFF";
    const contenido = bom + lineas.join("\r\n");
    const slugPerfil = perfilActual.nombre
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
    const nombreArchivo = `historial_${slugPerfil || "perfil"}_${obtenerHoyPeruISO()}.csv`;

    return new NextResponse(contenido, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${nombreArchivo}"`,
      },
    });
  } catch (error) {
    console.error("Error en GET /api/exportar/csv:", error);
    return NextResponse.json(
      { ok: false, error: "Error al exportar CSV." },
      { status: 500 }
    );
  }
}