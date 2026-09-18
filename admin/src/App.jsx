import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProductsManager from './pages/ProductsManager';
import OrdersManager from './pages/OrdersManager';
import CategoriesManager from './pages/CategoriesManager';
import CouponsManager from './pages/CouponsManager';
import CustomersManager from './pages/CustomersManager';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

const ProtectedAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
          <Route path="/products" element={<ProtectedAdminRoute><ProductsManager /></ProtectedAdminRoute>} />
          <Route path="/orders" element={<ProtectedAdminRoute><OrdersManager /></ProtectedAdminRoute>} />
          <Route path="/categories" element={<ProtectedAdminRoute><CategoriesManager /></ProtectedAdminRoute>} />
          <Route path="/coupons" element={<ProtectedAdminRoute><CouponsManager /></ProtectedAdminRoute>} />
          <Route path="/customers" element={<ProtectedAdminRoute><CustomersManager /></ProtectedAdminRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
