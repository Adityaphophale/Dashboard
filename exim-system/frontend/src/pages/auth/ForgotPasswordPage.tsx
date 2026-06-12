import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import '../../styles/LoginPage.css';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="login-container">
      <div className="glass login-box" style={{ maxWidth: '400px' }}>
        <div className="login-header">
          <div className="logo-icon" style={{ background: 'rgba(37, 99, 235, 0.1)' }}>
            <Mail size={32} color="#2563eb" />
          </div>
          <h2>Reset Password</h2>
          <p>Enter your SOGT email to receive a password retrieval link</p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-color)', padding: '1rem', borderRadius: 'var(--radius-md)', fontWeight: 500, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Telegraphic reset instruction email has been dispatched to {email}.
            </div>
            <button className="login-button" onClick={() => navigate('/reset-password')}>
              Proceed to Reset Form
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@sogt.com"
                required 
              />
            </div>
            <button type="submit" className="login-button">
              Send Reset Link
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <a href="#" className="forgot-password" onClick={(e) => { e.preventDefault(); navigate('/login'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowLeft size={14} />
            <span>Back to Sign In</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
