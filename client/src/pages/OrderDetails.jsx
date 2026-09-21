import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Truck, Package, CheckCircle2, MapPin, Copy, Check, RotateCcw, AlertCircle, X } from 'lucide-react';
import { API_URL } from '../utils/api';

const RETURN_REASONS = [
  'Damaged or defective item',
  'Received wrong item',
  'Item different from website description',
  'Quality not as expected',
  'No longer needed',
  'Other'
];

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

  // Return Modal State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState(RETURN_REASONS[0]);
  const [returnDetails, setReturnDetails] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnSuccessMessage, setReturnSuccessMessage] = useState('');
  const [returnErrorMessage, setReturnErrorMessage] = useState('');

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

  useEffect(() => {
    fetchOrderDetails();
  }, [id, token]);

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
      case 'return_requested': return '#d97706';
      case 'return_approved': return '#2563eb';
      case 'returned': return '#7c3aed';
      case 'return_rejected': return '#dc2626';
      default: return '#f39c12';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'return_requested': return 'Return Requested';
      case 'return_approved': return 'Return Approved';
      case 'returned': return 'Returned';
      case 'return_rejected': return 'Return Rejected';
      default: return (status || '').replace('_', ' ');
    }
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    setSubmittingReturn(true);
    setReturnErrorMessage('');
    setReturnSuccessMessage('');

    try {
      const res = await fetch(`${API_URL}/api/orders/${id}/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: returnReason,
          details: returnDetails
        })
      });

      const data = await res.json();
      if (res.ok) {
        setReturnSuccessMessage('Return request submitted successfully! We will process it shortly.');
        fetchOrderDetails();
        setTimeout(() => {
          setIsReturnModalOpen(false);
        }, 1800);
      } else {
        setReturnErrorMessage(data.message || 'Failed to submit return request.');
      }
    } catch (err) {
      console.error(err);
      setReturnErrorMessage('Network error while requesting return.');
    } finally {
      setSubmittingReturn(false);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {!order.return_status && !isCancelled && (
              <button
                onClick={() => setIsReturnModalOpen(true)}
                className="btn-outline"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  padding: '6px 14px',
                  color: '#c2410c',
                  borderColor: '#fed7aa',
                  background: '#fffaf5',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={14} color="#c2410c" /> Request Return
              </button>
            )}
            <span style={{ 
              padding: '6px 14px', 
              borderRadius: '20px', 
              background: `${getStatusColor(order.order_status)}18`,
              color: getStatusColor(order.order_status),
              fontWeight: 'bold',
              textTransform: 'capitalize',
              fontSize: '14px'
            }}>
              {getStatusLabel(order.order_status)}
            </span>
          </div>
        </div>

        {/* Return Details Card if return exists */}
        {order.return_status && (
          <div style={{
            background: order.return_status === 'returned' ? '#f5f3ff' : '#fffbeb',
            border: `1px solid ${order.return_status === 'returned' ? '#c4b5fd' : '#fde68a'}`,
            borderRadius: '10px',
            padding: '18px 20px',
            marginBottom: '25px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: order.return_status === 'returned' ? '#6b21a8' : '#92400e', fontSize: '1.05rem' }}>
              <RotateCcw size={18} /> Return Information: {getStatusLabel(order.return_status)}
            </div>
            {order.return_reason && (
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#444' }}>
                <strong>Reason:</strong> {order.return_reason}
              </p>
            )}
            {order.return_requested_at && (
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                Requested on {new Date(order.return_requested_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            )}
            {order.return_notes && (
              <div style={{ marginTop: '4px', fontSize: '0.88rem', color: '#1f2937', background: 'rgba(255,255,255,0.7)', padding: '8px 12px', borderRadius: '6px' }}>
                <strong>Store Note:</strong> {order.return_notes}
              </div>
            )}
          </div>
        )}

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

        {/* Request Return Modal */}
        {isReturnModalOpen && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              padding: '20px'
            }}
            onClick={() => setIsReturnModalOpen(false)}
          >
            <div 
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                maxWidth: '480px',
                width: '100%',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', color: '#111827' }}>
                  <RotateCcw size={20} color="#468165" /> Request Order Return
                </h3>
                <button 
                  onClick={() => setIsReturnModalOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>

              <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#555' }}>
                Returning <strong>Order #{order.id}</strong> (Total: ${parseFloat(order.total).toFixed(2)})
              </p>

              {returnSuccessMessage ? (
                <div style={{ background: '#ecfdf5', color: '#065f46', padding: '14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem' }}>
                  <CheckCircle2 size={18} color="#059669" />
                  <span>{returnSuccessMessage}</span>
                </div>
              ) : (
                <form onSubmit={handleSubmitReturn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {returnErrorMessage && (
                    <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '10px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <AlertCircle size={16} />
                      <span>{returnErrorMessage}</span>
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Reason for Return *
                    </label>
                    <select 
                      value={returnReason} 
                      onChange={e => setReturnReason(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.92rem', outline: 'none' }}
                      required
                    >
                      {RETURN_REASONS.map(reason => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Additional Details / Condition of Product (Optional)
                    </label>
                    <textarea 
                      rows={3} 
                      value={returnDetails} 
                      onChange={e => setReturnDetails(e.target.value)}
                      placeholder="Please describe any defects, package condition, or items to be returned..."
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                    <button 
                      type="button" 
                      onClick={() => setIsReturnModalOpen(false)} 
                      className="btn-outline" 
                      style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                      disabled={submittingReturn}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn-primary" 
                      style={{ padding: '8px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                      disabled={submittingReturn}
                    >
                      {submittingReturn ? 'Submitting...' : 'Confirm Return Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
