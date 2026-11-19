import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { transacciones } from "@/db/schema";
import { esFechaISOValida, obtenerHoyPeruISO } from "@/lib/format";
import { obtenerPerfilActivo } from "@/lib/perfil";

function parsearFilaCsv(linea: string): string[] {
  const resultado: string[] = [];
  let actual = "";
  let enComillas = false;

  for (let i = 0; i < linea.length; i++) {
    const ch = linea[i];
    if (ch === '"') {
      if (enComillas && linea[i + 1] === '"') {
        actual += '"';
        i += 1;
      } else {
        enComillas = !enComillas;
      }
    } else if ((ch === "," || ch === ";") && !enComillas) {
      resultado.push(actual.trim());
      actual = "";
    } else {
      actual += ch;
    }
  }
  resultado.push(actual.trim());
  return resultado;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const contenido = String(body.csv ?? "").replace(/^\uFEFF/, "");
    const lineas = contenido
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lineas.length < 2) {
      return NextResponse.json(
        { ok: false, error: "El CSV está vacío o no tiene filas de datos." },
        { status: 400 }
      );
    }

    const { perfilActual } = await obtenerPerfilActivo();
    const cabecera = parsearFilaCsv(lineas[0]).map((h) => h.toLowerCase());

    const idxFecha = cabecera.findIndex((h) => h.includes("fecha"));
    const idxTipo = cabecera.findIndex((h) => h.includes("tipo"));
    const idxCat = cabecera.findIndex((h) => h.includes("categor"));
    const idxDesc = cabecera.findIndex((h) => h.includes("descrip"));
    const idxMonto = cabecera.findIndex((h) => h.includes("monto"));

    if (idxMonto === -1) {
      return NextResponse.json(
        { ok: false, error: "No se encontró la columna 'Monto' en el CSV." },
        { status: 400 }
      );
    }

    let importados = 0;
    await db.transaction(async (tx) => {
      for (let i = 1; i < lineas.length; i++) {
        const cols = parsearFilaCsv(lineas[i]);
        const montoRaw = (cols[idxMonto] ?? "0").replace(/[^0-9.,-]/g, "").replace(",", ".");
        const monto = Math.abs(Number(montoRaw));
        if (!Number.isFinite(monto) || monto <= 0) continue;

        const tipoTexto = (idxTipo >= 0 ? cols[idxTipo] : "egreso").toLowerCase();
        const tipo = tipoTexto.includes("ing") ? "ingreso" : "egreso";
        const categoria = (idxCat >= 0 ? cols[idxCat] : "Otros Gastos").slice(0, 60) || "Otros Gastos";
        const descripcion = (idxDesc >= 0 ? cols[idxDesc] : "").slice(0, 240);
        const fechaRaw = idxFecha >= 0 ? cols[idxFecha] : "";
        const fecha = esFechaISOValida(fechaRaw) ? fechaRaw : obtenerHoyPeruISO();

        await tx.insert(transacciones).values({
          perfil_id: perfilActual.id,
          tipo,
          monto: monto.toFixed(2),
          categoria,
          descripcion,
          fecha,
          estado: "pagado",
          eliminado: false,
        });
        importados += 1;
      }
    });

    return NextResponse.json({
      ok: true,
      mensaje: `${importados} movimiento(s) importado(s) desde CSV.`,
    });
  } catch (error) {
    console.error("Error en POST /api/importar/csv:", error);
    return NextResponse.json(
      { ok: false, error: "Error al procesar el archivo CSV." },
      { status: 500 }
    );
  }
}