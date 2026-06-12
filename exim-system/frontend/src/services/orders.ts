import { apiRequest } from './api';
import type { Customer } from './customers';
import type { Product } from './products';

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer: Customer;
  quotationId?: string;
  currency: string;
  totalAmount: number;
  advanceAmount: number;
  balanceAmount: number;
  paymentTerms: string;
  incoterms: string;
  status: 'Confirmed' | 'Production In Process' | 'Shipment Ready' | 'Shipped' | 'Delivered';
  expectedDispatchDate: string;
  items: OrderItem[];
  createdAt: string;
}

export async function fetchOrders(): Promise<Order[]> {
  return apiRequest<Order[]>('/orders');
}

export async function createOrder(data: {
  customerId: string;
  currency: string;
  totalAmount?: number;
  advanceAmount?: number;
  paymentTerms: string;
  incoterms: string;
  expectedDispatchDate: string;
  items: { productId: string; quantity: number; unitPrice?: number }[];
}): Promise<Order> {
  return apiRequest<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateOrderStatus(id: string, status: string): Promise<Order> {
  return apiRequest<Order>(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}
