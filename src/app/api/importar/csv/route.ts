import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categorias, transacciones } from "@/db/schema";
import { obtenerAjustesApp } from "@/lib/ajustes";
import { buildIsoDate, esFechaISOValida, obtenerHoyPeruISO } from "@/lib/format";
import { obtenerPerfilActivo } from "@/lib/perfil";

const PALETA_CSV = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
];

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

function normalizarFechaCsv(raw: string, limitarAnios: boolean): string {
  const limpia = raw.trim().slice(0, 10);
  let iso = "";

  const match = limpia.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (match) {
    const candidato = buildIsoDate(
      Number(match[3]),
      Number(match[2]),
      Number(match[1])
    );
    if (esFechaISOValida(candidato)) iso = candidato;
  } else if (esFechaISOValida(limpia)) {
    iso = limpia;
  }

  if (!iso) return obtenerHoyPeruISO();
  if (limitarAnios) {
    const anio = Number(iso.slice(0, 4));
    if (anio < 2000 || anio > 3000) return obtenerHoyPeruISO();
  }
  return iso;
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
    const { config } = await obtenerAjustesApp();
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
    const catsNuevas = new Map<string, "ingreso" | "egreso">();

    await db.transaction(async (tx) => {
      for (let i = 1; i < lineas.length; i++) {
        const cols = parsearFilaCsv(lineas[i]);
        const montoRaw = (cols[idxMonto] ?? "0")
          .replace(/[^0-9.,-]/g, "")
          .replace(",", ".");
        const monto = Math.abs(Number(montoRaw));
        if (!Number.isFinite(monto) || monto <= 0) continue;

        const tipoTexto = (idxTipo >= 0 ? cols[idxTipo] : "egreso").toLowerCase();
        const tipo = tipoTexto.includes("ing") ? "ingreso" : "egreso";
        const categoria =
          (idxCat >= 0 ? cols[idxCat] : "Otros Gastos").slice(0, 60) ||
          "Otros Gastos";
        const descripcion = (idxDesc >= 0 ? cols[idxDesc] : "").slice(0, 240);
        const fechaRaw = idxFecha >= 0 ? cols[idxFecha] : "";
        const fecha = normalizarFechaCsv(
          fechaRaw,
          config.limitarAniosCalendario
        );

        if (!catsNuevas.has(categoria)) {
          catsNuevas.set(categoria, tipo);
        }

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

      let colorIdx = 0;
      for (const [nombreCat, tipoCat] of catsNuevas.entries()) {
        await tx
          .insert(categorias)
          .values({
            perfil_id: perfilActual.id,
            nombre: nombreCat,
            tipo: tipoCat,
            atajo: nombreCat.slice(0, 2).toLowerCase(),
            color: PALETA_CSV[colorIdx % PALETA_CSV.length],
          })
          .onConflictDoNothing({
            target: [categorias.perfil_id, categorias.nombre],
          });
        colorIdx += 1;
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