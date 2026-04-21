import Papa from "papaparse";
import * as XLSX from "xlsx";

import {
  REQUIRED_PRODUCT_COLUMNS,
  REQUIRED_SALES_COLUMNS,
} from "@/lib/constants";
import type { Product, Sale } from "@/lib/types";
import { normalizeText, normalizeUnit } from "@/lib/utils";

type RawRow = Record<string, unknown>;

type ParsedRows = {
  rows: RawRow[];
  errors: string[];
};

type ParsedNumber = {
  value: number;
  valid: boolean;
  empty: boolean;
};

export type ParsedImport<T> = {
  data: T[];
  errors: string[];
  warnings: string[];
};

function normalizeHeaders(row: RawRow) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key.trim().toLowerCase(),
      typeof value === "string" ? value.trim() : value,
    ]),
  );
}

function isBlankRow(row: RawRow) {
  return Object.values(row).every((value) => String(value ?? "").trim() === "");
}

function parseNumericField(value: unknown): ParsedNumber {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return {
      value: 0,
      valid: false,
      empty: true,
    };
  }

  const normalized = raw.replace(/\s/g, "").replace(",", ".");
  const parsed = Number(normalized);

  return {
    value: Number.isFinite(parsed) ? parsed : 0,
    valid: Number.isFinite(parsed),
    empty: false,
  };
}

function isValidDateValue(value: string) {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function validateRequiredColumns(
  rows: RawRow[],
  requiredColumns: readonly string[],
  label: string,
) {
  if (rows.length === 0) {
    return [`Le fichier ${label} est vide.`];
  }

  const headers = Object.keys(rows[0]);
  const missing = requiredColumns.filter((column) => !headers.includes(column));

  if (missing.length > 0) {
    return [
      `Le fichier ${label} est invalide. Colonnes manquantes : ${missing.join(", ")}.`,
    ];
  }

  return [];
}

async function readCsvFile(file: File): Promise<ParsedRows> {
  const text = await file.text();
  const parsed = Papa.parse<RawRow>(text, {
    header: true,
    skipEmptyLines: true,
  });

  const errors = parsed.errors.map((error) => {
    const line =
      typeof error.row === "number" ? ` à la ligne ${error.row + 2}` : "";
    return `Le fichier ${file.name} contient une erreur CSV${line} : ${error.message}.`;
  });

  return {
    rows: parsed.data.map(normalizeHeaders).filter((row) => !isBlankRow(row)),
    errors,
  };
}

async function readSpreadsheetFile(file: File): Promise<ParsedRows> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    return {
      rows: [],
      errors: [`Le fichier ${file.name} ne contient aucune feuille exploitable.`],
    };
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: "" });

  return {
    rows: rows.map(normalizeHeaders).filter((row) => !isBlankRow(row)),
    errors: [],
  };
}

async function readRowsFromFile(file: File): Promise<ParsedRows> {
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith(".csv")) {
    return readCsvFile(file);
  }

  if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
    return readSpreadsheetFile(file);
  }

  return {
    rows: [],
    errors: [
      "Format non pris en charge. Utilisez un fichier CSV, XLSX ou XLS.",
    ],
  };
}

function validateProductRow(
  row: RawRow,
  lineNumber: number,
  warnings: string[],
) {
  const sku = normalizeText(row.sku);
  const name = normalizeText(row.name);
  const category = normalizeText(row.category);
  const supplier = normalizeText(row.supplier);
  const costPrice = parseNumericField(row.cost_price);
  const sellPrice = parseNumericField(row.sell_price);
  const currentStock = parseNumericField(row.current_stock);
  const minStock = parseNumericField(row.min_stock);

  const lineErrors: string[] = [];

  if (!sku) {
    lineErrors.push(`Ligne ${lineNumber} : le SKU produit est obligatoire.`);
  }

  if (!name) {
    lineErrors.push(`Ligne ${lineNumber} : le nom produit est obligatoire.`);
  }

  if (!category) {
    lineErrors.push(`Ligne ${lineNumber} : la catégorie produit est obligatoire.`);
  }

  if (!supplier) {
    lineErrors.push(`Ligne ${lineNumber} : le fournisseur est obligatoire.`);
  }

  if (!costPrice.valid) {
    lineErrors.push(`Ligne ${lineNumber} : cost_price doit être numérique.`);
  }

  if (!sellPrice.valid) {
    lineErrors.push(`Ligne ${lineNumber} : sell_price doit être numérique.`);
  }

  if (!currentStock.valid) {
    lineErrors.push(`Ligne ${lineNumber} : current_stock doit être numérique.`);
  }

  if (!minStock.valid) {
    lineErrors.push(`Ligne ${lineNumber} : min_stock doit être numérique.`);
  }

  if (costPrice.valid && costPrice.value < 0) {
    lineErrors.push(`Ligne ${lineNumber} : cost_price ne peut pas être négatif.`);
  }

  if (sellPrice.valid && sellPrice.value < 0) {
    lineErrors.push(`Ligne ${lineNumber} : sell_price ne peut pas être négatif.`);
  }

  if (currentStock.valid && currentStock.value < 0) {
    lineErrors.push(`Ligne ${lineNumber} : current_stock ne peut pas être négatif.`);
  }

  if (minStock.valid && minStock.value < 0) {
    lineErrors.push(`Ligne ${lineNumber} : min_stock ne peut pas être négatif.`);
  }

  if (lineErrors.length > 0) {
    return {
      product: null,
      errors: lineErrors,
    };
  }

  if (sellPrice.value < costPrice.value) {
    warnings.push(
      `Ligne ${lineNumber} : le prix de vente du SKU ${sku} est inférieur au coût d'achat.`,
    );
  }

  if (minStock.value === 0) {
    warnings.push(
      `Ligne ${lineNumber} : le stock minimum du SKU ${sku} est à 0, ce qui limite la pertinence des alertes.`,
    );
  }

  return {
    product: {
      sku,
      name,
      category,
      costPrice: costPrice.value,
      sellPrice: sellPrice.value,
      currentStock: currentStock.value,
      minStock: minStock.value,
      supplier,
      unit: normalizeUnit(row.unit),
    } satisfies Product,
    errors: [],
  };
}

