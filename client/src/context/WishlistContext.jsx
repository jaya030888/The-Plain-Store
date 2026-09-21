import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from '../utils/api';

const WishlistContext = createContext();
const LOCAL_WISHLIST_KEY = 'plainstore_wishlist';

export const useWishlist = () => useContext(WishlistContext);

const readLocalWishlist = () => {
  try {
    const stored = localStorage.getItem(LOCAL_WISHLIST_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const writeLocalWishlist = (items) => {
  localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(items));
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const { user, token } = useAuth();

  const fetchWishlist = async () => {
    if (!token || !user) {
      setWishlistItems([]);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error('Failed to fetch wishlist');
      }
      const data = await res.json();
      setWishlistItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [user, token]);

  const toggleWishlist = async (product) => {
    if (!user || !token) {
      return false;
    }

    const exists = wishlistItems.find((item) => item.id === product.id);
    if (exists) {
      setWishlistItems((prev) => prev.filter((item) => item.id !== product.id));
    } else {
      setWishlistItems((prev) => [...prev, product]);
    }

    try {
      const res = await fetch(`${API_URL}/api/wishlist/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId: product.id })
      });
      if (!res.ok) {
        await fetchWishlist();
      }
      return true;
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      await fetchWishlist();
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    const product = wishlistItems.find((item) => item.id === productId);
    if (product) {
      await toggleWishlist(product);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
