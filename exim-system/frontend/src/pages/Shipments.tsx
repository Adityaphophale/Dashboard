import React, { useEffect, useState } from 'react';
import { Truck, MapPin, Anchor, Navigation, Calendar, X, Plus, Clock } from 'lucide-react';
import type { Shipment } from '../services/shipments';
import { fetchShipments, createShipment, updateShipmentStatus, updateShipmentDetails } from '../services/shipments';
import type { Order } from '../services/orders';
import { fetchOrders } from '../services/orders';
import { useAuth } from '../context/AuthContext';
import '../styles/Workflows.css';
import '../styles/Customers.css';

const SHIPMENT_STATUSES = [
  'Booking Confirmed',
  'Container Stuffed',
  'Vessel Departed',
  'Customs Cleared',
  'In Transit',
  'Delivered'
];

const Shipments: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'Admin';

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [containerNumber, setContainerNumber] = useState('');
  const [blNumber, setBlNumber] = useState('');
  const [shippingLine, setShippingLine] = useState('Maersk Line');
  const [vesselName, setVesselName] = useState('');
  const [freightForwarder, setFreightForwarder] = useState('');
  const [portOfLoading, setPortOfLoading] = useState('Nhava Sheva Port, India');
  const [portOfDischarge, setPortOfDischarge] = useState('Rotterdam, Netherlands');
  const [etd, setEtd] = useState('');
  const [eta, setEta] = useState('');

  // Status modal state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('In Transit');
  const [statusNotes, setStatusNotes] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const shipData = await fetchShipments();
      setShipments(shipData);
      
      // Auto select first shipment
      if (shipData.length > 0) {
        if (selectedShipment) {
          const current = shipData.find(s => s.id === selectedShipment.id);
          setSelectedShipment(current || shipData[0]);
        } else {
          setSelectedShipment(shipData[0]);
        }
      }

      if (role === 'Admin' || role === 'Documentation') {
        const orderData = await fetchOrders();
        // Filter orders that don't have active shipments
        setOrders(orderData.filter(o => o.status !== 'Delivered'));
      }
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load shipments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [role]);

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) {
      alert('Please select an order to allocate.');
      return;
    }

    try {
      await createShipment({
        orderId: selectedOrderId,
        containerNumber,
        blNumber,
        shippingLine,
        vesselName,
        freightForwarder,
        portOfLoading,
        portOfDischarge,
        etd: etd || new Date().toISOString(),
        eta: eta || new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString()
      });
      setIsDrawerOpen(false);
      // Reset form
      setSelectedOrderId('');
      setContainerNumber('');
      setBlNumber('');
      setVesselName('');
      setFreightForwarder('');
      
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create shipment.');
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment) return;

    try {
      await updateShipmentStatus(selectedShipment.id, newStatus, statusNotes);
      setIsStatusModalOpen(false);
      setStatusNotes('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update shipment status.');
    }
  };

  return (
    <div className="workflow-container">
      <div className="customers-header">
        <div>
          <h1>Ocean & Air Freight Logistics</h1>
          <p className="text-secondary">Track real-time container coordinates, bill of lading documentation, and port-clearance timelines</p>
        </div>
        {(role === 'Admin' || role === 'Documentation') && (
          <button className="btn-primary" onClick={() => setIsDrawerOpen(true)}>
            <Truck size={18} />
            <span>New Shipment</span>
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading shipments tracker...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--danger-color)' }}>{error}</div>
      ) : shipments.length === 0 ? (
        <div className="glass" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          No active shipments registered.
        </div>
      ) : (
        <div className="shipment-tracking-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
          
          {/* Tracker Map and Selected Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div className="vessel-tracker-map" style={{ minHeight: '200px' }}>
              <div className="map-radar"></div>
              <div className="map-ship-dot" style={{ top: '45%', left: '55%' }}></div>
              
              <div style={{ zIndex: 5, textAlign: 'center', pointerEvents: 'none' }}>
                <Navigation size={32} color="var(--accent-color)" style={{ animation: 'spin 10s linear infinite' }} />
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'white', marginTop: '0.5rem' }}>
                  GPS VESSEL TRACKING ACTIVE
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.1rem' }}>
                  Vessel: {selectedShipment?.vesselName || 'N/A'} ({selectedShipment?.shippingLine || 'N/A'})
                </div>
              </div>
            </div>

            {/* Shipment Select Dropdown */}
            <div className="glass" style={{ padding: '1rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Shipment Fleet</label>
              <select 
                value={selectedShipment?.id || ''} 
                onChange={(e) => {
                  const s = shipments.find(item => item.id === e.target.value);
                  if (s) setSelectedShipment(s);
                }}
                style={{ marginTop: '0.4rem', width: '100%' }}
              >
                {shipments.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.shipmentNumber} - {s.vesselName} ({s.order?.customer?.companyName})
                  </option>
                ))}
              </select>
            </div>

            {/* Details Card */}
            {selectedShipment && (
              <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <div>
                    <span className="customer-code">{selectedShipment.shipmentNumber}</span>
                    <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.2rem' }}>{selectedShipment.vesselName}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Order Ref: {selectedShipment.order?.orderNumber}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-end' }}>
                    <span className="status-badge active">
                      {selectedShipment.status}
                    </span>
                    {(role === 'Admin' || role === 'Documentation') && (
                      <button 
                        onClick={() => {
                          setNewStatus(selectedShipment.status);
                          setIsStatusModalOpen(true);
                        }} 
                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(37,99,235,0.05)', border: 'none', color: 'var(--primary-color)', fontWeight: 600, cursor: 'pointer', borderRadius: '4px' }}
                      >
                        Update Stage
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-secondary)' }}>Container Number</div>
                    <div style={{ fontWeight: 600, marginTop: '0.1rem' }}>{selectedShipment.containerNumber || 'PENDING'}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)' }}>Bill of Lading (B/L)</div>
                    <div style={{ fontWeight: 600, marginTop: '0.1rem' }}>{selectedShipment.blNumber || 'PENDING'}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)' }}>Estimated Departure (ETD)</div>
                    <div style={{ fontWeight: 600, marginTop: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={14} color="var(--text-secondary)" />
                      <span>{new Date(selectedShipment.etd).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)' }}>Estimated Arrival (ETA)</div>
                    <div style={{ fontWeight: 600, marginTop: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={14} color="var(--accent-color)" />
                      <span>{new Date(selectedShipment.eta).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <MapPin size={16} color="var(--text-secondary)" style={{ marginTop: '0.1rem' }} />
                    <div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Port of Loading</div>
                      <div style={{ fontWeight: 600 }}>{selectedShipment.portOfLoading}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <Anchor size={16} color="var(--primary-color)" style={{ marginTop: '0.1rem' }} />
                    <div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Port of Discharge</div>
                      <div style={{ fontWeight: 600 }}>{selectedShipment.portOfDischarge}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Milestone History Logger */}
          {selectedShipment && (
            <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Milestone Tracker</h3>
              
              <div className="tracking-timeline">
                {selectedShipment.statusHistory?.map((history, idx) => (
                  <div key={history.id} className={`tracking-point ${idx === 0 ? 'active' : 'completed'}`}>
                    <div className="tracking-dot"></div>
                    <div className="tracking-content">
                      <span className="tracking-date">{new Date(history.createdAt).toLocaleString()}</span>
                      <h4 className="tracking-title">{history.status}</h4>
                      <p className="tracking-desc">{history.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Shipment Drawer */}
      {isDrawerOpen && (
        <div className="drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <div className="drawer" style={{ width: '550px' }} onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>Allocate Cargo Shipment</h2>
              <button className="btn-icon" onClick={() => setIsDrawerOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateShipment} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 70px)' }}>
              <div className="drawer-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Link Active Order *</label>
                    <select required value={selectedOrderId} onChange={(e) => setSelectedOrderId(e.target.value)}>
                      <option value="">-- Choose Order Number --</option>
                      {orders.map(o => (
                        <option key={o.id} value={o.id}>{o.orderNumber} - {o.customer?.companyName} (${Number(o.totalAmount).toLocaleString()})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Container Number</label>
                      <input 
                        type="text" 
                        value={containerNumber} 
                        onChange={(e) => setContainerNumber(e.target.value)} 
                        placeholder="e.g. MSKU9876543" 
                      />
                    </div>
                    <div className="form-group">
                      <label>Bill of Lading / AWB</label>
                      <input 
                        type="text" 
                        value={blNumber} 
                        onChange={(e) => setBlNumber(e.target.value)} 
                        placeholder="e.g. BL-123456789" 
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Shipping Line</label>
                      <input 
                        type="text" 
                        value={shippingLine} 
                        onChange={(e) => setShippingLine(e.target.value)} 
                        placeholder="e.g. Maersk Line, MSC" 
                      />
                    </div>
                    <div className="form-group">
                      <label>Vessel Name</label>
                      <input 
                        type="text" 
                        value={vesselName} 
                        onChange={(e) => setVesselName(e.target.value)} 
                        placeholder="e.g. MAERSK MC-KINNEY" 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Freight Forwarder Details</label>
                    <input 
                      type="text" 
                      value={freightForwarder} 
                      onChange={(e) => setFreightForwarder(e.target.value)} 
                      placeholder="DHL Global Forwarding" 
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Port of Loading *</label>
                      <input 
                        type="text" 
                        required 
                        value={portOfLoading} 
                        onChange={(e) => setPortOfLoading(e.target.value)} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Port of Discharge *</label>
                      <input 
                        type="text" 
                        required 
                        value={portOfDischarge} 
                        onChange={(e) => setPortOfDischarge(e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Estimated Departure (ETD)</label>
                      <input 
                        type="date" 
                        value={etd} 
                        onChange={(e) => setEtd(e.target.value)} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Estimated Arrival (ETA)</label>
                      <input 
                        type="date" 
                        value={eta} 
                        onChange={(e) => setEta(e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="drawer-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsDrawerOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Allocate Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Status Milestone Modal */}
      {isStatusModalOpen && (
        <div className="drawer-backdrop" onClick={() => setIsStatusModalOpen(false)}>
          <div className="drawer" style={{ height: 'fit-content', top: '20%', margin: 'auto', borderRadius: '8px', padding: '1.5rem', width: '450px' }} onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header" style={{ padding: '0 0 1rem 0' }}>
              <h2>Log Transit Milestone</h2>
              <button className="btn-icon" onClick={() => setIsStatusModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateStatus}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Transit Status Stage *</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  {SHIPMENT_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Milestone Notes / Cargo Position</label>
                <textarea 
                  rows={3} 
                  value={statusNotes} 
                  onChange={(e) => setStatusNotes(e.target.value)} 
                  placeholder="e.g. Current speed 18 knots. Passed Indian Ocean coordinates." 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsStatusModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Log Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shipments;
