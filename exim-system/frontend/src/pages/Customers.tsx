import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Globe,
  DollarSign
} from 'lucide-react';
import type { Customer } from '../services/customers';
import { 
  fetchCustomers, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer 
} from '../services/customers';
import '../styles/Customers.css';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Partial<Customer> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form values
  const [formCompany, setFormCompany] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCountry, setFormCountry] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formGstVat, setFormGstVat] = useState('');
  const [formStatus, setFormStatus] = useState<Customer['status']>('active');

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await fetchCustomers({ 
        search: searchQuery || undefined, 
        status: statusFilter !== 'all' ? statusFilter : undefined 
      });
      setCustomers(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customers list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [searchQuery, statusFilter]);

  const resetForm = () => {
    setFormCompany('');
    setFormContact('');
    setFormEmail('');
    setFormPhone('');
    setFormCountry('');
    setFormAddress('');
    setFormGstVat('');
    setFormStatus('active');
    setCurrentCustomer(null);
  };

  const handleAddClick = () => {
    resetForm();
    setIsEditing(false);
    setIsDrawerOpen(true);
  };

  const handleEditClick = (cust: Customer) => {
    setCurrentCustomer(cust);
    setFormCompany(cust.companyName);
    setFormContact(cust.contactPerson);
    setFormEmail(cust.email);
    setFormPhone(cust.phone);
    setFormCountry(cust.country);
    setFormAddress(cust.address);
    setFormGstVat(cust.gstVatNumber || '');
    setFormStatus(cust.status);
    setIsEditing(true);
    setIsDrawerOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer(id);
        loadCustomers();
      } catch (err: any) {
        alert(err.message || 'Error deleting customer record.');
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      companyName: formCompany,
      contactPerson: formContact,
      email: formEmail,
      phone: formPhone,
      country: formCountry,
      address: formAddress,
      gstVatNumber: formGstVat || undefined,
      status: formStatus,
    };

    try {
      if (isEditing && currentCustomer?.id) {
        await updateCustomer(currentCustomer.id, payload);
      } else {
        await createCustomer(payload);
      }
      setIsDrawerOpen(false);
      resetForm();
      loadCustomers();
    } catch (err: any) {
      alert(err.message || 'Error saving customer record.');
    }
  };

  // Stats
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const blockedCustomers = customers.filter(c => c.status === 'blocked').length;
  const totalOutstanding = customers.reduce((sum, c) => sum + (c.outstandingBalance || 0), 0);

  return (
    <div className="customers-container">
      {/* Header */}
      <div className="customers-header">
        <div>
          <h1>Customer Directory</h1>
          <p className="text-secondary">Manage and monitor exporter, importer and agent portfolios</p>
        </div>
        <button onClick={handleAddClick} className="btn-primary">
          <Plus size={18} />
          <span>Add Customer</span>
        </button>
      </div>

      {/* KPI Widgets */}
      <div className="kpis-grid">
        <div className="kpi-card glass">
          <div className="kpi-icon blue">
            <Users size={22} />
          </div>
          <div className="kpi-info">
            <h3>Total Customers</h3>
            <p className="kpi-value">{totalCustomers}</p>
          </div>
        </div>

        <div className="kpi-card glass">
          <div className="kpi-icon green">
            <CheckCircle size={22} />
          </div>
          <div className="kpi-info">
            <h3>Active Accounts</h3>
            <p className="kpi-value">{activeCustomers}</p>
          </div>
        </div>

        <div className="kpi-card glass">
          <div className="kpi-icon orange">
            <AlertTriangle size={22} />
          </div>
          <div className="kpi-info">
            <h3>Blocked Accounts</h3>
            <p className="kpi-value">{blockedCustomers}</p>
          </div>
        </div>

        <div className="kpi-card glass">
          <div className="kpi-icon purple">
            <DollarSign size={22} />
          </div>
          <div className="kpi-info">
            <h3>Total Outstanding</h3>
            <p className="kpi-value">${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="table-controls glass" style={{ padding: '1rem' }}>
        <div className="search-bar">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Search by company, code, or contact..." 
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
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading portfolios...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--danger-color)' }}>{error}</div>
      ) : (
        <div className="table-container glass">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Customer Details</th>
                <th>Contact Person</th>
                <th>Region</th>
                <th>Outstanding</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length > 0 ? (
                customers.map((cust) => (
                  <tr key={cust.id}>
                    <td>
                      <div className="customer-meta">
                        <span className="customer-code">{cust.customerCode}</span>
                        <span className="company-name">{cust.companyName}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{cust.email}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{cust.contactPerson}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{cust.phone}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Globe size={14} color="var(--text-secondary)" />
                        <span>{cust.country}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      ${(cust.outstandingBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className={`status-badge ${cust.status}`}>
                        {cust.status}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button 
                          onClick={() => handleEditClick(cust)} 
                          className="btn-icon edit" 
                          title="Edit Customer"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(cust.id)} 
                          className="btn-icon delete" 
                          title="Delete Customer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    No customers found matching the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Slide-out Drawer Component */}
      {isDrawerOpen && (
        <div className="drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>{isEditing ? 'Edit Customer Portfolio' : 'Register New Customer'}</h2>
              <button className="btn-icon" onClick={() => setIsDrawerOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 70px)' }}>
              <div className="drawer-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Company Legal Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={formCompany}
                      onChange={(e) => setFormCompany(e.target.value)}
                      placeholder="e.g. Acme Corporation Ltd" 
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Contact Person *</label>
                      <input 
                        type="text" 
                        required 
                        value={formContact}
                        onChange={(e) => setFormContact(e.target.value)}
                        placeholder="John Doe" 
                      />
                    </div>
                    <div className="form-group">
                      <label>Account Status</label>
                      <select 
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as Customer['status'])}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Email Address *</label>
                      <input 
                        type="email" 
                        required 
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="email@company.com" 
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input 
                        type="text" 
                        required 
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="+1 (555) 123-4567" 
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Country *</label>
                      <input 
                        type="text" 
                        required 
                        value={formCountry}
                        onChange={(e) => setFormCountry(e.target.value)}
                        placeholder="Germany" 
                      />
                    </div>
                    <div className="form-group">
                      <label>GST / VAT / Tax ID</label>
                      <input 
                        type="text" 
                        value={formGstVat}
                        onChange={(e) => setFormGstVat(e.target.value)}
                        placeholder="EU-12345678" 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Corporate Address *</label>
                    <textarea 
                      rows={3} 
                      required 
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      placeholder="Enter street, office number, city, postal code..."
                    />
                  </div>
                </div>
              </div>
              
              <div className="drawer-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsDrawerOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {isEditing ? 'Save Changes' : 'Register Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
