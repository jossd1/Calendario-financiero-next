import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ajustesApp } from "@/db/schema";
import type { AjustesAppConfig, TextosUI } from "@/types";

export const AJUSTES_DEFECTO: AjustesAppConfig = {
  configVersion: 4,
  modoPrivacidad: false,
  comparativasKpi: false,
  kpiTopEgreso: true,
  vistaSemanal: false,
  vistaGeneral: true,
  hoverPreviewDia: true,
  mostrarNetoCeldas: false,
  limitarAniosCalendario: true,
  mostrarMovimientosRecientes: true,
  paletaSobria: false,
  mostrarBotonPaletaTopbar: true,
  categoriaPredeterminada: "",
  alertaTopeDiario: 0,
  densidad: "comoda",
  generalMostrarAhorro: true,
  generalMostrarEvolucion: true,
  generalMostrarRecords: true,
  generalMostrarAnual: true,
  generalPermitirConsolidado: false,
  presupuestosActivos: false,
  programadosActivos: true,
  modoPresupuesto: "base_mensual",
  sumarProgramadosEnKpi: false,
  authPinActivo: false,
  pinConfigurado: false,
};

export const TEXTOS_UI_DEFECTO: TextosUI = {
  brandTitle: "Calendario Financiero",
  navCalendario: "Calendario",
  navAnalisis: "Análisis & Gráficos",
  navMovimientos: "Movimientos",
  kpiIngresosTitulo: "Total Ingresos",
  kpiIngresosSub: "Entradas",
  kpiEgresosTitulo: "Total Egresos",
  kpiEgresosSub: "Salidas",
  kpiBalanceTitulo: "Balance Neto",
  kpiBalanceSub: "Diferencia neta del periodo",
  kpiTopEgresoTitulo: "Mayor Egreso",
  tituloCalendarioMensual: "Calendario Mensual (Lun–Dom)",
  tituloVistaSemanal: "Vista Semanal (Lun–Dom)",
  tituloDesgloseDia: "Desglose del Día",
  tituloResumenAnual: "Resumen Anual",
  tituloVistaGeneral: "Resumen General Histórico",
  modoClicLabel: "Modo Clic:",
  modoFecha: "Fecha",
  modoVerDia: "Ver Día",
  modoAnalizar: "Analizar",
  btnVolverAlMes: "↩ Volver al Mes",
  tituloRegistroRapido: "Registrar Movimiento",
  subtituloAtajos: "Atajos ej: 15al",
  labelTipoOperacion: "Tipo de Operación",
  labelMontoAtajo: "Monto",
  labelCategoria: "Categoría",
  labelFechaTx: "Fecha",
  labelDescripcion: "Descripción (Opcional)",
  btnGuardarMovimiento: "Guardar Movimiento (Enter)",
  tituloAnalisis: "Análisis y Gráficos Financieros",
  tituloGraficoDona: "Egresos por Categoría (%)",
  tituloGraficoBarras: "Comparativa Ingresos vs Egresos",
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
  const versionGuardada = guardado.configVersion ?? 1;

  if (versionGuardada < 4) {
    configFinal = {
      ...configFinal,
      configVersion: 4,
      kpiTopEgreso: versionGuardada < 2 ? true : configFinal.kpiTopEgreso,
      vistaGeneral: versionGuardada < 2 ? true : configFinal.vistaGeneral,
      hoverPreviewDia: versionGuardada < 2 ? true : configFinal.hoverPreviewDia,
      generalMostrarAhorro:
        versionGuardada < 2 ? true : configFinal.generalMostrarAhorro,
      generalMostrarEvolucion:
        versionGuardada < 2 ? true : configFinal.generalMostrarEvolucion,
      generalMostrarRecords:
        versionGuardada < 2 ? true : configFinal.generalMostrarRecords,
      generalMostrarAnual:
        versionGuardada < 2 ? true : configFinal.generalMostrarAnual,
      generalPermitirConsolidado:
        versionGuardada < 2 ? false : configFinal.generalPermitirConsolidado,
      limitarAniosCalendario:
        versionGuardada < 3 ? true : configFinal.limitarAniosCalendario,
      programadosActivos:
        versionGuardada < 3 ? true : configFinal.programadosActivos,
      mostrarMovimientosRecientes: true,
      paletaSobria: false,
      mostrarBotonPaletaTopbar: true,
    };

    await db
      .update(ajustesApp)
      .set({ config_json: configFinal, actualizado_en: new Date() })
      .where(eq(ajustesApp.clave, CLAVE_GLOBAL));
  }

  const textosGuardados = { ...(fila.textos_json ?? {}) };
  let textosCambiados = false;

  const migracionesTexto: ReadonlyArray<[string, string, string]> = [
    ["subtituloAtajos", "⚡ Atajos literales ej: 15al", "Atajos ej: 15al"],
    ["labelMontoAtajo", "Monto (S/) o atajo (ej. 15al)", "Monto"],
    ["labelMontoAtajo", "Monto (S/)", "Monto"],
    ["labelFechaTx", "Fecha (Persistente)", "Fecha"],
    ["tituloCalendarioMensual", "Calendario Mensual (Dom–Sáb)", "Calendario Mensual (Lun–Dom)"],
    ["tituloVistaSemanal", "Vista Semanal (Dom–Sáb)", "Vista Semanal (Lun–Dom)"],
    ["tituloRegistroRapido", "Registrar Movimiento (S/)", "Registrar Movimiento"],
    ["tituloGraficoBarras", "Comparativa Ingresos vs Egresos (S/)", "Comparativa Ingresos vs Egresos"],
    ["kpiBalanceSub", "Diferencia neta en Soles", "Diferencia neta del periodo"],
  ];

  for (const [clave, viejo, nuevo] of migracionesTexto) {
    if (textosGuardados[clave] === viejo) {
      textosGuardados[clave] = nuevo;
      textosCambiados = true;
    }
  }

  if (textosCambiados) {
    await db
      .update(ajustesApp)
      .set({ textos_json: textosGuardados, actualizado_en: new Date() })
      .where(eq(ajustesApp.clave, CLAVE_GLOBAL));
  }

  return {
    config: configFinal,
    textos: { ...TEXTOS_UI_DEFECTO, ...textosGuardados },
  };
}

export async function guardarAjustesApp(params: {
  config?: Partial<AjustesAppConfig>;
  textos?: TextosUI;
  restablecerTextos?: boolean;
}): Promise<{ config: AjustesAppConfig; textos: TextosUI }> {
  const actual = await obtenerAjustesApp();

  const nuevoConfig: AjustesAppConfig = params.config
    ? { ...actual.config, ...params.config, configVersion: 4 }
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