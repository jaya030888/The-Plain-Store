import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [user, token]);

  const fetchWishlist = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWishlistItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    }
  };

  const toggleWishlist = async (product) => {
    if (!token) return;
    
    // Optimistic update
    const exists = wishlistItems.find(item => item.id === product.id);
    if (exists) {
      setWishlistItems(prev => prev.filter(item => item.id !== product.id));
    } else {
      setWishlistItems(prev => [...prev, product]);
    }

    try {
      const res = await fetch('http://localhost:5000/api/wishlist/toggle', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ productId: product.id })
      });
      if (!res.ok) {
        // Revert on failure
        fetchWishlist();
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      fetchWishlist();
    }
  };

  const removeFromWishlist = async (productId) => {
    // We can just use toggleWishlist since it toggles it off
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/wishlist/toggle', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ productId })
      });
      if (res.ok) {
        fetchWishlist();
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
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
