import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Truck } from 'lucide-react';
import { API_URL } from '../utils/api';

const Orders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return '#468165';
      case 'cancelled': return '#e03a3a';
      default: return '#f39c12';
    }
  };

  if (loading) return <div className="page-container" style={{paddingTop: '100px'}}><p>Loading...</p></div>;

  return (
    <div className="page-container" style={{paddingTop: '100px'}}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ marginBottom: '30px' }}>My Orders</h1>
        
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', background: '#f9f9f9', borderRadius: '8px' }}>
            <p style={{ marginBottom: '20px' }}>You have no orders yet.</p>
            <Link to="/" className="btn-primary" style={{ textDecoration: 'none' }}>Start Shopping</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {orders.map(order => (
              <div key={order.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0' }}>Order #{order.id}</h3>
                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                      display: 'inline-block', 
                      padding: '4px 10px', 
                      borderRadius: '12px', 
                      background: `${getStatusColor(order.order_status)}20`,
                      color: getStatusColor(order.order_status),
                      fontWeight: 'bold',
                      textTransform: 'capitalize',
                      fontSize: '14px'
                    }}>
                      {order.order_status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                  {order.items?.map(item => (
                    <img 
                      key={item.id} 
                      src={item.image} 
                      alt={item.title} 
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }} 
                    />
                  ))}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>Total: ${parseFloat(order.total).toFixed(2)}</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to={`/track?id=${order.id}`} className="btn-outline" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', padding: '6px 12px' }}>
                      <Truck size={14} color="#468165" /> Track
                    </Link>
                    <Link to={`/orders/${order.id}`} className="btn-primary" style={{ textDecoration: 'none', fontSize: '13px', padding: '6px 14px' }}>
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
