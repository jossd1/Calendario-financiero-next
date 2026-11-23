"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FormularioRegistro from "@/components/FormularioRegistro";
import KpiResumen from "@/components/KpiResumen";
import MovimientosRecientes from "@/components/MovimientosRecientes";
import TablaTransacciones from "@/components/TablaTransacciones";
import Topbar from "@/components/Topbar";
import WorkspaceToolbar from "@/components/WorkspaceToolbar";
import PanelAnalisis from "@/components/analisis/PanelAnalisis";
import PanelPresupuestos from "@/components/analisis/PanelPresupuestos";
import CalendarioPanel from "@/components/calendario/CalendarioPanel";
import VistaGeneral from "@/components/calendario/VistaGeneral";
import DashboardModales from "@/components/dashboard/DashboardModales";
import EditModeFloatingBar from "@/components/dashboard/EditModeFloatingBar";
import FlashFloatingStack from "@/components/dashboard/FlashFloatingStack";
import ToastContainer from "@/components/dashboard/ToastContainer";
import { useDashboardActions } from "@/hooks/useDashboardActions";
import { useDashboardState } from "@/hooks/useDashboardState";
import { useEditModeTextos } from "@/hooks/useEditModeTextos";
import type { DashboardEstadoDTO, TransaccionDTO } from "@/types";

