import { apiRequest } from './api';

export interface Product {
  id: string;
  productCode: string;
  name: string;
  hsCode: string;
  unit: string;
  price: number;
  currency: string;
}

export async function fetchProducts(): Promise<Product[]> {
  return apiRequest<Product[]>('/products');
}

export async function createProduct(data: Omit<Product, 'id' | 'productCode'>): Promise<Product> {
  return apiRequest<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
