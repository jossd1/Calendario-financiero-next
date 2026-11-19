import PinLockScreen from "@/components/PinLockScreen";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { compilarEstadoDashboard } from "@/lib/dashboard";
import { estaAppBloqueada } from "@/lib/pin";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    vista?: string;
    fecha?: string;
    generalConsolidado?: string;
  }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  if (await estaAppBloqueada()) {
    return <PinLockScreen />;
  }

  const params = await searchParams;
  const estadoInicial = await compilarEstadoDashboard({
    vista: params.vista,
    fecha: params.fecha,
    generalConsolidado: params.generalConsolidado,
  });

  return <DashboardClient initialEstado={estadoInicial} />;
}