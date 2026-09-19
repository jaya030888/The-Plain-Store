import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
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
  const isMergingRef = useRef(false);

  useEffect(() => {
    if (user && token) {
      mergeLocalCartThenFetch();
    } else {
      setCartItems(readLocalCart());
    }
  }, [user, token]);

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  });

  const fetchCart = async () => {
    try {
      const res = await fetch(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error('Failed to fetch cart');
      }
      const data = await res.json();
      setCartItems(data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  const mergeLocalCartThenFetch = async () => {
    if (isMergingRef.current) return;
    const localItems = readLocalCart();
    if (!localItems || localItems.length === 0) {
      await fetchCart();
      return;
    }

    isMergingRef.current = true;
    localStorage.removeItem(LOCAL_CART_KEY);
    try {
      for (const item of localItems) {
        await fetch(`${API_URL}/api/cart/add`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ productId: item.id, quantity: item.quantity || 1 })
        });
      }
      await fetchCart();
    } catch (error) {
      console.error('Failed to merge cart:', error);
      await fetchCart();
    } finally {
      isMergingRef.current = false;
    }
  };

  const addToCart = async (product, qty = 1) => {
    if (!token) {
      const current = readLocalCart();
      const existing = current.find((item) => item.id === product.id);
      const next = existing
        ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + qty } : item)
        : [...current, {
          id: product.id,
          title: product.title,
          price: product.discountPrice || product.price,
          rawPrice: product.rawPrice,
          quantity: qty,
          image: product.image,
          stock: product.stock
        }];
      writeLocalCart(next);
      setCartItems(next);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/cart/add`, {
        method: 'POST',
        headers: authHeaders(),
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
  };

  const updateQuantity = async (productId, quantity) => {
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
  };

  const clearCart = async () => {
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
