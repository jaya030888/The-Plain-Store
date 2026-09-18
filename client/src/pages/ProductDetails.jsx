import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { replaceWithFallbackImage } from '../utils/productImage';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        }
      } catch (error) {
        console.error('Failed to fetch product', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const isWished = product ? isInWishlist(product.id) : false;

  if (loading) {
    return <div style={{ padding: '150px 20px', textAlign: 'center' }}>Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="product-details-container" style={{ padding: '150px 20px', textAlign: 'center' }}>
        <h2>Product Not Found</h2>
        <button className="btn-primary" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
          Return Home
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/product/${id}` } } });
      return;
    }
    addToCart(product);
    setIsCartOpen(true);
  };

  const handleToggleWishlist = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/product/${id}` } } });
      return;
    }
    toggleWishlist(product);
  };

  return (
    <div className="pd-container">
      <button 
        className="pd-back-btn" 
        onClick={() => navigate('/')}
      >
        <ArrowLeft size={20} /> Back to Store
      </button>

      <div className="pd-grid">
        <div className="pd-image-wrapper">
          <img src={product.image} alt={product.title} className="pd-image" onError={(event) => replaceWithFallbackImage(event, product.id)} />
        </div>
        
        <div className="pd-info">
          <h1 className="pd-title">{product.title}</h1>
          <p className="pd-price">{product.price}</p>
          
          <div className="pd-desc">
            <p>{product.description || 'Elevate your space with this beautiful piece, designed with minimalism and utility in mind.'}</p>
          </div>

          <div className="pd-actions">
            <button className="btn-primary pd-add-btn" onClick={handleAddToCart}>
              <ShoppingBag size={22} /> Add to Cart
            </button>
            <button
              className={`btn-secondary pd-wishlist-btn ${isWished ? 'is-wishlisted' : ''}`}
              onClick={handleToggleWishlist}
            >
              <Heart size={22} fill={isWished ? 'currentColor' : 'none'} /> {isWished ? 'In Wishlist' : 'Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
