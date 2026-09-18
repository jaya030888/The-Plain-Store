import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { X, CheckCircle, MapPin, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const { cartItems, isCheckoutOpen, setIsCheckoutOpen, cartTotal, clearCart } = useCart();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Address, 2: Summary/Payment, 3: Success
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  
  const deliveryFee = 15.00;
  
  useEffect(() => {
    if (isCheckoutOpen && token) {
      fetchAddresses();
    }
  }, [isCheckoutOpen, token]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/addresses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
        const defaultAddr = data.find(a => a.is_default);
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
      const res = await fetch('http://localhost:5000/api/coupons/validate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
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

  const handlePayment = async () => {
    if (!selectedAddressId) return alert('Please select an address');

    const res = await loadRazorpayScript();
    if (!res) return alert('Razorpay SDK failed to load. Are you online?');

    try {
      // Create Razorpay Order via Backend
      const orderRes = await fetch('http://localhost:5000/api/orders/create-razorpay-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ amount: finalTotal })
      });
      
      const orderData = await orderRes.json();
      
      if (!orderRes.ok) throw new Error(orderData.message);

      const options = {
        key: import.meta.env?.VITE_RAZORPAY_KEY_ID || 'rzp_test_mocked_id',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'The Plain Store',
        description: 'Store Purchase',
        order_id: orderData.id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyRes = await fetch('http://localhost:5000/api/orders/verify-payment', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                addressId: selectedAddressId,
                couponId: appliedCoupon ? appliedCoupon.id : null,
                subtotal: cartTotal,
                deliveryFee: deliveryFee,
                discountAmount: getDiscountAmount(),
                total: finalTotal,
                items: cartItems
              })
            });

            if (verifyRes.ok) {
              setStep(3); // Success
              clearCart();
            } else {
              alert('Payment verification failed on the server.');
            }
          } catch (error) {
            console.error(error);
            alert('Error verifying payment.');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: '#468165'
        }
      };

      // Bypass Razorpay entirely as requested
      setTimeout(() => {
        options.handler({
          razorpay_order_id: orderData.id,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: 'mock_signature'
        });
      }, 1000);
      return;
    } catch (error) {
      console.error(error);
      alert('Error initiating checkout.');
    }
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
    setTimeout(() => {
      setStep(1);
      setAppliedCoupon(null);
      setCouponCode('');
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
            {addresses.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>You have no saved addresses.</p>
                <button className="btn-primary" onClick={() => { closeCheckout(); navigate('/profile'); }}>Add Address in Profile</button>
              </div>
            ) : (
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
                  onClick={() => setStep(2)}
                  style={{ marginTop: '15px' }}
                >
                  Continue to Order Summary
                </button>
              </div>
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
              <button className="btn-primary" onClick={handlePayment} style={{ flex: 2 }}>Pay Now</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="success-state" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <CheckCircle size={64} color="#468165" style={{ margin: '0 auto 20px' }} />
            <h3 style={{ marginBottom: '10px' }}>Payment Successful!</h3>
            <p style={{ color: '#666', marginBottom: '30px' }}>Your order has been confirmed.</p>
            <button className="btn-primary" onClick={() => { closeCheckout(); navigate('/orders'); }}>View My Orders</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
