import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  ShoppingCart,
  Truck,
  Settings,
  LogOut,
  Compass,
  FileCheck,
  Briefcase,
  Receipt,
  FolderOpen,
  CreditCard,
  BarChart2,
  AlertCircle,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/DashboardLayout.css';
import logo from '../../assets/logo.png';
import { useState } from 'react';
import { Menu } from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const role = user?.role || 'Admin';

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  const dashboardPath = role === 'Admin' ? '/admin/dashboard' : 
                        role === 'Sales' ? '/sales/dashboard' : 
                        role === 'Documentation' ? '/documentation/dashboard' : 
                        role === 'Accounts' ? '/accounts/dashboard' : 
                        '/customer/dashboard';

  // Base list of items
  const menuItems = [
    { to: dashboardPath, label: 'Dashboard', icon: <LayoutDashboard size={20} />, allowedRoles: ['Admin', 'Sales', 'Documentation', 'Accounts', 'Customer'] },
    { to: '/customers', label: 'Customers', icon: <Users size={20} />, allowedRoles: ['Admin', 'Sales'] },
    { to: '/products', label: 'Products', icon: <Package size={20} />, allowedRoles: ['Admin', 'Sales'] },
    { to: '/leads', label: 'Leads', icon: <Compass size={20} />, allowedRoles: ['Admin', 'Sales'] },
    { to: '/inquiries', label: 'Inquiries', icon: <FileText size={20} />, allowedRoles: ['Admin', 'Sales'] },
    { to: '/quotations', label: 'Quotations', icon: <FileCheck size={20} />, allowedRoles: ['Admin', 'Sales'] },
    { to: '/orders', label: role === 'Customer' ? 'My Orders' : 'Orders', icon: <ShoppingCart size={20} />, allowedRoles: ['Admin', 'Sales', 'Customer'] },
    { to: '/suppliers', label: 'Suppliers', icon: <Briefcase size={20} />, allowedRoles: ['Admin', 'Sales'] },
    { to: '/purchase-orders', label: 'Purchase Orders', icon: <Receipt size={20} />, allowedRoles: ['Admin', 'Sales'] },
    { to: '/shipments', label: role === 'Customer' ? 'My Shipments' : 'Shipments', icon: <Truck size={20} />, allowedRoles: ['Admin', 'Documentation', 'Customer'] },
    { to: '/documents', label: role === 'Customer' ? 'My Documents' : 'Documents', icon: <FolderOpen size={20} />, allowedRoles: ['Admin', 'Documentation', 'Customer'] },
    { to: '/payments', label: 'Payments', icon: <CreditCard size={20} />, allowedRoles: ['Admin', 'Accounts'] },
    { to: '/reports', label: 'Reports & KPI', icon: <BarChart2 size={20} />, allowedRoles: ['Admin', 'Accounts'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.allowedRoles || item.allowedRoles.includes(role)
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="layout-container">
      {/* Sidebar Backdrop for mobile */}
      {isSidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar glass ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}>
        <div className="sidebar-logo">
          <img src={logo} alt="SOGT EXIM Logo" className="sidebar-logo-img" />
        </div>
        
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {filteredMenuItems.map(item => (
              <li key={item.to}>
                <NavLink to={item.to} className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <ul className="nav-list">
            {role === 'Admin' && (
              <li>
                <NavLink to="/settings" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                  <Settings size={20} />
                  <span>Settings</span>
                </NavLink>
              </li>
            )}
            {role === 'Customer' && (
              <li>
                <NavLink to="/profile" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                  <User size={20} />
                  <span>My Profile</span>
                </NavLink>
              </li>
            )}
            {role !== 'Admin' && role !== 'Customer' && (
              <li>
                <NavLink to="/profile" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                  <User size={20} />
                  <span>Profile</span>
                </NavLink>
              </li>
            )}
            <li>
              <a href="#" className="nav-link logout" onClick={handleLogout}>
                <LogOut size={20} />
                <span>Logout</span>
              </a>
            </li>
          </ul>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="main-content">
        <header className="top-navbar glass">
          <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="navbar-search">
            <input type="text" placeholder="Search SOGT databases..." />
          </div>
          <div className="navbar-profile">
            <div className="avatar">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name || 'SOGT User'}</span>
              <span className="user-role" style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.65rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                {role} ACCESS
              </span>
            </div>
          </div>
        </header>
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
