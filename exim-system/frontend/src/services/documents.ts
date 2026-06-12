import { apiRequest } from './api';

export interface Document {
  id: string;
  entityType: 'Order' | 'Quotation';
  entityId: string;
  referenceNumber: string; // Order Number or Quote Number
  documentType: 'Invoice' | 'Packing List' | 'Bill of Lading' | 'Certificate of Origin' | 'Insurance Documents' | 'Test Certificates' | 'Purchase Orders';
  fileName: string;
  fileSize?: number;
  contentType?: string;
  fileUrl?: string;
  uploadedAt: string;
}

export async function fetchDocuments(): Promise<Document[]> {
  return apiRequest<Document[]>('/documents');
}

export async function uploadDocument(data: {
  entityType: string;
  entityId: string;
  documentType: string;
  fileName: string;
  fileSize?: number;
  contentType?: string;
}): Promise<Document> {
  return apiRequest<Document>('/documents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteDocument(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/documents/${id}`, {
    method: 'DELETE',
  });
}
