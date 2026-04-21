import type { Metadata } from "next";

import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata: Metadata = {
  title: "Tableau de bord | SahelStock AI",
  description:
    "Consultez les KPI, les graphiques, les alertes de rupture et les recommandations de SahelStock AI.",
};

export default function DashboardPage() {
  return <DashboardView />;
}
