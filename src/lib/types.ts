export type Product = {
  sku: string;
  name: string;
  category: string;
  costPrice: number;
  sellPrice: number;
  currentStock: number;
  minStock: number;
  supplier: string;
  unit: string;
};

export type Sale = {
  date: string;
  sku: string;
  unitsSold: number;
  revenue: number;
};

export type StoredDataset = {
  products: Product[];
  sales: Sale[];
  source: "upload" | "demo";
  importedAt: string;
};

export type ImportNotice = {
  kind: "success" | "warning";
  message: string;
  details: string[];
};

export type RiskLevel = "faible" | "moyen" | "eleve";

export type ProductPerformance = {
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  totalUnitsSold: number;
  totalRevenue: number;
  estimatedMargin: number;
  forecastUnits: number;
  riskLevel: RiskLevel;
  reorderQuantity: number;
  supplier: string;
  unit: string;
};

export type KpiSummary = {
  totalProducts: number;
  totalStock: number;
  totalRevenue: number;
  estimatedMargin: number;
  productsAtRisk: number;
};

export type ChartPoint = {
  label: string;
  value: number;
  secondaryValue?: number;
};

export type DashboardAnalysis = {
  kpis: KpiSummary;
  monthlySales: ChartPoint[];
  topProducts: ChartPoint[];
  stockVsMinimum: ChartPoint[];
  riskDistribution: ChartPoint[];
  productPerformance: ProductPerformance[];
  topSellers: ProductPerformance[];
  riskProducts: ProductPerformance[];
  reorderSuggestions: ProductPerformance[];
  marginOpportunities: ProductPerformance[];
};

export type SummaryPayload = {
  storeName: string;
  kpis: KpiSummary;
  topSellers: Array<{
    name: string;
    sku: string;
    units: number;
    revenue: number;
    unit: string;
  }>;
  riskProducts: Array<{
    name: string;
    sku: string;
    stock: number;
    minStock: number;
    riskLevel: RiskLevel;
    unit: string;
  }>;
  reorderSuggestions: Array<{
    name: string;
    sku: string;
    quantity: number;
    supplier: string;
    unit: string;
  }>;
  marginOpportunities: Array<{
    name: string;
    sku: string;
    estimatedMargin: number;
  }>;
};

export type SummaryResponse = {
  summary: string;
  mode: "openai" | "fallback";
};
