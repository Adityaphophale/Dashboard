import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, TrendingUp, Users, RefreshCw, X } from 'lucide-react';
import type { Lead } from '../services/inquiries';
import { fetchLeads, createLead, updateLead } from '../services/inquiries';
import type { Customer } from '../services/customers';
import { fetchCustomers } from '../services/customers';
import { useAuth } from '../context/AuthContext';
import '../styles/Customers.css';

const Leads: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'Admin';

  const [leads, setLeads] = useState<Lead[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState<Partial<Lead> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form values
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [source, setSource] = useState('Website Inquiry');
  const [status, setStatus] = useState<Lead['status']>('New');
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchLeads();
      setLeads(data);

      if (role === 'Admin' || role === 'Sales') {
        const custs = await fetchCustomers({ status: 'all' });
        setCustomers(custs);
      }
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load leads list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [role]);

  const resetForm = () => {
    setSelectedCustomerId('');
    setSource('Website Inquiry');
    setStatus('New');
    setNotes('');
    setCurrentLead(null);
  };

  const handleAddClick = () => {
    resetForm();
    setIsEditing(false);
    setIsDrawerOpen(true);
  };

  const handleEditClick = (lead: Lead) => {
    setCurrentLead(lead);
    setSelectedCustomerId(lead.customerId || '');
    setSource(lead.source);
    setStatus(lead.status);
    setNotes(lead.notes || '');
    setIsEditing(true);
    setIsDrawerOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      alert('Please select a customer portfolio.');
      return;
    }

    const payload = {
      customerId: selectedCustomerId,
      source,
      status,
      notes,
    };

    try {
      if (isEditing && currentLead?.id) {
        await updateLead(currentLead.id, payload);
      } else {
        await createLead(payload);
      }
      setIsDrawerOpen(false);
      resetForm();
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save lead.');
    }
  };

  const getStatusBadgeClass = (s: string) => {
    switch (s) {
      case 'New': return 'status-badge active';
      case 'Contacted': return 'status-badge inactive';
      case 'Qualified': return 'status-badge active';
      case 'Lost': return 'status-badge blocked';
      default: return 'status-badge';
    }
  };

  const filteredLeads = leads.filter(l => {
    const client = l.customer?.companyName || '';
    const code = l.leadNumber || '';
    const contact = l.customer?.contactPerson || '';

    const matchesSearch = 
      client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'New').length;
  const conversionRate = totalLeads > 0 ? (leads.filter(l => l.status === 'Qualified').length / totalLeads) * 100 : 25.0;

  return (
    <div className="customers-container">
      <div className="customers-header">
        <div>
          <h1>Leads & Pipeline Management</h1>
          <p className="text-secondary">Nurture global leads from raw inquiries to qualified import-export opportunities</p>
        </div>
        {(role === 'Admin' || role === 'Sales') && (
          <button className="btn-primary" onClick={handleAddClick}>
            <Plus size={18} />
            <span>New Lead</span>
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="kpis-grid">
        <div className="kpi-card glass">
          <div className="kpi-icon blue">
            <TrendingUp size={22} />
          </div>
          <div className="kpi-info">
            <h3>Total Pipeline</h3>
            <p className="kpi-value">{totalLeads}</p>
          </div>
        </div>

        <div className="kpi-card glass">
          <div className="kpi-icon green">
            <Users size={22} />
          </div>
          <div className="kpi-info">
            <h3>New Inquiries</h3>
            <p className="kpi-value">{newLeads}</p>
          </div>
        </div>

        <div className="kpi-card glass">
          <div className="kpi-icon purple">
            <RefreshCw size={22} />
          </div>
          <div className="kpi-info">
            <h3>Conversion Rate</h3>
            <p className="kpi-value">{conversionRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="table-controls glass" style={{ padding: '1rem' }}>
        <div className="search-bar">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Search leads by company, contact..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Stages</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Grid of Leads */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading pipeline...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--danger-color)' }}>{error}</div>
      ) : (
        <div className="table-container glass">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Lead Details</th>
                <th>Contact Info</th>
                <th>Lead Source</th>
                <th>Assigned Specialist</th>
                <th>Notes / Action Item</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length > 0 ? (
                filteredLeads.map(l => (
                  <tr key={l.id}>
                    <td>
                      <div className="customer-meta">
                        <span className="customer-code">{l.leadNumber}</span>
                        <span className="company-name">{l.customer?.companyName}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Created: {new Date(l.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{l.customer?.contactPerson}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{l.customer?.phone}</div>
                    </td>
                    <td>{l.source}</td>
                    <td>{l.user ? `${l.user.firstName} ${l.user.lastName}` : 'Unassigned'}</td>
                    <td style={{ maxWidth: '280px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {l.notes}
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(l.status)}>
                        {l.status}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn-icon edit" title="Edit Lead" onClick={() => handleEditClick(l)}><Edit size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    No matching leads found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Lead Drawer */}
      {isDrawerOpen && (
        <div className="drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <div className="drawer" style={{ width: '450px' }} onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>{isEditing ? 'Edit Lead Status' : 'Register New Pipeline Lead'}</h2>
              <button className="btn-icon" onClick={() => setIsDrawerOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 70px)' }}>
              <div className="drawer-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Link Customer Portfolio *</label>
                    <select required value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)}>
                      <option value="">-- Choose Customer --</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.companyName} ({c.customerCode})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Lead Acquisition Source *</label>
                      <select value={source} onChange={(e) => setSource(e.target.value)}>
                        <option value="Website Inquiry">Website Inquiry</option>
                        <option value="International Trade Fair">International Trade Fair</option>
                        <option value="Referral">Referral</option>
                        <option value="Linkedin Outbound">Linkedin Outbound</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Pipeline Stage *</label>
                      <select value={status} onChange={(e) => setStatus(e.target.value as Lead['status'])}>
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Notes / Sourcing Requirements</label>
                    <textarea 
                      rows={4} 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)} 
                      placeholder="e.g. Verified payment terms. Annual trade projection. Target cargo specs..."
                    />
                  </div>
                </div>
              </div>
              
              <div className="drawer-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsDrawerOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
