import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { adminToken } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    totalCustomers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [adminToken]);

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) setStats(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Dashboard Overview">
      {loading ? <p>Loading stats...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        {/* Metric Cards */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem', textTransform: 'uppercase' }}>Total Revenue</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: '700', color: '#333' }}>${parseFloat(stats.totalRevenue).toFixed(2)}</p>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem', textTransform: 'uppercase' }}>Orders</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: '700', color: '#333' }}>{stats.totalOrders}</p>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem', textTransform: 'uppercase' }}>Pending Orders</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: '700', color: '#f39c12' }}>{stats.pendingOrders}</p>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem', textTransform: 'uppercase' }}>Total Products</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: '700', color: '#333' }}>{stats.totalProducts}</p>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem', textTransform: 'uppercase' }}>Low Stock Products</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: '700', color: '#e03a3a' }}>{stats.lowStockProducts}</p>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem', textTransform: 'uppercase' }}>Customers</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: '700', color: '#333' }}>{stats.totalCustomers}</p>
        </div>
      </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
