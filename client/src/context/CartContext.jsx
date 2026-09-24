import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from '../utils/api';

const CartContext = createContext();
const LOCAL_CART_KEY = 'plainstore_cart';

export const useCart = () => useContext(CartContext);

const readLocalCart = () => {
  try {
    const stored = localStorage.getItem(LOCAL_CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const writeLocalCart = (items) => {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { user, token } = useAuth();

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }), [token]);

  const fetchCart = useCallback(async () => {
    if (!token || !user) {
      setCartItems([]);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error('Failed to fetch cart');
      }
      const data = await res.json();
      setCartItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  }, [token, user]);

  useEffect(() => {
    if (user && token) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [user, token, fetchCart]);

  const addToCart = useCallback(async (product, qty = 1) => {
    if (!user || !token) {
      return false;
    }

    if (product.stock !== undefined && product.stock !== null && Number(product.stock) <= 0) {
      alert('This product is currently out of stock.');
      return false;
    }

    try {
      const res = await fetch(`${API_URL}/api/cart/add`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ productId: product.id, quantity: qty })
      });
      if (res.ok) {
        await fetchCart();
        return true;
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to add to cart');
        return false;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  }, [user, token, authHeaders, fetchCart]);

  const removeFromCart = useCallback(async (productId) => {
    if (!token) {
      const current = readLocalCart();
      const next = current.filter((item) => item.id !== productId);
      writeLocalCart(next);
      setCartItems(next);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchCart();
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  }, [token, fetchCart]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    if (!token) {
      const current = readLocalCart();
      const next = quantity <= 0
        ? current.filter((item) => item.id !== productId)
        : current.map((item) => item.id === productId ? { ...item, quantity } : item);
      writeLocalCart(next);
      setCartItems(next);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/cart/update`, {
        method: 'PUT',
        headers: authHeaders(),
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
  }, [token, authHeaders, fetchCart]);

  const clearCart = useCallback(async () => {
    if (!token) {
      writeLocalCart([]);
      setCartItems([]);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/cart/clear`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }, [token]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.]/g, '')) : (item.rawPrice || 0);
      return total + (price * item.quantity);
    }, 0);
  }, [cartItems]);

  const cartCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const contextValue = useMemo(() => ({
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
  }), [cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, isCartOpen, isCheckoutOpen]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};
