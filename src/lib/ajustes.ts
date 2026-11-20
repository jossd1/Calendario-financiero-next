import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ajustesApp } from "@/db/schema";
import type { AjustesAppConfig, TextosUI } from "@/types";

export const AJUSTES_DEFECTO: AjustesAppConfig = {
  configVersion: 2,
  modoPrivacidad: false,
  comparativasKpi: false,
  kpiTopEgreso: true,
  vistaSemanal: false,
  vistaGeneral: true,
  hoverPreviewDia: true,
  mostrarNetoCeldas: false,
  categoriaPredeterminada: "",
  alertaTopeDiario: 0,
  densidad: "comoda",
  generalMostrarAhorro: true,
  generalMostrarEvolucion: true,
  generalMostrarRecords: true,
  generalMostrarAnual: true,
  generalPermitirConsolidado: false,
  presupuestosActivos: false,
  programadosActivos: false,
  modoPresupuesto: "base_mensual",
  sumarProgramadosEnKpi: false,
  authPinActivo: false,
  pinConfigurado: false,
};

export const TEXTOS_UI_DEFECTO: TextosUI = {
  brandTitle: "Calendario Financiero (S/)",
  navCalendario: "Calendario",
  navAnalisis: "Análisis & Gráficos",
  navMovimientos: "Movimientos",
  kpiIngresosTitulo: "Total Ingresos",
  kpiIngresosSub: "Entradas",
  kpiEgresosTitulo: "Total Egresos",
  kpiEgresosSub: "Salidas",
  kpiBalanceTitulo: "Balance Neto",
  kpiBalanceSub: "Diferencia neta en Soles",
  kpiTopEgresoTitulo: "Mayor Egreso",
  tituloCalendarioMensual: "Calendario Mensual (Dom–Sáb)",
  tituloVistaSemanal: "Vista Semanal (Dom–Sáb)",
  tituloDesgloseDia: "Desglose del Día",
  tituloResumenAnual: "Resumen Anual",
  tituloVistaGeneral: "Resumen General Histórico",
  modoClicLabel: "Modo Clic:",
  modoFecha: "Fecha",
  modoVerDia: "Ver Día",
  modoAnalizar: "Analizar",
  btnVolverAlMes: "↩ Volver al Mes",
  tituloRegistroRapido: "Registrar Movimiento (S/)",
  subtituloAtajos: "⚡ Atajos literales ej: 15al",
  labelTipoOperacion: "Tipo de Operación",
  labelMontoAtajo: "Monto (S/) o atajo (ej. 15al)",
  labelCategoria: "Categoría",
  labelFechaTx: "Fecha (Persistente)",
  labelDescripcion: "Descripción (Opcional)",
  btnGuardarMovimiento: "Guardar Movimiento (Enter)",
  tituloAnalisis: "Análisis y Gráficos Financieros",
  tituloGraficoDona: "Egresos por Categoría (%)",
  tituloGraficoBarras: "Comparativa Ingresos vs Egresos (S/)",
  tituloResumenCategorias: "📋 Resumen Agrupado por Categorías (Periodo Activo)",
  tituloHistorial: "Historial de Movimientos",
};

const CLAVE_GLOBAL = "global";

export async function obtenerAjustesApp(): Promise<{
  config: AjustesAppConfig;
  textos: TextosUI;
}> {
  const [fila] = await db
    .select()
    .from(ajustesApp)
    .where(eq(ajustesApp.clave, CLAVE_GLOBAL));

  if (!fila) {
    await db
      .insert(ajustesApp)
      .values({
        clave: CLAVE_GLOBAL,
        config_json: AJUSTES_DEFECTO,
        textos_json: TEXTOS_UI_DEFECTO,
      })
      .onConflictDoNothing({ target: ajustesApp.clave });

    return {
      config: { ...AJUSTES_DEFECTO },
      textos: { ...TEXTOS_UI_DEFECTO },
    };
  }

  const guardado = fila.config_json ?? ({} as Partial<AjustesAppConfig>);
  let configFinal: AjustesAppConfig = { ...AJUSTES_DEFECTO, ...guardado };

  // Aplica una sola vez los nuevos defaults v2 sobre instalaciones previas
  if ((guardado.configVersion ?? 1) < 2) {
    configFinal = {
      ...configFinal,
      configVersion: 2,
      kpiTopEgreso: true,
      vistaGeneral: true,
      hoverPreviewDia: true,
      generalMostrarAhorro: true,
      generalMostrarEvolucion: true,
      generalMostrarRecords: true,
      generalMostrarAnual: true,
      generalPermitirConsolidado: false,
    };

    await db
      .update(ajustesApp)
      .set({ config_json: configFinal, actualizado_en: new Date() })
      .where(eq(ajustesApp.clave, CLAVE_GLOBAL));
  }

  return {
    config: configFinal,
    textos: { ...TEXTOS_UI_DEFECTO, ...(fila.textos_json ?? {}) },
  };
}

export async function guardarAjustesApp(params: {
  config?: Partial<AjustesAppConfig>;
  textos?: TextosUI;
  restablecerTextos?: boolean;
}): Promise<{ config: AjustesAppConfig; textos: TextosUI }> {
  const actual = await obtenerAjustesApp();

  const nuevoConfig: AjustesAppConfig = params.config
    ? { ...actual.config, ...params.config, configVersion: 2 }
    : actual.config;

  const nuevosTextos: TextosUI = params.restablecerTextos
    ? { ...TEXTOS_UI_DEFECTO }
    : params.textos
    ? { ...actual.textos, ...params.textos }
    : actual.textos;

  await db
    .insert(ajustesApp)
    .values({
      clave: CLAVE_GLOBAL,
      config_json: nuevoConfig,
      textos_json: nuevosTextos,
      actualizado_en: new Date(),
    })
    .onConflictDoUpdate({
      target: ajustesApp.clave,
      set: {
        config_json: nuevoConfig,
        textos_json: nuevosTextos,
        actualizado_en: new Date(),
      },
    });

  return {
    config: nuevoConfig,
    textos: nuevosTextos,
  };
}