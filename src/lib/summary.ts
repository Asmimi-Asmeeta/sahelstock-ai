import type { SummaryPayload } from "@/lib/types";
import {
  formatCurrency,
  formatNumber,
  formatQuantityWithUnit,
  humanizeRiskLevel,
} from "@/lib/utils";

export function buildFallbackSummary(payload: SummaryPayload) {
  const topSeller = payload.topSellers[0];
  const firstRisk = payload.riskProducts[0];
  const firstReorder = payload.reorderSuggestions[0];
  const firstMargin = payload.marginOpportunities[0];

  const parts = [
    `Sur la période analysée, ${payload.storeName} suit ${formatNumber(payload.kpis.totalProducts)} produits pour un chiffre d'affaires total de ${formatCurrency(payload.kpis.totalRevenue)} et une marge estimée de ${formatCurrency(payload.kpis.estimatedMargin)}.`,
  ];

  if (topSeller) {
    parts.push(
      `La meilleure vente actuelle est ${topSeller.name} (${topSeller.sku}) avec ${formatQuantityWithUnit(topSeller.units, topSeller.unit)} commercialisées pour ${formatCurrency(topSeller.revenue)} de revenus.`,
    );
  }

  if (firstRisk) {
    parts.push(
      `Le produit à suivre en priorité est ${firstRisk.name} (${firstRisk.sku}) : stock actuel ${formatQuantityWithUnit(firstRisk.stock, firstRisk.unit)} contre un seuil minimum de ${formatQuantityWithUnit(firstRisk.minStock, firstRisk.unit)}, avec un niveau ${humanizeRiskLevel(firstRisk.riskLevel).toLowerCase()}.`,
    );
  }

  if (firstReorder) {
    parts.push(
      `Une action concrète consiste à recommander environ ${formatQuantityWithUnit(firstReorder.quantity, firstReorder.unit)} de ${firstReorder.name} auprès de ${firstReorder.supplier}.`,
    );
  }

  if (firstMargin) {
    parts.push(
      `Côté marge, ${firstMargin.name} apparaît comme une opportunité intéressante avec une marge estimée de ${formatCurrency(firstMargin.estimatedMargin)}.`,
    );
  }

  if (payload.riskProducts.length === 0) {
    parts.push(
      "Aucun produit ne présente actuellement un risque majeur de rupture, ce qui indique un stock globalement maîtrisé.",
    );
  }

  return parts.join(" ");
}
