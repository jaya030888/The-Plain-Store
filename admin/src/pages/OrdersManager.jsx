import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import { Search, Truck, XCircle, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { API_URL } from '../utils/api';

const OrdersManager = () => {
  const { adminToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'returns'

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingForm, setTrackingForm] = useState({
    status: '',
    tracking_number: '',
    carrier: '',
    estimated_delivery: ''
  });
  const [savingTracking, setSavingTracking] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState(null);

  const getEffectiveToken = () => adminToken || localStorage.getItem('adminToken');

  const fetchOrders = async (isBackground = false) => {
    const token = getEffectiveToken();
    if (!token) return;

    if (!isBackground) setRefreshing(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/orders/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        setLastSyncedTime(new Date().toLocaleTimeString());
      } else {
        const err = await res.json();
        setError(err.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      if (!isBackground) {
        setError('Unable to connect to server. Please verify backend is running.');
      }
    } finally {
      setLoading(false);
      if (!isBackground) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Automatic real-time background sync every 4 seconds
    const pollInterval = setInterval(() => {
      fetchOrders(true);
    }, 4000);

    // Also sync immediately when window is focused or tab becomes visible
    const handleSync = () => {
      if (document.visibilityState === 'visible') {
        fetchOrders(true);
      }
    };
    window.addEventListener('focus', handleSync);
    document.addEventListener('visibilitychange', handleSync);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleSync);
      document.removeEventListener('visibilitychange', handleSync);
    };
  }, [adminToken]);

  const fetchOrderDetails = async (id) => {
    try {
      const token = getEffectiveToken();
      const res = await fetch(`${API_URL}/api/orders/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedOrder(data);
        setTrackingForm({
          status: data.order_status || 'pending',
          tracking_number: data.tracking_number || '',
          carrier: data.carrier || 'Standard Shipping',
          estimated_delivery: data.estimated_delivery ? data.estimated_delivery.split('T')[0] : ''
        });
        setSaveSuccess(false);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/admin/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchOrders();
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder({ ...selectedOrder, order_status: status });
          setTrackingForm(prev => ({ ...prev, status }));
        }
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleSaveTracking = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setSavingTracking(true);
    setSaveSuccess(false);
    try {
      const res = await fetch(`${API_URL}/api/orders/admin/${selectedOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(trackingForm)
      });
      if (res.ok) {
        setSaveSuccess(true);
        setSelectedOrder(prev => ({
          ...prev,
          order_status: trackingForm.status,
          tracking_number: trackingForm.tracking_number,
          carrier: trackingForm.carrier,
          estimated_delivery: trackingForm.estimated_delivery
        }));
        fetchOrders();
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save tracking info:', error);
      alert('Error updating tracking info');
    } finally {
      setSavingTracking(false);
    }
  };

  const generateTrackingNumber = () => {
    const randomTrk = `TPS-TRK-${selectedOrder.id}${Date.now().toString().slice(-4)}`;
    setTrackingForm(prev => ({ ...prev, tracking_number: randomTrk }));
  };

  const returnOrders = orders.filter(o => o.return_status || (o.order_status && o.order_status.startsWith('return')));

  const displayedOrders = (activeTab === 'returns' ? returnOrders : orders).filter(order => {
    const cust = order.customer_name ? order.customer_name.toLowerCase() : '';
    const email = order.customer_email ? order.customer_email.toLowerCase() : '';
    const trk = order.tracking_number ? order.tracking_number.toLowerCase() : '';
    const reason = order.return_reason ? order.return_reason.toLowerCase() : '';
    const q = search.toLowerCase();
    const matchesSearch = order.id.toString().includes(q) || cust.includes(q) || email.includes(q) || trk.includes(q) || reason.includes(q);
    const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return '#468165';
      case 'cancelled': return '#e03a3a';
      case 'shipped': return '#2980b9';
      case 'out_for_delivery': return '#8e44ad';
      case 'processing': return '#3498db';
      case 'confirmed': return '#27ae60';
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
      case 'returned': return 'Returned / Refunded';
      case 'return_rejected': return 'Return Rejected';
      default: return (status || '').replace('_', ' ');
    }
  };

  return (
    <AdminLayout title="Orders & Returns Management">
      {error && (
        <div style={{ background: '#fdeded', color: '#e03a3a', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Top View Selector Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #eaeaea', paddingBottom: '12px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => { setActiveTab('all'); setStatusFilter('all'); }}
          style={{
            background: activeTab === 'all' ? '#111827' : '#f3f4f6',
            color: activeTab === 'all' ? '#ffffff' : '#4b5563',
            border: 'none',
            padding: '9px 18px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          All Orders ({orders.length})
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('returns'); setStatusFilter('all'); }}
          style={{
            background: activeTab === 'returns' ? '#c2410c' : '#fff7ed',
            color: activeTab === 'returns' ? '#ffffff' : '#c2410c',
            border: '1px solid #fed7aa',
            padding: '9px 18px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <RotateCcw size={16} />
          <span>Customer Returns</span>
          <span style={{ 
            background: activeTab === 'returns' ? '#ffffff' : '#c2410c', 
            color: activeTab === 'returns' ? '#c2410c' : '#ffffff', 
            fontSize: '12px', 
            padding: '2px 8px', 
            borderRadius: '12px', 
            fontWeight: 700 
          }}>
            {returnOrders.length}
          </span>
        </button>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px', maxWidth: '400px' }}>
          <input 
            type="text" 
            placeholder={activeTab === 'returns' ? "Search returns by user, order, or reason..." : "Search by Order ID, Customer, or Tracking #"} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: '#888' }} />
        </div>

        {activeTab === 'all' ? (
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '160px' }}
          >
            <option value="all">All Statuses ({orders.length})</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="return_requested">Return Requested</option>
            <option value="return_approved">Return Approved</option>
            <option value="returned">Returned / Refunded</option>
            <option value="return_rejected">Return Rejected</option>
          </select>
        ) : (
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '160px' }}
          >
            <option value="all">All Return Statuses ({returnOrders.length})</option>
            <option value="return_requested">Return Requested</option>
            <option value="return_approved">Return Approved</option>
            <option value="returned">Returned / Refunded</option>
            <option value="return_rejected">Return Rejected</option>
          </select>
        )}

        {lastSyncedTime && (
          <div 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '12px', 
              color: '#34664f', 
              background: '#eaf3ee', 
              padding: '7px 14px', 
              borderRadius: '20px', 
              border: '1px solid #c2dece',
              fontWeight: 500,
              marginLeft: 'auto'
            }}
            title="Orders are automatically synchronized in real-time"
          >
            <span 
              style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: '#468165', 
                display: 'inline-block',
                boxShadow: '0 0 0 3px rgba(70, 129, 101, 0.25)'
              }}
            ></span>
            <span>Live Auto-Sync: <strong>{lastSyncedTime}</strong></span>
          </div>
        )}
      </div>

      <div className="admin-table-container">
        {activeTab === 'returns' ? (
          /* ======================================================== */
          /* DEDICATED RETURNS TABLE: WHICH USER RETURNED WHAT */
          /* ======================================================== */
          <table className="admin-table">
            <thead>
              <tr style={{ background: '#fff7ed' }}>
                <th>Order #</th>
                <th>User (Customer)</th>
                <th>What Was Returned (Product Items)</th>
                <th>Return Reason & Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Loading returns...</td></tr>
              ) : displayedOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <RotateCcw size={32} color="#ccc" />
                      <p style={{ margin: 0, fontSize: '15px' }}>No customer returns found.</p>
                      <small>Orders requested for return by customers will appear here.</small>
                    </div>
                  </td>
                </tr>
              ) : displayedOrders.map(order => (
                <tr key={order.id} style={{ background: order.order_status === 'return_requested' ? '#fffaf5' : 'transparent' }}>
                  <td>
                    <strong>#{order.id}</strong>
                    <div style={{ fontSize: '11px', color: '#666', marginTop: '3px' }}>
                      ${parseFloat(order.total).toFixed(2)}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#111827' }}>{order.customer_name}</div>
                    <div style={{ fontSize: '12px', color: '#4b5563' }}>{order.customer_email}</div>
                    {order.customer_phone && (
                      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                        Phone: {order.customer_phone}
                      </div>
                    )}
                  </td>
                  <td style={{ minWidth: '220px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {order.items?.map(item => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid #eee', padding: '4px 8px', borderRadius: '6px' }}>
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }} 
                          />
                          <div style={{ fontSize: '12px', overflow: 'hidden' }}>
                            <div style={{ fontWeight: 500, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '170px' }}>
                              {item.title}
                            </div>
                            <div style={{ color: '#6b7280', fontSize: '11px' }}>
                              Qty: {item.quantity} &bull; ${parseFloat(item.price_at_purchase).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      display: 'inline-block', 
                      background: '#ffedd5', 
                      color: '#9a3412', 
                      padding: '3px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px', 
                      fontWeight: 600 
                    }}>
                      {order.return_reason || 'Return Requested'}
                    </span>
                    {order.return_requested_at && (
                      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                        Requested: {new Date(order.return_requested_at).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      background: `${getStatusColor(order.order_status)}18`,
                      color: getStatusColor(order.order_status)
                    }}>
                      {getStatusLabel(order.order_status)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {order.order_status === 'return_requested' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'return_approved')}
                          style={{
                            background: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Approve Return
                        </button>
                      )}
                      {(order.order_status === 'return_requested' || order.order_status === 'return_approved') && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'returned')}
                          style={{
                            background: '#059669',
                            color: '#fff',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Mark Refunded
                        </button>
                      )}
                      <button 
                        className="btn-outline" 
                        style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }} 
                        onClick={() => fetchOrderDetails(order.id)}
                      >
                        Manage
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          /* ======================================================== */
          /* REGULAR ALL ORDERS TABLE */
          /* ======================================================== */
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Tracking & Carrier</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Loading orders...</td></tr>
              ) : displayedOrders.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>No orders found</td></tr>
              ) : displayedOrders.map(order => (
                <tr key={order.id}>
                  <td>
                    <strong>#{order.id}</strong>
                    {order.return_status && (
                      <div style={{ marginTop: '3px' }}>
                        <span style={{ fontSize: '10px', background: '#ffedd5', color: '#c2410c', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                          RETURN
                        </span>
                      </div>
                    )}
                  </td>
                  <td>
                    <div>{order.customer_name}</div>
                    <small style={{ color: '#888' }}>{order.customer_email}</small>
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    {order.tracking_number ? (
                      <div>
                        <span style={{ fontSize: '12px', background: '#eef2ff', color: '#3b82f6', padding: '3px 8px', borderRadius: '4px', fontWeight: '500', display: 'inline-block' }}>
                          {order.tracking_number}
                        </span>
                        <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                          {order.carrier || 'Standard Shipping'}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#aaa', fontSize: '12px' }}>Not assigned</span>
                    )}
                  </td>
                  <td><strong>${parseFloat(order.total).toFixed(2)}</strong></td>
                  <td>
                    <span style={{ 
                      color: order.payment_status === 'paid' ? '#468165' : '#f39c12', 
                      fontWeight: 'bold', 
                      fontSize: '12px',
                      padding: '3px 8px',
                      background: order.payment_status === 'paid' ? '#e8f5e9' : '#fff8e1',
                      borderRadius: '4px'
                    }}>
                      {order.payment_status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <select 
                      value={order.order_status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      style={{ 
                        padding: '5px 10px', 
                        borderRadius: '20px', 
                        border: `1px solid ${getStatusColor(order.order_status)}`,
                        color: getStatusColor(order.order_status),
                        background: `${getStatusColor(order.order_status)}10`,
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="return_requested">Return Requested</option>
                      <option value="return_approved">Return Approved</option>
                      <option value="returned">Returned / Refunded</option>
                      <option value="return_rejected">Return Rejected</option>
                    </select>
                  </td>
                  <td>
                    <button 
                      className="btn-outline" 
                      style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }} 
                      onClick={() => fetchOrderDetails(order.id)}
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Details & Tracking Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="checkout-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '750px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Order #{selectedOrder.id} Details</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setSelectedOrder(null)}><XCircle size={24} /></button>
            </div>

            {/* Customer Return Request Highlight Card in Modal */}
            {selectedOrder.return_status && (
              <div style={{
                background: '#fffaf5',
                border: '1px solid #fed7aa',
                borderRadius: '8px',
                padding: '16px 20px',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c2410c', fontWeight: 700 }}>
                    <RotateCcw size={18} />
                    <span>Customer Return Request: {getStatusLabel(selectedOrder.return_status)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => updateOrderStatus(selectedOrder.id, 'return_approved')}
                      style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => updateOrderStatus(selectedOrder.id, 'returned')}
                      style={{ background: '#059669', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Mark Refunded
                    </button>
                    <button
                      type="button"
                      onClick={() => updateOrderStatus(selectedOrder.id, 'return_rejected')}
                      style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: '#374151' }}>
                  <strong>Returned by:</strong> {selectedOrder.customer_name} ({selectedOrder.customer_email})
                </div>
                <div style={{ fontSize: '13px', color: '#374151' }}>
                  <strong>Return Reason:</strong> {selectedOrder.return_reason || 'N/A'}
                </div>
                {selectedOrder.return_requested_at && (
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    <strong>Requested on:</strong> {new Date(selectedOrder.return_requested_at).toLocaleString()}
                  </div>
                )}
              </div>
            )}

            {/* Tracking & Fulfillment Management Section */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                <Truck size={20} color="#2563eb" />
                <h4 style={{ margin: 0, color: '#1e293b' }}>Order Tracking & Fulfillment</h4>
              </div>

              <form onSubmit={handleSaveTracking}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>Order Status</label>
                    <select
                      value={trackingForm.status}
                      onChange={(e) => setTrackingForm({ ...trackingForm, status: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="return_requested">Return Requested</option>
                      <option value="return_approved">Return Approved</option>
                      <option value="returned">Returned / Refunded</option>
                      <option value="return_rejected">Return Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>Courier / Carrier</label>
                    <input
                      type="text"
                      list="carrier-suggestions"
                      placeholder="e.g. Standard Shipping, FedEx, BlueDart, DHL"
                      value={trackingForm.carrier}
                      onChange={(e) => setTrackingForm({ ...trackingForm, carrier: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    />
                    <datalist id="carrier-suggestions">
                      <option value="Standard Shipping" />
                      <option value="BlueDart" />
                      <option value="Delhivery" />
                      <option value="FedEx" />
                      <option value="DHL Express" />
                      <option value="UPS" />
                      <option value="India Post" />
                    </datalist>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Tracking Number</label>
                      <button 
                        type="button" 
                        onClick={generateTrackingNumber}
                        style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Auto-generate
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. TPS-TRK-10928"
                      value={trackingForm.tracking_number}
                      onChange={(e) => setTrackingForm({ ...trackingForm, tracking_number: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>Estimated Delivery</label>
                    <input
                      type="date"
                      value={trackingForm.estimated_delivery}
                      onChange={(e) => setTrackingForm({ ...trackingForm, estimated_delivery: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {saveSuccess ? (
                    <span style={{ color: '#16a34a', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <CheckCircle2 size={16} /> Tracking and status updated successfully!
                    </span>
                  ) : <span />}
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={savingTracking}
                    style={{ padding: '8px 20px', fontSize: '13px', cursor: 'pointer' }}
                  >
                    {savingTracking ? 'Saving...' : 'Update Tracking & Status'}
                  </button>
                </div>
              </form>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>Customer Information</h4>
                <p style={{ margin: '4px 0' }}><strong>Name:</strong> {selectedOrder.customer_name}</p>
                <p style={{ margin: '4px 0' }}><strong>Email:</strong> {selectedOrder.customer_email}</p>
                <p style={{ margin: '4px 0' }}><strong>Phone:</strong> {selectedOrder.phone || 'N/A'}</p>
              </div>
              <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>Shipping Address</h4>
                <p style={{ margin: '4px 0' }}><strong>{selectedOrder.full_name}</strong></p>
                <p style={{ margin: '4px 0' }}>{selectedOrder.house_flat}, {selectedOrder.street}</p>
                <p style={{ margin: '4px 0' }}>{selectedOrder.area}, {selectedOrder.city}</p>
                <p style={{ margin: '4px 0' }}>{selectedOrder.state} - {selectedOrder.pincode}</p>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4>Ordered Items</h4>
              <table className="admin-table" style={{ marginTop: '10px' }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={item.image} alt={item.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                          {item.title}
                        </div>
                      </td>
                      <td>${parseFloat(item.price_at_purchase).toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td>${(parseFloat(item.price_at_purchase) * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background: '#f5f1e7', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
              <div style={{ width: '250px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <span>${parseFloat(selectedOrder.subtotal).toFixed(2)}</span>
              </div>
              <div style={{ width: '250px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery:</span>
                <span>${parseFloat(selectedOrder.delivery_fee).toFixed(2)}</span>
              </div>
              {parseFloat(selectedOrder.discount_amount) > 0 && (
                <div style={{ width: '250px', display: 'flex', justifyContent: 'space-between', color: '#468165' }}>
                  <span>Discount:</span>
                  <span>-${parseFloat(selectedOrder.discount_amount).toFixed(2)}</span>
                </div>
              )}
              <div style={{ width: '250px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
                <span>Total:</span>
                <span>${parseFloat(selectedOrder.total).toFixed(2)}</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default OrdersManager;
