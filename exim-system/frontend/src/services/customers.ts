import { apiRequest } from './api';

export interface Customer {
  id: string;
  customerCode: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  country: string;
  address: string;
  gstVatNumber?: string;
  status: 'active' | 'inactive' | 'blocked';
  outstandingBalance: number;
}

export async function fetchCustomers(filters: { search?: string; status?: string } = {}): Promise<Customer[]> {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);
  
  return apiRequest<Customer[]>(`/customers?${params.toString()}`);
}

export async function fetchCustomerById(id: string): Promise<Customer> {
  return apiRequest<Customer>(`/customers/${id}`);
}

export async function createCustomer(data: Omit<Customer, 'id' | 'customerCode' | 'outstandingBalance'>): Promise<Customer> {
  return apiRequest<Customer>('/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
  return apiRequest<Customer>(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCustomer(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/customers/${id}`, {
    method: 'DELETE',
  });
}
