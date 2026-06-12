import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/Layout/DashboardLayout';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Inquiries from './pages/Inquiries';
import Orders from './pages/Orders';
import Shipments from './pages/Shipments';
import Leads from './pages/Leads';
import Quotations from './pages/Quotations';
import Suppliers from './pages/Suppliers';
import PurchaseOrders from './pages/PurchaseOrders';
import Documents from './pages/Documents';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="admin/dashboard" element={<Dashboard />} />
            <Route path="sales/dashboard" element={<Dashboard />} />
            <Route path="documentation/dashboard" element={<Dashboard />} />
            <Route path="accounts/dashboard" element={<Dashboard />} />
            <Route path="customer/dashboard" element={<Dashboard />} />
            
            <Route path="customers" element={<Customers />} />
            <Route path="products" element={<Products />} />
            <Route path="inquiries" element={<Inquiries />} />
            <Route path="orders" element={<Orders />} />
            <Route path="shipments" element={<Shipments />} />
            <Route path="leads" element={<Leads />} />
            <Route path="quotations" element={<Quotations />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="purchase-orders" element={<PurchaseOrders />} />
            <Route path="documents" element={<Documents />} />
            <Route path="payments" element={<Payments />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
