"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DashboardAnalysis } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/utils";

type ChartsPanelProps = {
  analysis: DashboardAnalysis;
};

const riskColors = ["#16a34a", "#f59e0b", "#dc2626"];

function tooltipNumber(value: unknown) {
  return formatNumber(typeof value === "number" ? value : Number(value ?? 0));
}

function tooltipCurrency(value: unknown) {
  return formatCurrency(typeof value === "number" ? value : Number(value ?? 0));
}

export function ChartsPanel({ analysis }: ChartsPanelProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="panel-card p-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-950">Ventes par mois</h3>
          <p className="text-sm text-slate-500">
            Vue rapide de l&apos;évolution du chiffre d&apos;affaires.
          </p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analysis.monthlySales}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(value) => formatNumber(Number(value))} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => tooltipCurrency(value)} />
              <Bar dataKey="value" fill="#2563eb" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel-card p-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-950">Top produits</h3>
          <p className="text-sm text-slate-500">
            Les références les plus vendues en volume.
          </p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={analysis.topProducts}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="label"
                width={110}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value, name) =>
                  name === "secondaryValue"
                    ? tooltipCurrency(value)
                    : `${tooltipNumber(value)} unités`
                }
              />
              <Bar dataKey="value" fill="#0f766e" radius={[0, 10, 10, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel-card p-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-950">
            Stock actuel vs seuil minimum
          </h3>
          <p className="text-sm text-slate-500">
            Contrôle des niveaux de sécurité pour les produits sensibles.
          </p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analysis.stockVsMinimum}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={70}
              />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => `${tooltipNumber(value)} unités`} />
              <Legend />
              <Bar dataKey="value" name="Stock actuel" fill="#2563eb" radius={[10, 10, 0, 0]} />
              <Bar
                dataKey="secondaryValue"
                name="Stock minimum"
                fill="#f59e0b"
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel-card p-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-950">
            Produits en risque de rupture
          </h3>
          <p className="text-sm text-slate-500">
            Répartition des produits selon le niveau de risque.
          </p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analysis.riskDistribution}
                dataKey="value"
                nameKey="label"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
              >
                {analysis.riskDistribution.map((entry, index) => (
                  <Cell key={entry.label} fill={riskColors[index % riskColors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${tooltipNumber(value)} produits`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
