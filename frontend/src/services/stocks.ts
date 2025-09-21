import { api } from "@/lib/axios";

// Tipos (opcional pero recomendado)
export type Category = { id: number; name: string; is_active: boolean };
export type Stock = {
  id: number;
  symbol: string;
  name: string;
  last_price: string | null;   
  variation: string | null;
  updated_at: string | null;
  created_at: string;
  category: Category | null;
};

// --- STOCKS ---
export async function getActiveStocks() {
  const { data } = await api.get<Stock[]>("/stocks/active/");
  return data;
}

export async function getStockByName(name: string) {
  const { data } = await api.get<Stock>("/stocks/by-name/", { params: { name } });
  return data;
}

export async function getStocksByCategory(category: string) {
  const { data } = await api.get<Stock[]>("/stocks/by-category/", { params: { category } });
  return data;
}

export async function getStocksByPriceRange(min?: number, max?: number) {
  const { data } = await api.get<Stock[]>("/stocks/by-price-range/", { params: { min, max } });
  return data;
}

// --- CATEGORIES ---
export async function listActiveCategories() {
  const { data } = await api.get<Category[]>("/stocks/categories/");
  return data;
}

export async function createCategory(name: string) {
  const { data } = await api.post<Category>("/stocks/categories/save/", { name });
  return data;
}

export async function deleteCategoryById(id: number) {
  const { data } = await api.delete<boolean>("/stocks/categories/delete/", { params: { id } });
  return data;
}
