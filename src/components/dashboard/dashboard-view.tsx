"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { buildSummaryPayload, analyzeBusinessData } from "@/lib/analytics";
import { buildFallbackSummary } from "@/lib/summary";
import { clearDataset, loadDataset } from "@/lib/storage";
import type { SummaryResponse } from "@/lib/types";
import {
  formatCurrencyCompact,
  formatDateTime,
  formatNumber,
} from "@/lib/utils";
import { ChartsPanel } from "@/components/dashboard/charts-panel";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";

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
        <div className="panel-card p-8">
          <p className="text-sm text-slate-500">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (!dataset || !analysis) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
        <section className="panel-card p-8 text-center">
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
            Tableau de bord vide
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
            Aucune donnée n&apos;a encore été importée.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Importez vos fichiers produits et ventes, ou chargez la démo pour
            visualiser immédiatement le fonctionnement de l&apos;application.
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
      <RevealOnScroll>
        <section className="panel-card bg-gradient-to-br from-white to-slate-50 p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Tableau de bord
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Décisions rapides pour votre stock et vos ventes.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                Source :{" "}
                <span className="font-medium text-slate-800">
                  {dataset.source === "demo" ? "Démo intégrée" : "Fichiers importés"}
                </span>
                {" · "}
                Mise à jour :{" "}
                <span className="font-medium text-slate-800">
                  {formatDateTime(dataset.importedAt)}
                </span>
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
      </RevealOnScroll>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            {
              label: "Produits suivis",
              value: formatNumber(analysis.kpis.totalProducts),
              helper: "Nombre total de références importées.",
              accent: false,
            },
            {
              label: "Stock total",
              value: formatNumber(analysis.kpis.totalStock),
              helper: "Somme des quantités disponibles, toutes unités confondues.",
              accent: false,
            },
            {
              label: "Chiffre d'affaires",
              value: formatCurrencyCompact(analysis.kpis.totalRevenue),
              helper: "Total des revenus observés sur la période.",
              accent: true,
            },
            {
              label: "Marge estimée",
              value: formatCurrencyCompact(analysis.kpis.estimatedMargin),
              helper: "Estimation basée sur le prix de vente, le coût et les ventes.",
              accent: false,
            },
            {
              label: "Produits à surveiller",
              value: formatNumber(analysis.kpis.productsAtRisk),
              helper: "Références avec un niveau à surveiller ou une rupture probable.",
              accent: analysis.kpis.productsAtRisk > 0,
            },
          ].map((item, index) => (
            <RevealOnScroll key={item.label} delay={index * 70}>
              <KpiCard
                label={item.label}
                value={item.value}
                helper={item.helper}
                accent={item.accent}
              />
            </RevealOnScroll>
          ))}
      </section>

      <RevealOnScroll>
        <ChartsPanel analysis={analysis} />
      </RevealOnScroll>
      <RevealOnScroll delay={100}>
        <InsightsPanel
          analysis={analysis}
          summary={summary}
          summaryMode={summaryMode}
        />
      </RevealOnScroll>
    </div>
  );
}
