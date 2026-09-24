import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  ShoppingBag, 
  RotateCcw, 
  IndianRupee, 
  Package, 
  MapPin, 
  Calendar, 
  Mail, 
  XCircle, 
  ChevronRight, 
  AlertCircle,
  Clock,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Ban,
  UserCheck,
  UserX,
  Eye,
  Filter
} from 'lucide-react';
import { API_URL } from '../utils/api';

const CustomersManager = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'blocked'
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });
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
      if (res.ok) {
        const data = await res.json();
        setCustomers(Array.isArray(data) ? data : []);
      }
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

  const showNotification = (text, type = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => {
      setActionMessage({ text: '', type: '' });
    }, 4000);
  };

  const handleToggleBlock = async (customer, e) => {
    e?.stopPropagation();
    const isCurrentlyBlocked = Boolean(customer.is_blocked);
    const actionName = isCurrentlyBlocked ? 'unblock' : 'block';

    if (!window.confirm(`Are you sure you want to ${actionName} "${customer.name}"? ${!isCurrentlyBlocked ? 'They will not be able to log in or make purchases.' : 'Their account access will be restored.'}`)) {
      return;
    }

    setActionLoadingId(customer.id);
    try {
      const token = getEffectiveToken();
      const res = await fetch(`${API_URL}/api/customers/admin/${customer.id}/toggle-block`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (res.ok) {
        // Update customer in local state
        setCustomers(prev => prev.map(c => {
          if (c.id === customer.id) {
            return { ...c, is_blocked: data.is_blocked };
          }
          return c;
        }));

        // If history modal is open for this customer, update it too
        if (customerHistory && customerHistory.customer.id === customer.id) {
          setCustomerHistory(prev => ({
            ...prev,
            customer: {
              ...prev.customer,
              is_blocked: data.is_blocked
            }
          }));
        }

        showNotification(data.message || `Customer ${actionName}ed successfully.`, 'success');
      } else {
        showNotification(data.message || `Failed to ${actionName} customer.`, 'error');
      }
    } catch (err) {
      console.error(`Error toggling block:`, err);
      showNotification(`Network error while trying to ${actionName} customer.`, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteCustomer = async (customer, e) => {
    e?.stopPropagation();
    const promptMsg = `Are you sure you want to delete customer "${customer.name}" (ID #${customer.id})?\n\nIf the customer has placed orders in the past, their profile will be deactivated and historical order reports will be preserved.`;

    if (!window.confirm(promptMsg)) {
      return;
    }

    setActionLoadingId(customer.id);
    try {
      const token = getEffectiveToken();
      const res = await fetch(`${API_URL}/api/customers/admin/${customer.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        setCustomers(prev => prev.filter(c => c.id !== customer.id));
        if (selectedCustomerId === customer.id) {
          setSelectedCustomerId(null);
        }
        showNotification(data.message || `Customer deleted successfully.`, 'success');
      } else {
        showNotification(data.message || 'Failed to delete customer.', 'error');
      }
    } catch (err) {
      console.error('Error deleting customer:', err);
      showNotification('Network error while deleting customer.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.id && c.id.toString().includes(q))
    );

    const isBlocked = Boolean(c.is_blocked);
    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = !isBlocked;
    if (statusFilter === 'blocked') matchesStatus = isBlocked;

    return matchesSearch && matchesStatus;
  });

  const activeCount = customers.filter(c => !c.is_blocked).length;
  const blockedCount = customers.filter(c => c.is_blocked).length;

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
      {/* Toast Notification */}
      {actionMessage.text && (
        <div style={{
          marginBottom: '16px',
          padding: '10px 16px',
          borderRadius: '8px',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: actionMessage.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color: actionMessage.type === 'error' ? '#991b1b' : '#166534',
          border: `1px solid ${actionMessage.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          {actionMessage.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        {/* Search input */}
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '340px' }}>
          <Search size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by customer name, email, or ID..."
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

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
          <button
            onClick={() => setStatusFilter('all')}
            style={{
              padding: '5px 12px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: statusFilter === 'all' ? '#ffffff' : 'transparent',
              color: statusFilter === 'all' ? '#0f172a' : '#64748b',
              boxShadow: statusFilter === 'all' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            All ({customers.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            style={{
              padding: '5px 12px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: statusFilter === 'active' ? '#ffffff' : 'transparent',
              color: statusFilter === 'active' ? '#15803d' : '#64748b',
              boxShadow: statusFilter === 'active' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('blocked')}
            style={{
              padding: '5px 12px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: statusFilter === 'blocked' ? '#ffffff' : 'transparent',
              color: statusFilter === 'blocked' ? '#b91c1c' : '#64748b',
              boxShadow: statusFilter === 'blocked' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Blocked ({blockedCount})
          </button>
        </div>

        <div style={{ fontSize: '0.84rem', color: '#64748b' }}>
          Showing <strong>{filteredCustomers.length}</strong> of {customers.length} customers
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading customers...</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '60px', textAlign: 'center' }}>ID</th>
                <th style={{ minWidth: '130px' }}>Customer</th>
                <th style={{ minWidth: '150px' }}>Email</th>
                <th style={{ width: '85px' }}>Status</th>
                <th style={{ width: '90px' }}>Joined</th>
                <th style={{ textAlign: 'center', width: '65px' }}>Orders</th>
                <th style={{ textAlign: 'right', width: '85px' }}>Spent</th>
                <th style={{ textAlign: 'center', width: '185px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => {
                const isBlocked = Boolean(c.is_blocked);
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
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: isBlocked ? '#fffafa' : undefined,
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    {/* Customer ID Badge */}
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 6px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        fontWeight: 700,
                        fontSize: '0.76rem',
                        color: '#334155',
                        fontFamily: 'monospace'
                      }}>
                        #{c.id}
                      </span>
                    </td>

                    {/* Customer Name & Avatar */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          background: isBlocked ? '#fee2e2' : '#f1f5f9',
                          color: isBlocked ? '#b91c1c' : '#334155',
                          fontWeight: '700',
                          fontSize: '0.74rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {initials}
                        </div>
                        <div style={{ fontWeight: '600', color: isBlocked ? '#991b1b' : '#0f172a', fontSize: '0.84rem' }}>
                          {c.name}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ color: '#475569', fontSize: '0.82rem', maxWidth: '190px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.email}>
                      {c.email}
                    </td>

                    {/* Status Badge */}
                    <td>
                      {isBlocked ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '2px 7px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: '#fef2f2',
                          color: '#b91c1c',
                          border: '1px solid #fecaca'
                        }}>
                          <Ban size={10} /> Blocked
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '2px 7px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: '#f0fdf4',
                          color: '#15803d',
                          border: '1px solid #bbf7d0'
                        }}>
                          <CheckCircle2 size={10} /> Active
                        </span>
                      )}
                    </td>

                    {/* Joined Date */}
                    <td style={{ color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {new Date(c.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>

                    {/* Total Orders */}
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        background: '#f1f5f9',
                        color: '#334155',
                        padding: '2px 7px',
                        borderRadius: '10px',
                        fontWeight: '600',
                        fontSize: '0.76rem'
                      }}>
                        {c.number_of_orders || 0}
                      </span>
                    </td>

                    {/* Total Spent */}
                    <td style={{ textAlign: 'right', fontWeight: '700', color: '#0f172a', fontSize: '0.86rem', whiteSpace: 'nowrap' }}>
                      ₹{parseFloat(c.total_spent || 0).toFixed(2)}
                    </td>

                    {/* Manage Actions */}
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }} onClick={e => e.stopPropagation()}>
                        {/* View Past Details */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fetchCustomerHistory(c.id);
                          }}
                          title="View Details & Order History"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '4px 8px',
                            borderRadius: '5px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#0f172a',
                            fontSize: '0.74rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Eye size={12} />
                          <span>Details</span>
                        </button>

                        {/* Block / Unblock Customer */}
                        <button
                          type="button"
                          disabled={actionLoadingId === c.id}
                          onClick={(e) => handleToggleBlock(c, e)}
                          title={isBlocked ? 'Unblock customer' : 'Block customer'}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '4px 8px',
                            borderRadius: '5px',
                            border: isBlocked ? '1px solid #bbf7d0' : '1px solid #fecaca',
                            background: isBlocked ? '#f0fdf4' : '#fff5f5',
                            color: isBlocked ? '#15803d' : '#b91c1c',
                            fontSize: '0.74rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isBlocked ? <UserCheck size={12} /> : <Ban size={12} />}
                          <span>{isBlocked ? 'Unblock' : 'Block'}</span>
                        </button>

                        {/* Delete Customer */}
                        <button
                          type="button"
                          disabled={actionLoadingId === c.id}
                          onClick={(e) => handleDeleteCustomer(c, e)}
                          title="Delete customer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4px 7px',
                            borderRadius: '5px',
                            border: '1px solid #fed7aa',
                            background: '#fffaf5',
                            color: '#c2410c',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    No customers found matching the search or filter criteria.
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
              maxWidth: '840px',
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: customerHistory.customer.is_blocked ? '#fee2e2' : '#468165',
                      color: customerHistory.customer.is_blocked ? '#b91c1c' : '#fff',
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {(customerHistory.customer.name || 'C').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                          {customerHistory.customer.name}
                        </h2>
                        <span style={{
                          padding: '2px 7px',
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          fontFamily: 'monospace',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          color: '#475569'
                        }}>
                          ID: #{customerHistory.customer.id}
                        </span>
                        {customerHistory.customer.is_blocked ? (
                          <span style={{ fontSize: '0.72rem', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                            Blocked
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.72rem', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                            Active
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '0.8rem', color: '#64748b' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={13} /> {customerHistory.customer.email}
                        </span>
                        <span>&bull;</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} /> Joined {new Date(customerHistory.customer.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Block/Unblock toggle in modal */}
                    <button
                      type="button"
                      disabled={actionLoadingId === customerHistory.customer.id}
                      onClick={(e) => handleToggleBlock(customerHistory.customer, e)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: customerHistory.customer.is_blocked ? '1px solid #bbf7d0' : '1px solid #fecaca',
                        background: customerHistory.customer.is_blocked ? '#f0fdf4' : '#fff5f5',
                        color: customerHistory.customer.is_blocked ? '#15803d' : '#b91c1c',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {customerHistory.customer.is_blocked ? <UserCheck size={14} /> : <Ban size={14} />}
                      <span>{customerHistory.customer.is_blocked ? 'Unblock Customer' : 'Block Customer'}</span>
                    </button>

                    {/* Delete Customer in modal */}
                    <button
                      type="button"
                      disabled={actionLoadingId === customerHistory.customer.id}
                      onClick={(e) => handleDeleteCustomer(customerHistory.customer, e)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #fed7aa',
                        background: '#fffaf5',
                        color: '#c2410c',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>

                    <button
                      onClick={() => setSelectedCustomerId(null)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
                      title="Close"
                    >
                      <XCircle size={22} />
                    </button>
                  </div>
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
                      ₹{customerHistory.stats.totalSpent.toFixed(2)}
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
                                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                    {new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{
                                    padding: '3px 9px',
                                    borderRadius: '12px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    background: statusStyle.bg,
                                    color: statusStyle.color,
                                    border: `1px solid ${statusStyle.border}`
                                  }}>
                                    {getStatusLabel(order.order_status)}
                                  </span>
                                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                                    ₹{parseFloat(order.total || 0).toFixed(2)}
                                  </span>
                                </div>
                              </div>

                              {/* Order Items */}
                              <div style={{ padding: '12px 16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {order.items && order.items.map(item => (
                                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {item.image && (
                                          <img
                                            src={item.image}
                                            alt={item.title}
                                            style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                                          />
                                        )}
                                        <div>
                                          <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#1e293b' }}>
                                            {item.title}
                                          </div>
                                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                            Qty: {item.quantity} &times; ₹{parseFloat(item.price || 0).toFixed(2)}
                                          </div>
                                        </div>
                                      </div>
                                      <div style={{ fontWeight: 600, fontSize: '0.84rem', color: '#0f172a' }}>
                                        ₹{(item.quantity * parseFloat(item.price || 0)).toFixed(2)}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {order.tracking_number && (
                                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #e2e8f0', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#475569' }}>
                                    <Package size={13} color="#468165" />
                                    <span>Tracking: <strong>{order.tracking_number}</strong> ({order.carrier || 'Standard'})</span>
                                  </div>
                                )}
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
                        No returns or refunds initiated by this customer.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {customerHistory.returns.map(order => {
                          const returnStyle = getStatusBadgeStyle(order.return_status || order.order_status);
                          return (
                            <div key={order.id} style={{ border: '1px solid #fed7aa', borderRadius: '8px', overflow: 'hidden', background: '#fffaf5' }}>
                              <div style={{ padding: '12px 16px', borderBottom: '1px solid #fed7aa', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                <div>
                                  <span style={{ fontWeight: 700, color: '#9a3412', fontSize: '0.9rem' }}>
                                    Return on Order #{order.id}
                                  </span>
                                  <span style={{ fontSize: '0.78rem', color: '#7c2d12', marginLeft: '8px' }}>
                                    {order.return_requested_at ? new Date(order.return_requested_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                                  </span>
                                </div>
                                <span style={{
                                  padding: '3px 9px',
                                  borderRadius: '12px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  background: returnStyle.bg,
                                  color: returnStyle.color,
                                  border: `1px solid ${returnStyle.border}`
                                }}>
                                  {getStatusLabel(order.return_status || order.order_status)}
                                </span>
                              </div>
                              <div style={{ padding: '12px 16px', fontSize: '0.84rem' }}>
                                {order.return_reason && (
                                  <div style={{ marginBottom: '8px' }}>
                                    <strong style={{ color: '#431407' }}>Reason: </strong>
                                    <span style={{ color: '#78350f' }}>{order.return_reason}</span>
                                  </div>
                                )}
                                {order.return_admin_notes && (
                                  <div style={{ background: '#fef3c7', padding: '8px 12px', borderRadius: '6px', fontSize: '0.78rem', color: '#92400e' }}>
                                    <strong>Admin Notes: </strong>{order.return_admin_notes}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: SAVED ADDRESSES */}
                {activeTab === 'addresses' && (
                  <div>
                    {customerHistory.addresses.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        No saved delivery addresses found for this customer.
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
                              <span>Phone: {addr.phone}</span>
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
