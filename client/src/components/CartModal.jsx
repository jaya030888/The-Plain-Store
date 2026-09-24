import React from 'react';
import { useCart } from '../context/CartContext';
import { X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { replaceWithFallbackImage } from '../utils/productImage';

const CartModal = () => {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, clearCart, cartTotal, setIsCheckoutOpen } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleItemClick = (id) => {
    setIsCartOpen(false);
    navigate(`/product/${id}`);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsCartOpen(false)}>
      <div className="cart-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Your Cart</h2>
          <button className="close-btn" onClick={() => setIsCartOpen(false)}><X size={24} /></button>
        </div>
        
        <div className="cart-items">
          {cartItems.length === 0 ? (
            <p className="empty-cart">Your cart is empty.</p>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="cart-item" onClick={() => handleItemClick(item.id)} style={{ cursor: 'pointer' }}>
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="cart-item-img" 
                  onError={(e) => replaceWithFallbackImage(e, item.id)}
                />
                <div className="cart-item-details" style={{ flex: 1, padding: '0 15px' }}>
                  <h4 style={{ margin: '0 0 5px 0' }}>{item.title}</h4>
                  <p style={{ margin: '0 0 10px 0', color: '#666' }}>{item.price}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{ width: '24px', height: '24px', border: '1px solid #ddd', background: '#fff', borderRadius: '4px', cursor: 'pointer' }}
                    >-</button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{ width: '24px', height: '24px', border: '1px solid #ddd', background: '#fff', borderRadius: '4px', cursor: 'pointer' }}
                    >+</button>
                  </div>
                </div>
                <button 
                  className="remove-btn" 
                  onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }}
                  style={{ background: 'none', border: 'none', color: '#e03a3a', cursor: 'pointer' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <button 
                onClick={clearCart} 
                style={{ background: 'none', border: 'none', color: '#666', textDecoration: 'underline', cursor: 'pointer' }}
              >
                Clear Cart
              </button>
              <div className="cart-total" style={{ fontWeight: 'bold' }}>
                <span>Total: </span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
            </div>
            <button className="btn-primary checkout-btn" onClick={handleCheckout}>Proceed to Checkout</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
