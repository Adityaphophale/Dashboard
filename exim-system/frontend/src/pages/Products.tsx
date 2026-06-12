import React, { useEffect, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { type Product, fetchProducts, createProduct } from '../services/products';
import { useAuth } from '../context/AuthContext';
import '../styles/Customers.css';

const Products: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'Admin';

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [name, setName] = useState('');
  const [hsCode, setHsCode] = useState('');
  const [unit, setUnit] = useState('Metric Tons (MT)');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load products list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !hsCode || !price) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      await createProduct({
        name,
        hsCode,
        unit,
        price: parseFloat(price) || 0,
        currency
      });
      setIsDrawerOpen(false);
      // Reset form
      setName('');
      setHsCode('');
      setPrice('');
      
      loadProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to create product.');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.productCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.hsCode.includes(searchQuery)
  );

  return (
    <div className="customers-container">
      <div className="customers-header">
        <div>
          <h1>Product Catalog</h1>
          <p className="text-secondary">Manage global SKU lists, custom HS classifications, and default tariff rates</p>
        </div>
        {(role === 'Admin' || role === 'Sales') && (
          <button className="btn-primary" onClick={() => setIsDrawerOpen(true)}>
            <Plus size={18} />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {/* Search bar */}
      <div className="table-controls glass" style={{ padding: '1rem' }}>
        <div className="search-bar">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Search by SKU, HS code, or name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid of Products */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading catalog...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--danger-color)' }}>{error}</div>
      ) : (
        <div className="table-container glass">
          <table className="premium-table">
            <thead>
              <tr>
                <th>SKU / Product Code</th>
                <th>Description</th>
                <th>HS Harmonized Code</th>
                <th>Logistical Unit</th>
                <th>Unit Rate</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                      {p.productCode}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                    </td>
                    <td>
                      <span style={{ 
                        fontFamily: 'monospace', 
                        fontSize: '0.85rem',
                        background: '#f8fafc',
                        border: '1px solid var(--border-color)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        {p.hsCode}
                      </span>
                    </td>
                    <td>{p.unit}</td>
                    <td style={{ fontWeight: 600 }}>
                      {p.currency === 'USD' ? '$' : '€'}{Number(p.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    No products matching search found in catalog.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* New Product Drawer */}
      {isDrawerOpen && (
        <div className="drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <div className="drawer" style={{ width: '450px' }} onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>Register New Cargo Goods Item</h2>
              <button className="btn-icon" onClick={() => setIsDrawerOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 70px)' }}>
              <div className="drawer-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Product Common Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Organic Basmati Rice (Premium)" 
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>HS Harmonization Code *</label>
                      <input 
                        type="text" 
                        required 
                        value={hsCode} 
                        onChange={(e) => setHsCode(e.target.value)}
                        placeholder="e.g. 1006.30.20" 
                      />
                    </div>
                    <div className="form-group">
                      <label>Logistical Standard Unit</label>
                      <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                        <option value="Metric Tons (MT)">Metric Tons (MT)</option>
                        <option value="Kilograms (KG)">Kilograms (KG)</option>
                        <option value="Barrels (BBL)">Barrels (BBL)</option>
                        <option value="Liters (L)">Liters (L)</option>
                        <option value="Units">Units</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Base Price Rate *</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        required 
                        value={price} 
                        onChange={(e) => setPrice(e.target.value)} 
                        placeholder="0.00" 
                      />
                    </div>
                    <div className="form-group">
                      <label>Currency</label>
                      <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="drawer-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsDrawerOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save SKU Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
