import React, { useEffect, useState } from 'react';
import { ShoppingCart, Eye, FileText, ArrowRight, X, Plus, Trash2 } from 'lucide-react';
import type { Order } from '../services/orders';
import { fetchOrders, createOrder, updateOrderStatus } from '../services/orders';
import type { Customer } from '../services/customers';
import { fetchCustomers } from '../services/customers';
import type { Product } from '../services/products';
import { fetchProducts } from '../services/products';
import { useAuth } from '../context/AuthContext';
import '../styles/Workflows.css';
import '../styles/Customers.css';

const STEPS = ['Confirmed', 'Production In Process', 'Shipment Ready', 'Shipped', 'Delivered'];

const Orders: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'Admin';
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [paymentTerms, setPaymentTerms] = useState('20% Advance TT, 80% against BL');
  const [incoterms, setIncoterms] = useState('FOB Nhava Sheva Port');
  const [expectedDispatch, setExpectedDispatch] = useState('');
  const [orderItems, setOrderItems] = useState<{ productId: string; quantity: number; unitPrice: number }[]>([
    { productId: '', quantity: 1, unitPrice: 0 }
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      const ordersData = await fetchOrders();
      setOrders(ordersData);
      
      if (role === 'Admin' || role === 'Sales') {
        const custData = await fetchCustomers({ status: 'active' });
        setCustomers(custData);
        const prodData = await fetchProducts();
        setProducts(prodData);
      }
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [role]);

  const handleAdvanceStage = async (orderId: string, currentStatus: string) => {
    const currentIndex = STEPS.indexOf(currentStatus);
    if (currentIndex < STEPS.length - 1) {
      const nextStatus = STEPS[currentIndex + 1];
      try {
        await updateOrderStatus(orderId, nextStatus);
        loadData();
      } catch (err: any) {
        alert(err.message || 'Error updating order stage.');
      }
    }
  };

  const handleAddItemRow = () => {
    setOrderItems([...orderItems, { productId: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...orderItems];
    updated[index] = {
      ...updated[index],
      [field]: value
    };

    // Auto-populate unit price if product changes
    if (field === 'productId') {
      const prod = products.find(p => p.id === value);
      if (prod) {
        updated[index].unitPrice = Number(prod.price);
      }
    }
    setOrderItems(updated);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      alert('Please select a customer.');
      return;
    }
    if (orderItems.some(item => !item.productId)) {
      alert('Please select a product for all rows.');
      return;
    }

    try {
      await createOrder({
        customerId: selectedCustomerId,
        currency,
        paymentTerms,
        incoterms,
        expectedDispatchDate: expectedDispatch || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        items: orderItems
      });
      setIsDrawerOpen(false);
      // Reset form
      setSelectedCustomerId('');
      setCurrency('USD');
      setPaymentTerms('20% Advance TT, 80% against BL');
      setIncoterms('FOB Nhava Sheva Port');
      setExpectedDispatch('');
      setOrderItems([{ productId: '', quantity: 1, unitPrice: 0 }]);
      
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create sales order.');
    }
  };

  return (
    <div className="workflow-container">
      <div className="customers-header">
        <div>
          <h1>Active Orders Tracker</h1>
          <p className="text-secondary">Monitor order production timelines, coordinate packing lists, and trigger shipment creation</p>
        </div>
        {(role === 'Admin' || role === 'Sales') && (
          <button className="btn-primary" onClick={() => setIsDrawerOpen(true)}>
            <ShoppingCart size={18} />
            <span>New Order</span>
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading orders...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--danger-color)' }}>{error}</div>
      ) : (
        <div className="orders-grid">
          {orders.length > 0 ? (
            orders.map((order) => {
              const stepIndex = STEPS.indexOf(order.status);
              
              return (
                <div key={order.id} className="order-row-card glass">
                  <div className="order-row-header">
                    <div>
                      <span className="customer-code" style={{ fontSize: '0.85rem' }}>{order.orderNumber}</span>
                      <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.1rem' }}>{order.customer?.companyName}</h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {order.items?.map(it => `${it.product?.name} (Qty: ${it.quantity})`).join(', ')}
                      </span>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                        ${Number(order.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Dispatch Date: {new Date(order.expectedDispatchDate).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {(role === 'Admin' || role === 'Sales') && stepIndex < STEPS.length - 1 && (
                        <button 
                          onClick={() => handleAdvanceStage(order.id, order.status)} 
                          className="btn-primary" 
                          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.8rem', fontSize: '0.8rem' }}
                        >
                          <span>Advance</span>
                          <ArrowRight size={14} />
                        </button>
                      )}
                      <button 
                        className="btn-secondary" 
                        onClick={() => window.location.href = '/documents'}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.8rem', fontSize: '0.8rem' }}
                      >
                        <FileText size={14} />
                        <span>Docs</span>
                      </button>
                    </div>
                  </div>

                  {/* Timeline stages */}
                  <div className="order-timeline">
                    {STEPS.map((step, idx) => {
                      let stepStatusClass = '';
                      if (idx < stepIndex) {
                        stepStatusClass = 'completed';
                      } else if (idx === stepIndex) {
                        stepStatusClass = 'active';
                      }
                      
                      return (
                        <div key={step} className={`timeline-step ${stepStatusClass}`}>
                          <div className="step-node">
                            {idx < stepIndex ? '✓' : idx + 1}
                          </div>
                          <span className="step-label">{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="glass" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
              No active orders tracked.
            </div>
          )}
        </div>
      )}

      {/* New Order Drawer */}
      {isDrawerOpen && (
        <div className="drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <div className="drawer" style={{ width: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>Create Commercial Sales Order</h2>
              <button className="btn-icon" onClick={() => setIsDrawerOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 70px)' }}>
              <div className="drawer-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Select Customer Portfolio *</label>
                    <select 
                      required 
                      value={selectedCustomerId} 
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                    >
                      <option value="">-- Choose Customer --</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.companyName} ({c.customerCode})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Incoterms *</label>
                      <input 
                        type="text" 
                        required 
                        value={incoterms} 
                        onChange={(e) => setIncoterms(e.target.value)}
                        placeholder="e.g. FOB Mumbai, CIF Hamburg" 
                      />
                    </div>
                    <div className="form-group">
                      <label>Currency *</label>
                      <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Payment Terms *</label>
                      <input 
                        type="text" 
                        required 
                        value={paymentTerms} 
                        onChange={(e) => setPaymentTerms(e.target.value)}
                        placeholder="e.g. 100% CAD or 20/80" 
                      />
                    </div>
                    <div className="form-group">
                      <label>Expected Dispatch Date *</label>
                      <input 
                        type="date" 
                        required 
                        value={expectedDispatch} 
                        onChange={(e) => setExpectedDispatch(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label style={{ fontWeight: 600 }}>Order Items (Products) *</label>
                      <button type="button" className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={handleAddItemRow}>
                        <Plus size={14} /> Add Product
                      </button>
                    </div>

                    {orderItems.map((item, index) => (
                      <div key={index} className="form-row" style={{ alignItems: 'flex-end', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div className="form-group" style={{ flex: 2 }}>
                          <select 
                            required 
                            value={item.productId} 
                            onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                          >
                            <option value="">-- Select Product --</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name} ({p.productCode} - ${Number(p.price)}/{p.unit})</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <input 
                            type="number" 
                            min="1" 
                            required 
                            value={item.quantity} 
                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                            placeholder="Qty"
                          />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <input 
                            type="number" 
                            step="0.01" 
                            required 
                            value={item.unitPrice} 
                            onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            placeholder="Price"
                          />
                        </div>
                        {orderItems.length > 1 && (
                          <button type="button" className="btn-icon delete" style={{ marginBottom: '0.4rem' }} onClick={() => handleRemoveItemRow(index)}>
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                </div>
              </div>
              
              <div className="drawer-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsDrawerOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Sales Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
