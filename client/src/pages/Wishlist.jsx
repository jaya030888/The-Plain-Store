import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const { wishlistItems } = useWishlist();

  return (
    <div className="page-container" style={{ minHeight: '80vh' }}>
      <h1 style={{ marginBottom: '30px', textAlign: 'center', fontFamily: 'Dancing Script, cursive', color: '#468165', fontSize: '3rem' }}>My Wishlist</h1>
      
      {wishlistItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '12px', border: '1px solid #E6DEC9' }}>
          <p style={{ marginBottom: '20px', color: '#666', fontSize: '1.05rem' }}>Your wishlist is empty.</p>
          <Link to="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Start Shopping</Link>
        </div>
      ) : (
        <div className="product-grid">
          {wishlistItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
