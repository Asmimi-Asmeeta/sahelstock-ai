import { STORAGE_KEY } from "@/lib/constants";
import type { ImportNotice, StoredDataset } from "@/lib/types";

const IMPORT_NOTICE_KEY = `${STORAGE_KEY}.notice`;

export function saveDataset(dataset: StoredDataset) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataset));
}

export function loadDataset() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredDataset;
  } catch {
    return null;
  }
}

export function clearDataset() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
}

export function saveImportNotice(notice: ImportNotice) {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(IMPORT_NOTICE_KEY, JSON.stringify(notice));
}

export function consumeImportNotice() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(IMPORT_NOTICE_KEY);
  if (!raw) {
    return null;
  }

  sessionStorage.removeItem(IMPORT_NOTICE_KEY);

  try {
    return JSON.parse(raw) as ImportNotice;
  } catch {
    return null;
  }
}
