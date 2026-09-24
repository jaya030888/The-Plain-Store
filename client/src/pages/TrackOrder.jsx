import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, Truck, Package, CheckCircle2, MapPin, Copy, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { API_URL } from '../utils/api';
import { replaceWithFallbackImage } from '../utils/productImage';

const STAGES = [
  { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle2, desc: 'Order received and confirmed' },
  { key: 'processing', label: 'Processing', icon: Package, desc: 'Items packed and prepared for dispatch' },
  { key: 'shipped', label: 'Shipped', icon: Truck, desc: 'Package handed over to carrier' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin, desc: 'Courier out for delivery to your address' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2, desc: 'Package delivered safely' }
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

const TrackOrder = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialId = searchParams.get('id') || searchParams.get('orderId') || searchParams.get('trk') || '';

  const [orderQuery, setOrderQuery] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleTrack = async (idToSearch) => {
    const query = String(idToSearch || orderQuery).trim();
    if (!query) {
      setError('Please enter a valid Order ID or Tracking Number');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`${API_URL}/api/orders/track/${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        const err = await res.json();
        setError(err.message || 'No tracking information found for this order.');
      }
    } catch (err) {
      console.error('Tracking error:', err);
      setError('Unable to fetch tracking data. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      handleTrack(initialId);
    }
  }, [initialId]);

  const copyTracking = () => {
    if (!order?.tracking_number) return;
    navigator.clipboard.writeText(order.tracking_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentStage = order ? getStageIndex(order.order_status) : 0;
  const isCancelled = order?.order_status === 'cancelled';

  return (
    <div className="page-container" style={{ paddingTop: '110px', minHeight: '80vh' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto', padding: '10px 20px 60px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <div style={{ display: 'inline-flex', padding: '10px', background: '#e8f0eb', borderRadius: '50%', marginBottom: '15px' }}>
            <Truck size={32} color="#468165" />
          </div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '8px', color: '#1a1a1a' }}>Track Your Order</h1>
          <p style={{ color: '#666', fontSize: '15px', maxWidth: '500px', margin: '0 auto' }}>
            Enter your Order ID or Shipment Tracking Number to see real-time updates on your package.
          </p>
        </div>

        {/* Tracking Search Input Card */}
        <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '30px', border: '1px solid #ede8de' }}>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleTrack(); }} 
            style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}
          >
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
              <input
                type="text"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                placeholder="e.g. Order #1 or TPS-TRK-..."
                style={{ 
                  width: '100%', 
                  padding: '14px 14px 14px 44px', 
                  borderRadius: '8px', 
                  border: '1.5px solid #dcd7ce', 
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ padding: '14px 28px', fontSize: '15px', borderRadius: '8px', cursor: 'pointer', minWidth: '150px' }}
            >
              {loading ? 'Tracking...' : 'Track Package'}
            </button>
          </form>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', background: '#fef2f2', padding: '12px 16px', borderRadius: '8px', marginTop: '16px', fontSize: '14px' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Order Tracking Details Display */}
        {order && (
          <div style={{ background: '#fff', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #ede8de' }}>
            {/* Header / Basic Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '30px' }}>
              <div>
                <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', fontWeight: 'bold' }}>Shipment Details</span>
                <h2 style={{ margin: '4px 0', fontSize: '1.6rem' }}>Order #{order.id}</h2>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  Placed on {new Date(order.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  display: 'inline-block',
                  padding: '6px 14px', 
                  borderRadius: '20px', 
                  background: isCancelled ? '#fee2e2' : '#e8f0eb',
                  color: isCancelled ? '#dc2626' : '#468165',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  textTransform: 'capitalize'
                }}>
                  {order.order_status.replace(/_/g, ' ')}
                </div>
                {order.estimated_delivery && !isCancelled && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>
                    Est. Delivery: <strong>{new Date(order.estimated_delivery).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Tracking Meta Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '35px' }}>
              <div style={{ background: '#faf8f5', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Tracking Number</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontWeight: '600', color: '#2563eb', fontSize: '14px' }}>{order.tracking_number || 'Pending'}</span>
                  {order.tracking_number && (
                    <button 
                      onClick={copyTracking} 
                      title="Copy Tracking Number" 
                      style={{ padding: '4px', cursor: 'pointer', color: copied ? '#16a34a' : '#666' }}
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  )}
                </div>
              </div>

              <div style={{ background: '#faf8f5', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Courier Partner</span>
                <div style={{ fontWeight: '600', marginTop: '4px', fontSize: '14px' }}>
                  {order.carrier || 'Standard Delivery'}
                </div>
              </div>

              <div style={{ background: '#faf8f5', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Destination</span>
                <div style={{ fontWeight: '600', marginTop: '4px', fontSize: '14px' }}>
                  {order.city ? `${order.city}, ${order.state}` : 'On File'}
                </div>
              </div>
            </div>

            {/* Visual Stepper Timeline */}
            {!isCancelled ? (
              <div style={{ margin: '30px 0 40px' }}>
                <h4 style={{ marginBottom: '25px', color: '#222' }}>Live Shipment Progress</h4>
                
                <div className="tracking-stepper-scroll" style={{ padding: '0 5px 10px' }}>
                  <div className="tracking-stepper-inner" style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 10px' }}>
                    {/* Background Progress Bar */}
                    <div style={{
                      position: 'absolute',
                      top: '20px',
                      left: '40px',
                      right: '40px',
                      height: '4px',
                      background: '#e5e7eb',
                      zIndex: 1
                    }} />

                    {/* Active Progress Bar Fill */}
                    <div style={{
                      position: 'absolute',
                      top: '20px',
                      left: '40px',
                      width: `${(currentStage / (STAGES.length - 1)) * 100}%`,
                      maxWidth: 'calc(100% - 80px)',
                      height: '4px',
                      background: '#468165',
                      transition: 'width 0.4s ease',
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
                            width: '80px',
                            textAlign: 'center'
                          }}
                        >
                          <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            background: isDone ? '#468165' : '#fff',
                            border: `2.5px solid ${isDone ? '#468165' : '#cbd5e1'}`,
                            color: isDone ? '#fff' : '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: isCurrent ? '0 0 0 4px rgba(70, 129, 101, 0.2)' : 'none',
                            marginBottom: '8px',
                            transition: 'all 0.3s ease'
                          }}>
                            <Icon size={18} />
                          </div>
                          <span style={{ 
                            fontSize: '12px', 
                            fontWeight: isDone ? '600' : '400',
                            color: isDone ? '#1e293b' : '#94a3b8',
                            lineHeight: '1.2'
                          }}>
                            {stage.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '20px', borderRadius: '8px', marginBottom: '30px', textAlign: 'center', color: '#b91c1c' }}>
                <h4 style={{ margin: '0 0 6px 0' }}>This Order Has Been Cancelled</h4>
                <p style={{ margin: 0, fontSize: '13px' }}>If you have any questions or require a refund status update, please contact support.</p>
              </div>
            )}

            {/* Items in this Shipment */}
            {order.items && order.items.length > 0 && (
              <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <h4 style={{ marginBottom: '15px' }}>Items in this Shipment ({order.items.length})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {order.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#faf8f5', padding: '10px 15px', borderRadius: '8px', border: '1px solid #eee' }}>
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          onError={(e) => replaceWithFallbackImage(e, item.id || item.product_id)}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd' }} 
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>{item.title}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Qty: {item.quantity} × ₹{parseFloat(item.price_at_purchase).toFixed(2)}</div>
                      </div>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>
                        ₹{(parseFloat(item.price_at_purchase) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid #eee' }}>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '14px', textDecoration: 'none' }}>
                <ArrowLeft size={16} /> Continue Shopping
              </Link>
              <span style={{ fontSize: '14px', color: '#468165', fontWeight: 'bold' }}>
                Total Paid: ₹{parseFloat(order.total).toFixed(2)}
              </span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default TrackOrder;
