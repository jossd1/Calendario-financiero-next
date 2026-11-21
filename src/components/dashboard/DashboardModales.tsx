"use client";

import ModalAjustes from "@/components/modales/ModalAjustes";
import ModalBuscadorMagico from "@/components/modales/ModalBuscadorMagico";
import ModalCategorias from "@/components/modales/ModalCategorias";
import ModalEditarTx from "@/components/modales/ModalEditarTx";
import ModalPapelera from "@/components/modales/ModalPapelera";
import ModalPerfiles from "@/components/modales/ModalPerfiles";
import ModalProgramados from "@/components/modales/ModalProgramados";
import type {
  AjustesAppConfig,
  DashboardEstadoDTO,
  TransaccionDTO,
} from "@/types";

interface DashboardModalesProps {
  estado: DashboardEstadoDTO;
  modalCategoriasAbierto: boolean;
  modalPerfilesAbierto: boolean;
  modalPapeleraAbierto: boolean;
  modalProgramadosAbierto: boolean;
  modalAjustesAbierto: boolean;
  modalBuscadorAbierto: boolean;
  txEditando: TransaccionDTO | null;
  editModeTextos: boolean;
  onCerrarCategorias: () => void;
  onCerrarPerfiles: () => void;
  onCerrarPapelera: () => void;
  onCerrarProgramados: () => void;
  onCerrarAjustes: () => void;
  onCerrarBuscador: () => void;
  onCerrarEditarTx: () => void;
  onEditarTx: (tx: TransaccionDTO) => void;
  onToggleEditModeTextos: () => void;
  onRestablecerTextos: () => Promise<void>;
  onActualizarConfig: (parcial: Partial<AjustesAppConfig>) => Promise<void>;
  onRefrescar: () => Promise<void>;
  onSaltoMagico: (fechaIso: string, vistaDestino: "mensual" | "dia") => void;
  onNotificar: (tipo: "success" | "error", texto: string) => void;
  onToastSutil: (texto: string) => void;
}

export default function DashboardModales({
  estado,
  modalCategoriasAbierto,
  modalPerfilesAbierto,
  modalPapeleraAbierto,
  modalProgramadosAbierto,
  modalAjustesAbierto,
  modalBuscadorAbierto,
  txEditando,
  editModeTextos,
  onCerrarCategorias,
  onCerrarPerfiles,
  onCerrarPapelera,
  onCerrarProgramados,
  onCerrarAjustes,
  onCerrarBuscador,
  onCerrarEditarTx,
  onEditarTx,
  onToggleEditModeTextos,
  onRestablecerTextos,
  onActualizarConfig,
  onRefrescar,
  onSaltoMagico,
  onNotificar,
  onToastSutil,
}: DashboardModalesProps) {
  const anioVista = Number(estado.fecha_ref.slice(0, 4)) || new Date().getFullYear();

  return (
    <>
      <ModalBuscadorMagico
        abierto={modalBuscadorAbierto}
        anioVista={anioVista}
        limitarAnios={estado.ajustes.limitarAniosCalendario}
        onCerrar={onCerrarBuscador}
        onNavegar={onSaltoMagico}
      />

      <ModalEditarTx
        tx={txEditando}
        categoriasEgreso={estado.categorias_egreso}
        categoriasIngreso={estado.categorias_ingreso}
        programadosActivos={estado.ajustes.programadosActivos}
        onCerrar={onCerrarEditarTx}
        onGuardado={onRefrescar}
        onNotificar={onNotificar}
      />

      <ModalCategorias
        abierto={modalCategoriasAbierto}
        categoriasEgreso={estado.categorias_egreso}
        categoriasIngreso={estado.categorias_ingreso}
        onCerrar={onCerrarCategorias}
        onActualizado={onRefrescar}
        onNotificar={onNotificar}
      />

      <ModalPerfiles
        abierto={modalPerfilesAbierto}
        perfiles={estado.perfiles}
        perfilActual={estado.perfil_actual}
        onCerrar={onCerrarPerfiles}
        onActualizado={onRefrescar}
        onNotificar={onNotificar}
      />

      <ModalPapelera
        abierto={modalPapeleraAbierto}
        items={estado.papelera}
        modoPrivacidad={estado.ajustes.modoPrivacidad}
        onCerrar={onCerrarPapelera}
        onActualizado={onRefrescar}
        onNotificar={onNotificar}
      />

      <ModalProgramados
        abierto={modalProgramadosAbierto}
        items={estado.pendientes_programados}
        categoriasEgreso={estado.categorias_egreso}
        categoriasIngreso={estado.categorias_ingreso}
        hoyIso={estado.hoy_iso}
        limitarAnios={estado.ajustes.limitarAniosCalendario}
        sumarEnKpi={estado.ajustes.sumarProgramadosEnKpi}
        modoPrivacidad={estado.ajustes.modoPrivacidad}
        onCerrar={onCerrarProgramados}
        onActualizado={onRefrescar}
        onEditarTx={onEditarTx}
        onNotificar={onNotificar}
      />

      <ModalAjustes
        abierto={modalAjustesAbierto}
        ajustes={estado.ajustes}
        categorias={estado.categorias}
        editModeTextos={editModeTextos}
        onCerrar={onCerrarAjustes}
        onToggleEditModeTextos={onToggleEditModeTextos}
        onRestablecerTextos={onRestablecerTextos}
        onActualizarConfig={onActualizarConfig}
        onActivarPin={async (pin) => {
          const res = await fetch("/api/auth/pin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "activar", pin }),
          });
          const data = await res.json();
          if (!data.ok) return false;
          onToastSutil(data.mensaje ?? "PIN activado.");
          await onRefrescar();
          return true;
        }}
        onDesactivarPin={async () => {
          const res = await fetch("/api/auth/pin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "desactivar" }),
          });
          const data = await res.json();
          if (data.ok) {
            onToastSutil(data.mensaje ?? "PIN desactivado.");
            await onRefrescar();
          }
        }}
        onImportado={onRefrescar}
        onNotificar={onNotificar}
      />
    </>
  );
}