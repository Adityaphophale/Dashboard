import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/auth';
import '../styles/LoginPage.css';
import logo from '../assets/logo.png';

const roleRedirects: Record<string, string> = {
  Admin: '/admin/dashboard',
  Sales: '/sales/dashboard',
  Documentation: '/documentation/dashboard',
  Accounts: '/accounts/dashboard',
  Customer: '/customer/dashboard',
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAutofill = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  const demoCredentials = [
    { role: 'Admin', email: 'admin@sogt.com', pass: 'Admin@123' },
    { role: 'Sales', email: 'sales@sogt.com', pass: 'Sales@123' },
    { role: 'Docs', email: 'docs@sogt.com', pass: 'Docs@123' },
    { role: 'Accounts', email: 'accounts@sogt.com', pass: 'Accounts@123' },
    { role: 'Customer', email: 'alex.mercer@apexglobal.com', pass: 'Customer@123' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const normalizedEmail = email.toLowerCase().trim();

    try {
      const data = await loginUser(normalizedEmail, password);
      const userName = `${data.user.firstName} ${data.user.lastName}`;
      login(data.token, { id: data.user.id, name: userName, role: data.user.role, email: data.user.email });
      const redirectPath = roleRedirects[data.user.role] || '/dashboard';
      navigate(redirectPath, { replace: true });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="glass login-box">
        <div className="login-header">
          <img src={logo} alt="SHIVAA OM GLOBE TRADE Logo" className="login-logo-img" />
          <h2>SHIVAA OM GLOBE TRADE Portal</h2>
          <p>Sign in to your account</p>
        </div>
        
        <form onSubmit={handleLogin} className="login-form">
          {error && (
            <div style={{ color: 'var(--danger-color)', fontSize: '0.8rem', fontWeight: 600, background: 'rgba(239, 68, 68, 0.05)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@sogt.com"
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
            />
          </div>
          
          <div className="form-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
              <input type="checkbox" style={{ cursor: 'pointer' }} />
              <span>Remember Me</span>
            </label>
            <a href="#" className="forgot-password" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}>Forgot password?</a>
          </div>
          
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', textAlign: 'left' }}>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 600 }}>Demo accounts (click to autofill):</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {demoCredentials.map(c => (
              <button
                key={c.role}
                type="button"
                onClick={() => handleAutofill(c.email, c.pass)}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.4)', 
                  border: '1px solid var(--border-color)', 
                  padding: '0.4rem 0.6rem', 
                  borderRadius: 'var(--radius-sm)', 
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  color: 'var(--text-primary)'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(27, 94, 32, 0.05)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)'}
              >
                <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{c.role}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{c.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
