import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const OrderDetails = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id, token]);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/my-orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return '#468165';
      case 'cancelled': return '#e03a3a';
      default: return '#f39c12';
    }
  };

  if (loading) return <div className="page-container" style={{paddingTop: '100px'}}><p>Loading...</p></div>;
  if (!order) return <div className="page-container" style={{paddingTop: '100px'}}><p>Order not found</p></div>;

  return (
    <div className="page-container" style={{paddingTop: '100px'}}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <Link to="/orders" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#666', textDecoration: 'none', marginBottom: '20px' }}>
          <ArrowLeft size={16} /> Back to My Orders
        </Link>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1>Order #{order.id}</h1>
          <span style={{ 
            padding: '6px 12px', 
            borderRadius: '20px', 
            background: `${getStatusColor(order.order_status)}20`,
            color: getStatusColor(order.order_status),
            fontWeight: 'bold',
            textTransform: 'capitalize'
          }}>
            {order.order_status.replace('_', ' ')}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
            <h3>Shipping Details</h3>
            <p style={{ margin: '10px 0 5px 0' }}><strong>{order.full_name}</strong></p>
            <p style={{ margin: '0 0 5px 0', color: '#555' }}>
              {order.house_flat}, {order.street}, {order.area}<br/>
              {order.city}, {order.state} - {order.pincode}
            </p>
            <p style={{ margin: 0, color: '#555' }}>Phone: {order.phone}</p>
          </div>
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
            <h3>Payment Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <span>Subtotal:</span>
              <span>${parseFloat(order.subtotal).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
              <span>Delivery Fee:</span>
              <span>${parseFloat(order.delivery_fee).toFixed(2)}</span>
            </div>
            {parseFloat(order.discount_amount) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', color: '#468165' }}>
                <span>Discount:</span>
                <span>-${parseFloat(order.discount_amount).toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee', fontWeight: 'bold' }}>
              <span>Total:</span>
              <span>${parseFloat(order.total).toFixed(2)}</span>
            </div>
            <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>Payment Status: <span style={{ textTransform: 'capitalize' }}>{order.payment_status}</span></p>
          </div>
        </div>

        <h3>Ordered Items</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
          {order.items?.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: '15px', border: '1px solid #ddd', padding: '15px', borderRadius: '8px', alignItems: 'center' }}>
              <img src={item.image} alt={item.title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 5px 0' }}>{item.title}</h4>
                <p style={{ margin: 0, color: '#666' }}>Qty: {item.quantity}</p>
              </div>
              <div style={{ fontWeight: 'bold' }}>
                ${(parseFloat(item.price_at_purchase) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
