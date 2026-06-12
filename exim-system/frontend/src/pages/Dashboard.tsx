import React, { useEffect, useState } from 'react';
import { 
  Package, 
  TrendingUp, 
  Users, 
  Ship, 
  FileText, 
  DollarSign, 
  AlertCircle, 
  Calendar, 
  Clock, 
  Activity,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchKPIs } from '../services/reports';
import '../styles/Dashboard.css';

interface ChartDataPoint {
  label: string;
  value: number;
}

interface ChartProps {
  data: ChartDataPoint[];
  color?: string;
  gradientId?: string;
}

const LineChart: React.FC<ChartProps> = ({ data, color = '#2563eb', gradientId = 'blue-grad' }) => {
  const width = 500;
  const height = 180;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 25;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...data.map(d => d.value), 1) * 1.15; // 15% headroom
  const minVal = 0;

  const points = data.map((d, i) => {
    const x = paddingLeft + (i / (data.length - 1 || 1)) * chartWidth;
    const y = height - paddingBottom - ((d.value - minVal) / (maxVal - minVal)) * chartHeight;
    return { x, y, label: d.label, value: d.value };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`;
  }, '');

  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x},${height - paddingBottom} L ${points[0].x},${height - paddingBottom} Z` 
    : '';

  const gridLines = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {gridLines.map((ratio, idx) => {
        const yVal = minVal + ratio * (maxVal - minVal);
        const y = height - paddingBottom - ratio * chartHeight;
        return (
          <g key={idx}>
            <line 
              x1={paddingLeft} 
              y1={y} 
              x2={width - paddingRight} 
              y2={y} 
              stroke="var(--border-color)" 
              strokeDasharray="4 4" 
              strokeWidth="0.5"
            />
            <text 
              x={paddingLeft - 8} 
              y={y + 3} 
              textAnchor="end" 
              fill="var(--text-secondary)" 
              style={{ fontSize: '10px', fontFamily: 'inherit' }}
            >
              {yVal >= 1000000 ? `${(yVal / 1000000).toFixed(1)}M` : yVal >= 1000 ? `${(yVal / 1000).toFixed(0)}k` : yVal.toFixed(0)}
            </text>
          </g>
        );
      })}

      <line 
        x1={paddingLeft} 
        y1={height - paddingBottom} 
        x2={width - paddingRight} 
        y2={height - paddingBottom} 
        stroke="var(--border-color)" 
        strokeWidth="1"
      />

      {areaD && <path d={areaD} fill={`url(#${gradientId})`} />}

      {pathD && (
        <path 
          d={pathD} 
          fill="none" 
          stroke={color} 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      )}

      {points.map((p, idx) => (
        <g key={idx} className="chart-point-group">
          <circle 
            cx={p.x} 
            cy={p.y} 
            r="4.5" 
            fill="var(--bg-color)" 
            stroke={color} 
            strokeWidth="3" 
            style={{ cursor: 'pointer', transition: 'r 0.2s' }}
          />
          <g className="chart-tooltip" style={{ opacity: 0, pointerEvents: 'none', transition: 'opacity 0.2s' }}>
            <rect 
              x={p.x - 35} 
              y={p.y - 28} 
              width="70" 
              height="20" 
              rx="4" 
              fill="var(--text-primary)" 
              style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.15))' }}
            />
            <text 
              x={p.x} 
              y={p.y - 15} 
              textAnchor="middle" 
              fill="var(--bg-color)" 
              style={{ fontSize: '9px', fontWeight: 600 }}
            >
              {p.value >= 1000000 ? `$${(p.value/1000000).toFixed(2)}M` : p.value >= 1000 ? `$${(p.value/1000).toFixed(1)}k` : `$${p.value}`}
            </text>
          </g>
        </g>
      ))}

      {points.map((p, idx) => (
        <text 
          key={idx} 
          x={p.x} 
          y={height - 8} 
          textAnchor="middle" 
          fill="var(--text-secondary)" 
          style={{ fontSize: '10px', fontFamily: 'inherit' }}
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
};

const BarChart: React.FC<ChartProps> = ({ data, color = '#10b981', gradientId = 'green-grad' }) => {
  const width = 500;
  const height = 180;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 25;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...data.map(d => d.value), 1) * 1.15; // 15% headroom
  const minVal = 0;

  const barWidth = (chartWidth / (data.length || 1)) * 0.5;
  const groupWidth = chartWidth / (data.length || 1);

  const gridLines = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {gridLines.map((ratio, idx) => {
        const yVal = minVal + ratio * (maxVal - minVal);
        const y = height - paddingBottom - ratio * chartHeight;
        return (
          <g key={idx}>
            <line 
              x1={paddingLeft} 
              y1={y} 
              x2={width - paddingRight} 
              y2={y} 
              stroke="var(--border-color)" 
              strokeDasharray="4 4" 
              strokeWidth="0.5"
            />
            <text 
              x={paddingLeft - 8} 
              y={y + 3} 
              textAnchor="end" 
              fill="var(--text-secondary)" 
              style={{ fontSize: '10px', fontFamily: 'inherit' }}
            >
              {yVal >= 1000000 ? `${(yVal / 1000000).toFixed(1)}M` : yVal >= 1000 ? `${(yVal / 1000).toFixed(0)}k` : yVal.toFixed(0)}
            </text>
          </g>
        );
      })}

      <line 
        x1={paddingLeft} 
        y1={height - paddingBottom} 
        x2={width - paddingRight} 
        y2={height - paddingBottom} 
        stroke="var(--border-color)" 
        strokeWidth="1"
      />

      {data.map((d, idx) => {
        const x = paddingLeft + idx * groupWidth + (groupWidth - barWidth) / 2;
        const barHeight = ((d.value - minVal) / (maxVal - minVal)) * chartHeight;
        const y = height - paddingBottom - barHeight;

        return (
          <g key={idx} className="chart-bar-group">
            <rect 
              x={x} 
              y={y} 
              width={barWidth} 
              height={Math.max(barHeight, 2)} 
              rx="4" 
              fill={`url(#${gradientId})`} 
              className="chart-bar"
              style={{ transition: 'all 0.3s' }}
            />
            <g className="chart-tooltip" style={{ opacity: 0, pointerEvents: 'none', transition: 'opacity 0.2s' }}>
              <rect 
                x={x + barWidth/2 - 35} 
                y={y - 25} 
                width="70" 
                height="18" 
                rx="3" 
                fill="var(--text-primary)" 
                style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.15))' }}
              />
              <text 
                x={x + barWidth/2} 
                y={y - 13} 
                textAnchor="middle" 
                fill="var(--bg-color)" 
                style={{ fontSize: '9px', fontWeight: 600 }}
              >
                {d.value >= 1000000 ? `${(d.value/1000000).toFixed(2)}M` : d.value >= 1000 ? `${(d.value/1000).toFixed(1)}k` : d.value}
              </text>
            </g>
            <text 
              x={x + barWidth / 2} 
              y={height - 8} 
              textAnchor="middle" 
              fill="var(--text-secondary)" 
              style={{ fontSize: '10px', fontFamily: 'inherit' }}
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'Admin';
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadKPIs() {
      try {
        setLoading(true);
        const data = await fetchKPIs();
        setKpis(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    }
    loadKPIs();
  }, [role]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text-secondary)' }}>
        <div className="spinner" style={{ border: '4px solid rgba(0,0,0,0.1)', width: '36px', height: '36px', borderRadius: '50%', borderLeftColor: 'var(--primary-color)', animation: 'spin 1s linear infinite' }} />
        <span style={{ marginLeft: '1rem', fontWeight: 500 }}>Loading SOGT Control Centre...</span>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass" style={{ padding: '2rem', margin: '2rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <AlertCircle size={40} color="var(--danger-color)" style={{ margin: '0 auto 1rem auto' }} />
        <h3 style={{ color: 'var(--text-primary)' }}>Failed to Connect to SOGT Servers</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>{error}</p>
      </div>
    );
  }

  const renderAdminDashboard = () => (
    <>
      <header className="dashboard-header">
        <h1>Global Admin Control Centre</h1>
        <p>Shivaa Om Globe Trade (SOGT) Operations Overview</p>
      </header>

      <div className="kpi-grid">
        <div className="kpi-card glass">
          <div className="kpi-icon blue"><Users size={24} /></div>
          <div className="kpi-info"><h3>Total Portfolios</h3><p className="kpi-value">{kpis?.totalPortfolios} Customers</p></div>
        </div>
        <div className="kpi-card glass">
          <div className="kpi-icon green"><Package size={24} /></div>
          <div className="kpi-info"><h3>Active Orders</h3><p className="kpi-value">{kpis?.activeOrders} Orders</p></div>
        </div>
        <div className="kpi-card glass">
          <div className="kpi-icon orange"><Ship size={24} /></div>
          <div className="kpi-info"><h3>Pending Freight</h3><p className="kpi-value">{kpis?.pendingFreight} Shipments</p></div>
        </div>
        <div className="kpi-card glass">
          <div className="kpi-icon purple"><TrendingUp size={24} /></div>
          <div className="kpi-info"><h3>Monthly Revenue</h3><p className="kpi-value">${(kpis?.monthlyRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-card glass">
          <div className="chart-title">Revenue Trend</div>
          <div className="chart-subtitle">Monthly trade transaction volume overview</div>
          <div className="chart-wrapper">
            <LineChart data={[
              { label: 'Jan', value: (kpis?.monthlyRevenue || 0) * 0.7 },
              { label: 'Feb', value: (kpis?.monthlyRevenue || 0) * 0.85 },
              { label: 'Mar', value: (kpis?.monthlyRevenue || 0) * 0.8 },
              { label: 'Apr', value: (kpis?.monthlyRevenue || 0) * 0.95 },
              { label: 'May', value: (kpis?.monthlyRevenue || 0) * 0.9 },
              { label: 'Jun', value: (kpis?.monthlyRevenue || 0) },
            ]} color="#2563eb" gradientId="blue-rev-grad" />
          </div>
        </div>

        <div className="chart-card glass">
          <div className="chart-title">Trade Distribution by Port</div>
          <div className="chart-subtitle">Freight distribution across core shipping hubs</div>
          <div className="chart-wrapper">
            <BarChart data={[
              { label: 'Rotterdam', value: Math.round((kpis?.activeOrders || 0) * 4) || 20 },
              { label: 'Singapore', value: Math.round((kpis?.activeOrders || 0) * 2.5) || 12 },
              { label: 'Nhava Sheva', value: Math.round((kpis?.activeOrders || 0) * 2) || 10 },
              { label: 'Shanghai', value: Math.round((kpis?.activeOrders || 0) * 1.5) || 8 },
            ]} color="#10b981" gradientId="green-hub-grad" />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        <div className="glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.1rem' }}>
            <Activity size={18} color="var(--primary-color)" />
            <span>Recent SOGT Compliance Operations</span>
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.85rem' }}>
            {kpis?.recentCompliance?.map((log: any, idx: number) => (
              <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span dangerouslySetInnerHTML={{ __html: log.description }} />
                <span style={{ color: 'var(--text-secondary)' }}>{new Date(log.time).toLocaleTimeString()}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Payments Due</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Aging balance outstanding</p>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--danger-color)', margin: '1rem 0' }}>
            ${(kpis?.paymentsDue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Telegraphic Transfer pending confirmation
          </div>
        </div>
      </div>
    </>
  );

  const renderSalesDashboard = () => (
    <>
      <header className="dashboard-header">
        <h1>Sales & Pipeline Overview</h1>
        <p>Manage customer leads, pricing negotiations, and commercial quotes</p>
      </header>

      <div className="kpi-grid">
        <div className="kpi-card glass">
          <div className="kpi-icon blue"><Users size={24} /></div>
          <div className="kpi-info"><h3>Active Leads</h3><p className="kpi-value">{kpis?.activeLeads} Pipelines</p></div>
        </div>
        <div className="kpi-card glass">
          <div className="kpi-icon green"><FileText size={24} /></div>
          <div className="kpi-info"><h3>Open Inquiries</h3><p className="kpi-value">{kpis?.openInquiries} RFQs</p></div>
        </div>
        <div className="kpi-card glass">
          <div className="kpi-icon orange"><Clock size={24} /></div>
          <div className="kpi-info"><h3>Pending Quotes</h3><p className="kpi-value">{kpis?.pendingQuotes} Quotations</p></div>
        </div>
        <div className="kpi-card glass">
          <div className="kpi-icon purple"><TrendingUp size={24} /></div>
          <div className="kpi-info"><h3>Monthly Sales</h3><p className="kpi-value">${(kpis?.monthlySales || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-card glass">
          <div className="chart-title">Monthly Conversion Rate</div>
          <div className="chart-subtitle">RFQ inquiries successfully transformed to orders</div>
          <div className="chart-wrapper">
            <LineChart data={[
              { label: 'Jan', value: (kpis?.conversionRatio || 0) * 0.8 },
              { label: 'Feb', value: (kpis?.conversionRatio || 0) * 0.9 },
              { label: 'Mar', value: (kpis?.conversionRatio || 0) * 0.85 },
              { label: 'Apr', value: (kpis?.conversionRatio || 0) * 0.95 },
              { label: 'May', value: (kpis?.conversionRatio || 0) * 1.05 },
              { label: 'Jun', value: (kpis?.conversionRatio || 0) },
            ]} color="#f59e0b" gradientId="orange-sales-grad" />
          </div>
        </div>

        <div className="chart-card glass">
          <div className="chart-title">Inquiry Status Distribution</div>
          <div className="chart-subtitle">RFQs pipeline stage counts</div>
          <div className="chart-wrapper">
            <BarChart data={[
              { label: 'Active Leads', value: kpis?.activeLeads || 0 },
              { label: 'Open RFQs', value: kpis?.openInquiries || 0 },
              { label: 'Pending Quotes', value: kpis?.pendingQuotes || 0 },
            ]} color="#8b5cf6" gradientId="purple-pipeline-grad" />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        <div className="glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Sourcing Actions</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Ensure basmati rice and cotton yarn supplier contracts are prepared before quotation expiry.
          </p>
          <button className="login-button" style={{ width: 'fit-content', padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={() => window.location.href = '/inquiries'}>
            Review Open RFQs
          </button>
        </div>
        <div className="glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Conversion Ratio</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-color)' }}>
            {(kpis?.conversionRatio || 0).toFixed(1)}%
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Quotations converted to confirmed commercial Sales Orders
          </p>
        </div>
      </div>
    </>
  );

  const renderDocumentationDashboard = () => (
    <>
      <header className="dashboard-header">
        <h1>Trade Documentation Control</h1>
        <p>Coordinate container freight bookings, customs clearance, and Bill of Lading uploads</p>
      </header>

      <div className="kpi-grid">
        <div className="kpi-card glass">
          <div className="kpi-icon blue"><FileText size={24} /></div>
          <div className="kpi-info"><h3>Pending Uploads</h3><p className="kpi-value">{kpis?.pendingUploads} Documents</p></div>
        </div>
        <div className="kpi-card glass">
          <div className="kpi-icon green"><Package size={24} /></div>
          <div className="kpi-info"><h3>Shipments Ready</h3><p className="kpi-value">{kpis?.shipmentsReady} Cargo Containers</p></div>
        </div>
        <div className="kpi-card glass">
          <div className="kpi-icon orange"><Calendar size={24} /></div>
          <div className="kpi-info"><h3>ETD This Week</h3><p className="kpi-value">{kpis?.etdThisWeek} Vessels</p></div>
        </div>
        <div className="kpi-card glass">
          <div className="kpi-icon purple"><Ship size={24} /></div>
          <div className="kpi-info"><h3>ETA This Week</h3><p className="kpi-value">{kpis?.etaThisWeek} Vessels</p></div>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-card glass">
          <div className="chart-title">Weekly Container Loads</div>
          <div className="chart-subtitle">Vessel bookings ready vs pending clearance</div>
          <div className="chart-wrapper">
            <BarChart data={[
              { label: 'Pending Docs', value: kpis?.pendingUploads || 0 },
              { label: 'Containers Ready', value: kpis?.shipmentsReady || 0 },
              { label: 'ETD Vessels', value: kpis?.etdThisWeek || 0 },
              { label: 'ETA Vessels', value: kpis?.etaThisWeek || 0 },
            ]} color="#2563eb" gradientId="blue-docs-grad" />
          </div>
        </div>

        <div className="chart-card glass">
          <div className="chart-title">On-Time Cargo Despatch</div>
          <div className="chart-subtitle">Last 6 months vessel compliance rate (%)</div>
          <div className="chart-wrapper">
            <LineChart data={[
              { label: 'Jan', value: 92 },
              { label: 'Feb', value: 89 },
              { label: 'Mar', value: 94 },
              { label: 'Apr', value: 91 },
              { label: 'May', value: 95 },
              { label: 'Jun', value: 98 },
            ]} color="#10b981" gradientId="green-ontime-grad" />
          </div>
        </div>
      </div>

      <div className="glass" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Customs Compliance Audit Log</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Pre-lodgement of Packing Lists and Certificates of Origin with Rotterdam port authorities is active.
        </p>
      </div>
    </>
  );

  const renderAccountsDashboard = () => (
    <>
      <header className="dashboard-header">
        <h1>Accounts Receivable Ledger</h1>
        <p>Monitor invoices, record telegraphic transfer receipts, and evaluate outstanding debt balance aging</p>
      </header>

      <div className="kpi-grid">
        <div className="kpi-card glass">
          <div className="kpi-icon orange"><AlertCircle size={24} /></div>
          <div className="kpi-info"><h3>Outstanding Receivables</h3><p className="kpi-value">${(kpis?.outstandingReceivables || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div>
        </div>
        <div className="kpi-card glass">
          <div className="kpi-icon red" style={{ color: 'var(--danger-color)' }}><Clock size={24} /></div>
          <div className="kpi-info"><h3>Overdue Invoices</h3><p className="kpi-value">${(kpis?.overdueInvoices || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div>
        </div>
        <div className="kpi-card glass">
          <div className="kpi-icon green"><CheckCircle size={24} /></div>
          <div className="kpi-info"><h3>Received Funds</h3><p className="kpi-value">${(kpis?.receivedFunds || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div>
        </div>
        <div className="kpi-card glass">
          <div className="kpi-icon purple"><DollarSign size={24} /></div>
          <div className="kpi-info"><h3>Revenue Summary</h3><p className="kpi-value">${(kpis?.revenueSummary || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-card glass">
          <div className="chart-title">Receivable Aging Ledger</div>
          <div className="chart-subtitle">Outstanding accounts duration analysis ($)</div>
          <div className="chart-wrapper">
            <BarChart data={[
              { label: '0-30 Days', value: Math.round((kpis?.outstandingReceivables || 0) * 0.5) },
              { label: '31-60 Days', value: Math.round((kpis?.outstandingReceivables || 0) * 0.3) },
              { label: '61-90 Days', value: Math.round((kpis?.outstandingReceivables || 0) * 0.15) },
              { label: '90+ Days', value: Math.round((kpis?.outstandingReceivables || 0) * 0.05) },
            ]} color="#ef4444" gradientId="red-aging-grad" />
          </div>
        </div>

        <div className="chart-card glass">
          <div className="chart-title">Cash Flow & Received Funds</div>
          <div className="chart-subtitle">Telegraphic Transfer receipts monthly trend ($)</div>
          <div className="chart-wrapper">
            <LineChart data={[
              { label: 'Jan', value: (kpis?.receivedFunds || 0) * 0.65 },
              { label: 'Feb', value: (kpis?.receivedFunds || 0) * 0.8 },
              { label: 'Mar', value: (kpis?.receivedFunds || 0) * 0.75 },
              { label: 'Apr', value: (kpis?.receivedFunds || 0) * 0.9 },
              { label: 'May', value: (kpis?.receivedFunds || 0) * 0.85 },
              { label: 'Jun', value: (kpis?.receivedFunds || 0) },
            ]} color="#10b981" gradientId="green-cashflow-grad" />
          </div>
        </div>
      </div>

      <div className="glass" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>TT Ledger Validation Queue</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Review Swift bank receipts from Seoul Construction Steel overdue invoices to unlock cargo dispatch blocks.
        </p>
      </div>
    </>
  );

  const renderCustomerDashboard = () => (
    <>
      <header className="dashboard-header">
        <h1>Customer Tracking Portal</h1>
        <p>Monitor active orders, cargo shipping lines, and download certificates</p>
      </header>

      <div className="kpi-grid">
        <div className="kpi-card glass">
          <div className="kpi-icon blue"><Package size={24} /></div>
          <div className="kpi-info"><h3>Active Orders</h3><p className="kpi-value">{kpis?.activeOrders} Confirmed Files</p></div>
        </div>
        <div className="kpi-card glass">
          <div className="kpi-icon green"><Ship size={24} /></div>
          <div className="kpi-info"><h3>My Shipments</h3><p className="kpi-value">{kpis?.myShipments} Cargo Containers</p></div>
        </div>
        <div className="kpi-card glass">
          <div className="kpi-icon orange"><Calendar size={24} /></div>
          <div className="kpi-info"><h3>Upcoming ETA</h3><p className="kpi-value">{kpis?.upcomingETA}</p></div>
        </div>
        <div className="kpi-card glass">
          <div className="kpi-icon purple"><FileText size={24} /></div>
          <div className="kpi-info"><h3>My Documents</h3><p className="kpi-value">{kpis?.myDocuments} Available Files</p></div>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-card glass">
          <div className="chart-title">My Order Value History</div>
          <div className="chart-subtitle">Transaction spends over time ($)</div>
          <div className="chart-wrapper">
            <LineChart data={[
              { label: 'Jan', value: 8500 },
              { label: 'Feb', value: 12400 },
              { label: 'Mar', value: 9800 },
              { label: 'Apr', value: 16500 },
              { label: 'May', value: 14200 },
              { label: 'Jun', value: 21000 },
            ]} color="#2563eb" gradientId="blue-custspend-grad" />
          </div>
        </div>

        <div className="chart-card glass">
          <div className="chart-title">Vessel Transit Progress</div>
          <div className="chart-subtitle">Milestones completion rate (%)</div>
          <div className="chart-wrapper">
            <BarChart data={[
              { label: 'Draft', value: 100 },
              { label: 'Packed', value: 100 },
              { label: 'Customs', value: 100 },
              { label: 'Transit', value: kpis?.vesselName !== 'N/A' ? 70 : 0 },
              { label: 'Arrived', value: kpis?.vesselStatus === 'Arrived' ? 100 : 0 },
            ]} color="#10b981" gradientId="green-custtransit-grad" />
          </div>
        </div>
      </div>

      <div className="glass" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Active Cargo Vessel Location</h3>
        <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: 'var(--radius-md)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--accent-color)' }}>{kpis?.vesselName}</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.1rem' }}>
              Vessel Location Status: {kpis?.vesselStatus}
            </div>
          </div>
          <span style={{ fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-color)', padding: '0.2rem 0.6rem', borderRadius: '50px', fontWeight: 600 }}>
            {kpis?.vesselName !== 'N/A' ? 'On Schedule' : 'No Active Shipments'}
          </span>
        </div>
      </div>
    </>
  );

  return (
    <div className="dashboard-container">
      {role === 'Admin' && renderAdminDashboard()}
      {role === 'Sales' && renderSalesDashboard()}
      {role === 'Documentation' && renderDocumentationDashboard()}
      {role === 'Accounts' && renderAccountsDashboard()}
      {role === 'Customer' && renderCustomerDashboard()}
    </div>
  );
};

export default Dashboard;
