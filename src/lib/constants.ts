export const APP_NAME = "SahelStock AI";
export const APP_TAGLINE =
  "Le suivi de stock et d'aide à la décision à partir de fichiers simples.";

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

export const PRODUCT_IMPORT_HEADER_HINTS = [
  "sku ou référence",
  "name ou nom",
  "category ou catégorie",
  "cost_price ou prix_achat",
  "sell_price ou prix_vente",
  "current_stock ou stock_actuel",
  "min_stock ou stock_minimum",
  "supplier ou fournisseur",
] as const;

export const SALES_IMPORT_HEADER_HINTS = [
  "date ou date_vente",
  "sku ou référence",
  "units_sold ou quantité_vendue",
  "revenue ou chiffre_affaires",
] as const;

export const DEMO_PRODUCTS_URL = "/demo/products.csv";
export const DEMO_SALES_URL = "/demo/sales.csv";

export const TEST_SCENARIO_PRODUCTS_URL = "/test-scenarios/produits-test-fr.csv";
export const TEST_SCENARIO_SALES_URL = "/test-scenarios/ventes-test-fr.csv";