function validateSaleRow(
  row: RawRow,
  lineNumber: number,
  warnings: string[],
) {
  const date = normalizeText(row.date);
  const sku = normalizeText(row.sku);
  const unitsSold = parseNumericField(row.units_sold);
  const revenue = parseNumericField(row.revenue);

  const lineErrors: string[] = [];

  if (!date) {
    lineErrors.push(`Ligne ${lineNumber} : la date de vente est obligatoire.`);
  } else if (!isValidDateValue(date)) {
    lineErrors.push(`Ligne ${lineNumber} : la date "${date}" est invalide.`);
  }

  if (!sku) {
    lineErrors.push(`Ligne ${lineNumber} : le SKU vente est obligatoire.`);
  }

  if (!unitsSold.valid) {
    lineErrors.push(`Ligne ${lineNumber} : units_sold doit être numérique.`);
  }

  if (!revenue.valid) {
    lineErrors.push(`Ligne ${lineNumber} : revenue doit être numérique.`);
  }

  if (unitsSold.valid && unitsSold.value < 0) {
    lineErrors.push(`Ligne ${lineNumber} : units_sold ne peut pas être négatif.`);
  }

  if (revenue.valid && revenue.value < 0) {
    lineErrors.push(`Ligne ${lineNumber} : revenue ne peut pas être négatif.`);
  }

  if (lineErrors.length > 0) {
    return {
      sale: null,
      errors: lineErrors,
    };
  }

  if (unitsSold.value === 0 && revenue.value > 0) {
    warnings.push(
      `Ligne ${lineNumber} : la vente ${sku} a un chiffre d'affaires positif avec zéro unité vendue.`,
    );
  }

  if (unitsSold.value > 0 && revenue.value === 0) {
    warnings.push(
      `Ligne ${lineNumber} : la vente ${sku} a des unités vendues mais aucun revenu renseigné.`,
    );
  }

  return {
    sale: {
      date,
      sku,
      unitsSold: unitsSold.value,
      revenue: revenue.value,
    } satisfies Sale,
    errors: [],
  };
}

export async function parseProductsFile(file: File): Promise<ParsedImport<Product>> {
  try {
    const source = await readRowsFromFile(file);
    const errors = [
      ...source.errors,
      ...validateRequiredColumns(source.rows, REQUIRED_PRODUCT_COLUMNS, "produits"),
    ];
    const warnings: string[] = [];

    if (errors.length > 0) {
      return {
        data: [],
        errors,
        warnings,
      };
    }

    const data: Product[] = [];
    const seenSkus = new Set<string>();

    source.rows.forEach((row, index) => {
      const lineNumber = index + 2;
      const { product, errors: lineErrors } = validateProductRow(
        row,
        lineNumber,
        warnings,
      );

      if (lineErrors.length > 0 || !product) {
        errors.push(...lineErrors);
        return;
      }

      if (seenSkus.has(product.sku)) {
        errors.push(
          `Ligne ${lineNumber} : le SKU ${product.sku} est dupliqué dans le fichier produits.`,
        );
        return;
      }

      seenSkus.add(product.sku);
      data.push(product);
    });

    if (data.length === 0) {
      errors.push(
        "Le fichier produits ne contient aucune ligne exploitable après validation.",
      );
    }

    return { data, errors, warnings };
  } catch (error) {
    return {
      data: [],
      errors: [
        error instanceof Error ? error.message : "Erreur de lecture produits.",
      ],
      warnings: [],
    };
  }
}

export async function parseSalesFile(file: File): Promise<ParsedImport<Sale>> {
  try {
    const source = await readRowsFromFile(file);
    const errors = [
      ...source.errors,
      ...validateRequiredColumns(source.rows, REQUIRED_SALES_COLUMNS, "ventes"),
    ];
    const warnings: string[] = [];

    if (errors.length > 0) {
      return {
        data: [],
        errors,
        warnings,
      };
    }

    const data: Sale[] = [];

    source.rows.forEach((row, index) => {
      const lineNumber = index + 2;
      const { sale, errors: lineErrors } = validateSaleRow(
        row,
        lineNumber,
        warnings,
      );

      if (lineErrors.length > 0 || !sale) {
        errors.push(...lineErrors);
        return;
      }

      data.push(sale);
    });

    if (data.length === 0) {
      errors.push(
        "Le fichier ventes ne contient aucune ligne exploitable après validation.",
      );
    }

    return { data, errors, warnings };
  } catch (error) {
    return {
      data: [],
      errors: [error instanceof Error ? error.message : "Erreur de lecture ventes."],
      warnings: [],
    };
  }
}

export async function parseProductsCsvText(text: string) {
  const file = new File([text], "products.csv", { type: "text/csv" });
  return parseProductsFile(file);
}

export async function parseSalesCsvText(text: string) {
  const file = new File([text], "sales.csv", { type: "text/csv" });
  return parseSalesFile(file);
}
