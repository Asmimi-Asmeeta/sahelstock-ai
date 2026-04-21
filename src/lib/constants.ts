export const APP_NAME = "SahelStock AI";
export const APP_TAGLINE =
  "Le mini SaaS qui transforme vos fichiers de stock en décisions simples.";

export const STORAGE_KEY = "sahelstock-ai.dataset";

export const REQUIRED_PRODUCT_COLUMNS = [
  "sku",
  "name",
  "category",
  "cost_price",
  "sell_price",
  "current_stock",
  "min_stock",
  "supplier",
] as const;

export const REQUIRED_SALES_COLUMNS = [
  "date",
  "sku",
  "units_sold",
  "revenue",
] as const;

export const DEMO_PRODUCTS_URL = "/demo/products.csv";
export const DEMO_SALES_URL = "/demo/sales.csv";
