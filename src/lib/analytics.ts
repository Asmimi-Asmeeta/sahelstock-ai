import type {
  ChartPoint,
  DashboardAnalysis,
  Product,
  ProductPerformance,
  RiskLevel,
  Sale,
  SummaryPayload,
} from "@/lib/types";
import { formatMonthLabel, slugifyMonth } from "@/lib/utils";

function getMonthBuckets(sales: Sale[]) {
  const bucket = new Map<string, number>();

  sales.forEach((sale) => {
    const date = new Date(sale.date);
    if (Number.isNaN(date.getTime())) {
      return;
    }

    const key = slugifyMonth(date);
    bucket.set(key, (bucket.get(key) ?? 0) + sale.revenue);
  });

  return [...bucket.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => ({
      label: formatMonthLabel(key),
      value: Math.round(value),
    }));
}

function getSalesBySku(sales: Sale[]) {
  const map = new Map<
    string,
    {
      units: number;
      revenue: number;
      months: Map<string, number>;
    }
  >();

  sales.forEach((sale) => {
    const date = new Date(sale.date);
    if (Number.isNaN(date.getTime())) {
      return;
    }

    const monthKey = slugifyMonth(date);
    const current = map.get(sale.sku) ?? {
      units: 0,
      revenue: 0,
      months: new Map<string, number>(),
    };

    current.units += sale.unitsSold;
    current.revenue += sale.revenue;
    current.months.set(monthKey, (current.months.get(monthKey) ?? 0) + sale.unitsSold);
    map.set(sale.sku, current);
  });

  return map;
}

function forecastNextMonth(monthMap: Map<string, number>) {
  const history = [...monthMap.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, units]) => units);

  if (history.length >= 3) {
    const latest = history.at(-1) ?? 0;
    const previous = history.at(-2) ?? 0;
    const third = history.at(-3) ?? 0;

    return Math.max(1, Math.round(latest * 0.5 + previous * 0.3 + third * 0.2));
  }

  if (history.length === 2) {
    return Math.max(1, Math.round((history[0] + history[1]) / 2));
  }

  if (history.length === 1) {
    return Math.max(1, Math.round(history[0]));
  }

  return 0;
}

function getRiskLevel(
  currentStock: number,
  minStock: number,
  forecastUnits: number,
): RiskLevel {
  const monthlyNeed = Math.max(forecastUnits, minStock, 1);
  const coverageRatio = currentStock / monthlyNeed;

  if (currentStock <= minStock || coverageRatio < 0.8) {
    return "eleve";
  }

  if (coverageRatio < 1.5) {
    return "moyen";
  }

  return "faible";
}

function buildProductPerformance(products: Product[], sales: Sale[]) {
  const salesBySku = getSalesBySku(sales);

  return products.map<ProductPerformance>((product) => {
    const salesStats = salesBySku.get(product.sku);
    const totalUnitsSold = salesStats?.units ?? 0;
    const totalRevenue = Math.round(salesStats?.revenue ?? 0);
    const estimatedMargin = Math.round(
      totalRevenue - totalUnitsSold * product.costPrice,
    );
    const forecastUnits = forecastNextMonth(salesStats?.months ?? new Map());
    const riskLevel = getRiskLevel(
      product.currentStock,
      product.minStock,
      forecastUnits,
    );

    // On ajoute une petite marge de sécurité pour rester crédible sans complexifier.
    const reorderQuantity = Math.max(
      0,
      Math.ceil(product.minStock + forecastUnits * 1.1 - product.currentStock),
    );

    return {
      sku: product.sku,
      name: product.name,
      category: product.category,
      currentStock: product.currentStock,
      minStock: product.minStock,
      totalUnitsSold,
      totalRevenue,
      estimatedMargin,
      forecastUnits,
      riskLevel,
      reorderQuantity,
      supplier: product.supplier,
      unit: product.unit,
    };
  });
}

function riskDistribution(rows: ProductPerformance[]): ChartPoint[] {
  const counts = {
    faible: 0,
    moyen: 0,
    eleve: 0,
  };

  rows.forEach((row) => {
    counts[row.riskLevel] += 1;
  });

  return [
    { label: "Stock correct", value: counts.faible },
    { label: "À surveiller", value: counts.moyen },
    { label: "Rupture probable", value: counts.eleve },
  ];
}

export function analyzeBusinessData(
  products: Product[],
  sales: Sale[],
): DashboardAnalysis {
  const productPerformance = buildProductPerformance(products, sales).sort(
    (left, right) => right.totalRevenue - left.totalRevenue,
  );

  const totalStock = products.reduce(
    (sum, product) => sum + product.currentStock,
    0,
  );
  const totalRevenue = productPerformance.reduce(
    (sum, product) => sum + product.totalRevenue,
    0,
  );
  const estimatedMargin = productPerformance.reduce(
    (sum, product) => sum + product.estimatedMargin,
    0,
  );
  const riskProducts = productPerformance.filter(
    (product) => product.riskLevel !== "faible",
  );

  return {
    kpis: {
      totalProducts: products.length,
      totalStock,
      totalRevenue,
      estimatedMargin,
      productsAtRisk: riskProducts.length,
    },
    monthlySales: getMonthBuckets(sales),
    topProducts: productPerformance.slice(0, 5).map((product) => ({
      label: product.name,
      value: product.totalUnitsSold,
      secondaryValue: product.totalRevenue,
    })),
    stockVsMinimum: productPerformance.slice(0, 8).map((product) => ({
      label: product.name,
      value: product.currentStock,
      secondaryValue: product.minStock,
    })),
    riskDistribution: riskDistribution(productPerformance),
    productPerformance,
    topSellers: productPerformance.slice(0, 5),
    riskProducts: riskProducts.sort((left, right) => {
      const scoreLeft =
        (left.riskLevel === "eleve" ? 2 : 1) + left.reorderQuantity / 100;
      const scoreRight =
        (right.riskLevel === "eleve" ? 2 : 1) + right.reorderQuantity / 100;
      return scoreRight - scoreLeft;
    }),
    reorderSuggestions: productPerformance
      .filter((product) => product.reorderQuantity > 0)
      .sort((left, right) => right.reorderQuantity - left.reorderQuantity)
      .slice(0, 8),
    marginOpportunities: [...productPerformance]
      .sort((left, right) => right.estimatedMargin - left.estimatedMargin)
      .slice(0, 5),
  };
}

export function buildSummaryPayload(
  analysis: DashboardAnalysis,
  storeName = "SahelStock AI",
): SummaryPayload {
  return {
    storeName,
    kpis: analysis.kpis,
    topSellers: analysis.topSellers.map((item) => ({
      name: item.name,
      sku: item.sku,
      units: item.totalUnitsSold,
      revenue: item.totalRevenue,
      unit: item.unit,
    })),
    riskProducts: analysis.riskProducts.slice(0, 5).map((item) => ({
      name: item.name,
      sku: item.sku,
      stock: item.currentStock,
      minStock: item.minStock,
      riskLevel: item.riskLevel,
      unit: item.unit,
    })),
    reorderSuggestions: analysis.reorderSuggestions.slice(0, 5).map((item) => ({
      name: item.name,
      sku: item.sku,
      quantity: item.reorderQuantity,
      supplier: item.supplier,
      unit: item.unit,
    })),
    marginOpportunities: analysis.marginOpportunities.map((item) => ({
      name: item.name,
      sku: item.sku,
      estimatedMargin: item.estimatedMargin,
    })),
  };
}
