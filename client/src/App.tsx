import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

const PrivateRoute = ({ children, role }: { children: React.ReactNode, role: string }) => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  if (user.role !== role && role !== 'any') {
    return <Navigate to="/" />; // Or unauthorized page
  }

  return children;
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
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
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
                    <Route path="profile" element={<AdminProfile />} />
                    <Route path="requests" element={<ConnectionRequests />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="payments" element={<Payments />} />
                    <Route path="orders" element={<AdminOrders />} />
                  </Route>

                  {/* Customer Routes */}
                  <Route path="/customer" element={
                    <PrivateRoute role="customer">
                      <CustomerLayout />
                    </PrivateRoute>
                  }>
                    <Route index element={<CustomerDashboard />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="orders" element={<CustomerOrders />} />
                    <Route path="payment" element={<CustomerPayment />} />
                    {/* Add other customer routes */}
                  </Route>

                  {/* Fallback route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
