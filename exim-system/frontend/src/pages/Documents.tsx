import React, { useEffect, useState } from 'react';
import { FileText, Upload, Download, Search, X, Trash2 } from 'lucide-react';
import type { Document } from '../services/documents';
import { fetchDocuments, uploadDocument, deleteDocument } from '../services/documents';
import type { Order } from '../services/orders';
import { fetchOrders } from '../services/orders';
import { useAuth } from '../context/AuthContext';
import '../styles/Customers.css';

const Documents: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'Admin';

  const [docs, setDocs] = useState<Document[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Drawer Upload states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [docType, setDocType] = useState('Invoice');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('150 KB');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchDocuments();
      setDocs(data);

      if (role === 'Admin' || role === 'Documentation') {
        const orderData = await fetchOrders();
        setOrders(orderData);
      }
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [role]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) {
      alert('Please select a linked order.');
      return;
    }
    if (!fileName) {
      alert('Please enter a file name.');
      return;
    }

    // Convert file size string e.g. "150 KB" to approximate bytes for storage
    const sizeInBytes = parseInt(fileSize) * 1024 || 102400;

    try {
      await uploadDocument({
        entityType: 'Order',
        entityId: selectedOrderId,
        documentType: docType,
        fileName: fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`,
        fileSize: sizeInBytes,
        contentType: 'application/pdf',
      });
      setIsDrawerOpen(false);
      // Reset form
      setSelectedOrderId('');
      setFileName('');
      setFileSize('150 KB');
      
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error uploading document.');
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this document from the vault?')) {
      try {
        await deleteDocument(id);
        loadData();
      } catch (err: any) {
        alert(err.message || 'Failed to delete document.');
      }
    }
  };

  const handleDownload = (doc: Document) => {
    // Open the mock file url in a new tab, or alert
    if (doc.fileUrl) {
      // Simulate file download by opening link
      window.open(`http://localhost:5000${doc.fileUrl}`, '_blank');
    } else {
      alert(`Downloading ${doc.fileName} from secure storage vault.`);
    }
  };

  const filteredDocs = docs.filter(d => {
    const matchesSearch = 
      d.fileName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      d.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || d.documentType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="customers-container">
      <div className="customers-header">
        <div>
          <h1>Compliance Documents Vault</h1>
          <p className="text-secondary">Store, download, and trace critical trade documentation securely</p>
        </div>
        {(role === 'Admin' || role === 'Documentation') && (
          <button className="btn-primary" onClick={() => setIsDrawerOpen(true)}>
            <Upload size={18} />
            <span>Upload Document</span>
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="table-controls glass" style={{ padding: '1rem' }}>
        <div className="search-bar">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Search files by name, order number..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <select 
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Document Types</option>
            <option value="Invoice">Invoice</option>
            <option value="Packing List">Packing List</option>
            <option value="Bill of Lading">Bill of Lading</option>
            <option value="Certificate of Origin">Certificate of Origin</option>
            <option value="Insurance Documents">Insurance Documents</option>
            <option value="Purchase Orders">Purchase Orders</option>
            <option value="Test Certificates">Test Certificates</option>
          </select>
        </div>
      </div>

      {/* Files list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading vault files...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--danger-color)' }}>{error}</div>
      ) : (
        <div className="table-container glass">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Classification</th>
                <th>Linked Order Reference</th>
                <th>Uploaded Timestamp</th>
                <th>File Size</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length > 0 ? (
                filteredDocs.map(d => (
                  <tr key={d.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <FileText size={20} color="var(--primary-color)" />
                        <span style={{ fontWeight: 600 }}>{d.fileName}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: '0.8rem', 
                        background: 'rgba(37, 99, 235, 0.05)', 
                        color: 'var(--primary-color)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 500
                      }}>
                        {d.documentType}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500, fontSize: '0.85rem' }}>{d.referenceNumber}</td>
                    <td>{new Date(d.uploadedAt).toLocaleString()}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {d.fileSize ? `${Math.round(d.fileSize / 1024)} KB` : 'N/A'}
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button 
                          className="btn-icon edit" 
                          title="Download File" 
                          onClick={() => handleDownload(d)}
                        >
                          <Download size={16} />
                        </button>
                        {(role === 'Admin' || role === 'Documentation') && (
                          <button 
                            className="btn-icon delete" 
                            title="Delete File" 
                            onClick={() => handleDeleteClick(d.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    No matching compliance documents found in vault.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Drawer */}
      {isDrawerOpen && (
        <div className="drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <div className="drawer" style={{ width: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>Upload Compliance Document</h2>
              <button className="btn-icon" onClick={() => setIsDrawerOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 70px)' }}>
              <div className="drawer-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Link Active Order *</label>
                    <select required value={selectedOrderId} onChange={(e) => setSelectedOrderId(e.target.value)}>
                      <option value="">-- Choose Order Number --</option>
                      {orders.map(o => (
                        <option key={o.id} value={o.id}>{o.orderNumber} ({o.customer?.companyName})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Document Classification Type *</label>
                    <select value={docType} onChange={(e) => setDocType(e.target.value)}>
                      <option value="Invoice">Invoice</option>
                      <option value="Packing List">Packing List</option>
                      <option value="Bill of Lading">Bill of Lading</option>
                      <option value="Certificate of Origin">Certificate of Origin</option>
                      <option value="Insurance Documents">Insurance Documents</option>
                      <option value="Purchase Orders">Purchase Orders</option>
                      <option value="Test Certificates">Test Certificates</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>File Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={fileName} 
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder="e.g. PackingList_ORD-2026-0501" 
                    />
                  </div>

                  <div className="form-group">
                    <label>File Size Description</label>
                    <input 
                      type="text" 
                      value={fileSize} 
                      onChange={(e) => setFileSize(e.target.value)} 
                      placeholder="e.g. 150 KB" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="drawer-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsDrawerOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Vault Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
