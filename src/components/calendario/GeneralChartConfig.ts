import type { ChartData, ChartOptions } from "chart.js";
import { formatoMoneda, obtenerMonedaInfo } from "@/lib/monedas";
import type { EvolucionMensualItem } from "@/types/general";

export function buildGeneralChartConfig(params: {
  evolucion: EvolucionMensualItem[];
  modoVista: "flujo" | "neto";
  mostrarSaldo: boolean;
  mostrarIngresos: boolean;
  mostrarEgresos: boolean;
  mostrarNeto: boolean;
  modoPrivacidad: boolean;
  moneda: string;
}): {
  data: ChartData<"bar" | "line", number[], string>;
  options: ChartOptions<"bar" | "line">;
} {
  const {
    evolucion,
    modoVista,
    mostrarSaldo,
    mostrarIngresos,
    mostrarEgresos,
    mostrarNeto,
    modoPrivacidad,
    moneda,
  } = params;

  const { simbolo } = obtenerMonedaInfo(moneda);
  const labels = evolucion.map((e) => e.etiqueta);

  const lineSaldo = {
    type: "line" as const,
    label: `Saldo Acumulado (${simbolo})`,
    yAxisID: "ySaldo",
    hidden: !mostrarSaldo,
    data: evolucion.map((e) => e.acumulado),
    borderColor: "rgba(148, 163, 184, 0.8)",
    backgroundColor: "rgba(148, 163, 184, 0.8)",
    borderWidth: 2,
    borderDash: [6, 5],
    tension: 0,
    pointRadius: 4,
    pointHoverRadius: 6,
    pointBackgroundColor: "#0d1322",
    pointBorderColor: "#cbd5e1",
    pointBorderWidth: 2,
    order: 1,
  };

  const data: ChartData<"bar" | "line", number[], string> =
    modoVista === "flujo"
      ? {
          labels,
          datasets: [
            lineSaldo,
            {
              type: "bar",
              label: `Ingresos (${simbolo})`,
              yAxisID: "y",
              hidden: !mostrarIngresos,
              data: evolucion.map((e) => e.ingresos),
              backgroundColor: "rgba(16, 185, 129, 0.88)",
              hoverBackgroundColor: "#10b981",
              borderRadius: 6,
              barPercentage: 0.85,
              categoryPercentage: 0.34,
              maxBarThickness: 28,
              order: 2,
            },
            {
              type: "bar",
              label: `Egresos (${simbolo})`,
              yAxisID: "y",
              hidden: !mostrarEgresos,
              data: evolucion.map((e) => e.egresos),
              backgroundColor: "rgba(239, 68, 68, 0.88)",
              hoverBackgroundColor: "#ef4444",
              borderRadius: 6,
              barPercentage: 0.85,
              categoryPercentage: 0.34,
              maxBarThickness: 28,
              order: 3,
            },
          ],
        }
      : {
          labels,
          datasets: [
            lineSaldo,
            {
              type: "bar",
              label: `Ahorro Neto Mensual (${simbolo})`,
              yAxisID: "y",
              hidden: !mostrarNeto,
              data: evolucion.map((e) => e.neto),
              backgroundColor: evolucion.map((e) =>
                e.neto >= 0
                  ? "rgba(16, 185, 129, 0.88)"
                  : "rgba(239, 68, 68, 0.88)"
              ),
              hoverBackgroundColor: evolucion.map((e) =>
                e.neto >= 0 ? "#10b981" : "#ef4444"
              ),
              borderRadius: 6,
              barPercentage: 0.72,
              categoryPercentage: 0.36,
              maxBarThickness: 36,
              order: 2,
            },
          ],
        };

  const formatTick = (v: string | number) =>
    modoPrivacidad
      ? `${simbolo} •••`
      : `${simbolo} ${Number(v).toLocaleString("en-US")}`;

  const mostrarEjeIzq =
    modoVista === "flujo" ? mostrarIngresos || mostrarEgresos : mostrarNeto;

  const options: ChartOptions<"bar" | "line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#94a3b8", font: { family: '"DM Sans", sans-serif' } },
      },
      y: {
        type: "linear",
        position: "left",
        display: mostrarEjeIzq,
        grid: { color: "rgba(148, 163, 184, 0.1)" },
        ticks: {
          color: "#94a3b8",
          font: { family: '"DM Sans", sans-serif' },
          callback: formatTick,
        },
      },
      ySaldo: {
        type: "linear",
        position: "right",
        display: mostrarSaldo,
        grid: { drawOnChartArea: false },
        ticks: {
          color: "#94a3b8",
          font: { family: '"DM Sans", sans-serif' },
          callback: formatTick,
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(11, 17, 31, 0.96)",
        borderColor: "rgba(56, 189, 248, 0.35)",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (ctx) =>
            ` ${ctx.dataset.label}: ${
              modoPrivacidad
                ? `${simbolo} •••`
                : formatoMoneda(ctx.parsed.y ?? 0, moneda)
            }`,
          afterBody: (items) => {
            const idx = items[0]?.dataIndex;
            if (idx === undefined || !evolucion[idx]) return "";
            const mes = evolucion[idx];
            const tasa =
              mes.ingresos > 0
                ? `${((mes.neto / mes.ingresos) * 100).toFixed(1)}%`
                : "—";
            const signo = mes.neto >= 0 ? "+" : "";
            const lineas = [
              ` Ahorro neto: ${
                modoPrivacidad
                  ? `${simbolo} •••`
                  : `${signo}${formatoMoneda(mes.neto, moneda)}`
              } (Tasa: ${tasa})`,
            ];
            if (modoVista === "neto") {
              lineas.unshift(
                ` Ingresos: ${
                  modoPrivacidad
                    ? `${simbolo} •••`
                    : formatoMoneda(mes.ingresos, moneda)
                } · Egresos: ${
                  modoPrivacidad
                    ? `${simbolo} •••`
                    : formatoMoneda(mes.egresos, moneda)
                }`
              );
            }
            return "\n" + lineas.join("\n");
          },
        },
      },
    },
  };

  return { data, options };
}
