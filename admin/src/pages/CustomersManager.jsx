import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  ShoppingBag, 
  RotateCcw, 
  DollarSign, 
  Package, 
  MapPin, 
  Calendar, 
  Mail, 
  XCircle, 
  ChevronRight, 
  AlertCircle,
  Clock,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { API_URL } from '../utils/api';

const CustomersManager = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { adminToken } = useAuth();

  // Customer History Modal State
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerHistory, setCustomerHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'returns' | 'addresses'

  const getEffectiveToken = () => adminToken || localStorage.getItem('adminToken');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = getEffectiveToken();
      const res = await fetch(`${API_URL}/api/customers/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setCustomers(await res.json());
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerHistory = async (customerId) => {
    setSelectedCustomerId(customerId);
    setLoadingHistory(true);
    setCustomerHistory(null);
    setActiveTab('orders');

    try {
      const token = getEffectiveToken();
      const res = await fetch(`${API_URL}/api/customers/admin/${customerId}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCustomerHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch customer history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const q = search.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.id && c.id.toString().includes(q))
    );
  });

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'delivered':
        return { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' };
      case 'shipped':
        return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
      case 'out_for_delivery':
        return { bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff' };
      case 'processing':
        return { bg: '#f0fdfa', color: '#0f766e', border: '#99f6e4' };
      case 'confirmed':
        return { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
      case 'cancelled':
        return { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' };
      case 'return_requested':
        return { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' };
      case 'return_approved':
        return { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' };
      case 'returned':
        return { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' };
      case 'return_rejected':
        return { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' };
      case 'pending':
      default:
        return { bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'return_requested': return 'Return Requested';
      case 'return_approved': return 'Return Approved';
      case 'returned': return 'Returned / Refunded';
      case 'return_rejected': return 'Return Rejected';
      case 'out_for_delivery': return 'Out for Delivery';
      default: return (status || '').replace(/_/g, ' ');
    }
  };

  return (
    <AdminLayout title="Customers Management">
      {/* Search & Header Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '380px' }}>
          <Search size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by customer name, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 32px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.84rem',
              outline: 'none',
              background: '#fff'
            }}
          />
        </div>
        <div style={{ fontSize: '0.84rem', color: '#64748b' }}>
          Showing <strong>{filteredCustomers.length}</strong> of {customers.length} registered customers
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading customers...</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Joined Date</th>
                <th style={{ textAlign: 'center' }}>Total Orders</th>
                <th style={{ textAlign: 'right' }}>Total Spent</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(c => {
                const initials = (c.name || 'C')
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase();

                return (
                  <tr 
                    key={c.id} 
                    onClick={() => fetchCustomerHistory(c.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: '#f1f5f9',
                          color: '#334155',
                          fontWeight: '700',
                          fontSize: '0.78rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.88rem' }}>
                            {c.name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            ID: #{c.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: '#475569', fontSize: '0.84rem' }}>{c.email}</td>
                    <td style={{ color: '#64748b', fontSize: '0.82rem' }}>
                      {new Date(c.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        background: '#f1f5f9',
                        color: '#334155',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontWeight: '600',
                        fontSize: '0.78rem'
                      }}>
                        {c.number_of_orders || 0}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>
                      ${parseFloat(c.total_spent || 0).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchCustomerHistory(c.id);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '5px 12px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          background: '#fff',
                          color: '#0f172a',
                          fontSize: '0.78rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>View History</span>
                        <ChevronRight size={12} color="#64748b" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    No customers found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Profile & Purchase/Return History Modal */}
      {selectedCustomerId && (
        <div className="modal-overlay" onClick={() => setSelectedCustomerId(null)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '820px',
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
            {loadingHistory ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                <Clock size={32} className="spin" style={{ margin: '0 auto 12px' }} />
                <p style={{ margin: 0, fontWeight: 500 }}>Loading customer history & purchases...</p>
              </div>
            ) : customerHistory ? (
              <div>
                {/* Modal Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: '#468165',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {(customerHistory.customer.name || 'C').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                        {customerHistory.customer.name}
                      </h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '3px', fontSize: '0.8rem', color: '#64748b' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={13} /> {customerHistory.customer.email}
                        </span>
                        <span>&bull;</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} /> Customer since {new Date(customerHistory.customer.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCustomerId(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                  >
                    <XCircle size={22} />
                  </button>
                </div>

                {/* 4 Stat Overview Cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: '12px',
                  marginBottom: '20px'
                }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Spent</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                      ${customerHistory.stats.totalSpent.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Orders Placed</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                      {customerHistory.stats.totalOrders}
                    </div>
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Items Bought</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                      {customerHistory.stats.totalItemsPurchased}
                    </div>
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Returns / Refunds</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: customerHistory.stats.totalReturns > 0 ? '#ea580c' : '#0f172a', marginTop: '4px' }}>
                      {customerHistory.stats.totalReturns}
                    </div>
                  </div>
                </div>

                {/* Sub-tabs: Orders vs Returns vs Addresses */}
                <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '18px' }}>
                  <button
                    onClick={() => setActiveTab('orders')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      background: 'none',
                      border: 'none',
                      borderBottom: activeTab === 'orders' ? '2px solid #468165' : '2px solid transparent',
                      color: activeTab === 'orders' ? '#468165' : '#64748b',
                      fontWeight: 600,
                      fontSize: '0.84rem',
                      cursor: 'pointer'
                    }}
                  >
                    <ShoppingBag size={14} />
                    <span>Purchase History ({customerHistory.orders.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('returns')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      background: 'none',
                      border: 'none',
                      borderBottom: activeTab === 'returns' ? '2px solid #ea580c' : '2px solid transparent',
                      color: activeTab === 'returns' ? '#ea580c' : '#64748b',
                      fontWeight: 600,
                      fontSize: '0.84rem',
                      cursor: 'pointer'
                    }}
                  >
                    <RotateCcw size={14} />
                    <span>Returns & Refunds ({customerHistory.returns.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('addresses')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      background: 'none',
                      border: 'none',
                      borderBottom: activeTab === 'addresses' ? '2px solid #0f172a' : '2px solid transparent',
                      color: activeTab === 'addresses' ? '#0f172a' : '#64748b',
                      fontWeight: 600,
                      fontSize: '0.84rem',
                      cursor: 'pointer'
                    }}
                  >
                    <MapPin size={14} />
                    <span>Addresses ({customerHistory.addresses.length})</span>
                  </button>
                </div>

                {/* TAB 1: PURCHASE HISTORY */}
                {activeTab === 'orders' && (
                  <div>
                    {customerHistory.orders.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        No orders placed by this customer yet.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {customerHistory.orders.map(order => {
                          const statusStyle = getStatusBadgeStyle(order.order_status);
                          return (
                            <div key={order.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                              {/* Order Card Header */}
                              <div style={{ background: '#f8fafc', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                                    Order #{order.id}
                                  </span>
                                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                                    {new Date(order.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    background: statusStyle.bg,
                                    color: statusStyle.color,
                                    border: `1px solid ${statusStyle.border}`
                                  }}>
                                    {getStatusLabel(order.order_status)}
                                  </span>
                                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                                    ${parseFloat(order.total).toFixed(2)}
                                  </span>
                                </div>
                              </div>

                              {/* Order Items */}
                              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {order.items?.map(item => (
                                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <img src={item.image} alt={item.title} style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                                      <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0f172a' }}>{item.title}</div>
                                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Qty: {item.quantity} &bull; ${parseFloat(item.price_at_purchase).toFixed(2)} each</div>
                                      </div>
                                    </div>
                                    <span style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0f172a' }}>
                                      ${(parseFloat(item.price_at_purchase) * item.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              {/* Tracking & Address Footer */}
                              <div style={{ background: '#fafbfc', borderTop: '1px solid #f1f5f9', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: '#64748b' }}>
                                <div>
                                  Tracking: <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1e293b' }}>{order.tracking_number || `TPS-TRK-${order.id}`}</span> ({order.carrier || 'Standard Shipping'})
                                </div>
                                <div>
                                  Delivered to: {order.city || 'Address on file'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: RETURNS & REFUNDS */}
                {activeTab === 'returns' && (
                  <div>
                    {customerHistory.returns.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        <RotateCcw size={28} color="#94a3b8" style={{ margin: '0 auto 8px', display: 'block' }} />
                        <p style={{ margin: 0, fontWeight: 500, color: '#0f172a' }}>No return requests</p>
                        <small style={{ color: '#64748b' }}>This customer has not requested any returns or refunds.</small>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {customerHistory.returns.map(order => {
                          const statusStyle = getStatusBadgeStyle(order.order_status);
                          return (
                            <div key={order.id} style={{ border: '1px solid #fed7aa', background: '#fffaf5', borderRadius: '8px', padding: '16px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <div>
                                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                                    Return on Order #{order.id}
                                  </span>
                                  {order.return_requested_at && (
                                    <span style={{ fontSize: '0.74rem', color: '#64748b', marginLeft: '8px' }}>
                                      Requested on {new Date(order.return_requested_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                  )}
                                </div>
                                <span style={{
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  background: statusStyle.bg,
                                  color: statusStyle.color,
                                  border: `1px solid ${statusStyle.border}`
                                }}>
                                  {getStatusLabel(order.order_status)}
                                </span>
                              </div>

                              <div style={{ fontSize: '0.82rem', color: '#334155', marginBottom: '10px' }}>
                                <strong>Reason for return:</strong> {order.return_reason || 'Return Requested'}
                              </div>

                              {/* Items Returned */}
                              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {order.items?.map(item => (
                                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <img src={item.image} alt={item.title} style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px' }} />
                                    <div style={{ fontSize: '0.78rem', color: '#1e293b' }}>
                                      <strong>{item.title}</strong> &bull; Qty {item.quantity} &bull; ${parseFloat(item.price_at_purchase).toFixed(2)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: ADDRESSES */}
                {activeTab === 'addresses' && (
                  <div>
                    {customerHistory.addresses.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        No saved addresses found.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                        {customerHistory.addresses.map(addr => (
                          <div key={addr.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', background: '#f8fafc' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.86rem', color: '#0f172a' }}>{addr.full_name}</span>
                              {addr.is_default && (
                                <span style={{ fontSize: '0.68rem', background: '#ecfdf5', color: '#047857', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>DEFAULT</span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span>{addr.phone}</span>
                              <span>{addr.house_flat}, {addr.street}</span>
                              <span>{addr.area}, {addr.city}</span>
                              <span>{addr.state} - {addr.pincode}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    onClick={() => setSelectedCustomerId(null)}
                    style={{
                      padding: '7px 18px',
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#dc2626' }}>
                <AlertCircle size={28} style={{ margin: '0 auto 8px', display: 'block' }} />
                Failed to load customer details.
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default CustomersManager;
