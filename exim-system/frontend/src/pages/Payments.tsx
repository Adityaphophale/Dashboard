import React, { useEffect, useState } from 'react';
import { Plus, Search, DollarSign, Calendar, AlertCircle, X } from 'lucide-react';
import type { Payment } from '../services/payments';
import { fetchPayments, updatePaymentStatus } from '../services/payments';
import { useAuth } from '../context/AuthContext';
import '../styles/Customers.css';

const Payments: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'Admin';

  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Receipt modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState('');
  const [amountReceived, setAmountReceived] = useState('');

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await fetchPayments();
      setPayments(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load payments ledger.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleRecordReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentId) {
      alert('Please select an invoice.');
      return;
    }
    const amount = parseFloat(amountReceived);
    if (isNaN(amount) || amount < 0) {
      alert('Please enter a valid amount.');
      return;
    }

    try {
      await updatePaymentStatus(selectedPaymentId, amount);
      setIsModalOpen(false);
      setSelectedPaymentId('');
      setAmountReceived('');
      loadPayments();
    } catch (err: any) {
      alert(err.message || 'Failed to update ledger invoice.');
    }
  };

  const getStatusBadge = (p: Payment) => {
    const isOverdue = p.status !== 'Paid' && new Date(p.dueDate) < new Date();
    
    if (p.status === 'Paid') {
      return <span className="status-badge active">Paid</span>;
    }
    if (isOverdue) {
      return <span className="status-badge blocked">Overdue</span>;
    }
    if (p.status === 'Partially Paid') {
      return <span className="status-badge inactive" style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706' }}>Partial</span>;
    }
    return <span className="status-badge inactive">Pending</span>;
  };

  const filteredPayments = payments.filter(p => {
    const client = p.order?.customer?.companyName || '';
    const invoice = p.invoiceNumber || '';
    const orderNum = p.order?.orderNumber || '';
    
    return client.toLowerCase().includes(searchQuery.toLowerCase()) ||
           invoice.toLowerCase().includes(searchQuery.toLowerCase()) ||
           orderNum.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalOutstanding = payments.reduce((sum, p) => sum + Number(p.pendingAmount), 0);
  const totalReceived = payments.reduce((sum, p) => sum + Number(p.receivedAmount), 0);

  return (
    <div className="customers-container">
      <div className="customers-header">
        <div>
          <h1>Payments & Receivables Ledger</h1>
          <p className="text-secondary">Track outstanding invoices, record customer telegraphic transfer receipts, and manage aging credit balances</p>
        </div>
        {(role === 'Admin' || role === 'Accounts') && (
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            <span>Record Receipt</span>
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="kpis-grid">
        <div className="kpi-card glass">
          <div className="kpi-icon green">
            <DollarSign size={22} />
          </div>
          <div className="kpi-info">
            <h3>Telegraphic Transfers Recd</h3>
            <p className="kpi-value">${totalReceived.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="kpi-card glass">
          <div className="kpi-icon orange">
            <AlertCircle size={22} />
          </div>
          <div className="kpi-info">
            <h3>Outstanding Receivables</h3>
            <p className="kpi-value">${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="table-controls glass" style={{ padding: '1rem' }}>
        <div className="search-bar">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Search payments by invoice #, order #, or client..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Ledger Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading ledger...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--danger-color)' }}>{error}</div>
      ) : (
        <div className="table-container glass">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Invoice Code</th>
                <th>Commercial Reference</th>
                <th>Customer</th>
                <th>Invoice Amount</th>
                <th>Telegraphic Transfer Recd</th>
                <th>Outstanding Balance</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                      {p.invoiceNumber}
                    </td>
                    <td style={{ fontWeight: 500 }}>{p.order?.orderNumber}</td>
                    <td style={{ fontWeight: 600 }}>{p.order?.customer?.companyName}</td>
                    <td style={{ fontWeight: 600 }}>
                      ${Number(p.invoiceAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ color: 'var(--accent-color)', fontWeight: 600 }}>
                      ${Number(p.receivedAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ color: Number(p.pendingAmount) > 0 ? 'var(--danger-color)' : 'var(--text-primary)', fontWeight: 600 }}>
                      ${Number(p.pendingAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                        <Calendar size={14} color="var(--text-secondary)" />
                        <span>{new Date(p.dueDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td>
                      {getStatusBadge(p)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    No payment invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Record Receipt Modal */}
      {isModalOpen && (
        <div className="drawer-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="drawer" style={{ height: 'fit-content', top: '20%', margin: 'auto', borderRadius: '8px', padding: '1.5rem', width: '450px' }} onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header" style={{ padding: '0 0 1rem 0' }}>
              <h2>Record Telegraphic Transfer</h2>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleRecordReceipt}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Select Invoice / Outstanding Balance *</label>
                <select required value={selectedPaymentId} onChange={(e) => {
                  setSelectedPaymentId(e.target.value);
                  const selected = payments.find(p => p.id === e.target.value);
                  if (selected) {
                    setAmountReceived(String(selected.receivedAmount));
                  }
                }}>
                  <option value="">-- Choose Invoice Code --</option>
                  {payments.filter(p => p.status !== 'Paid').map(p => (
                    <option key={p.id} value={p.id}>
                      {p.invoiceNumber} ({p.order?.customer?.companyName}) - Out: ${Number(p.pendingAmount).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Total Cumulative Amount Received ($) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  required 
                  value={amountReceived} 
                  onChange={(e) => setAmountReceived(e.target.value)} 
                  placeholder="0.00" 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