export default function DashboardClient({
  initialEstado,
}: {
  initialEstado: DashboardEstadoDTO;
}) {
  const router = useRouter();
  const ds = useDashboardState(initialEstado);
  const ed = useEditModeTextos({
    textos: ds.estado.textos,
    onActualizarTextosEnEstado: ds.actualizarTextosLocal,
    onNotificar: ds.notificar,
    onToastSutil: ds.lanzarToastSutil,
  });

  const [modalCategoriasAbierto, setModalCategoriasAbierto] = useState(false);
  const [modalPerfilesAbierto, setModalPerfilesAbierto] = useState(false);
  const [modalPapeleraAbierto, setModalPapeleraAbierto] = useState(false);
  const [modalProgramadosAbierto, setModalProgramadosAbierto] = useState(false);
  const [modalAjustesAbierto, setModalAjustesAbierto] = useState(false);
  const [modalBuscadorAbierto, setModalBuscadorAbierto] = useState(false);
  const [txEditando, setTxEditando] = useState<TransaccionDTO | null>(null);
  const [modoSimpleActivo, setModoSimpleActivo] = useState(false);

  const { estado } = ds;
  const moneda = estado.perfil_actual.moneda;

  const actions = useDashboardActions({
    hoyIso: estado.hoy_iso,
    notificar: ds.notificar,
    lanzarToastSutil: ds.lanzarToastSutil,
    setDiaSeleccionado: ds.setDiaSeleccionado,
    setModoClick: ds.setModoClick,
    setPrimerToque: ds.setPrimerToque,
    setRangoDesde: ds.setRangoDesde,
    setRangoHasta: ds.setRangoHasta,
    setModoAnalisis: ds.setModoAnalisis,
    setFiltroCategoria: ds.setFiltroCategoria,
    setFiltroTipo: ds.setFiltroTipo,
    setFiltroBusqueda: ds.setFiltroBusqueda,
    refrescarEstado: ds.refrescarEstado,
  });

  useEffect(() => {
    setModoSimpleActivo(window.localStorage.getItem("cf_modo_simple") === "1");
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setModalBuscadorAbierto((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      className={
        [
          ed.editModeTextos ? "app-edit-mode-frame" : "",
          estado.ajustes.densidad === "compacta" ? "density-compact" : "",
        ]
          .filter(Boolean)
          .join(" ") || undefined
      }
    >
      <Topbar
        perfiles={estado.perfiles}
        perfilActual={estado.perfil_actual}
        cantidadPapelera={estado.papelera.length}
        cantidadPendientes={estado.pendientes_programados.length}
        programadosActivos={estado.ajustes.programadosActivos}
        modoPrivacidad={estado.ajustes.modoPrivacidad}
        authPinActivo={estado.ajustes.authPinActivo}
        textos={estado.textos}
        editModeTextos={ed.editModeTextos}
        onGuardarTexto={ed.handleGuardarTexto}
        onTogglePrivacidad={() =>
          void ds.handleActualizarConfig({
            modoPrivacidad: !estado.ajustes.modoPrivacidad,
          })
        }
        onBloquearPin={async () => {
          await fetch("/api/auth/pin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "bloquear" }),
          });
          router.refresh();
        }}
        onCambiarPerfil={(id) => void actions.handleCambiarPerfil(id)}
        onAbrirCategorias={() => setModalCategoriasAbierto(true)}
        onAbrirPerfiles={() => setModalPerfilesAbierto(true)}
        onAbrirPapelera={() => setModalPapeleraAbierto(true)}
        onAbrirProgramados={() => setModalProgramadosAbierto(true)}
        onAbrirAjustes={() => setModalAjustesAbierto(true)}
        onResetInicio={() => void actions.handleResetInicio()}
      />

      <FlashFloatingStack flashes={ds.flashes} onCerrar={ds.cerrarFlash} />

      <main className="page-container">
        <WorkspaceToolbar
          vista={estado.vista}
          tituloPeriodo={estado.titulo_periodo}
          fechaAnterior={estado.fecha_anterior}
          fechaSiguiente={estado.fecha_siguiente}
          vistaSemanalActiva={estado.ajustes.vistaSemanal}
          vistaGeneralActiva={estado.ajustes.vistaGeneral}
          onCambiarVista={(v) => void ds.refrescarEstado({ vista: v })}
          onNavegarPeriodo={(fecha) => {
            if (estado.vista === "dia") ds.setDiaSeleccionado(fecha);
            void ds.refrescarEstado({ fecha });
          }}
          onIrHoy={() => {
            ds.setDiaSeleccionado(estado.hoy_iso);
            void ds.refrescarEstado({ fecha: estado.hoy_iso });
          }}
        />

        <KpiResumen
          tituloPeriodo={estado.titulo_periodo}
          moneda={moneda}
          totalIngresos={estado.total_ingresos}
          totalEgresos={estado.total_egresos}
          balanceNeto={estado.balance_neto}
          comparativaKpi={estado.comparativa_kpi}
          topEgresoKpi={estado.top_egreso_kpi}
          mostrarComparativa={estado.ajustes.comparativasKpi}
          mostrarTopEgreso={estado.ajustes.kpiTopEgreso}
          modoPrivacidad={estado.ajustes.modoPrivacidad}
          textos={estado.textos}
          editModeTextos={ed.editModeTextos}
          onGuardarTexto={ed.handleGuardarTexto}
        />

        {estado.vista === "general" && estado.datos_general ? (
          <VistaGeneral
            datos={estado.datos_general}
            ajustes={estado.ajustes}
            textos={estado.textos}
            editModeTextos={ed.editModeTextos}
            onGuardarTexto={ed.handleGuardarTexto}
            onToggleConsolidado={(consolidado) => {
              ds.setGeneralConsolidado(consolidado);
              void ds.refrescarEstado({ generalConsolidado: consolidado });
            }}
          />
        ) : (
          <section className="main-grid" id="calendario">
            <CalendarioPanel
              vista={estado.vista}
              fechaRef={estado.fecha_ref}
              tituloPeriodo={estado.titulo_periodo}
              moneda={moneda}
              diaSeleccionado={ds.diaSeleccionado}
              modoClick={ds.modoClick}
              rangoDesde={ds.rangoDesde}
              rangoHasta={ds.rangoHasta}
              semanasCalendario={estado.semanas_calendario}
              diasSemanaVista={estado.dias_semana_vista}
              mesesAnual={estado.meses_anual}
              transaccionesDia={estado.transacciones_dia}
              categorias={estado.categorias}
              hoverPreviewDia={estado.ajustes.hoverPreviewDia}
              mostrarNetoCeldas={estado.ajustes.mostrarNetoCeldas}
              alertaTopeDiario={estado.ajustes.alertaTopeDiario}
              modoPrivacidad={estado.ajustes.modoPrivacidad}
              textos={estado.textos}
              editModeTextos={ed.editModeTextos}
              onGuardarTexto={ed.handleGuardarTexto}
              onCambiarModoClick={ds.setModoClick}
              onAbrirBuscadorMagico={() => setModalBuscadorAbierto(true)}
              onClicDia={(f) => void ds.handleClicDia(f)}
              onClicMesAnual={(anio, mes) => void ds.handleClicMesAnual(anio, mes)}
              onVolverAlMes={() => {
                ds.setModoAnalisis("auto");
                void ds.refrescarEstado({ vista: "mensual", analisisModo: "auto" });
              }}
              onEditarTx={(tx) => setTxEditando(tx)}
              onEliminarTx={actions.handleEliminarTx}
            />

            <div className="sidebar-stack">
              <FormularioRegistro
                moneda={moneda}
                categoriasEgreso={estado.categorias_egreso}
                categoriasIngreso={estado.categorias_ingreso}
                categoriaPredeterminada={estado.ajustes.categoriaPredeterminada}
                limitarAnios={estado.ajustes.limitarAniosCalendario}
                fechaSeleccionada={ds.diaSeleccionado}
                hoyIso={estado.hoy_iso}
                focusPing={ds.focusPing}
                textos={estado.textos}
                editModeTextos={ed.editModeTextos}
                onGuardarTexto={ed.handleGuardarTexto}
                onCambiarFechaSeleccionada={ds.setDiaSeleccionado}
                onMoverDiaFlecha={ds.handleMoverDiaFlecha}
                onModoSimpleChange={setModoSimpleActivo}
                onRegistrarExito={async (fechaTx) => {
                  ds.setDiaSeleccionado(fechaTx);
                  const nuevoEstado = await ds.refrescarEstado({
                    vista: estado.vista,
                    fecha: fechaTx,
                  });
                  actions.verificarAlertaTope(nuevoEstado, fechaTx);
                }}
                onNotificar={ds.notificar}
                onToastSutil={ds.lanzarToastSutil}
              />

              <MovimientosRecientes
                transacciones={estado.transacciones_historial}
                categorias={estado.categorias}
                moneda={moneda}
                maxItems={modoSimpleActivo ? 8 : 4}
                modoPrivacidad={estado.ajustes.modoPrivacidad}
                onEditarTx={(tx) => setTxEditando(tx)}
              />
            </div>
          </section>
        )}

        <PanelAnalisis
          analisis={estado.analisis}
          moneda={moneda}
          categorias={estado.categorias}
          modoAnalisis={ds.modoAnalisis}
          manualDesde={ds.manualDesde}
          manualHasta={ds.manualHasta}
          manualTipo={ds.manualTipo}
          modoPrivacidad={estado.ajustes.modoPrivacidad}
          textos={estado.textos}
          editModeTextos={ed.editModeTextos}
          onGuardarTexto={ed.handleGuardarTexto}
          onCambiarModoAnalisis={ds.setModoAnalisis}
          onAplicarManual={async (desde, hasta, tipo) => {
            const dMin = desde <= hasta ? desde : hasta;
            const dMax = desde <= hasta ? hasta : desde;
            ds.setPrimerToque(null);
            ds.setModoAnalisis("manual");
            ds.setManualDesde(dMin);
            ds.setManualHasta(dMax);
            ds.setManualTipo(tipo);
            ds.setRangoDesde(dMin);
            ds.setRangoHasta(dMax);
            await ds.refrescarEstado({
              analisisModo: "manual",
              analisisDesde: dMin,
              analisisHasta: dMax,
              analisisTipo: tipo,
            });
          }}
          onResetearAutomatico={async () => {
            ds.setPrimerToque(null);
            ds.setModoAnalisis("auto");
            ds.setRangoDesde(null);
            ds.setRangoHasta(null);
            await ds.refrescarEstado({ analisisModo: "auto" });
          }}
        />

        {estado.ajustes.presupuestosActivos && (
          <PanelPresupuestos
            presupuestos={estado.presupuestos}
            categoriasEgreso={estado.categorias_egreso}
            moneda={moneda}
            fechaRef={estado.fecha_ref}
            modoPresupuesto={estado.ajustes.modoPresupuesto}
            modoPrivacidad={estado.ajustes.modoPrivacidad}
            onActualizado={async () => {
              await ds.refrescarEstado();
            }}
            onNotificar={ds.notificar}
          />
        )}

        <TablaTransacciones
          initialItems={estado.transacciones_historial}
          initialHasMore={estado.hay_mas_historial}
          inicioPeriodo={estado.inicio_periodo}
          finPeriodo={estado.fin_periodo}
          tituloPeriodo={estado.titulo_periodo}
          moneda={moneda}
          todasCategorias={estado.categorias}
          filtroCategoria={ds.filtroCategoria}
          filtroTipo={ds.filtroTipo}
          filtroBusqueda={ds.filtroBusqueda}
          modoPrivacidad={estado.ajustes.modoPrivacidad}
          textos={estado.textos}
          editModeTextos={ed.editModeTextos}
          onGuardarTexto={ed.handleGuardarTexto}
          onCambiarFiltros={ds.handleCambiarFiltrosHistorial}
          onEditarTx={(tx) => setTxEditando(tx)}
          onEliminarTx={actions.handleEliminarTx}
        />
      </main>

      <EditModeFloatingBar
        visible={ed.editModeTextos}
        puedeDeshacer={ed.puedeDeshacer}
        puedeRehacer={ed.puedeRehacer}
        onDeshacer={ed.handleDeshacerTexto}
        onRehacer={ed.handleRehacerTexto}
        onRestablecer={ed.handleRestablecerTextos}
        onSalir={() => ed.setEditModeTextos(false)}
      />

      <ToastContainer toasts={ds.bottomToasts} />

      <DashboardModales
        estado={estado}
        modalCategoriasAbierto={modalCategoriasAbierto}
        modalPerfilesAbierto={modalPerfilesAbierto}
        modalPapeleraAbierto={modalPapeleraAbierto}
        modalProgramadosAbierto={modalProgramadosAbierto}
        modalAjustesAbierto={modalAjustesAbierto}
        modalBuscadorAbierto={modalBuscadorAbierto}
        txEditando={txEditando}
        editModeTextos={ed.editModeTextos}
        onCerrarCategorias={() => setModalCategoriasAbierto(false)}
        onCerrarPerfiles={() => setModalPerfilesAbierto(false)}
        onCerrarPapelera={() => setModalPapeleraAbierto(false)}
        onCerrarProgramados={() => setModalProgramadosAbierto(false)}
        onCerrarAjustes={() => setModalAjustesAbierto(false)}
        onCerrarBuscador={() => setModalBuscadorAbierto(false)}
        onCerrarEditarTx={() => setTxEditando(null)}
        onEditarTx={(tx) => setTxEditando(tx)}
        onToggleEditModeTextos={() => ed.setEditModeTextos((v) => !v)}
        onRestablecerTextos={ed.handleRestablecerTextos}
        onActualizarConfig={ds.handleActualizarConfig}
        onRefrescar={async () => {
          await ds.refrescarEstado();
        }}
        onSaltoMagico={(fechaIso, vistaDestino) =>
          void ds.handleSaltoMagico(fechaIso, vistaDestino)
        }
        onNotificar={ds.notificar}
        onToastSutil={ds.lanzarToastSutil}
      />
    </div>
  );
}
