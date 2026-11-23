"use client";

import EditableText from "@/components/EditableText";
import { mostrarMontoMoneda, obtenerMonedaInfo } from "@/lib/monedas";
import type { DesgloseCategoria, TextosUI } from "@/types";

const PALETA_FALLBACK = [
  "#ec4899",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#e11d48",
];

interface ResumenCategoriasTablaProps {
  desgloseEgresos: DesgloseCategoria[];
  moneda: string;
  colorPorCategoria: Map<string, string>;
  modoPrivacidad: boolean;
  textos: TextosUI;
  editModeTextos: boolean;
  onGuardarTexto: (clave: string, valor: string) => void;
}

export default function ResumenCategoriasTabla({
  desgloseEgresos,
  moneda,
  colorPorCategoria,
  modoPrivacidad,
  textos,
  editModeTextos,
  onGuardarTexto,
}: ResumenCategoriasTablaProps) {
  const { simbolo } = obtenerMonedaInfo(moneda);

  return (
    <div className="analysis-subcard" style={{ marginTop: "20px" }}>
      <h4
        style={{
          fontSize: "0.95rem",
          marginBottom: "12px",
          color: "var(--accent-primary)",
        }}
      >
        <EditableText
          clave="tituloResumenCategorias"
          textos={textos}
          editMode={editModeTextos}
          onGuardarTexto={onGuardarTexto}
        />
      </h4>
      <div className="table-scroll">
        <table className="tx-table">
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Distribución</th>
              <th className="num">Total Egresos ({simbolo})</th>
              <th className="num">Porcentaje (%)</th>
            </tr>
          </thead>
          <tbody>
            {desgloseEgresos.length > 0 ? (
              desgloseEgresos.map((item, idx) => {
                const colorCat =
                  colorPorCategoria.get(item.categoria) ??
                  PALETA_FALLBACK[idx % PALETA_FALLBACK.length];

                return (
                  <tr key={item.categoria}>
                    <td style={{ fontWeight: 600 }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          className="cat-color-dot"
                          style={{ backgroundColor: colorCat }}
                        />
                        {item.categoria}
                      </span>
                    </td>
                    <td style={{ minWidth: "160px" }}>
                      <div
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          height: "6px",
                          borderRadius: "3px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            background: colorCat,
                            width: `${item.porcentaje}%`,
                            height: "100%",
                          }}
                        />
                      </div>
                    </td>
                    <td
                      className={`num tabular-nums expense ${
                        modoPrivacidad ? "privacy-dots" : ""
                      }`}
                      style={{ fontWeight: 600 }}
                    >
                      {mostrarMontoMoneda(
                        item.monto_fmt,
                        modoPrivacidad,
                        moneda
                      )}
                    </td>
                    <td className="num tabular-nums">{item.porcentaje}%</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4}>
                  <div className="empty-state">
                    No hay datos de egresos resumidos para este periodo.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
