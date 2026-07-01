import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
// Layouts
import AdminLayout from './layouts/AdminLayout';
import CustomerLayout from './layouts/CustomerLayout';
import Footer from './components/Footer';
// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotUsername from './pages/ForgotUsername';
import ForgotPassword from './pages/ForgotPassword';
import CustomerPayment from './pages/CustomerPayment';
import Home from './pages/Home';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProfile from './pages/admin/AdminProfile';
import ConnectionRequests from './pages/admin/ConnectionRequests';
import Inventory from './pages/admin/Inventory';
import Payments from './pages/admin/Payments';
import AdminOrders from './pages/admin/Orders';
import CustomerDashboard from './pages/customer/Dashboard';
import { CartProvider } from './context/CartContext';
import Cart from './pages/customer/Cart';
import CustomerOrders from './pages/customer/Orders';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Settings from './pages/admin/Settings';
import ShopProfile from './pages/admin/ShopProfile';

const Reports = React.lazy(() => import('./pages/admin/Reports'));

import { useNavigate } from 'react-router-dom';

const PrivateRoute = ({ children, role }: { children: React.ReactNode, role: string }) => {
  const { user, loading, logout } = React.useContext(AuthContext);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (loading) return;

    // 1. Verify Authentication status, JWT/session validity, and Active session
    if (!user || !user.token) {
      logout();
      navigate("/", { replace: true });
      return;
    }

    // 2. Validate Role and handle Invalid Roles
    const validRoles = ['admin', 'customer'];
    const isMissingRole = !user.role;
    const isInvalidRole = user.role && !validRoles.includes(user.role);
    const isUnauthorizedRole = user.role !== role && role !== 'any';

    if (isMissingRole || isInvalidRole || isUnauthorizedRole) {
      alert("Unable to determine your account role. Please contact support or sign in again.");
      logout();
      navigate("/", { replace: true });
    }
  }, [user, loading, role, logout, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-teal-50 text-teal-600 font-bold font-sans">Loading...</div>;
  }

  if (!user || !user.token) {
    return null;
  }

  const validRoles = ['admin', 'customer'];
  if (!user.role || !validRoles.includes(user.role) || (user.role !== role && role !== 'any')) {
    return null;
  }

  return <>{children}</>;
};

const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-teal-50 text-teal-600 font-bold font-sans">Loading...</div>;
  }

  if (user && user.token) {
    const dashboardPath = user.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
};

const GlobalFooter = () => {
  const location = useLocation();
  // Hide global footer on admin routes to preserve admin layout UI
  if (location.pathname.startsWith('/admin')) {
    return null;
  }
  return <Footer />;
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CartProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  
                  {/* Public Only Auth Routes */}
                  <Route path="/login" element={
                    <PublicOnlyRoute>
                      <Login />
                    </PublicOnlyRoute>
                  } />
                  <Route path="/signin" element={
                    <PublicOnlyRoute>
                      <Login />
                    </PublicOnlyRoute>
                  } />
                  <Route path="/register" element={
                    <PublicOnlyRoute>
                      <Register />
                    </PublicOnlyRoute>
                  } />
                  <Route path="/signup" element={
                    <PublicOnlyRoute>
                      <Register />
                    </PublicOnlyRoute>
                  } />
                  <Route path="/auth" element={
                    <PublicOnlyRoute>
                      <Login />
                    </PublicOnlyRoute>
                  } />

                  <Route path="/forgot-username" element={<ForgotUsername />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={
                    <PrivateRoute role="admin">
                      <AdminLayout />
                    </PrivateRoute>
                  }>
                    <Route index element={<AdminDashboard />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="profile" element={<AdminProfile />} />
                    <Route path="requests" element={<ConnectionRequests />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="payments" element={<Payments />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="shop-profile" element={<ShopProfile />} />
                    <Route path="reports" element={
                      <React.Suspense fallback={<div className="p-8 text-center text-teal-600 font-bold font-sans animate-pulse">Loading Reports...</div>}>
                        <Reports />
                      </React.Suspense>
                    } />
                  </Route>

                  {/* Customer Routes */}
                  <Route path="/customer" element={
                    <PrivateRoute role="customer">
                      <CustomerLayout />
                    </PrivateRoute>
                  }>
                    <Route index element={<CustomerDashboard />} />
                    <Route path="dashboard" element={<CustomerDashboard />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="orders" element={<CustomerOrders />} />
                    <Route path="payment" element={<CustomerPayment />} />
                    {/* Add other customer routes */}
                  </Route>

                  {/* Fallback route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <GlobalFooter />
            </div>
          </Router>
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
