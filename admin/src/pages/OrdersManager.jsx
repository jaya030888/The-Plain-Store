import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import { Search, Truck, XCircle, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { API_URL } from '../utils/api';

const OrdersManager = () => {
  const { adminToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

    // Auto-poll every 10 seconds to sync orders placed on frontend in real time
    const pollInterval = setInterval(() => {
      fetchOrders(true);
    }, 10000);

    // Also sync immediately when admin window/tab is focused
    const handleFocus = () => fetchOrders(true);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
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

  const filteredOrders = orders.filter(order => {
    const cust = order.customer_name ? order.customer_name.toLowerCase() : '';
    const trk = order.tracking_number ? order.tracking_number.toLowerCase() : '';
    const q = search.toLowerCase();
    const matchesSearch = order.id.toString().includes(q) || cust.includes(q) || trk.includes(q);
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
      default: return '#f39c12';
    }
  };

  return (
    <AdminLayout title="Orders Management">
      {error && (
        <div style={{ background: '#fdeded', color: '#e03a3a', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px', maxWidth: '400px' }}>
          <input 
            type="text" 
            placeholder="Search by Order ID, Customer, or Tracking #" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: '#888' }} />
        </div>
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
        </select>

        <button 
          onClick={() => fetchOrders(false)}
          className="btn-outline" 
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 15px', cursor: 'pointer', background: '#fff' }}
          title="Sync with latest user orders"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          <span>Sync Orders</span>
        </button>

        {lastSyncedTime && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#468165', background: '#eaf3ee', padding: '6px 12px', borderRadius: '20px', border: '1px solid #c2dece' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#468165', display: 'inline-block' }}></span>
            <span>Live Sync: <strong>{lastSyncedTime}</strong></span>
          </div>
        )}
      </div>

      <div className="admin-table-container">
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
            ) : filteredOrders.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>No orders found</td></tr>
            ) : filteredOrders.map(order => (
              <tr key={order.id}>
                <td><strong>#{order.id}</strong></td>
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
      </div>

      {/* Order Details & Tracking Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="checkout-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '750px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Order #{selectedOrder.id} Details</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setSelectedOrder(null)}><XCircle size={24} /></button>
            </div>

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
