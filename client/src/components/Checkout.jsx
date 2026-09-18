import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { X, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../utils/api';

const Checkout = () => {
  const { cartItems, isCheckoutOpen, setIsCheckoutOpen, cartTotal, clearCart } = useCart();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [guestAddress, setGuestAddress] = useState({
    full_name: '', phone: '', house_flat: '', street: '', area: '', city: '', state: '', pincode: ''
  });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);

  const deliveryFee = 15.00;

  useEffect(() => {
    if (isCheckoutOpen && token) {
      fetchAddresses();
    }
  }, [isCheckoutOpen, token]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch(`${API_URL}/api/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
        const defaultAddr = data.find((a) => a.is_default);
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
        else if (data.length > 0) setSelectedAddressId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching addresses', error);
    }
  };

  const applyCoupon = async () => {
    setCouponError('');
    if (!couponCode) return;
    try {
      const res = await fetch(`${API_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ code: couponCode })
      });
      const data = await res.json();
      if (res.ok) {
        if (cartTotal < data.min_order_amount) {
          setCouponError(`Minimum order amount is $${data.min_order_amount}`);
        } else {
          setAppliedCoupon(data);
        }
      } else {
        setCouponError(data.message || 'Invalid coupon');
      }
    } catch (error) {
      setCouponError('Failed to validate coupon');
    }
  };

  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discount_type === 'percentage') {
      return (cartTotal * (appliedCoupon.discount_value / 100));
    }
    return parseFloat(appliedCoupon.discount_value);
  };

  const finalTotal = cartTotal + deliveryFee - getDiscountAmount();

  const guestAddressComplete = Object.values(guestAddress).every((value) => String(value).trim());

  const continueFromAddress = () => {
    if (token) {
      if (!selectedAddressId) return alert('Please select an address');
      setStep(2);
      return;
    }
    if (!guestAddressComplete) return alert('Please complete your shipping address');
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    if (token && !selectedAddressId) return alert('Please select an address');
    if (!token && !guestAddressComplete) return alert('Please complete your shipping address');

    setPlacingOrder(true);
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          addressId: token ? selectedAddressId : null,
          address: token ? undefined : guestAddress,
          couponId: appliedCoupon ? appliedCoupon.id : null,
          items: cartItems.map((item) => ({ productId: item.id, quantity: item.quantity }))
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to place order');
      }
      setCreatedOrderId(data.id);
      await clearCart();
      setStep(3);
    } catch (error) {
      console.error(error);
      alert(error.message || 'Error placing order.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
    setTimeout(() => {
      setStep(1);
      setAppliedCoupon(null);
      setCouponCode('');
      setCreatedOrderId(null);
    }, 500);
  };

  if (!isCheckoutOpen) return null;

  return (
    <div className="modal-overlay" onClick={closeCheckout}>
      <div className="checkout-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2>Checkout</h2>
          <button className="close-btn" onClick={closeCheckout}><X size={24} /></button>
        </div>

        {step === 1 && (
          <div className="checkout-step">
            <h3>Select Shipping Address</h3>
            {token && addresses.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>You have no saved addresses.</p>
                <button className="btn-primary" onClick={() => { closeCheckout(); navigate('/profile'); }}>Add Address in Profile</button>
              </div>
            ) : token ? (
              <div className="address-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                {addresses.map(addr => (
                  <label key={addr.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', border: '1px solid #ddd', padding: '15px', borderRadius: '8px', cursor: 'pointer', background: selectedAddressId === addr.id ? '#f5f1e7' : '#fff' }}>
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      style={{ marginTop: '5px' }}
                    />
                    <div>
                      <strong>{addr.full_name}</strong>
                      <p style={{ margin: '5px 0', fontSize: '14px', color: '#555' }}>
                        {addr.house_flat}, {addr.street}, {addr.area}<br/>
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>Phone: {addr.phone}</p>
                    </div>
                  </label>
                ))}
                <button
                  className="btn-primary"
                  disabled={!selectedAddressId}
                  onClick={continueFromAddress}
                  style={{ marginTop: '15px' }}
                >
                  Continue to Order Summary
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); continueFromAddress(); }} style={{ display: 'grid', gap: '12px', marginTop: '15px' }}>
                <input className="auth-input" placeholder="Full Name" value={guestAddress.full_name} onChange={(e) => setGuestAddress({ ...guestAddress, full_name: e.target.value })} required />
                <input className="auth-input" placeholder="Phone" value={guestAddress.phone} onChange={(e) => setGuestAddress({ ...guestAddress, phone: e.target.value })} required />
                <input className="auth-input" placeholder="House / Flat" value={guestAddress.house_flat} onChange={(e) => setGuestAddress({ ...guestAddress, house_flat: e.target.value })} required />
                <input className="auth-input" placeholder="Street" value={guestAddress.street} onChange={(e) => setGuestAddress({ ...guestAddress, street: e.target.value })} required />
                <input className="auth-input" placeholder="Area" value={guestAddress.area} onChange={(e) => setGuestAddress({ ...guestAddress, area: e.target.value })} required />
                <input className="auth-input" placeholder="City" value={guestAddress.city} onChange={(e) => setGuestAddress({ ...guestAddress, city: e.target.value })} required />
                <input className="auth-input" placeholder="State" value={guestAddress.state} onChange={(e) => setGuestAddress({ ...guestAddress, state: e.target.value })} required />
                <input className="auth-input" placeholder="Pincode" value={guestAddress.pincode} onChange={(e) => setGuestAddress({ ...guestAddress, pincode: e.target.value })} required />
                <button className="btn-primary" type="submit">Continue to Order Summary</button>
              </form>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="checkout-step">
            <h3>Order Summary</h3>
            <div className="summary-items" style={{ margin: '15px 0', borderBottom: '1px solid #ddd', paddingBottom: '15px' }}>
              {cartItems.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span>{item.title} (x{item.quantity})</span>
                  <span>${(item.rawPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input
                className="auth-input"
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                style={{ flex: 1 }}
              />
              <button className="btn-outline" type="button" onClick={applyCoupon}>Apply</button>
            </div>
            {couponError && <p style={{ color: '#e03a3a', marginTop: 0 }}>{couponError}</p>}

            <div className="totals" style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery Fee:</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#468165' }}>
                  <span>Discount ({appliedCoupon.code}):</span>
                  <span>-${getDiscountAmount().toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '20px', marginTop: '10px', paddingTop: '10px', borderTop: '2px solid #ddd' }}>
                <span>Total:</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
              <button className="btn-outline" onClick={() => setStep(1)} style={{ flex: 1 }}>Back</button>
              <button className="btn-primary" onClick={handlePlaceOrder} disabled={placingOrder} style={{ flex: 2 }}>
                {placingOrder ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="success-state" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <CheckCircle size={64} color="#468165" style={{ margin: '0 auto 20px' }} />
            <h3 style={{ marginBottom: '10px' }}>Order Placed</h3>
            <p style={{ color: '#666', marginBottom: '30px' }}>
              {createdOrderId ? `Order #${createdOrderId} has been confirmed.` : 'Your order has been confirmed.'}
            </p>
            <button className="btn-primary" onClick={() => { closeCheckout(); if (user) navigate('/orders'); }}>
              {user ? 'View My Orders' : 'Continue Shopping'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
