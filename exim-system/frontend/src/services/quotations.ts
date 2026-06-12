import { apiRequest } from './api';
import type { Customer } from './customers';
import type { Product } from './products';

export interface QuotationItem {
  id?: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customer: Customer;
  currency: string;
  subTotal: number;
  taxTotal: number;
  grandTotal: number;
  validUntil: string;
  revision: number;
  status: 'Draft' | 'Sent' | 'Approved' | 'Declined';
  items: QuotationItem[];
  createdAt: string;
}

export async function fetchQuotations(): Promise<Quotation[]> {
  return apiRequest<Quotation[]>('/quotations');
}

export async function createQuotation(data: {
  customerId: string;
  currency: string;
  validUntil: string;
  taxRate: number;
  items: { productId: string; quantity: number; unitPrice?: number }[];
}): Promise<Quotation> {
  return apiRequest<Quotation>('/quotations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateQuotationStatus(id: string, status: string): Promise<Quotation> {
  return apiRequest<Quotation>(`/quotations/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function convertQuotationToOrder(
  id: string,
  details: { paymentTerms: string; incoterms: string; expectedDispatchDate: string }
): Promise<any> {
  return apiRequest<any>(`/quotations/${id}/convert-to-order`, {
    method: 'POST',
    body: JSON.stringify(details),
  });
}
