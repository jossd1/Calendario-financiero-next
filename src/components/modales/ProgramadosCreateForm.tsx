"use client";

import { useEffect, useState } from "react";
import CustomSelect, { type CustomSelectOption } from "@/components/CustomSelect";
import { formatearFechaDMY } from "@/lib/format";
import { formatoMoneda, obtenerMonedaInfo } from "@/lib/monedas";
import type { CategoriaDTO, TipoMovimiento, TransaccionDTO } from "@/types";

interface ProgramadosCreateFormProps {
  moneda: string;
  categoriasEgreso: CategoriaDTO[];
  categoriasIngreso: CategoriaDTO[];
  hoyIso: string;
  limitarAnios: boolean;
  onCreado: (txCreada: TransaccionDTO) => Promise<void>;
  onNotificar: (tipo: "success" | "error", texto: string) => void;
}

export default function ProgramadosCreateForm({
  moneda,
  categoriasEgreso,
  categoriasIngreso,
  hoyIso,
  limitarAnios,
  onCreado,
  onNotificar,
}: ProgramadosCreateFormProps) {
  const [tipo, setTipo] = useState<TipoMovimiento>("egreso");
  const [monto, setMonto] = useState("");
  const [categoria, setCategoria] = useState(
    categoriasEgreso[0]?.nombre ?? categoriasIngreso[0]?.nombre ?? ""
  );
  const [fecha, setFecha] = useState(hoyIso);
  const [descripcion, setDescripcion] = useState("");
  const [estadoNuevo, setEstadoNuevo] = useState<"pendiente" | "programado">(
    "pendiente"
  );
  const [guardando, setGuardando] = useState(false);

  const { simbolo } = obtenerMonedaInfo(moneda);

  useEffect(() => {
    setFecha(hoyIso);
  }, [hoyIso]);

  const listaCatsActiva =
    tipo === "ingreso" ? categoriasIngreso : categoriasEgreso;

  useEffect(() => {
    if (
      listaCatsActiva.length > 0 &&
      !listaCatsActiva.some((c) => c.nombre === categoria)
    ) {
      setCategoria(listaCatsActiva[0].nombre);
    }
  }, [listaCatsActiva, categoria]);

  const opcionesCat: CustomSelectOption[] = listaCatsActiva.map((c) => ({
    value: c.nombre,
    label: c.nombre,
    color: c.color || "#3b82f6",
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const montoNum = Number(monto.replace(",", "."));
    if (!Number.isFinite(montoNum) || montoNum <= 0 || !categoria || !fecha) {
      onNotificar("error", "Completa monto, categoría y fecha válidos.");
      return;
    }

    setGuardando(true);
    try {
      const res = await fetch("/api/transacciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          monto: montoNum.toFixed(2),
          categoria,
          descripcion,
          fecha,
          estado: estadoNuevo,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        onNotificar("error", data.error ?? "No se pudo guardar.");
        return;
      }
      const descLimpiada = descripcion;
      setMonto("");
      setDescripcion("");
      onNotificar(
        "success",
        `${estadoNuevo === "programado" ? "Programado" : "Pendiente"} registrado.`
      );
      await onCreado({
        id: Number(data.id),
        perfil_id: 0,
        tipo,
        monto: montoNum,
        monto_fmt: formatoMoneda(montoNum, moneda),
        categoria,
        descripcion: descLimpiada,
        fecha_iso: fecha,
        fecha_fmt: formatearFechaDMY(fecha),
        hora_fmt: "",
        estado: estadoNuevo,
        eliminado: false,
      });
    } catch {
      onNotificar("error", "Error de red al guardar pendiente/programado.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid var(--border-hairline)",
        borderRadius: "10px",
        padding: "12px",
        marginBottom: "14px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(125px, 1fr))",
          gap: "8px",
        }}
      >
        <CustomSelect
          ariaLabel="Tipo"
          value={tipo}
          options={[
            { value: "egreso", label: "Egreso (-)", color: "#ef4444" },
            { value: "ingreso", label: "Ingreso (+)", color: "#10b981" },
          ]}
          onChange={(val) => setTipo(val as TipoMovimiento)}
        />

        <input
          type="text"
          inputMode="decimal"
          placeholder={`Monto ${simbolo}`}
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          className="input-control tabular-nums"
          style={{ padding: "7px 10px", fontSize: "0.84rem" }}
          required
        />

        <CustomSelect
          ariaLabel="Categoría"
          value={categoria}
          options={opcionesCat}
          onChange={setCategoria}
        />

        <CustomSelect
          ariaLabel="Estado"
          value={estadoNuevo}
          options={[
            { value: "pendiente", label: "Pendiente" },
            { value: "programado", label: "Programado" },
          ]}
          onChange={(val) =>
            setEstadoNuevo(val as "pendiente" | "programado")
          }
        />
      </div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <input
          type="date"
          min={limitarAnios ? "2000-01-01" : undefined}
          max={limitarAnios ? "3000-12-31" : undefined}
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="input-control tabular-nums"
          style={{ width: "155px", padding: "6px 8px", fontSize: "0.82rem" }}
          required
        />
        <input
          type="text"
          maxLength={240}
          placeholder="Descripción (ej. Recibo de luz)..."
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="input-control"
          style={{ flex: 1, minWidth: "160px", padding: "6px 8px", fontSize: "0.82rem" }}
        />
        <button
          type="submit"
          disabled={guardando}
          className="btn btn-primary btn-sm"
        >
          {guardando ? "..." : "+ Agregar"}
        </button>
      </div>
    </form>
  );
}