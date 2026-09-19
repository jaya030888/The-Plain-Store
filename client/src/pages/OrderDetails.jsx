import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Truck, Package, CheckCircle2, MapPin, Copy, Check } from 'lucide-react';
import { API_URL } from '../utils/api';

const STAGES = [
  { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle2 },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 }
];

const getStageIndex = (status) => {
  switch (status) {
    case 'pending':
    case 'confirmed':
      return 0;
    case 'processing':
      return 1;
    case 'shipped':
      return 2;
    case 'out_for_delivery':
      return 3;
    case 'delivered':
      return 4;
    default:
      return 0;
  }
};

const OrderDetails = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id, token]);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders/my-orders/${id}`, {
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

  const copyTracking = () => {
    if (!order?.tracking_number) return;
    navigator.clipboard.writeText(order.tracking_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return '#468165';
      case 'cancelled': return '#e03a3a';
      case 'shipped': return '#2980b9';
      case 'out_for_delivery': return '#8e44ad';
      case 'processing': return '#3498db';
      default: return '#f39c12';
    }
  };

  if (loading) return <div className="page-container" style={{paddingTop: '100px'}}><p>Loading...</p></div>;
  if (!order) return <div className="page-container" style={{paddingTop: '100px'}}><p>Order not found</p></div>;

  const currentStage = getStageIndex(order.order_status);
  const isCancelled = order.order_status === 'cancelled';

  return (
    <div className="page-container" style={{paddingTop: '100px'}}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <Link to="/orders" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#666', textDecoration: 'none', marginBottom: '20px' }}>
          <ArrowLeft size={16} /> Back to My Orders
        </Link>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ margin: '0 0 5px 0' }}>Order #{order.id}</h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
              Placed on {new Date(order.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <span style={{ 
            padding: '6px 14px', 
            borderRadius: '20px', 
            background: `${getStatusColor(order.order_status)}18`,
            color: getStatusColor(order.order_status),
            fontWeight: 'bold',
            textTransform: 'capitalize',
            fontSize: '14px'
          }}>
            {order.order_status.replace('_', ' ')}
          </span>
        </div>

        {/* Live Shipment Tracking Card */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '25px', marginBottom: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', marginBottom: '25px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', background: '#e8f0eb', borderRadius: '8px' }}>
                <Truck size={20} color="#468165" />
              </div>
              <div>
                <h4 style={{ margin: 0 }}>Shipment Tracking</h4>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Carrier: <strong>{order.carrier || 'Standard Delivery'}</strong>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              {order.tracking_number && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#475569' }}>Track #: <strong>{order.tracking_number}</strong></span>
                  <button onClick={copyTracking} style={{ cursor: 'pointer', color: copied ? '#16a34a' : '#64748b' }} title="Copy Tracking #">
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              )}
              {order.estimated_delivery && (
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  Est. Delivery: <strong>{new Date(order.estimated_delivery).toLocaleDateString()}</strong>
                </div>
              )}
            </div>
          </div>

          {!isCancelled ? (
            <div style={{ padding: '10px 5px 5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                {/* Connector Bar Background */}
                <div style={{
                  position: 'absolute',
                  top: '18px',
                  left: '30px',
                  right: '30px',
                  height: '4px',
                  background: '#e2e8f0',
                  zIndex: 1
                }} />

                {/* Connector Bar Fill */}
                <div style={{
                  position: 'absolute',
                  top: '18px',
                  left: '30px',
                  width: `${(currentStage / (STAGES.length - 1)) * 100}%`,
                  maxWidth: 'calc(100% - 60px)',
                  height: '4px',
                  background: '#468165',
                  transition: 'width 0.3s ease',
                  zIndex: 2
                }} />

                {STAGES.map((stage, idx) => {
                  const isDone = idx <= currentStage;
                  const isCurrent = idx === currentStage;
                  const Icon = stage.icon;

                  return (
                    <div 
                      key={stage.key} 
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        position: 'relative', 
                        zIndex: 3,
                        width: '70px',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: isDone ? '#468165' : '#fff',
                        border: `2px solid ${isDone ? '#468165' : '#cbd5e1'}`,
                        color: isDone ? '#fff' : '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isCurrent ? '0 0 0 4px rgba(70, 129, 101, 0.18)' : 'none',
                        marginBottom: '6px',
                        transition: 'all 0.3s ease'
                      }}>
                        <Icon size={16} />
                      </div>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: isDone ? '600' : '400',
                        color: isDone ? '#0f172a' : '#94a3b8',
                        lineHeight: '1.2'
                      }}>
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '6px', textAlign: 'center', fontSize: '13px' }}>
              This order was cancelled.
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', background: '#fff' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Shipping Address</h3>
            <p style={{ margin: '5px 0' }}><strong>{order.full_name}</strong></p>
            <p style={{ margin: '0 0 5px 0', color: '#555', lineHeight: '1.5' }}>
              {order.house_flat}, {order.street}, {order.area}<br/>
              {order.city}, {order.state} - {order.pincode}
            </p>
            <p style={{ margin: '5px 0 0 0', color: '#555' }}>Phone: {order.phone}</p>
          </div>
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', background: '#fff' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Payment Summary</h3>
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
            <p style={{ marginTop: '10px', fontSize: '13px', color: '#666' }}>Payment Status: <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{order.payment_status}</span></p>
          </div>
        </div>

        <h3>Ordered Items</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
          {order.items?.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: '15px', border: '1px solid #ddd', padding: '15px', borderRadius: '8px', alignItems: 'center', background: '#fff' }}>
              <img src={item.image} alt={item.title} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 5px 0' }}>{item.title}</h4>
                <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>Qty: {item.quantity}</p>
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
