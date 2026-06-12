import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import '../../styles/LoginPage.css';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setSuccess(true);
  };

  return (
    <div className="login-container">
      <div className="glass login-box" style={{ maxWidth: '400px' }}>
        <div className="login-header">
          <div className="logo-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
            <Lock size={32} color="var(--danger-color)" />
          </div>
          <h2>Update Credentials</h2>
          <p>Provide the validation token sent to your email and set your new password</p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-color)', padding: '1rem', borderRadius: 'var(--radius-md)', fontWeight: 500, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Credentials updated successfully!
            </div>
            <button className="login-button" onClick={() => navigate('/login')}>
              Sign In Now
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div style={{ color: 'var(--danger-color)', fontSize: '0.8rem', fontWeight: 600, background: 'rgba(239, 68, 68, 0.05)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', textAlign: 'center' }}>
                {error}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="token">Validation Token</label>
              <input 
                type="text" 
                id="token" 
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter 6-digit code"
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input 
                type="password" 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required 
              />
            </div>

            <button type="submit" className="login-button">
              Save Credentials
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <a href="#" className="forgot-password" onClick={(e) => { e.preventDefault(); navigate('/login'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowLeft size={14} />
            <span>Cancel and Sign In</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
