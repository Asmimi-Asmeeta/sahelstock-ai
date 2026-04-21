import { STORAGE_KEY } from "@/lib/constants";
import type { StoredDataset } from "@/lib/types";

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
