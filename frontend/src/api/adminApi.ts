import api from './axios';

// ---------- Ingredients ----------

export interface Ingredient {
  ingredientId: number;
  name: string;
  unit: string;
  imageUrl: string;
}

export interface NewIngredient {
  name: string;
  unit: string;
  imageUrl: string;
}

export const getAllIngredients = () =>
  api.get<Ingredient[]>('/api/ingredients').then(r => r.data);

export const createIngredient = (payload: NewIngredient) =>
  api.post<Ingredient>('/api/ingredients', payload).then(r => r.data);

export const updateIngredient = (id: number, payload: NewIngredient) =>
  api.put<Ingredient>(`/api/ingredients/${id}`, payload).then(r => r.data);

export const deleteIngredient = (id: number) =>
  api.delete(`/api/ingredients/${id}`).then(r => r.data);

// ---------- Inventory ----------

export interface InventoryRecord {
  ingredientId: number;
  quantityOnHand: number;
}

// Joined view used in IngredientsTab (built client-side from two API calls)
export interface IngredientWithStock extends Ingredient {
  quantityOnHand: number;
}

export const getAllInventory = () =>
  api.get<InventoryRecord[]>('/api/inventory').then(r => r.data);

export const updateStock = (ingredientId: number, quantityOnHand: number) =>
  api.put<InventoryRecord>(`/api/inventory/${ingredientId}`, { quantityOnHand }).then(r => r.data);

/**
 * Fetch ingredients + inventory in parallel and join them by ingredientId.
 * Use this in IngredientsTab to avoid two separate loading states.
 */
export const getIngredientsWithStock = async (): Promise<IngredientWithStock[]> => {
  const [ingredients, inventory] = await Promise.all([
    getAllIngredients(),
    getAllInventory(),
  ]);
  const stockMap = new Map(inventory.map(inv => [inv.ingredientId, inv.quantityOnHand]));
  return ingredients.map(ing => ({
    ...ing,
    quantityOnHand: stockMap.get(ing.ingredientId) ?? 0,
  }));
};

// ---------- Stock change log ----------

export interface StockChangeLogPayload {
  adminUser: { userId: number };
  ingredient: { ingredientId: number };
  changeAmount: number;
}

export const logStockChange = (payload: StockChangeLogPayload) =>
  api.post('/api/stock-change-logs', payload).then(r => r.data);

/**
 * Update stock AND log the change in one call.
 * oldQuantity is needed to compute the delta for the log entry.
 */
export const updateStockWithLog = async (
  ingredientId: number,
  newQuantity: number,
  oldQuantity: number,
  adminUserId: number,
) => {
  await updateStock(ingredientId, newQuantity);
  await logStockChange({
    adminUser: { userId: adminUserId },
    ingredient: { ingredientId },
    changeAmount: newQuantity - oldQuantity,
  });
};
