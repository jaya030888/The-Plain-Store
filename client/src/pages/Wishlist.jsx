import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const { wishlistItems } = useWishlist();

  return (
    <div className="page-container" style={{paddingTop: '100px', minHeight: '80vh'}}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ marginBottom: '30px', textAlign: 'center', fontFamily: 'Dancing Script, cursive', color: '#468165', fontSize: '3rem' }}>My Wishlist</h1>
        
        {wishlistItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', background: '#f9f9f9', borderRadius: '8px' }}>
            <p style={{ marginBottom: '20px' }}>Your wishlist is empty.</p>
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
    </div>
  );
};

export default Wishlist;
