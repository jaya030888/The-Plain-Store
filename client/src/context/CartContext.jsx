import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [user, token]);

  const fetchCart = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCartItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  const addToCart = async (product, qty = 1) => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ productId: product.id, quantity: qty })
      });
      if (res.ok) {
        fetchCart();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (productId) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchCart();
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/cart/update', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ productId, quantity })
      });
      if (res.ok) {
        fetchCart();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating cart quantity:', error);
    }
  };

  const clearCart = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/cart/clear', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const cartTotal = cartItems.reduce((total, item) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price.replace('$', '')) : item.rawPrice;
    return total + (price * item.quantity);
  }, 0);

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      isCartOpen,
      setIsCartOpen,
      isCheckoutOpen,
      setIsCheckoutOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};
