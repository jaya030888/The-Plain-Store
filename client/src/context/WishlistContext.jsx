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
  const [wishlistItems, setWishlistItems] = useState(readLocalWishlist);
  const { user, token } = useAuth();

  const fetchWishlist = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error('Failed to fetch wishlist');
      }
      const data = await res.json();
      setWishlistItems(data);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    }
  };

  const mergeLocalWishlistThenFetch = async () => {
    const localItems = readLocalWishlist();
    try {
      const res = await fetch(`${API_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error('Failed to fetch wishlist');
      }
      const serverItems = await res.json();
      const serverIds = new Set(serverItems.map((item) => item.id));

      for (const item of localItems) {
        if (!serverIds.has(item.id)) {
          await fetch(`${API_URL}/api/wishlist/toggle`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ productId: item.id })
          });
        }
      }
      localStorage.removeItem(LOCAL_WISHLIST_KEY);
      await fetchWishlist();
    } catch (error) {
      console.error('Failed to merge wishlist:', error);
      await fetchWishlist();
    }
  };

  useEffect(() => {
    if (user && token) {
      mergeLocalWishlistThenFetch();
    } else {
      setWishlistItems(readLocalWishlist());
    }
  }, [user, token]);

  const toggleWishlist = async (product) => {
    if (!token) {
      const exists = wishlistItems.find((item) => item.id === product.id);
      setWishlistItems((prev) => {
        const next = exists
          ? prev.filter((item) => item.id !== product.id)
          : [...prev, product];
        writeLocalWishlist(next);
        return next;
      });

      // If user is adding to wishlist (not removing), notify admin backend
      if (!exists) {
        fetch(`${API_URL}/api/wishlist/guest-notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id })
        }).catch((err) => console.warn('Guest wishlist notify failed:', err));
      }
      return;
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
        fetchWishlist();
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      fetchWishlist();
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
