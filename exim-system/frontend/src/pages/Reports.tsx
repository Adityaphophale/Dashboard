import React, { useEffect, useState } from 'react';
import { BarChart2, Download, TrendingUp, AlertTriangle, Users, Box, Ship } from 'lucide-react';
import type { Order } from '../services/orders';
import { fetchOrders } from '../services/orders';
import type { Payment } from '../services/payments';
import { fetchPayments } from '../services/payments';
import '../styles/Customers.css';

const Reports: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const ordersData = await fetchOrders();
      setOrders(ordersData);
      const paymentsData = await fetchPayments();
      setPayments(paymentsData);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load report analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalOrderValue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const totalReceived = payments.reduce((sum, p) => sum + Number(p.receivedAmount), 0);
  const totalOutstanding = payments.reduce((sum, p) => sum + Number(p.pendingAmount), 0);

  // Sourcing volume (quantities total)
  const totalSourcingVolume = orders.reduce((sum, o) => {
    return sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
  }, 0);

  // Group by customer for Top Performers
  const customerPerformersMap: Record<string, { companyName: string; country: string; total: number }> = {};
  orders.forEach(o => {
    const name = o.customer?.companyName || 'Unknown';
    if (!customerPerformersMap[name]) {
      customerPerformersMap[name] = {
        companyName: name,
        country: o.customer?.country || 'N/A',
        total: 0
      };
    }
    customerPerformersMap[name].total += Number(o.totalAmount);
  });

  const sortedCustomers = Object.values(customerPerformersMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Group by product for Top Exported Goods
  const productVolumeMap: Record<string, { name: string; hsCode: string; quantity: number; unit: string }> = {};
  orders.forEach(o => {
    o.items.forEach(item => {
      const name = item.product?.name || 'Unknown';
      if (!productVolumeMap[name]) {
        productVolumeMap[name] = {
          name,
          hsCode: item.product?.hsCode || 'N/A',
          quantity: 0,
          unit: item.product?.unit || 'units'
        };
      }
      productVolumeMap[name].quantity += item.quantity;
    });
  });

  const sortedProducts = Object.values(productVolumeMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const handleExportCSV = () => {
    // Generate CSV content
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Invoice Number,Order Number,Customer Name,Invoice Amount,Received Amount,Pending Amount,Due Date,Status\n';
    
    payments.forEach(p => {
      csvContent += `"${p.invoiceNumber}","${p.order?.orderNumber}","${p.order?.customer?.companyName}",${p.invoiceAmount},${p.receivedAmount},${p.pendingAmount},"${new Date(p.dueDate).toLocaleDateString()}","${p.status}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = window.document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SOGT_Financial_Report_${new Date().toISOString().split('T')[0]}.csv`);
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="customers-container">
      <div className="customers-header">
        <div>
          <h1>Financial Analytics & Reports</h1>
          <p className="text-secondary">Export certified commercial spreadsheets and analyze global trade volume margins</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={handleExportCSV}>
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={handlePrintPDF}>
            <Download size={16} />
            <span>Print Report (PDF)</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading analytics...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--danger-color)' }}>{error}</div>
      ) : (
        <>
          {/* Grid of KPI Indicators */}
          <div className="kpis-grid">
            <div className="kpi-card glass">
              <div className="kpi-icon blue">
                <TrendingUp size={22} />
              </div>
              <div className="kpi-info">
                <h3>Total Sourcing Funds Recd</h3>
                <p className="kpi-value">${totalReceived.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            <div className="kpi-card glass">
              <div className="kpi-icon green">
                <Box size={22} />
              </div>
              <div className="kpi-info">
                <h3>Total Confirmed Orders Value</h3>
                <p className="kpi-value">${totalOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            <div className="kpi-card glass">
              <div className="kpi-icon orange">
                <AlertTriangle size={22} />
              </div>
              <div className="kpi-info">
                <h3>Outstanding Payments</h3>
                <p className="kpi-value">${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            <div className="kpi-card glass">
              <div className="kpi-icon purple">
                <Ship size={22} />
              </div>
              <div className="kpi-info">
                <h3>Total Sourced Volume</h3>
                <p className="kpi-value">{totalSourcingVolume.toLocaleString()} Units</p>
              </div>
            </div>
          </div>

          {/* Reports Lists and Performance Indicators */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '0.5rem' }}>
            
            {/* Top customers */}
            <div className="glass" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} color="var(--primary-color)" />
                <span>Top Performing Trade Portfolios</span>
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {sortedCustomers.length > 0 ? (
                  sortedCustomers.map((c, i) => (
                    <li key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', fontSize: '0.9rem' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{c.companyName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Region: {c.country}</div>
                      </div>
                      <div style={{ fontWeight: 700 }}>${c.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </li>
                  ))
                ) : (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No portfolio data available.</div>
                )}
              </ul>
            </div>

            {/* Top products */}
            <div className="glass" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart2 size={18} color="var(--accent-color)" />
                <span>Top Exported Goods Commodities</span>
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {sortedProducts.length > 0 ? (
                  sortedProducts.map((p, i) => (
                    <li key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', fontSize: '0.9rem' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>HS Code: {p.hsCode}</div>
                      </div>
                      <div style={{ fontWeight: 700 }}>{p.quantity.toLocaleString()} {p.unit}</div>
                    </li>
                  ))
                ) : (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No commodity data available.</div>
                )}
              </ul>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
