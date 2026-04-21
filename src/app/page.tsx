import Link from "next/link";

import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-900 to-slate-900 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-blue-100">
              MVP académique UA3
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
              {APP_NAME}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-200">
              {APP_TAGLINE}
            </p>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300">
              Conçu pour les petits marchands du Niger qui vendent via WhatsApp,
              Facebook ou petite boutique, et qui veulent passer d&apos;un suivi
              manuel à un pilotage simple, clair et démontrable.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/upload"
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Importer mes fichiers
              </Link>
              <Link
                href="/upload"
                className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Charger une démo
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">
              Ce que montre l&apos;application
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                "Import CSV et Excel",
                "Tableau de bord mobile-first",
                "Alertes de rupture",
                "Prévision légère des ventes",
                "Résumé intelligent en français",
                "Export CSV des recommandations",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-slate-100"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Le problème",
            text: "Beaucoup de petits commerçants suivent encore les produits, les ventes et les ruptures dans des feuilles dispersées ou à la main.",
          },
          {
            title: "La solution",
            text: "SahelStock AI transforme des fichiers tabulaires simples en indicateurs utiles, graphiques, alertes et suggestions concrètes.",
          },
          {
            title: "Le bénéfice",
            text: "Gagner du temps, mieux anticiper les ruptures, identifier les meilleures ventes et préparer les réapprovisionnements.",
          },
        ].map((item) => (
          <article
            key={item.title}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-slate-950">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Fonctionnalités clés
          </span>
          <ul className="mt-5 grid gap-4 text-sm leading-7 text-slate-600">
            <li>Import des fichiers `products` et `sales` en CSV ou Excel.</li>
            <li>Validation des colonnes avec messages d&apos;erreur clairs.</li>
            <li>KPI sur stock, chiffre d&apos;affaires, marge et risques.</li>
            <li>Graphiques Recharts pour une démonstration fluide.</li>
            <li>Prévision simple du mois suivant par SKU.</li>
            <li>Suggestions de réapprovisionnement exportables en CSV.</li>
          </ul>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Pricing fictif
          </span>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-lg font-semibold text-slate-950">Formule Démo</h3>
              <p className="mt-2 text-3xl font-bold text-slate-950">0 FCFA</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Import manuel, tableau de bord simple et résumé de base.
              </p>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <h3 className="text-lg font-semibold text-slate-950">Formule Pro</h3>
              <p className="mt-2 text-3xl font-bold text-slate-950">4 900 FCFA</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Option fictive pour illustrer une évolution SaaS crédible.
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
        <h2 className="text-2xl font-bold tracking-tight text-slate-950">
          Prêt à tester le MVP ?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Chargez vos propres fichiers ou utilisez les données de démonstration pour
          voir immédiatement les KPI, alertes et recommandations.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/upload"
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Lancer la démo
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Voir le dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
