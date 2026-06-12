import { apiRequest } from './api';
import type { Customer } from './customers';
import type { Product } from './products';

export interface Inquiry {
  id: string;
  inquiryNumber: string;
  customerId: string;
  customer: Customer;
  productId: string;
  product: Product;
  quantity: number;
  targetPrice: number;
  notes?: string;
  status: 'Received' | 'Discussion' | 'Quoted' | 'Order' | 'Accepted' | 'Declined';
  createdAt: string;
}

export interface Lead {
  id: string;
  leadNumber: string;
  customerId?: string;
  customer?: Customer;
  source: string;
  assignedTo?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost';
  notes?: string;
  createdAt: string;
}

export async function fetchInquiries(): Promise<Inquiry[]> {
  return apiRequest<Inquiry[]>('/inquiries');
}

export async function createInquiry(data: Partial<Inquiry>): Promise<Inquiry> {
  return apiRequest<Inquiry>('/inquiries', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateInquiry(id: string, data: Partial<Inquiry>): Promise<Inquiry> {
  return apiRequest<Inquiry>(`/inquiries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function fetchLeads(): Promise<Lead[]> {
  return apiRequest<Lead[]>('/leads');
}

export async function createLead(data: Partial<Lead>): Promise<Lead> {
  return apiRequest<Lead>('/leads', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
  return apiRequest<Lead>(`/leads/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
