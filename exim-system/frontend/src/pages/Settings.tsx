import React, { useState, useEffect } from 'react';
import { Shield, Activity, User, Save, Lock, Loader, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  fetchProfile, 
  updateProfileDetails, 
  updatePasswordDetails, 
  fetchRbacMatrix, 
  fetchAuditLogs 
} from '../services/auth';
import '../styles/Customers.css';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'rbac' | 'logs'>('profile');
  const { user, login } = useAuth();
  
  // Profile Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  
  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // States for Loading & Feedback
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Tab data states
  const [rbacData, setRbacData] = useState<any[]>([]);
  const [logsData, setLogsData] = useState<any[]>([]);

  // Fetch initial profile on mount
  useEffect(() => {
    async function loadInitialProfile() {
      try {
        setLoading(true);
        setError('');
        const profile = await fetchProfile();
        setFirstName(profile.firstName || '');
        setLastName(profile.lastName || '');
        setEmail(profile.email || '');
      } catch (err: any) {
        console.error('Failed to load profile:', err);
        setError(err.message || 'Failed to load user profile from server.');
      } finally {
        setLoading(false);
      }
    }
    loadInitialProfile();
  }, []);

  // Fetch RBAC / Logs when switching tabs
  useEffect(() => {
    async function loadTabData() {
      if (activeTab === 'rbac') {
        try {
          setLoading(true);
          setError('');
          const data = await fetchRbacMatrix();
          setRbacData(data || []);
        } catch (err: any) {
          setError(err.message || 'Failed to load RBAC Authorization Matrix.');
        } finally {
          setLoading(false);
        }
      } else if (activeTab === 'logs') {
        try {
          setLoading(true);
          setError('');
          const data = await fetchAuditLogs();
          setLogsData(data || []);
        } catch (err: any) {
          setError(err.message || 'Failed to load system audit logs.');
        } finally {
          setLoading(false);
        }
      }
    }
    loadTabData();
  }, [activeTab]);

  // Handle profile / credentials update
  const handleSaveChanges = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (activeTab !== 'profile') return;

    setSaveLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // 1. Update Profile name
      const profileResult = await updateProfileDetails(firstName.trim(), lastName.trim());
      
      // Update Context User Data
      const token = localStorage.getItem('token') || '';
      login(token, profileResult.user);

      // 2. Update Password if fields are filled
      if (currentPassword || newPassword || confirmPassword) {
        if (!currentPassword || !newPassword || !confirmPassword) {
          throw new Error('All password fields are required to update credentials.');
        }
        if (newPassword !== confirmPassword) {
          throw new Error('New password and confirm password do not match.');
        }
        if (newPassword.length < 6) {
          throw new Error('New password must be at least 6 characters long.');
        }
        await updatePasswordDetails(currentPassword, newPassword);
        // Clear fields on success
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }

      setSuccessMessage('System settings and profile updated successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Helper mapping for permission badge color coding
  const getPermissionColorClass = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return 'badge-success';
      case 'write':
      case 'update': return 'badge-warning';
      case 'delete': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  return (
    <div className="customers-container">
      {/* Header */}
      <div className="customers-header">
        <div>
          <h1>Global System Settings</h1>
          <p className="text-secondary">Configure RBAC roles, audit system activity, manage security credentials, and trace operations logs</p>
        </div>
        {activeTab === 'profile' && (
          <button 
            className="btn-primary" 
            onClick={() => handleSaveChanges()} 
            disabled={saveLoading || loading}
            style={{ opacity: (saveLoading || loading) ? 0.7 : 1, cursor: (saveLoading || loading) ? 'not-allowed' : 'pointer' }}
          >
            {saveLoading ? (
              <Loader size={18} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Save size={18} />
            )}
            <span>{saveLoading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {successMessage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.8rem 1.2rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontWeight: 500, fontSize: '0.9rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', padding: '0.8rem 1.2rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontWeight: 500, fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh', color: 'var(--text-secondary)' }}>
          <Loader size={32} className="spinner" style={{ animation: 'spin 1s linear infinite', marginRight: '0.75rem' }} />
          <span style={{ fontWeight: 500 }}>Fetching settings from cloud database...</span>
        </div>
      )}

      {!loading && (
        <div className="settings-grid">
          {/* Left Navigation Tabs */}
          <div className="glass" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', height: 'fit-content' }}>
            <button 
              onClick={() => setActiveTab('profile')}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                padding: '0.75rem 1rem', 
                width: '100%', 
                background: activeTab === 'profile' ? 'rgba(37, 99, 235, 0.08)' : 'transparent', 
                border: 'none', 
                borderRadius: 'var(--radius-md)', 
                textAlign: 'left', 
                fontWeight: activeTab === 'profile' ? 600 : 500, 
                color: activeTab === 'profile' ? 'var(--primary-color)' : 'var(--text-secondary)', 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <User size={18} />
              <span>Profile & Account</span>
            </button>
            <button 
              onClick={() => setActiveTab('rbac')}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                padding: '0.75rem 1rem', 
                width: '100%', 
                background: activeTab === 'rbac' ? 'rgba(37, 99, 235, 0.08)' : 'transparent', 
                border: 'none', 
                borderRadius: 'var(--radius-md)', 
                textAlign: 'left', 
                fontWeight: activeTab === 'rbac' ? 600 : 500, 
                color: activeTab === 'rbac' ? 'var(--primary-color)' : 'var(--text-secondary)', 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Shield size={18} />
              <span>RBAC Authorization Matrix</span>
            </button>
            <button 
              onClick={() => setActiveTab('logs')}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                padding: '0.75rem 1rem', 
                width: '100%', 
                background: activeTab === 'logs' ? 'rgba(37, 99, 235, 0.08)' : 'transparent', 
                border: 'none', 
                borderRadius: 'var(--radius-md)', 
                textAlign: 'left', 
                fontWeight: activeTab === 'logs' ? 600 : 500, 
                color: activeTab === 'logs' ? 'var(--primary-color)' : 'var(--text-secondary)', 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Activity size={18} />
              <span>Audit & Activity Logs</span>
            </button>
          </div>

          {/* Right Content Box */}
          <div className="glass" style={{ padding: '1.5rem', minHeight: '380px' }}>
            {/* TAB 1: PROFILE & CREDENTIALS */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveChanges} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                {/* User Profile Form */}
                <div>
                  <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={18} color="var(--primary-color)" />
                    <span>SOGT User Profile</span>
                  </h3>
                  <div className="form-grid">
                    <div className="settings-profile-row">
                      <div className="form-group">
                        <label style={{ fontWeight: 500, display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>First Name</label>
                        <input 
                          type="text" 
                          value={firstName} 
                          onChange={(e) => setFirstName(e.target.value)} 
                          required
                          style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', width: '100%' }}
                        />
                      </div>
                      <div className="form-group">
                        <label style={{ fontWeight: 500, display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Last Name</label>
                        <input 
                          type="text" 
                          value={lastName} 
                          onChange={(e) => setLastName(e.target.value)} 
                          required
                          style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', width: '100%' }}
                        />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                      <label style={{ fontWeight: 500, display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Corporate Email</label>
                      <input 
                        type="email" 
                        value={email} 
                        disabled 
                        style={{ background: 'rgba(0,0,0,0.03)', color: 'var(--text-secondary)', cursor: 'not-allowed', padding: '0.6rem 0.8rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', width: '100%' }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Security Box */}
                <div>
                  <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Lock size={18} color="var(--danger-color)" />
                    <span>Update Credentials</span>
                  </h3>
                  <div className="form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                      <label style={{ fontWeight: 500, display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Current Password</label>
                      <input 
                        type="password" 
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••" 
                        style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', width: '100%' }}
                      />
                    </div>
                    <div className="settings-profile-row">
                      <div className="form-group">
                        <label style={{ fontWeight: 500, display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>New Password</label>
                        <input 
                          type="password" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••" 
                          style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', width: '100%' }}
                        />
                      </div>
                      <div className="form-group">
                        <label style={{ fontWeight: 500, display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Confirm Password</label>
                        <input 
                          type="password" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••" 
                          style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', width: '100%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* TAB 2: RBAC MATRIX */}
            {activeTab === 'rbac' && (
              <div>
                <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={18} color="var(--primary-color)" />
                  <span>Role-Based Access Control (RBAC) Matrix</span>
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  The authorization matrix shows functional capabilities associated with different user profile roles in the Shivaa Om Globe Trade ecosystem.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {rbacData.map((roleObj) => (
                    <div key={roleObj.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.2rem', background: 'rgba(255,255,255,0.4)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h4 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1rem', fontWeight: 700 }}>{roleObj.name} Role</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{roleObj.rolePermissions?.length || 0} Permissions Active</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>{roleObj.description}</p>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {roleObj.rolePermissions && roleObj.rolePermissions.length > 0 ? (
                          roleObj.rolePermissions.map((rp: any) => (
                            <span 
                              key={rp.id} 
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '0.3rem', 
                                fontSize: '0.75rem', 
                                background: 'var(--bg-color)', 
                                border: '1px solid var(--border-color)', 
                                padding: '0.2rem 0.6rem', 
                                borderRadius: '4px',
                                color: 'var(--text-primary)'
                              }}
                            >
                              <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{rp.permission.module}:</span>
                              <span>{rp.permission.name}</span>
                              <span style={{ fontSize: '0.65rem', background: 'rgba(0,0,0,0.05)', color: 'var(--text-secondary)', padding: '1px 4px', borderRadius: '2px', textTransform: 'uppercase' }}>
                                {rp.permission.action}
                              </span>
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No explicitly mapped granular permissions (Full Module Access Inherited).</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: AUDIT LOGS */}
            {activeTab === 'logs' && (
              <div>
                <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity size={18} color="var(--primary-color)" />
                  <span>Audit Logs & Operation Ledger</span>
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  Recent user activity details, authorization changes, and critical security audits.
                </p>

                <div style={{ overflowX: 'auto' }}>
                  <table className="customers-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '0.75rem 0.5rem' }}>User</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Action</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Details</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>IP Address</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logsData.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>No audit logs recorded yet.</td>
                        </tr>
                      ) : (
                        logsData.map((log) => (
                          <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '0.75rem 0.5rem' }}>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                {log.user?.email || ''}
                              </div>
                            </td>
                            <td style={{ padding: '0.75rem 0.5rem' }}>
                              <span style={{ 
                                fontSize: '0.7rem', 
                                background: log.action.includes('PASSWORD') || log.action.includes('DELETE') ? 'rgba(239, 68, 68, 0.08)' : 'rgba(37, 99, 235, 0.08)', 
                                color: log.action.includes('PASSWORD') || log.action.includes('DELETE') ? 'var(--danger-color)' : 'var(--primary-color)',
                                padding: '0.2rem 0.5rem', 
                                borderRadius: '50px', 
                                fontWeight: 600,
                                display: 'inline-block'
                              }}>
                                {log.action}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-primary)' }}>{log.details}</td>
                            <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {log.ipAddress || '127.0.0.1'}
                            </td>
                            <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .spinner { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default Settings;
