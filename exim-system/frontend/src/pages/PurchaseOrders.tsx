import React, { useEffect, useState } from 'react';
import { Plus, Search, FileText, Play, X } from 'lucide-react';
import type { PurchaseOrder } from '../services/purchaseOrders';
import { fetchPurchaseOrders, createPurchaseOrder, updatePOStatus } from '../services/purchaseOrders';
import type { Supplier } from '../services/suppliers';
import { fetchSuppliers } from '../services/suppliers';
import type { Order } from '../services/orders';
import { fetchOrders } from '../services/orders';
import { useAuth } from '../context/AuthContext';
import '../styles/Customers.css';

const STATUS_STAGES = ['Created', 'In Production', 'Shipped', 'Delivered'];

const PurchaseOrders: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'Admin';

  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [amount, setAmount] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const poData = await fetchPurchaseOrders();
      setPos(poData);

      if (role === 'Admin' || role === 'Sales') {
        const sups = await fetchSuppliers();
        setSuppliers(sups);
        const ords = await fetchOrders();
        setOrders(ords);
      }
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load purchase orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [role]);

  const handlePOAdvance = async (id: string, currentStatus: string) => {
    const currentIndex = STATUS_STAGES.indexOf(currentStatus);
    if (currentIndex < STATUS_STAGES.length - 1) {
      const nextStatus = STATUS_STAGES[currentIndex + 1];
      try {
        await updatePOStatus(id, nextStatus);
        loadData();
      } catch (err: any) {
        alert(err.message || 'Failed to update PO status.');
      }
    }
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || !selectedOrderId || !amount) {
      alert('Please fill out all fields.');
      return;
    }

    try {
      await createPurchaseOrder({
        supplierId: selectedSupplierId,
        orderId: selectedOrderId,
        totalAmount: parseFloat(amount) || 0,
        expectedDeliveryDate: deliveryDate || undefined
      });
      setIsDrawerOpen(false);
      // Reset form
      setSelectedSupplierId('');
      setSelectedOrderId('');
      setAmount('');
      setDeliveryDate('');

      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create purchase order.');
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Created': return 'status-badge inactive';
      case 'In Production': return 'status-badge active';
      case 'Shipped': return 'status-badge active';
      case 'Delivered': return 'status-badge active';
      default: return 'status-badge';
    }
  };

  const filteredPOs = pos.filter(po => {
    const sName = po.supplier?.name || '';
    const code = po.poNumber || '';
    const oCode = po.order?.orderNumber || '';
    return sName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           code.toLowerCase().includes(searchQuery.toLowerCase()) ||
           oCode.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="customers-container">
      <div className="customers-header">
        <div>
          <h1>Supplier Purchase Orders (PO)</h1>
          <p className="text-secondary">Dispatch back-to-back production procurement notes, monitor factory outputs, and trigger shipment bookings</p>
        </div>
        {(role === 'Admin' || role === 'Sales') && (
          <button className="btn-primary" onClick={() => setIsDrawerOpen(true)}>
            <Plus size={18} />
            <span>New PO</span>
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="table-controls glass" style={{ padding: '1rem' }}>
        <div className="search-bar">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Search POs by PO #, sales order, or supplier..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading PO ledger...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--danger-color)' }}>{error}</div>
      ) : (
        <div className="table-container glass">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Procurement Code</th>
                <th>Linked Sales Order</th>
                <th>Supplier Name</th>
                <th>Procurement Cost</th>
                <th>Expected Delivery</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPOs.length > 0 ? (
                filteredPOs.map(po => (
                  <tr key={po.id}>
                    <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                      {po.poNumber}
                    </td>
                    <td style={{ fontWeight: 500 }}>{po.order?.orderNumber}</td>
                    <td>{po.supplier?.name}</td>
                    <td style={{ fontWeight: 600 }}>
                      ${Number(po.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      {po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <span className={getStatusClass(po.status)}>
                        {po.status}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell" style={{ display: 'flex', gap: '0.4rem' }}>
                        {(role === 'Admin' || role === 'Sales') && po.status !== 'Delivered' && (
                          <button 
                            className="btn-icon edit" 
                            title="Advance Production State"
                            onClick={() => handlePOAdvance(po.id, po.status)}
                          >
                            <Play size={16} />
                          </button>
                        )}
                        <button 
                          className="btn-icon edit" 
                          title="Download PO Document" 
                          onClick={() => alert(`Downloading Procurement Document ${po.poNumber}...`)}
                        >
                          <FileText size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    No purchase orders recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* New PO Drawer */}
      {isDrawerOpen && (
        <div className="drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <div className="drawer" style={{ width: '450px' }} onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>Issue Supplier Purchase Order</h2>
              <button className="btn-icon" onClick={() => setIsDrawerOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreatePO} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 70px)' }}>
              <div className="drawer-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Select Sourcing Supplier *</label>
                    <select required value={selectedSupplierId} onChange={(e) => setSelectedSupplierId(e.target.value)}>
                      <option value="">-- Choose Supplier --</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.country})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Link Customer Sales Order *</label>
                    <select required value={selectedOrderId} onChange={(e) => setSelectedOrderId(e.target.value)}>
                      <option value="">-- Choose Order Number --</option>
                      {orders.map(o => (
                        <option key={o.id} value={o.id}>{o.orderNumber} - {o.customer?.companyName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Sourcing Procurement Cost ($) *</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      required 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)} 
                      placeholder="0.00" 
                    />
                  </div>

                  <div className="form-group">
                    <label>Expected Factory Delivery Date</label>
                    <input 
                      type="date" 
                      value={deliveryDate} 
                      onChange={(e) => setDeliveryDate(e.target.value)} 
                    />
                  </div>
                </div>
              </div>
              
              <div className="drawer-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsDrawerOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Issue Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
