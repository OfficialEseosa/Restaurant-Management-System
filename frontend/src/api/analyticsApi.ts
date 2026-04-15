import api from './axios';

export interface RevenuePoint {
  date: string;
  revenue: number;
}

export interface TopItem {
  name: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface OrderVolumePoint {
  date: string;
  orderCount: number;
}

export interface InventoryForecastItem {
  ingredientName: string;
  unit: string;
  currentStock: number;
  estimatedDemand: number;
  belowThreshold: boolean;
}

// All four analytics endpoints — pass the same startDate/endDate pair to all three
// date-range endpoints, then pass lookbackDays (default 30) to the forecast endpoint.

export const getRevenue = (startDate: string, endDate: string) =>
  api
    .get<RevenuePoint[]>('/api/analytics/revenue', { params: { startDate, endDate } })
    .then(r => r.data);

export const getTopItems = (startDate: string, endDate: string) =>
  api
    .get<TopItem[]>('/api/analytics/top-items', { params: { startDate, endDate } })
    .then(r => r.data);

export const getOrderVolume = (startDate: string, endDate: string) =>
  api
    .get<OrderVolumePoint[]>('/api/analytics/order-volume', { params: { startDate, endDate } })
    .then(r => r.data);

export const getInventoryForecast = (lookbackDays = 30) =>
  api
    .get<InventoryForecastItem[]>('/api/analytics/inventory-forecast', {
      params: { lookbackDays },
    })
    .then(r => r.data);

/**
 * Fetch all four analytics datasets in parallel.
 * Pass the result straight to AnalyticsTab's four chart panels.
 */
export const getAllAnalytics = async (
  startDate: string,
  endDate: string,
  lookbackDays = 30,
) => {
  const [revenue, topItems, orderVolume, inventoryForecast] = await Promise.all([
    getRevenue(startDate, endDate),
    getTopItems(startDate, endDate),
    getOrderVolume(startDate, endDate),
    getInventoryForecast(lookbackDays),
  ]);
  return { revenue, topItems, orderVolume, inventoryForecast };
};
