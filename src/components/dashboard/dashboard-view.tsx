"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { buildSummaryPayload, analyzeBusinessData } from "@/lib/analytics";
import { buildFallbackSummary } from "@/lib/summary";
import { clearDataset, loadDataset } from "@/lib/storage";
import type { SummaryResponse } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { ChartsPanel } from "@/components/dashboard/charts-panel";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { KpiCard } from "@/components/dashboard/kpi-card";

export function DashboardView() {
  const isClient = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const [serverSummary, setServerSummary] = useState<string | null>(null);
  const [summaryMode, setSummaryMode] = useState<"openai" | "fallback">("fallback");
  const [resetMessage, setResetMessage] = useState("");

  const dataset = useMemo(() => {
    if (!isClient) {
      return null;
    }

    return loadDataset();
  }, [isClient]);

  const analysis = useMemo(() => {
    if (!dataset) {
      return null;
    }

    return analyzeBusinessData(dataset.products, dataset.sales);
  }, [dataset]);

  useEffect(() => {
    if (!analysis) {
      return;
    }

    const payload = buildSummaryPayload(analysis);
    let isCancelled = false;

    void fetch("/api/summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Résumé serveur indisponible");
        }

        return (await response.json()) as SummaryResponse;
      })
      .then((response) => {
        if (isCancelled) {
          return;
        }

        setServerSummary(response.summary);
        setSummaryMode(response.mode);
      })
      .catch(() => {
        if (isCancelled) {
          return;
        }

        setServerSummary(null);
        setSummaryMode("fallback");
      });

    return () => {
      isCancelled = true;
    };
  }, [analysis]);

  const fallbackSummary = useMemo(() => {
    if (!analysis) {
      return "Le résumé sera généré dès que des données valides seront disponibles.";
    }

    return buildFallbackSummary(buildSummaryPayload(analysis));
  }, [analysis]);

  const summary = serverSummary ?? fallbackSummary;

  const handleReset = () => {
    clearDataset();
    setResetMessage("Les données locales ont été supprimées.");
    setTimeout(() => setResetMessage(""), 2500);
    window.location.reload();
  };

  if (!isClient) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-slate-500">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (!dataset || !analysis) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
            Tableau de bord vide
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
            Aucune donnée n&apos;a encore été importée.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Importez vos fichiers produits et ventes, ou chargez la démo pour
            visualiser immédiatement le fonctionnement du MVP.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/upload"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Aller à l&apos;import
            </Link>
            <Link
              href="/"
              className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-emerald-50 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Tableau de bord
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Décisions rapides pour votre stock et vos ventes.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              Source: {dataset.source === "demo" ? "mode démonstration" : "fichiers importés"} ·
              dernière mise à jour le{" "}
              {new Date(dataset.importedAt).toLocaleString("fr-FR")}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/upload"
              className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              Remplacer les données
            </Link>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Effacer les données
            </button>
          </div>
        </div>
        {resetMessage ? (
          <p className="mt-4 text-sm font-medium text-emerald-700">{resetMessage}</p>
        ) : null}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          label="Produits suivis"
          value={formatNumber(analysis.kpis.totalProducts)}
          helper="Nombre total de références importées."
        />
        <KpiCard
          label="Stock total"
          value={formatNumber(analysis.kpis.totalStock)}
          helper="Somme des quantités actuellement disponibles."
        />
        <KpiCard
          label="Chiffre d'affaires"
          value={formatCurrency(analysis.kpis.totalRevenue)}
          helper="Total des revenus observés dans le fichier ventes."
        />
        <KpiCard
          label="Marge estimée"
          value={formatCurrency(analysis.kpis.estimatedMargin)}
          helper="Estimation basée sur prix de vente, coût et ventes."
        />
        <KpiCard
          label="Produits à risque"
          value={formatNumber(analysis.kpis.productsAtRisk)}
          helper="Références avec risque faible exclu."
        />
      </section>

      <ChartsPanel analysis={analysis} />
      <InsightsPanel
        analysis={analysis}
        summary={summary}
        summaryMode={summaryMode}
      />
    </div>
  );
}
