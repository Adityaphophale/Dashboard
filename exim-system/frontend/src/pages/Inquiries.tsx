import React, { useEffect, useState } from 'react';
import { Plus, MoveRight, DollarSign, Calendar, X } from 'lucide-react';
import type { Inquiry } from '../services/inquiries';
import { fetchInquiries, createInquiry, updateInquiry } from '../services/inquiries';
import type { Customer } from '../services/customers';
import { fetchCustomers } from '../services/customers';
import type { Product } from '../services/products';
import { fetchProducts } from '../services/products';
import { useAuth } from '../context/AuthContext';
import '../styles/Workflows.css';
import '../styles/Customers.css';

const STAGES = ['Received', 'Discussion', 'Quoted', 'Order'];

const Inquiries: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'Admin';

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('10');
  const [targetPrice, setTargetPrice] = useState('0');
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchInquiries();
      setInquiries(data);

      if (role === 'Admin' || role === 'Sales') {
        const custs = await fetchCustomers({ status: 'active' });
        setCustomers(custs);
        const prods = await fetchProducts();
        setProducts(prods);
      }
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load inquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [role]);

  const handleInquiryMove = async (id: string, currentStatus: string) => {
    const currentIndex = STAGES.indexOf(currentStatus);
    if (currentIndex < STAGES.length - 1) {
      const nextStatus = STAGES[currentIndex + 1];
      try {
        await updateInquiry(id, { status: nextStatus as any });
        loadData();
      } catch (err: any) {
        alert(err.message || 'Failed to update inquiry status.');
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedProductId) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      await createInquiry({
        customerId: selectedCustomerId,
        productId: selectedProductId,
        quantity: parseInt(quantity) || 1,
        targetPrice: parseFloat(targetPrice) || 0,
        notes,
        status: 'Received'
      });
      setIsDrawerOpen(false);
      // Reset form
      setSelectedCustomerId('');
      setSelectedProductId('');
      setQuantity('10');
      setTargetPrice('0');
      setNotes('');

      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to register inquiry.');
    }
  };

  const getInquiriesByStage = (stage: string) => {
    return inquiries.filter(i => {
      if (stage === 'Order') {
        return i.status === 'Order' || i.status === 'Accepted';
      }
      return i.status === stage;
    });
  };

  return (
    <div className="workflow-container">
      <div className="customers-header">
        <div>
          <h1>Inquiries & Sales Quotes</h1>
          <p className="text-secondary">Track client requests from initial RFQ through price negotiations and final quotation approvals</p>
        </div>
        {(role === 'Admin' || role === 'Sales') && (
          <button className="btn-primary" onClick={() => setIsDrawerOpen(true)}>
            <Plus size={18} />
            <span>New Inquiry</span>
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading Kanban...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--danger-color)' }}>{error}</div>
      ) : (
        <div className="kanban-board" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem' }}>
          {STAGES.map(stage => (
            <div key={stage} className="kanban-column glass">
              <div className="column-header">
                <h3>{stage}</h3>
                <span className="column-count">{getInquiriesByStage(stage).length}</span>
              </div>
              <div className="kanban-cards">
                {getInquiriesByStage(stage).map(inq => (
                  <div key={inq.id} className="kanban-card">
                    <span className="card-tag">{inq.inquiryNumber}</span>
                    <h4 className="card-title">{inq.customer?.companyName}</h4>
                    <div className="card-details">
                      <span style={{ fontWeight: 600 }}>{inq.product?.name}</span>
                      <span>Qty: {inq.quantity} {inq.product?.unit}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.4rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        <DollarSign size={14} /> Target: ${Number(inq.targetPrice).toLocaleString()}/unit
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.2rem' }}>
                        <Calendar size={12} /> {new Date(inq.createdAt).toLocaleDateString()}
                      </span>
                      {inq.notes && (
                        <div style={{ fontStyle: 'italic', fontSize: '0.75rem', marginTop: '0.4rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.3rem', color: 'var(--text-secondary)' }}>
                          "{inq.notes}"
                        </div>
                      )}
                    </div>
                    {inq.status !== 'Order' && inq.status !== 'Accepted' && (role === 'Admin' || role === 'Sales') && (
                      <button 
                        onClick={() => handleInquiryMove(inq.id, inq.status)}
                        style={{ width: '100%', marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.4rem', background: '#f1f5f9', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-color)' }}
                      >
                        <span>{inq.status === 'Discussion' ? 'Generate Quotation' : 'Advance Stage'}</span>
                        <MoveRight size={12} />
                      </button>
                    )}
                    {(inq.status === 'Order' || inq.status === 'Accepted') && (
                      <div style={{ marginTop: '0.75rem', padding: '0.4rem', background: 'rgba(16, 185, 129, 0.05)', color: 'var(--accent-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.7rem', fontWeight: 600, textAlign: 'center' }}>
                        Converted to Order
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Inquiry Drawer */}
      {isDrawerOpen && (
        <div className="drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <div className="drawer" style={{ width: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>Register Customer Inquiry (RFQ)</h2>
              <button className="btn-icon" onClick={() => setIsDrawerOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 70px)' }}>
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
                        setTargetPrice(String(prod.price));
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
                      <label>Requested Quantity *</label>
                      <input 
                        type="number" 
                        min="1" 
                        required 
                        value={quantity} 
                        onChange={(e) => setQuantity(e.target.value)} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Target Price ($ / unit) *</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        required 
                        value={targetPrice} 
                        onChange={(e) => setTargetPrice(e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Additional Specifications</label>
                    <textarea 
                      rows={4} 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)} 
                      placeholder="e.g. Packing preferences, certificate requirements, port details..."
                    />
                  </div>
                </div>
              </div>
              
              <div className="drawer-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsDrawerOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save RFQ Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inquiries;
