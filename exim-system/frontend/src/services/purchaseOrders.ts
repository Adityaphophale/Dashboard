import { apiRequest } from './api';
import type { Supplier } from './suppliers';
import type { Order } from './orders';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplier: Supplier;
  orderId: string;
  order: Order;
  currency: string;
  totalAmount: number;
  expectedDeliveryDate?: string;
  status: 'Created' | 'In Production' | 'Shipped' | 'Delivered';
  createdAt: string;
}

export async function fetchPurchaseOrders(): Promise<PurchaseOrder[]> {
  return apiRequest<PurchaseOrder[]>('/purchase-orders');
}

export async function createPurchaseOrder(data: {
  supplierId: string;
  orderId: string;
  totalAmount: number;
  expectedDeliveryDate?: string;
}): Promise<PurchaseOrder> {
  return apiRequest<PurchaseOrder>('/purchase-orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePOStatus(id: string, status: string): Promise<PurchaseOrder> {
  return apiRequest<PurchaseOrder>(`/purchase-orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}
