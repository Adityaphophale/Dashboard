import { apiRequest } from './api';

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  country: string;
  email: string;
  phone: string;
}

export async function fetchSuppliers(): Promise<Supplier[]> {
  return apiRequest<Supplier[]>('/suppliers');
}

export async function createSupplier(data: Omit<Supplier, 'id'>): Promise<Supplier> {
  return apiRequest<Supplier>('/suppliers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier> {
  return apiRequest<Supplier>(`/suppliers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteSupplier(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/suppliers/${id}`, {
    method: 'DELETE',
  });
}
