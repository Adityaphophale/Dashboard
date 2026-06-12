import { apiRequest } from './api';
import type { Order } from './orders';

export interface ShipmentStatusHistory {
  id: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export interface Shipment {
  id: string;
  shipmentNumber: string;
  orderId: string;
  order: Order;
  containerNumber?: string;
  blNumber?: string;
  awbNumber?: string;
  shippingLine?: string;
  vesselName?: string;
  freightForwarder?: string;
  portOfLoading: string;
  portOfDischarge: string;
  etd: string;
  eta: string;
  status: 'Booking Confirmed' | 'Container Stuffed' | 'Vessel Departed' | 'Customs Cleared' | 'In Transit' | 'Delivered';
  statusHistory: ShipmentStatusHistory[];
  createdAt: string;
}

export async function fetchShipments(): Promise<Shipment[]> {
  return apiRequest<Shipment[]>('/shipments');
}

export async function createShipment(data: Partial<Shipment>): Promise<Shipment> {
  return apiRequest<Shipment>('/shipments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateShipmentStatus(id: string, status: string, notes?: string): Promise<Shipment> {
  return apiRequest<Shipment>(`/shipments/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, notes }),
  });
}

export async function updateShipmentDetails(id: string, data: Partial<Shipment>): Promise<Shipment> {
  return apiRequest<Shipment>(`/shipments/${id}/details`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
