"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  APP_NAME,
  DEMO_PRODUCTS_URL,
  DEMO_SALES_URL,
  REQUIRED_PRODUCT_COLUMNS,
  REQUIRED_SALES_COLUMNS,
} from "@/lib/constants";
import {
  parseProductsCsvText,
  parseProductsFile,
  parseSalesCsvText,
  parseSalesFile,
} from "@/lib/importers";
import { saveDataset } from "@/lib/storage";

export function UploadWorkspace() {
  const router = useRouter();
  const [productsFile, setProductsFile] = useState<File | null>(null);
  const [salesFile, setSalesFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canImport = useMemo(
    () => Boolean(productsFile && salesFile && !isLoading),
    [isLoading, productsFile, salesFile],
  );

  const persistData = async (
    productsInput: File | string,
    salesInput: File | string,
    source: "upload" | "demo",
  ) => {
    setIsLoading(true);
    setErrors([]);
    setSuccessMessage("");

    const productsResult =
      typeof productsInput === "string"
        ? await parseProductsCsvText(productsInput)
        : await parseProductsFile(productsInput);
    const salesResult =
      typeof salesInput === "string"
        ? await parseSalesCsvText(salesInput)
        : await parseSalesFile(salesInput);

    const nextErrors = [...productsResult.errors, ...salesResult.errors];
    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      setIsLoading(false);
      return;
    }

    saveDataset({
      products: productsResult.data,
      sales: salesResult.data,
      source,
      importedAt: new Date().toISOString(),
    });

    setSuccessMessage(
      source === "demo"
        ? "Données de démonstration chargées avec succès."
        : "Fichiers importés avec succès.",
    );
    setIsLoading(false);
    router.push("/dashboard");
  };

  const handleImport = async () => {
    if (!productsFile || !salesFile) {
      setErrors([
        "Veuillez sélectionner un fichier products et un fichier sales avant l'import.",
      ]);
      return;
    }

    await persistData(productsFile, salesFile, "upload");
  };

  const handleLoadDemo = async () => {
    setIsLoading(true);
    setErrors([]);
    setSuccessMessage("");

    try {
      const [productsResponse, salesResponse] = await Promise.all([
        fetch(DEMO_PRODUCTS_URL),
        fetch(DEMO_SALES_URL),
      ]);

      if (!productsResponse.ok || !salesResponse.ok) {
        throw new Error("Impossible de charger les fichiers de démonstration.");
      }

      const [productsText, salesText] = await Promise.all([
        productsResponse.text(),
        salesResponse.text(),
      ]);

      await persistData(productsText, salesText, "demo");
    } catch (error) {
      setErrors([
        error instanceof Error
          ? error.message
          : "Erreur lors du chargement de la démo.",
      ]);
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-blue-50 p-6 shadow-sm sm:p-8">
        <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
          Import de données
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Importez vos fichiers et obtenez un tableau de bord exploitable.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          {APP_NAME} accepte deux fichiers tabulaires: un fichier produits et un
          fichier ventes. L&apos;application valide les colonnes, nettoie les
          données et les conserve dans le navigateur via le stockage local.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleLoadDemo}
            disabled={isLoading}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isLoading ? "Chargement..." : "Charger une démo"}
          </button>
          <Link
            href="/dashboard"
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
          >
            Voir le tableau de bord
          </Link>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-slate-950">Fichiers attendus</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Les formats acceptés sont `.csv`, `.xlsx` et `.xls`.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-5">
              <label className="text-sm font-semibold text-slate-900">
                Fichier produits
              </label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(event) =>
                  setProductsFile(event.target.files?.[0] ?? null)
                }
                className="mt-4 block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-500"
              />
              <p className="mt-3 text-xs text-slate-500">
                Colonnes minimales : {REQUIRED_PRODUCT_COLUMNS.join(", ")}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <label className="text-sm font-semibold text-slate-900">
                Fichier ventes
              </label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(event) => setSalesFile(event.target.files?.[0] ?? null)}
                className="mt-4 block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-500"
              />
              <p className="mt-3 text-xs text-slate-500">
                Colonnes minimales : {REQUIRED_SALES_COLUMNS.join(", ")}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleImport}
              disabled={!canImport}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              Importer et analyser
            </button>
            <p className="self-center text-sm text-slate-500">
              Les données sont stockées localement dans votre navigateur.
            </p>
          </div>

          {errors.length > 0 ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <p className="font-semibold">Import impossible</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {successMessage ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {successMessage}
            </div>
          ) : null}
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Bonnes pratiques d&apos;import
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>Utilisez une ligne d&apos;en-tête unique et propre.</li>
              <li>Gardez les `sku` identiques entre produits et ventes.</li>
              <li>Vérifiez que les dates de ventes sont cohérentes.</li>
              <li>Évitez les cellules fusionnées dans les fichiers Excel.</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Ce que vous obtenez</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>KPI clés sur le stock, le chiffre d&apos;affaires et la marge.</li>
              <li>Graphiques lisibles pour une démonstration en cours.</li>
              <li>Alertes de rupture et suggestions de réapprovisionnement.</li>
              <li>Résumé intelligent en français avec fallback automatique.</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
