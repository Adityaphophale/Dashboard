import React, { useEffect, useState } from 'react';
import { Plus, Search, FileText, Send, Calendar, X, Trash2 } from 'lucide-react';
import type { Quotation } from '../services/quotations';
import { fetchQuotations, createQuotation, updateQuotationStatus, convertQuotationToOrder } from '../services/quotations';
import type { Customer } from '../services/customers';
import { fetchCustomers } from '../services/customers';
import type { Product } from '../services/products';
import { fetchProducts } from '../services/products';
import { useAuth } from '../context/AuthContext';
import '../styles/Customers.css';

const Quotations: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'Admin';

  const [quotes, setQuotes] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Drawer Create states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [validUntil, setValidUntil] = useState('');
  const [taxRate, setTaxRate] = useState('0');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('10');
  const [unitPrice, setUnitPrice] = useState('0');

  // Order Conversion states
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [convertingQuoteId, setConvertingQuoteId] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('20% Advance TT, 80% against BL');
  const [incoterms, setIncoterms] = useState('FOB Nhava Sheva Port');
  const [expectedDispatch, setExpectedDispatch] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchQuotations();
      setQuotes(data);

      if (role === 'Admin' || role === 'Sales') {
        const custs = await fetchCustomers({ status: 'active' });
        setCustomers(custs);
        const prods = await fetchProducts();
        setProducts(prods);
      }
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load quotations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [role]);

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedProductId) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      await createQuotation({
        customerId: selectedCustomerId,
        currency,
        validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        taxRate: parseFloat(taxRate) || 0,
        items: [
          {
            productId: selectedProductId,
            quantity: parseInt(quantity) || 1,
            unitPrice: parseFloat(unitPrice) || 0
          }
        ]
      });

      setIsDrawerOpen(false);
      // Reset form
      setSelectedCustomerId('');
      setSelectedProductId('');
      setQuantity('10');
      setUnitPrice('0');
      setValidUntil('');

      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to generate quotation.');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateQuotationStatus(id, status);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update quotation status.');
    }
  };

  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingQuoteId) return;

    try {
      await convertQuotationToOrder(convertingQuoteId, {
        paymentTerms,
        incoterms,
        expectedDispatchDate: expectedDispatch || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
      });
      setIsConvertModalOpen(false);
      setConvertingQuoteId('');
      loadData();
      alert('Quotation successfully converted into Confirmed Sales Order!');
    } catch (err: any) {
      alert(err.message || 'Failed to convert quotation.');
    }
  };

  const filteredQuotes = quotes.filter(q => 
    q.customer?.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="customers-container">
      <div className="customers-header">
        <div>
          <h1>Quotations & Sales Proformas</h1>
          <p className="text-secondary">Draft multi-currency proforma invoices, coordinate revisions, and secure customer purchase approvals</p>
        </div>
        {(role === 'Admin' || role === 'Sales') && (
          <button className="btn-primary" onClick={() => setIsDrawerOpen(true)}>
            <Plus size={18} />
            <span>New Quotation</span>
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="table-controls glass" style={{ padding: '1rem' }}>
        <div className="search-bar">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Search quotations by quote # or client..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading quotes list...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--danger-color)' }}>{error}</div>
      ) : (
        <div className="table-container glass">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Quote Details</th>
                <th>Customer</th>
                <th>Product Description</th>
                <th>Valuation</th>
                <th>Valid Until</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.length > 0 ? (
                filteredQuotes.map(q => (
                  <tr key={q.id}>
                    <td>
                      <div className="customer-meta">
                        <span className="customer-code">{q.quotationNumber}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{q.customer?.companyName}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {q.items?.map(it => `${it.product?.name} (${it.quantity} ${it.product?.unit})`).join(', ')}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {q.currency === 'USD' ? '$' : '€'}{Number(q.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        Ex-tax: {q.currency === 'USD' ? '$' : '€'}{Number(q.subTotal).toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                        <Calendar size={14} color="var(--text-secondary)" />
                        <span>{new Date(q.validUntil).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${
                        q.status === 'Approved' ? 'active' : 
                        q.status === 'Sent' ? 'inactive' : 'inactive'
                      }`}>
                        {q.status}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        {(role === 'Admin' || role === 'Sales') && q.status === 'Draft' && (
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} 
                            onClick={() => handleUpdateStatus(q.id, 'Sent')}
                          >
                            Send
                          </button>
                        )}
                        {(role === 'Admin' || role === 'Sales') && q.status === 'Sent' && (
                          <button 
                            className="btn-primary" 
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} 
                            onClick={() => handleUpdateStatus(q.id, 'Approved')}
                          >
                            Approve
                          </button>
                        )}
                        {(role === 'Admin' || role === 'Sales') && q.status === 'Approved' && (
                          <button 
                            className="btn-primary" 
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', background: 'var(--accent-color)', borderColor: 'var(--accent-color)' }} 
                            onClick={() => {
                              setConvertingQuoteId(q.id);
                              setIsConvertModalOpen(true);
                            }}
                          >
                            Convert Order
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    No matching proformas found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* New Quotation Drawer */}
      {isDrawerOpen && (
        <div className="drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <div className="drawer" style={{ width: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>Generate Commercial Proforma</h2>
              <button className="btn-icon" onClick={() => setIsDrawerOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateQuotation} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 70px)' }}>
              <div className="drawer-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Select Customer Portfolio *</label>
                    <select required value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)}>
                      <option value="">-- Choose Customer --</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.companyName} ({c.customerCode})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Select Cargo Goods *</label>
                    <select required value={selectedProductId} onChange={(e) => {
                      setSelectedProductId(e.target.value);
                      const prod = products.find(p => p.id === e.target.value);
                      if (prod) {
                        setUnitPrice(String(prod.price));
                      }
                    }}>
                      <option value="">-- Choose Product --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.productCode} - ${Number(p.price)}/{p.unit})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Quantity *</label>
                      <input 
                        type="number" 
                        min="1" 
                        required 
                        value={quantity} 
                        onChange={(e) => setQuantity(e.target.value)} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Negotiated Unit Price ($) *</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        required 
                        value={unitPrice} 
                        onChange={(e) => setUnitPrice(e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Tax Rate (%)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        value={taxRate} 
                        onChange={(e) => setTaxRate(e.target.value)} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Valuation Currency</label>
                      <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Validity Expiry Date *</label>
                    <input 
                      type="date" 
                      required 
                      value={validUntil} 
                      onChange={(e) => setValidUntil(e.target.value)} 
                    />
                  </div>
                </div>
              </div>
              
              <div className="drawer-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsDrawerOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Draft Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert Quotation to Commercial Sales Order Modal */}
      {isConvertModalOpen && (
        <div className="drawer-backdrop" onClick={() => setIsConvertModalOpen(false)}>
          <div className="drawer" style={{ height: 'fit-content', top: '20%', margin: 'auto', borderRadius: '8px', padding: '1.5rem', width: '450px' }} onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header" style={{ padding: '0 0 1rem 0' }}>
              <h2>Commercial Order Execution</h2>
              <button className="btn-icon" onClick={() => setIsConvertModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleConvertSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Incoterms *</label>
                <input 
                  type="text" 
                  required 
                  value={incoterms} 
                  onChange={(e) => setIncoterms(e.target.value)} 
                  placeholder="e.g. FOB Mumbai Port, CIF Rotterdam"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Payment Terms *</label>
                <input 
                  type="text" 
                  required 
                  value={paymentTerms} 
                  onChange={(e) => setPaymentTerms(e.target.value)} 
                  placeholder="e.g. 20% Advance TT, 80% against BL scanned copy"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Expected Dispatch Date *</label>
                <input 
                  type="date" 
                  required 
                  value={expectedDispatch} 
                  onChange={(e) => setExpectedDispatch(e.target.value)} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsConvertModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Confirm Sales Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quotations;
