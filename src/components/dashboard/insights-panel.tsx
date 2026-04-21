"use client";

import type { DashboardAnalysis } from "@/lib/types";
import {
  createCsv,
  downloadTextFile,
  formatCurrency,
  formatQuantityWithUnit,
  humanizeRiskLevel,
} from "@/lib/utils";

type InsightsPanelProps = {
  analysis: DashboardAnalysis;
  summary: string;
  summaryMode: "openai" | "fallback";
};

function riskBadge(level: string) {
  if (level === "eleve") {
    return "border border-slate-300 bg-slate-900 text-white";
  }

  if (level === "moyen") {
    return "border border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border border-slate-200 bg-slate-50 text-slate-700";
}

export function InsightsPanel({
  analysis,
  summary,
  summaryMode,
}: InsightsPanelProps) {
  const exportRecommendations = () => {
    const rows = [
      ["sku", "produit", "risque", "stock_actuel", "stock_minimum", "prevision_mois_suivant", "quantite_recommandee", "fournisseur"],
      ...analysis.reorderSuggestions.map((item) => [
        item.sku,
        item.name,
        humanizeRiskLevel(item.riskLevel),
        String(item.currentStock),
        String(item.minStock),
        String(item.forecastUnits),
        String(item.reorderQuantity),
        item.supplier,
      ]),
    ];

    downloadTextFile(
      "sahelstock-recommandations.csv",
      createCsv(rows),
    );
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
      <section className="panel-card p-5">
        <div className="flex items-start justify-between gap-4">
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
          <button
            type="button"
            onClick={exportRecommendations}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Export CSV
          </button>
        </div>

        <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
          {summary}
        </div>

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
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${riskBadge(item.riskLevel)}`}
                  >
                    {humanizeRiskLevel(item.riskLevel)}
                  </span>
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
              Aucun réassort prioritaire n&apos;est nécessaire pour le moment.
            </div>
          ) : (
            analysis.reorderSuggestions.map((item) => (
              <article
                key={item.sku}
                className="panel-card p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-slate-900">{item.name}</h4>
                    <p className="text-sm text-slate-500">
                      SKU {item.sku} · Fournisseur {item.supplier}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${riskBadge(item.riskLevel)}`}
                  >
                    {humanizeRiskLevel(item.riskLevel)}
                  </span>
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
