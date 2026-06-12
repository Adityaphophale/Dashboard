import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Globe, Mail, Phone, X } from 'lucide-react';
import { type Supplier, fetchSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../services/suppliers';
import { useAuth } from '../context/AuthContext';
import '../styles/Customers.css';

const Suppliers: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'Admin';

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Partial<Supplier> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form values
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [country, setCountry] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await fetchSuppliers();
      setSuppliers(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load suppliers list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const resetForm = () => {
    setName('');
    setContactPerson('');
    setCountry('');
    setEmail('');
    setPhone('');
    setCurrentSupplier(null);
  };

  const handleAddClick = () => {
    resetForm();
    setIsEditing(false);
    setIsDrawerOpen(true);
  };

  const handleEditClick = (sup: Supplier) => {
    setCurrentSupplier(sup);
    setName(sup.name);
    setContactPerson(sup.contactPerson);
    setCountry(sup.country);
    setEmail(sup.email);
    setPhone(sup.phone);
    setIsEditing(true);
    setIsDrawerOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await deleteSupplier(id);
        loadSuppliers();
      } catch (err: any) {
        alert(err.message || 'Failed to delete supplier.');
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, contactPerson, country, email, phone };

    try {
      if (isEditing && currentSupplier?.id) {
        await updateSupplier(currentSupplier.id, payload);
      } else {
        await createSupplier(payload);
      }
      setIsDrawerOpen(false);
      resetForm();
      loadSuppliers();
    } catch (err: any) {
      alert(err.message || 'Error saving supplier.');
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="customers-container">
      <div className="customers-header">
        <div>
          <h1>Supplier Directory</h1>
          <p className="text-secondary">Manage international manufacturer databases, export sourcing contacts, and compliance certificates</p>
        </div>
        {(role === 'Admin' || role === 'Sales') && (
          <button className="btn-primary" onClick={handleAddClick}>
            <Plus size={18} />
            <span>New Supplier</span>
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="table-controls glass" style={{ padding: '1rem' }}>
        <div className="search-bar">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Search suppliers by name, region..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid of suppliers */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading suppliers...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--danger-color)' }}>{error}</div>
      ) : (
        <div className="table-container glass">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Supplier Name</th>
                <th>Contact Person</th>
                <th>Region</th>
                <th>Corporate Email</th>
                <th>Phone Connection</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{s.name}</div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{s.contactPerson}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Globe size={14} color="var(--text-secondary)" />
                        <span>{s.country}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-color)' }}>
                        <Mail size={14} />
                        <span>{s.email}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <Phone size={14} />
                        <span>{s.phone}</span>
                      </div>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn-icon edit" title="Edit Supplier" onClick={() => handleEditClick(s)}><Edit size={16} /></button>
                        <button className="btn-icon delete" title="Delete Supplier" onClick={() => handleDeleteClick(s.id)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    No suppliers registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Supplier drawer */}
      {isDrawerOpen && (
        <div className="drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <div className="drawer" style={{ width: '450px' }} onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>{isEditing ? 'Edit Supplier Profile' : 'Register New Supplier'}</h2>
              <button className="btn-icon" onClick={() => setIsDrawerOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 70px)' }}>
              <div className="drawer-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Supplier Corporate Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ganga Agri Mills" 
                    />
                  </div>

                  <div className="form-group">
                    <label>Contact Person *</label>
                    <input 
                      type="text" 
                      required 
                      value={contactPerson} 
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="John Smith" 
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Email Address *</label>
                      <input 
                        type="email" 
                        required 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@supplier.com" 
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input 
                        type="text" 
                        required 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 22 1234 5678" 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Country *</label>
                    <input 
                      type="text" 
                      required 
                      value={country} 
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g. India" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="drawer-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsDrawerOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
