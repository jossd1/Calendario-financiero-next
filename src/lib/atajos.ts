import type { CategoriaDTO } from "@/types";

export interface ResultadoAtajo {
  monto: string | null;
  sufijo: string;
  cat: CategoriaDTO | null;
}

export function analizarEntradaMonto(
  montoTexto: string,
  todasCategorias: CategoriaDTO[]
): ResultadoAtajo | null {
  const texto = montoTexto.trim();
  if (!texto) return null;

  const match = texto.match(/^(\d+(?:[.,]\d{1,2})?)\s*(.*)$/);
  if (!match) {
    return {
      monto: null,
      sufijo: texto.toLowerCase(),
      cat: null,
    };
  }

  const monto = match[1].replace(",", ".");
  const sufijo = (match[2] ?? "").trim().toLowerCase();

  if (!sufijo) {
    return { monto, sufijo: "", cat: null };
  }

  const encontrada =
    todasCategorias.find(
      (c) => Boolean(c.atajo) && c.atajo.trim().toLowerCase() === sufijo
    ) ?? null;

  return { monto, sufijo, cat: encontrada };
}