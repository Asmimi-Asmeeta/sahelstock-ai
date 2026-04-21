import Papa from "papaparse";
import * as XLSX from "xlsx";

import {
  REQUIRED_PRODUCT_COLUMNS,
  REQUIRED_SALES_COLUMNS,
} from "@/lib/constants";
import type { Product, Sale } from "@/lib/types";
import { normalizeText, parseNumber } from "@/lib/utils";

type RawRow = Record<string, unknown>;

export type ParsedImport<T> = {
  data: T[];
  errors: string[];
};

function normalizeHeaders(row: RawRow) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key.trim().toLowerCase(),
      typeof value === "string" ? value.trim() : value,
    ]),
  );
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

async function readCsvFile(file: File) {
  const text = await file.text();
  const parsed = Papa.parse<RawRow>(text, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data.map(normalizeHeaders);
}

async function readSpreadsheetFile(file: File) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: "" });

  return rows.map(normalizeHeaders);
}

async function readRowsFromFile(file: File) {
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith(".csv")) {
    return readCsvFile(file);
  }

  if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
    return readSpreadsheetFile(file);
  }

  throw new Error(
    "Format non pris en charge. Utilisez un fichier CSV, XLSX ou XLS.",
  );
}

export async function parseProductsFile(file: File): Promise<ParsedImport<Product>> {
  try {
    const rows = await readRowsFromFile(file);
    const errors = validateRequiredColumns(
      rows,
      REQUIRED_PRODUCT_COLUMNS,
      "products",
    );

    if (errors.length > 0) {
      return { data: [], errors };
    }

    const data = rows
      .map((row) => ({
        sku: normalizeText(row.sku),
        name: normalizeText(row.name),
        category: normalizeText(row.category),
        costPrice: parseNumber(row.cost_price),
        sellPrice: parseNumber(row.sell_price),
        currentStock: parseNumber(row.current_stock),
        minStock: parseNumber(row.min_stock),
        supplier: normalizeText(row.supplier),
      }))
      .filter((product) => product.sku && product.name);

    if (data.length === 0) {
      return {
        data: [],
        errors: [
          "Le fichier products ne contient aucune ligne exploitable après nettoyage.",
        ],
      };
    }

    return { data, errors: [] };
  } catch (error) {
    return {
      data: [],
      errors: [error instanceof Error ? error.message : "Erreur de lecture produits."],
    };
  }
}

export async function parseSalesFile(file: File): Promise<ParsedImport<Sale>> {
  try {
    const rows = await readRowsFromFile(file);
    const errors = validateRequiredColumns(rows, REQUIRED_SALES_COLUMNS, "sales");

    if (errors.length > 0) {
      return { data: [], errors };
    }

    const data = rows
      .map((row) => ({
        date: normalizeText(row.date),
        sku: normalizeText(row.sku),
        unitsSold: parseNumber(row.units_sold),
        revenue: parseNumber(row.revenue),
      }))
      .filter((sale) => sale.date && sale.sku);

    if (data.length === 0) {
      return {
        data: [],
        errors: [
          "Le fichier sales ne contient aucune ligne exploitable après nettoyage.",
        ],
      };
    }

    return { data, errors: [] };
  } catch (error) {
    return {
      data: [],
      errors: [error instanceof Error ? error.message : "Erreur de lecture ventes."],
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
