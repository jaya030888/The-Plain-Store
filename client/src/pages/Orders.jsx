import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Truck, RotateCcw, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { API_URL } from '../utils/api';

const RETURN_REASONS = [
  'Damaged or defective item',
  'Received wrong item',
  'Item different from website description',
  'Quality not as expected',
  'No longer needed',
  'Other'
];

const Orders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Return Modal State
  const [returnModalOrder, setReturnModalOrder] = useState(null);
  const [returnReason, setReturnReason] = useState(RETURN_REASONS[0]);
  const [returnDetails, setReturnDetails] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnSuccessMessage, setReturnSuccessMessage] = useState('');
  const [returnErrorMessage, setReturnErrorMessage] = useState('');

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

  const handleOpenReturnModal = (order) => {
    setReturnModalOrder(order);
    setReturnReason(RETURN_REASONS[0]);
    setReturnDetails('');
    setReturnSuccessMessage('');
    setReturnErrorMessage('');
  };

  const handleCloseReturnModal = () => {
    setReturnModalOrder(null);
    setReturnSuccessMessage('');
    setReturnErrorMessage('');
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    if (!returnModalOrder) return;

    setSubmittingReturn(true);
    setReturnErrorMessage('');
    setReturnSuccessMessage('');

    try {
      const res = await fetch(`${API_URL}/api/orders/${returnModalOrder.id}/return`, {
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
        fetchOrders();
        setTimeout(() => {
          handleCloseReturnModal();
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
              <div key={order.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0' }}>Order #{order.id}</h3>
                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{ 
                      display: 'inline-block', 
                      padding: '4px 12px', 
                      borderRadius: '12px', 
                      background: `${getStatusColor(order.order_status)}18`,
                      color: getStatusColor(order.order_status),
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      fontSize: '13px'
                    }}>
                      {getStatusLabel(order.order_status)}
                    </span>
                    {order.return_reason && (
                      <span style={{ fontSize: '12px', color: '#d97706', fontStyle: 'italic' }}>
                        Reason: {order.return_reason}
                      </span>
                    )}
                  </div>
                </div>

                {/* Return Status Banner if Active */}
                {order.return_status && (
                  <div style={{ 
                    background: order.return_status === 'returned' ? '#f5f3ff' : '#fffbeb', 
                    border: `1px solid ${order.return_status === 'returned' ? '#ddd6fe' : '#fef3c7'}`, 
                    borderRadius: '6px', 
                    padding: '10px 14px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    fontSize: '13px' 
                  }}>
                    <RotateCcw size={16} color={order.return_status === 'returned' ? '#7c3aed' : '#d97706'} />
                    <span>
                      <strong>Return Status:</strong> {getStatusLabel(order.return_status)}
                      {order.return_requested_at && ` (Initiated ${new Date(order.return_requested_at).toLocaleDateString()})`}
                    </span>
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                  {order.items?.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '180px', background: '#fcfbf9', padding: '6px', borderRadius: '8px', border: '1px solid #f0eee6' }}>
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} 
                      />
                      <div style={{ fontSize: '12px', overflow: 'hidden' }}>
                        <div style={{ fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{item.title}</div>
                        <div style={{ color: '#666' }}>Qty: {item.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #eee', flexWrap: 'wrap', gap: '10px' }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>Total: ${parseFloat(order.total).toFixed(2)}</p>
                  
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Return Action Button - Hide if already returned, refunded, or return requested */}
                    {!order.return_status && !['returned', 'refunded', 'cancelled', 'return requested'].includes(String(order.order_status).toLowerCase()) && (
                      <button 
                        onClick={() => handleOpenReturnModal(order)}
                        className="btn-outline" 
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '5px', 
                          fontSize: '13px', 
                          padding: '6px 12px',
                          color: '#c2410c',
                          borderColor: '#fed7aa',
                          background: '#fffaf5',
                          cursor: 'pointer'
                        }}
                      >
                        <RotateCcw size={14} color="#c2410c" /> Request Return
                      </button>
                    )}

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

        {/* Request Return Modal */}
        {returnModalOrder && (
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
            onClick={handleCloseReturnModal}
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
                  onClick={handleCloseReturnModal}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>

              <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#555' }}>
                Returning <strong>Order #{returnModalOrder.id}</strong> (Total: ${parseFloat(returnModalOrder.total).toFixed(2)})
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
                      onClick={handleCloseReturnModal} 
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

export default Orders;
