"use client";

import type { DashboardAnalysis } from "@/lib/types";
import { downloadDashboardReport, downloadRecommendationsCsv } from "@/lib/reports";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import {
  formatCurrency,
  formatQuantityWithUnit,
  humanizeRiskLevel,
} from "@/lib/utils";

type InsightsPanelProps = {
  analysis: DashboardAnalysis;
  summary: string;
  summaryMode: "openai" | "fallback";
  sourceLabel: string;
  importedAt: string;
};

function riskBadge(level: string): BadgeTone {
  if (level === "eleve") {
    return "red";
  }

  if (level === "moyen") {
    return "amber";
  }

  return "emerald";
}

export function InsightsPanel({
  analysis,
  summary,
  summaryMode,
  sourceLabel,
  importedAt,
}: InsightsPanelProps) {
  const exportRecommendations = () => {
    downloadRecommendationsCsv(analysis);
  };

  const exportVisualReport = () => {
    downloadDashboardReport({
      analysis,
      summary,
      summaryMode,
      sourceLabel,
      importedAt,
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
      <section className="panel-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">
              Résumé intelligent en français
            </h3>
            <p className="text-sm text-slate-500">
              {summaryMode === "openai"
                ? "Résumé généré via API serveur."
                : "Résumé déterministe utilisé en mode fallback."}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={exportRecommendations}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              CSV brut
            </button>
            <button
              type="button"
              onClick={exportVisualReport}
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Rapport HTML
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
          {summary}
        </div>

        <p className="mt-3 text-xs leading-6 text-slate-500">
          Le CSV sert aux données brutes de réapprovisionnement. Le rapport HTML
          génère un livrable plus propre avec KPI, graphiques et tableaux.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="panel-card p-4">
            <h4 className="font-semibold text-slate-900">Top 5 ventes</h4>
            <ul className="mt-3 space-y-3 text-sm text-slate-600">
              {analysis.topSellers.map((item) => (
                <li key={item.sku} className="flex items-center justify-between gap-3">
                  <span>{item.name}</span>
                  <span className="font-medium text-slate-900">
                    {formatQuantityWithUnit(item.totalUnitsSold, item.unit)}
                  </span>
                </li>
              ))}
            </ul>
          </article>

          <article className="panel-card p-4">
            <h4 className="font-semibold text-slate-900">Produits à surveiller</h4>
            <ul className="mt-3 space-y-3 text-sm text-slate-600">
              {analysis.riskProducts.slice(0, 5).map((item) => (
                <li key={item.sku} className="flex items-center justify-between gap-3">
                  <span>{item.name}</span>
                  <Badge tone={riskBadge(item.riskLevel)}>
                    {humanizeRiskLevel(item.riskLevel)}
                  </Badge>
                </li>
              ))}
            </ul>
          </article>

          <article className="panel-card p-4">
            <h4 className="font-semibold text-slate-900">Opportunités de marge</h4>
            <ul className="mt-3 space-y-3 text-sm text-slate-600">
              {analysis.marginOpportunities.map((item) => (
                <li key={item.sku} className="flex items-center justify-between gap-3">
                  <span>{item.name}</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(item.estimatedMargin)}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="panel-card p-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-950">
            Réapprovisionnement suggéré
          </h3>
          <p className="text-sm text-slate-500">
            Quantités indicatives basées sur le stock minimum et la prévision.
          </p>
        </div>

        <div className="space-y-3">
          {analysis.reorderSuggestions.length === 0 ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              Aucun réapprovisionnement prioritaire n&apos;est nécessaire pour le moment.
            </div>
          ) : (
            analysis.reorderSuggestions.map((item) => (
              <article key={item.sku} className="panel-card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-slate-900">{item.name}</h4>
                    <p className="text-sm text-slate-500">
                      SKU {item.sku} · Fournisseur {item.supplier}
                    </p>
                  </div>
                  <Badge tone={riskBadge(item.riskLevel)} className="max-w-[10.5rem]">
                    {humanizeRiskLevel(item.riskLevel)}
                  </Badge>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-slate-500">Stock</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {formatQuantityWithUnit(item.currentStock, item.unit)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-slate-500">Prévision</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {formatQuantityWithUnit(item.forecastUnits, item.unit)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-slate-500">Réassort conseillé</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {formatQuantityWithUnit(item.reorderQuantity, item.unit)}
                    </p>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
