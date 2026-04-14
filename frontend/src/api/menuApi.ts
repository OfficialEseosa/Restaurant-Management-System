import api from './axios';

export interface MenuItem {
  menuItemId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  active: boolean;
}

export interface MenuItemWithAvailability extends MenuItem {
  available: boolean;
}

export interface NewMenuItem {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  active: boolean;
}

export interface MenuItemIngredientPayload {
  menuItem: { menuItemId: number };
  ingredient: { ingredientId: number };
  quantityRequired: number;
}

// Customer: menu items with live availability
export const getMenuItemsWithAvailability = () =>
  api.get<MenuItemWithAvailability[]>('/api/menu-items/availability').then(r => r.data);

// Admin: all menu items (no availability field)
export const getAllMenuItems = () =>
  api.get<MenuItem[]>('/api/menu-items').then(r => r.data);

export const createMenuItem = (payload: NewMenuItem) =>
  api.post<MenuItem>('/api/menu-items', payload).then(r => r.data);

export const updateMenuItem = (id: number, payload: Partial<NewMenuItem>) =>
  api.put<MenuItem>(`/api/menu-items/${id}`, payload).then(r => r.data);

// Soft-delete: set active: false — never call DELETE on menu items
export const deactivateMenuItem = (id: number, current: NewMenuItem) =>
  updateMenuItem(id, { ...current, active: false });

// Assign an ingredient to a menu item (call once per ingredient in a loop after creating the item)
export const assignIngredientToMenuItem = (payload: MenuItemIngredientPayload) =>
  api.post('/api/menu-item-ingredients', payload).then(r => r.data);
