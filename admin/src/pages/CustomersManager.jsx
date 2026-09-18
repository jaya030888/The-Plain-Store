import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';

const CustomersManager = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { adminToken } = useAuth();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/customers/admin`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) setCustomers(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Customers Management">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ padding: '15px 20px' }}>Customer Name</th>
                <th style={{ padding: '15px 20px' }}>Email</th>
                <th style={{ padding: '15px 20px' }}>Joined Date</th>
                <th style={{ padding: '15px 20px', textAlign: 'center' }}>Total Orders</th>
                <th style={{ padding: '15px 20px', textAlign: 'right' }}>Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px 20px', fontWeight: 'bold' }}>{c.name}</td>
                  <td style={{ padding: '15px 20px', color: '#666' }}>{c.email}</td>
                  <td style={{ padding: '15px 20px' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '15px 20px', textAlign: 'center' }}>{c.number_of_orders}</td>
                  <td style={{ padding: '15px 20px', textAlign: 'right', fontWeight: 'bold', color: '#468165' }}>
                    ${parseFloat(c.total_spent || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>No customers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
};

export default CustomersManager;
