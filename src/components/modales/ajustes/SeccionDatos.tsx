"use client";

import {
  AjustesActionRow,
  AjustesCard,
} from "@/components/modales/AjustesControles";

interface SeccionDatosProps {
  onImportado?: () => Promise<void>;
  onNotificar?: (tipo: "success" | "error", texto: string) => void;
}

export default function SeccionDatos({
  onImportado,
  onNotificar,
}: SeccionDatosProps) {
  return (
    <AjustesCard titulo="Exportación y Respaldo">
      <AjustesActionRow
        titulo="Exportar mis Datos"
        descripcion="Descarga el historial activo en formato CSV o una copia de seguridad completa en JSON."
      >
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <a href="/api/exportar/csv" className="btn btn-secondary btn-sm">
            ⬇ Descargar .CSV
          </a>
          <a href="/api/exportar/json" className="btn btn-secondary btn-sm">
            ⬇ Descargar .JSON
          </a>
        </div>
      </AjustesActionRow>

      <AjustesActionRow
        titulo="Importar Movimientos (.CSV)"
        descripcion="Carga movimientos desde CSV (Fecha, Tipo, Categoría, Descripción, Monto)."
      >
        <label className="btn btn-celeste btn-sm" style={{ cursor: "pointer" }}>
          ⬆ Subir .CSV
          <input
            type="file"
            accept=".csv,text/csv"
            style={{ display: "none" }}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const texto = await file.text();
              const res = await fetch("/api/importar/csv", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ csv: texto }),
              });
              const data = await res.json();
              onNotificar?.(
                data.ok ? "success" : "error",
                data.mensaje ?? data.error
              );
              if (data.ok && onImportado) await onImportado();
              e.target.value = "";
            }}
          />
        </label>
      </AjustesActionRow>

      <AjustesActionRow
        titulo="Restaurar Backup (.JSON)"
        descripcion="Restaura categorías, presupuestos y movimientos en el perfil activo."
      >
        <label className="btn btn-celeste btn-sm" style={{ cursor: "pointer" }}>
          ⬆ Restaurar .JSON
          <input
            type="file"
            accept=".json,application/json"
            style={{ display: "none" }}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const json = JSON.parse(await file.text());
                const res = await fetch("/api/importar/json", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(json),
                });
                const data = await res.json();
                onNotificar?.(
                  data.ok ? "success" : "error",
                  data.mensaje ?? data.error
                );
                if (data.ok && onImportado) await onImportado();
              } catch {
                onNotificar?.("error", "El archivo JSON no es válido.");
              }
              e.target.value = "";
            }}
          />
        </label>
      </AjustesActionRow>
    </AjustesCard>
  );
}