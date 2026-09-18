import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import { Package, Search, ChevronDown, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';

const OrdersManager = () => {
  const { adminToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [adminToken]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/orders/admin', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/admin/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        setSelectedOrder(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/admin/${id}/status`, {
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
        }
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toString().includes(search) || order.customer_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return '#468165';
      case 'cancelled': return '#e03a3a';
      default: return '#f39c12';
    }
  };

  return (
    <AdminLayout title="Orders Management">
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <input 
            type="text" 
            placeholder="Search by Order ID or Customer Name" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: '#888' }} />
        </div>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '150px' }}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
            ) : filteredOrders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.customer_name}<br/><small style={{ color: '#666' }}>{order.customer_email}</small></td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td>${parseFloat(order.total).toFixed(2)}</td>
                <td><span style={{ color: order.payment_status === 'paid' ? '#468165' : '#f39c12', fontWeight: 'bold' }}>{order.payment_status.toUpperCase()}</span></td>
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
                  <button className="btn-outline" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => fetchOrderDetails(order.id)}>View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="checkout-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Order #{selectedOrder.id}</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setSelectedOrder(null)}><XCircle size={24} /></button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                <h4>Customer Information</h4>
                <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
                <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                <p><strong>Phone:</strong> {selectedOrder.phone}</p>
              </div>
              <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                <h4>Shipping Address</h4>
                <p>{selectedOrder.full_name}</p>
                <p>{selectedOrder.house_flat}, {selectedOrder.street}</p>
                <p>{selectedOrder.area}, {selectedOrder.city}</p>
                <p>{selectedOrder.state} - {selectedOrder.pincode}</p>
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

            <div style={{ background: '#f5f1e7', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
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
