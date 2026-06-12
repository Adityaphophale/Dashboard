import { apiRequest } from './api';

export interface AdminKPIs {
  totalPortfolios: number;
  activeOrders: number;
  pendingFreight: number;
  monthlyRevenue: number;
  paymentsDue: number;
  recentCompliance: { description: string; time: string }[];
}

export interface SalesKPIs {
  activeLeads: number;
  openInquiries: number;
  pendingQuotes: number;
  monthlySales: number;
  conversionRatio: number;
}

export interface DocumentationKPIs {
  pendingUploads: number;
  shipmentsReady: number;
  etdThisWeek: number;
  etaThisWeek: number;
}

export interface AccountsKPIs {
  outstandingReceivables: number;
  overdueInvoices: number;
  receivedFunds: number;
  revenueSummary: number;
}

export interface CustomerKPIs {
  activeOrders: number;
  myShipments: number;
  upcomingETA: string;
  myDocuments: number;
  vesselName: string;
  vesselStatus: string;
}

export async function fetchKPIs(): Promise<any> {
  return apiRequest<any>('/reports/kpis');
}
