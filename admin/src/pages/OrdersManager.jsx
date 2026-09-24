import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import { 
  Search, 
  Truck, 
  XCircle, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronRight, 
  IndianRupee, 
  Package, 
  Clock, 
  RefreshCw,
  Eye,
  Trash2,
  X
} from 'lucide-react';
import { API_URL } from '../utils/api';

const OrdersManager = () => {
  const { adminToken } = useAuth();
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'returns'
  const [copiedTrkId, setCopiedTrkId] = useState(null);

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
        const trk = data.tracking_number || `TPS-TRK-${data.id}${Math.floor(1000 + Math.random() * 9000)}`;
        setTrackingForm({
          status: data.order_status || 'pending',
          tracking_number: trk,
          carrier: data.carrier || 'Standard Shipping',
          estimated_delivery: data.estimated_delivery ? data.estimated_delivery.split('T')[0] : ''
        });
        setSelectedOrder(data);
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
    const finalTracking = trackingForm.tracking_number?.trim() || `TPS-TRK-${selectedOrder.id}${Math.floor(1000 + Math.random() * 9000)}`;
    const finalCarrier = trackingForm.carrier?.trim() || 'Standard Shipping';
    const payload = {
      ...trackingForm,
      tracking_number: finalTracking,
      carrier: finalCarrier
    };

    try {
      const res = await fetch(`${API_URL}/api/orders/admin/${selectedOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSaveSuccess(true);
        setSelectedOrder(prev => ({
          ...prev,
          order_status: payload.status,
          tracking_number: payload.tracking_number,
          carrier: payload.carrier,
          estimated_delivery: payload.estimated_delivery
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

  const copyTracking = (trk, orderId) => {
    if (!trk) return;
    navigator.clipboard.writeText(trk);
    setCopiedTrkId(orderId);
    setTimeout(() => setCopiedTrkId(null), 2000);
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to permanently delete Order #${orderId}? This will remove the order and all associated items and returns. This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/orders/admin/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getEffectiveToken()}` }
      });
      if (res.ok) {
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(null);
        }
        fetchOrders();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to delete order');
      }
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert('Error deleting order');
    }
  };

  const handleDismissReturn = async (orderId) => {
    if (!window.confirm(`Dismiss customer return for Order #${orderId}? It will be removed from Customer Returns.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/orders/admin/${orderId}/return`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getEffectiveToken()}` }
      });
      if (res.ok) {
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => ({ ...prev, return_status: null, return_reason: null }));
        }
        fetchOrders();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to dismiss return');
      }
    } catch (error) {
      console.error('Failed to dismiss return:', error);
      alert('Error dismissing return');
    }
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

  const getStatusBadgeStyle = (status) => {
    switch(status) {
      case 'delivered':
        return { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', dot: '#22c55e' };
      case 'shipped':
        return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', dot: '#3b82f6' };
      case 'out_for_delivery':
        return { bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff', dot: '#a855f7' };
      case 'processing':
        return { bg: '#f0fdfa', color: '#0f766e', border: '#99f6e4', dot: '#14b8a6' };
      case 'confirmed':
        return { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0', dot: '#10b981' };
      case 'cancelled':
        return { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca', dot: '#ef4444' };
      case 'return_requested':
        return { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa', dot: '#f97316' };
      case 'return_approved':
        return { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe', dot: '#2563eb' };
      case 'returned':
        return { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe', dot: '#8b5cf6' };
      case 'return_rejected':
        return { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca', dot: '#ef4444' };
      case 'pending':
      default:
        return { bg: '#fffbeb', color: '#b45309', border: '#fde68a', dot: '#f59e0b' };
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'return_requested': return 'Return Requested';
      case 'return_approved': return 'Return Approved';
      case 'returned': return 'Returned / Refunded';
      case 'return_rejected': return 'Return Rejected';
      case 'out_for_delivery': return 'Out for Delivery';
      default: return (status || '').replace(/_/g, ' ');
    }
  };
  const totalSales = orders.reduce((acc, o) => acc + (parseFloat(o.total) || 0), 0);
  const pendingFulfillment = orders.filter(o => ['pending', 'processing', 'confirmed'].includes(o.order_status)).length;

  return (
    <AdminLayout title="Orders & Returns Management">
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} />
          <span style={{ fontSize: '0.85rem' }}>{error}</span>
        </div>
      )}

      {/* Modern Metrics Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '14px',
        marginBottom: '22px'
      }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Orders</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{orders.length}</div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
            <Package size={20} />
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gross Revenue</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
              ₹{totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
            <IndianRupee size={20} />
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Needs Fulfillment</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{pendingFulfillment}</div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
            <Clock size={20} />
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer Returns</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: returnOrders.length > 0 ? '#ea580c' : '#0f172a', marginTop: '4px' }}>
              {returnOrders.length}
            </div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: returnOrders.length > 0 ? '#fff7ed' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: returnOrders.length > 0 ? '#ea580c' : '#64748b' }}>
            <RotateCcw size={20} />
          </div>
        </div>
      </div>

      {/* Top View Selector Tabs & Live Sync */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '3px' }}>
          <button
            type="button"
            onClick={() => { setActiveTab('all'); setStatusFilter('all'); }}
            style={{
              background: activeTab === 'all' ? '#ffffff' : 'transparent',
              color: activeTab === 'all' ? '#0f172a' : '#64748b',
              boxShadow: activeTab === 'all' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>All Orders</span>
            <span style={{ 
              fontSize: '0.7rem', 
              background: activeTab === 'all' ? '#f1f5f9' : 'rgba(0,0,0,0.04)', 
              padding: '1px 6px', 
              borderRadius: '10px', 
              color: activeTab === 'all' ? '#334155' : '#64748b',
              fontWeight: 600
            }}>
              {orders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('returns'); setStatusFilter('all'); }}
            style={{
              background: activeTab === 'returns' ? '#ffffff' : 'transparent',
              color: activeTab === 'returns' ? '#ea580c' : '#64748b',
              boxShadow: activeTab === 'returns' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <RotateCcw size={13} />
            <span>Returns</span>
            {returnOrders.length > 0 && (
              <span style={{ fontSize: '0.7rem', background: '#ffedd5', color: '#c2410c', padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>
                {returnOrders.length}
              </span>
            )}
          </button>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          {lastSyncedTime && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b', background: '#fff', padding: '5px 12px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
              <span>Live Synced {lastSyncedTime}</span>
            </div>
          )}
          <button
            onClick={() => fetchOrders()}
            title="Refresh orders"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 10px',
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '0.75rem',
              color: '#475569',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            <RefreshCw size={12} className={refreshing ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '16px',
        alignItems: 'center',
        flexWrap: 'wrap',
        background: '#fff',
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '360px' }}>
          <Search size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder={activeTab === 'returns' ? "Search by order, customer, or reason..." : "Search by Order #, customer, tracking..."} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '7px 10px 7px 32px', 
              borderRadius: '6px', 
              border: '1px solid #cbd5e1', 
              fontSize: '0.84rem', 
              outline: 'none',
              background: '#f8fafc',
              transition: 'border-color 0.15s ease'
            }}
            onFocus={(e) => { e.target.style.borderColor = '#468165'; e.target.style.background = '#fff'; }}
            onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc'; }}
          />
        </div>

        {activeTab === 'all' ? (
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem', color: '#334155', background: '#fff', cursor: 'pointer', outline: 'none' }}
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
            style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem', color: '#334155', background: '#fff', cursor: 'pointer', outline: 'none' }}
          >
            <option value="all">All Return Statuses ({returnOrders.length})</option>
            <option value="return_requested">Return Requested</option>
            <option value="return_approved">Return Approved</option>
            <option value="returned">Returned / Refunded</option>
            <option value="return_rejected">Return Rejected</option>
          </select>
        )}

        <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#64748b' }}>
          Showing <strong>{displayedOrders.length}</strong> of {activeTab === 'returns' ? returnOrders.length : orders.length} orders
        </div>
      </div>

      <div className="admin-table-container">
        {activeTab === 'returns' ? (
          /* ======================================================== */
          /* DEDICATED RETURNS TABLE */
          /* ======================================================== */
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items Returned</th>
                <th>Return Reason</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Loading returns...</td></tr>
              ) : displayedOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <RotateCcw size={28} color="#94a3b8" />
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#334155' }}>No customer returns found.</p>
                      <small style={{ color: '#64748b' }}>Orders requested for return by customers will appear here.</small>
                    </div>
                  </td>
                </tr>
              ) : displayedOrders.map(order => {
                const statusStyle = getStatusBadgeStyle(order.order_status);
                const initials = (order.customer_name || 'U')
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase();

                return (
                  <tr key={order.id} style={{ background: order.order_status === 'return_requested' ? '#fffdfa' : 'transparent' }}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>
                          #{order.id}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          ₹{parseFloat(order.total).toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: '#f1f5f9',
                          color: '#475569',
                          fontWeight: '600',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {initials}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.86rem' }}>
                            {order.customer_name}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>
                            {order.customer_email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ minWidth: '180px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {order.items?.map(item => (
                          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img 
                              src={item.image} 
                              alt={item.title} 
                              style={{ width: '24px', height: '24px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} 
                            />
                            <div style={{ fontSize: '0.76rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px', color: '#1e293b' }}>
                              {item.title} &bull; Qty {item.quantity}
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
                        fontSize: '0.76rem', 
                        fontWeight: '600' 
                      }}>
                        {order.return_reason || 'Return Requested'}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 10px',
                        borderRadius: '16px',
                        fontSize: '0.76rem',
                        fontWeight: '600',
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        border: `1px solid ${statusStyle.border}`
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusStyle.dot }} />
                        {getStatusLabel(order.order_status)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {order.order_status === 'return_requested' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'return_approved')}
                            style={{
                              background: '#2563eb',
                              color: '#fff',
                              border: 'none',
                              padding: '5px 10px',
                              borderRadius: '5px',
                              fontSize: '0.74rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Approve
                          </button>
                        )}
                        {(order.order_status === 'return_requested' || order.order_status === 'return_approved') && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'returned')}
                            style={{
                              background: '#059669',
                              color: '#fff',
                              border: 'none',
                              padding: '5px 10px',
                              borderRadius: '5px',
                              fontSize: '0.74rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Refund
                          </button>
                        )}
                        <button 
                          onClick={() => handleDismissReturn(order.id)}
                          title={`Dismiss return for Order #${order.id} (removes from Returns)`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '5px 8px',
                            borderRadius: '5px',
                            border: '1px solid #e2e8f0',
                            background: '#fff',
                            color: '#64748b',
                            fontSize: '0.74rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.background = '#f1f5f9'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = '#fff'; }}
                        >
                          <X size={12} />
                          <span>Dismiss</span>
                        </button>
                        <button 
                          onClick={() => fetchOrderDetails(order.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '5px 10px',
                            borderRadius: '5px',
                            border: '1px solid #e2e8f0',
                            background: '#fff',
                            color: '#334155',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          <span>Manage</span>
                          <ChevronRight size={12} color="#94a3b8" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          title={`Permanently delete Order #${order.id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '5px 8px',
                            borderRadius: '5px',
                            border: '1px solid #fee2e2',
                            background: '#fff',
                            color: '#ef4444',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fca5a5'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#fee2e2'; }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          /* ======================================================== */
          /* REGULAR ALL ORDERS TABLE */
          /* ======================================================== */
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Tracking & Carrier</th>
                <th>Total & Payment</th>
                <th>Fulfillment Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Loading orders...</td></tr>
              ) : displayedOrders.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No orders found</td></tr>
              ) : displayedOrders.map(order => {
                const statusStyle = getStatusBadgeStyle(order.order_status);
                const isPaid = order.payment_status === 'paid';
                const initials = (order.customer_name || 'U')
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase();
                const displayTracking = order.tracking_number || `TPS-TRK-${order.id}`;

                return (
                  <tr key={order.id}>
                    {/* Order ID & Date */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>
                            #{order.id}
                          </span>
                          {order.return_status && (
                            <span style={{ fontSize: '0.65rem', background: '#ffedd5', color: '#c2410c', padding: '1px 5px', borderRadius: '4px', fontWeight: '700' }}>
                              RETURN
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          {new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: '#f1f5f9',
                          color: '#475569',
                          fontWeight: '600',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {initials}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.86rem' }}>
                            {order.customer_name}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                            {order.customer_email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Tracking & Carrier with Copy feature */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span 
                            onClick={() => copyTracking(displayTracking, order.id)}
                            title="Click to copy tracking ID"
                            style={{
                              fontFamily: 'monospace',
                              fontSize: '0.76rem',
                              background: '#f8fafc',
                              color: '#334155',
                              border: '1px solid #e2e8f0',
                              padding: '2px 7px',
                              borderRadius: '5px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {displayTracking}
                            {copiedTrkId === order.id ? (
                              <Check size={11} color="#16a34a" />
                            ) : (
                              <Copy size={11} color="#94a3b8" />
                            )}
                          </span>
                          {copiedTrkId === order.id && (
                            <span style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: '600' }}>Copied!</span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.73rem', color: '#64748b' }}>
                          {order.carrier || 'Standard Shipping'}
                        </div>
                      </div>
                    </td>

                    {/* Total & Payment */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.92rem' }}>
                          ₹{parseFloat(order.total).toFixed(2)}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: '700',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            letterSpacing: '0.3px',
                            backgroundColor: isPaid ? '#f0fdf4' : '#fffbeb',
                            color: isPaid ? '#15803d' : '#b45309',
                            border: isPaid ? '1px solid #bbf7d0' : '1px solid #fde68a'
                          }}>
                            {isPaid ? 'PAID' : 'PENDING'}
                          </span>
                          {order.items && order.items.length > 0 && (
                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Fulfillment Status: Modern subtle pill dropdown */}
                    <td>
                      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                        <select 
                          value={order.order_status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          style={{ 
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            padding: '4px 24px 4px 20px', 
                            borderRadius: '16px', 
                            border: `1px solid ${statusStyle.border}`,
                            color: statusStyle.color,
                            backgroundColor: statusStyle.bg,
                            fontWeight: '600',
                            fontSize: '0.76rem',
                            cursor: 'pointer',
                            outline: 'none',
                            lineHeight: 1.2,
                            transition: 'all 0.15s ease'
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
                        <span style={{
                          position: 'absolute',
                          left: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: statusStyle.dot,
                          pointerEvents: 'none'
                        }} />
                        <ChevronDown 
                          size={11} 
                          color={statusStyle.color} 
                          style={{ 
                            position: 'absolute', 
                            right: '7px', 
                            top: '50%', 
                            transform: 'translateY(-50%)', 
                            pointerEvents: 'none' 
                          }} 
                        />
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button 
                          onClick={() => fetchOrderDetails(order.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '5px 12px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#ffffff',
                            color: '#0f172a',
                            fontSize: '0.78rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                          }}
                        >
                          <span>Manage</span>
                          <ChevronRight size={12} color="#64748b" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          title={`Permanently delete Order #${order.id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: '1px solid #fee2e2',
                            background: '#fff',
                            color: '#ef4444',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fca5a5'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#fee2e2'; }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>


      {/* Order Details & Tracking Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div 
            onClick={e => e.stopPropagation()} 
            style={{ 
              maxWidth: '780px', 
              width: '95%', 
              maxHeight: '90vh', 
              overflowY: 'auto', 
              padding: '28px',
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                    Order #{selectedOrder.id}
                  </h2>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '14px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    background: getStatusBadgeStyle(selectedOrder.order_status).bg,
                    color: getStatusBadgeStyle(selectedOrder.order_status).color,
                    border: `1px solid ${getStatusBadgeStyle(selectedOrder.order_status).border}`
                  }}>
                    {getStatusLabel(selectedOrder.order_status)}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Placed on {new Date(selectedOrder.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              <button 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }} 
                onClick={() => setSelectedOrder(null)}
              >
                <XCircle size={22} />
              </button>
            </div>

            {/* Customer Return Request Highlight Card */}
            {selectedOrder.return_status && (
              <div style={{
                background: '#fffaf5',
                border: '1px solid #fed7aa',
                borderRadius: '8px',
                padding: '16px 18px',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c2410c', fontWeight: 700, fontSize: '0.88rem' }}>
                    <RotateCcw size={16} />
                    <span>Customer Return Request: {getStatusLabel(selectedOrder.return_status)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => updateOrderStatus(selectedOrder.id, 'return_approved')}
                      style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '5px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Approve Return
                    </button>
                    <button
                      type="button"
                      onClick={() => updateOrderStatus(selectedOrder.id, 'returned')}
                      style={{ background: '#059669', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '5px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Mark Refunded
                    </button>
                    <button
                      type="button"
                      onClick={() => updateOrderStatus(selectedOrder.id, 'return_rejected')}
                      style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '5px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDismissReturn(selectedOrder.id)}
                      title="Dismiss this return from Returns list"
                      style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #cbd5e1', padding: '5px 12px', borderRadius: '5px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Dismiss Return
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#334155' }}>
                  <strong>Return Reason:</strong> {selectedOrder.return_reason || 'N/A'}
                </div>
                {selectedOrder.return_requested_at && (
                  <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                    Requested on {new Date(selectedOrder.return_requested_at).toLocaleString()}
                  </div>
                )}
              </div>
            )}

            {/* Tracking & Fulfillment Management Section */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '18px 20px', marginBottom: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Truck size={18} color="#2563eb" />
                <h4 style={{ margin: 0, color: '#0f172a', fontSize: '0.92rem', fontWeight: 700 }}>Fulfillment & Courier Tracking</h4>
              </div>

              <form onSubmit={handleSaveTracking}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>Status</label>
                    <select
                      value={trackingForm.status}
                      onChange={(e) => setTrackingForm({ ...trackingForm, status: e.target.value })}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem', background: '#fff', outline: 'none' }}
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
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>Courier / Carrier</label>
                    <input
                      type="text"
                      list="carrier-suggestions"
                      placeholder="e.g. Standard Shipping, FedEx"
                      value={trackingForm.carrier}
                      onChange={(e) => setTrackingForm({ ...trackingForm, carrier: e.target.value })}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem', background: '#fff', outline: 'none' }}
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
                      <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569' }}>Tracking Number</label>
                      <button 
                        type="button" 
                        onClick={generateTrackingNumber}
                        style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Auto-generate
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. TPS-TRK-10928"
                      value={trackingForm.tracking_number}
                      onChange={(e) => setTrackingForm({ ...trackingForm, tracking_number: e.target.value })}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem', background: '#fff', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>Estimated Delivery</label>
                    <input
                      type="date"
                      value={trackingForm.estimated_delivery}
                      onChange={(e) => setTrackingForm({ ...trackingForm, estimated_delivery: e.target.value })}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem', background: '#fff', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  {saveSuccess ? (
                    <span style={{ color: '#16a34a', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                      <CheckCircle2 size={16} /> Tracking and status updated successfully!
                    </span>
                  ) : <span />}
                  <button 
                    type="submit" 
                    disabled={savingTracking}
                    style={{ 
                      padding: '8px 18px', 
                      fontSize: '0.82rem', 
                      cursor: 'pointer',
                      backgroundColor: '#468165',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 600,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      marginLeft: 'auto'
                    }}
                  >
                    {savingTracking ? 'Saving...' : 'Update Fulfillment'}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Customer & Shipping Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '22px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.86rem', color: '#0f172a', fontWeight: 700 }}>Customer Information</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.82rem', color: '#334155' }}>
                  <p style={{ margin: 0 }}><strong>Name:</strong> {selectedOrder.customer_name}</p>
                  <p style={{ margin: 0 }}><strong>Email:</strong> {selectedOrder.customer_email}</p>
                  <p style={{ margin: 0 }}><strong>Phone:</strong> {selectedOrder.phone || 'N/A'}</p>
                </div>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.86rem', color: '#0f172a', fontWeight: 700 }}>Shipping Destination</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.82rem', color: '#334155' }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>{selectedOrder.full_name}</p>
                  <p style={{ margin: 0 }}>{selectedOrder.house_flat}, {selectedOrder.street}</p>
                  <p style={{ margin: 0 }}>{selectedOrder.area}, {selectedOrder.city}</p>
                  <p style={{ margin: 0 }}>{selectedOrder.state} - {selectedOrder.pincode}</p>
                </div>
              </div>
            </div>

            {/* Ordered Items Table */}
            <div style={{ marginBottom: '22px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.88rem', color: '#0f172a', fontWeight: 700 }}>Items in Order ({selectedOrder.items?.length || 0})</h4>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Unit Price</th>
                      <th>Quantity</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map(item => (
                      <tr key={item.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={item.image} alt={item.title} style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                            <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.84rem' }}>{item.title}</span>
                          </div>
                        </td>
                        <td style={{ color: '#475569', fontSize: '0.84rem' }}>₹{parseFloat(item.price_at_purchase).toFixed(2)}</td>
                        <td style={{ color: '#475569', fontSize: '0.84rem' }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#0f172a', fontSize: '0.84rem' }}>
                          ₹{(parseFloat(item.price_at_purchase) * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pricing Breakdown Summary */}
            <div style={{ 
              background: '#f8fafc', 
              border: '1px solid #e2e8f0', 
              padding: '16px 20px', 
              borderRadius: '8px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '6px', 
              alignItems: 'flex-end',
              fontSize: '0.84rem' 
            }}>
              <div style={{ width: '240px', display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Subtotal:</span>
                <span style={{ color: '#0f172a', fontWeight: 500 }}>₹{parseFloat(selectedOrder.subtotal || selectedOrder.total).toFixed(2)}</span>
              </div>
              <div style={{ width: '240px', display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Delivery:</span>
                <span style={{ color: '#0f172a', fontWeight: 500 }}>₹{parseFloat(selectedOrder.delivery_fee || 0).toFixed(2)}</span>
              </div>
              {parseFloat(selectedOrder.discount_amount || 0) > 0 && (
                <div style={{ width: '240px', display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 600 }}>
                  <span>Discount:</span>
                  <span>-₹{parseFloat(selectedOrder.discount_amount).toFixed(2)}</span>
                </div>
              )}
              <div style={{ width: '240px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem', color: '#0f172a', borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '4px' }}>
                <span>Total:</span>
                <span>₹{parseFloat(selectedOrder.total).toFixed(2)}</span>
              </div>
            </div>

            {/* Modal Bottom Actions Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '22px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
              <button
                type="button"
                onClick={() => handleDeleteOrder(selectedOrder.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#fff',
                  border: '1px solid #fca5a5',
                  color: '#dc2626',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
              >
                <Trash2 size={14} />
                <span>Delete Order</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                style={{
                  padding: '7px 16px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>


          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default OrdersManager;
