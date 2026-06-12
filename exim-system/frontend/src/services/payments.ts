import { apiRequest } from './api';
import type { Order } from './orders';

export interface Payment {
  id: string;
  invoiceNumber: string;
  orderId: string;
  order: Order;
  invoiceAmount: number;
  receivedAmount: number;
  pendingAmount: number;
  dueDate: string;
  status: 'Pending' | 'Partially Paid' | 'Paid';
  createdAt: string;
}

export async function fetchPayments(): Promise<Payment[]> {
  return apiRequest<Payment[]>('/payments');
}

export async function updatePaymentStatus(id: string, receivedAmount: number): Promise<Payment> {
  return apiRequest<Payment>(`/payments/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ receivedAmount }),
  });
}
