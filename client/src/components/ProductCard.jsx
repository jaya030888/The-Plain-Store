import React from 'react';
import { ShoppingBag, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useNavigate } from 'react-router-dom';
import { replaceWithFallbackImage } from '../utils/productImage';

const ProductCard = ({ product }) => {
  const { addToCart, setIsCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  const isWished = isInWishlist(product.id);

  const isOutOfStock = product.stock !== undefined && product.stock !== null && Number(product.stock) <= 0;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product);
    setIsCartOpen(true);
  };

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className={`product-card ${isOutOfStock ? 'is-out-of-stock' : ''}`} onClick={handleCardClick} style={{ cursor: 'pointer', position: 'relative' }}>
      <div className="product-image-wrapper">
        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 3 }}>
          {isOutOfStock ? (
            <div
              style={{
                backgroundColor: '#2A2A2A',
                color: '#F5F1E7',
                fontSize: '0.7rem',
                fontWeight: '600',
                letterSpacing: '0.8px',
                padding: '4px 10px',
                borderRadius: '20px',
                textTransform: 'uppercase',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
              }}
            >
              <span>OUT OF STOCK</span>
            </div>
          ) : (
            <>
              {product.isOnSale && (
                <div
                  style={{
                    backgroundColor: '#8F422E',
                    color: '#FFFFFF',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    letterSpacing: '0.8px',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    textTransform: 'uppercase',
                    boxShadow: '0 2px 6px rgba(143, 66, 46, 0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    width: 'fit-content'
                  }}
                >
                  <span>SALE</span>
                </div>
              )}
              {product.badge && (
                <div
                  style={{
                    backgroundColor: '#468165',
                    color: '#FFFFFF',
                    fontSize: '0.68rem',
                    fontWeight: '600',
                    letterSpacing: '0.6px',
                    padding: '3px 9px',
                    borderRadius: '20px',
                    textTransform: 'uppercase',
                    boxShadow: '0 2px 6px rgba(70, 129, 101, 0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    width: 'fit-content'
                  }}
                >
                  <span>{product.badge}</span>
                </div>
              )}
            </>
          )}
        </div>
        <button 
          onClick={handleToggleWishlist}
          className={`product-wishlist-button ${isWished ? 'is-wishlisted' : ''}`}
          aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={18} fill={isWished ? '#8F422E' : 'none'} color={isWished ? '#8F422E' : '#222222'} />
        </button>
        <img 
          src={product.image} 
          alt={product.title} 
          className="product-image" 
          onError={(event) => replaceWithFallbackImage(event, product.id)}
          style={{ 
            filter: isOutOfStock ? 'grayscale(35%) opacity(0.88)' : 'none'
          }}
        />
      </div>
      <div className="product-info">
        <h3 className="product-title">{product.title}</h3>
        {product.isOnSale && product.discountPrice ? (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
            <span className="product-price" style={{ color: '#8F422E', fontWeight: '700', margin: 0 }}>
              {product.discountPrice}
            </span>
            <span style={{ fontSize: '0.88rem', color: '#94a3b8', textDecoration: 'line-through' }}>
              {product.price}
            </span>
          </div>
        ) : (
          <p className="product-price" style={{ marginBottom: '8px' }}>{product.price}</p>
        )}
        
        {/* Micro-policy indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '14px', fontSize: '0.72rem' }}>
          {product.isReturnable === false || product.is_returnable === false ? (
            <span style={{ color: '#b91c1c', backgroundColor: '#fef2f2', padding: '2px 7px', borderRadius: '4px', fontWeight: '600' }}>
              Non-Returnable
            </span>
          ) : (
            <span style={{ color: '#2b7a4b', backgroundColor: '#f0fdf4', padding: '2px 7px', borderRadius: '4px', fontWeight: '500' }}>
              {product.returnWindowDays || product.return_window_days || 7}-Day Returns
            </span>
          )}
          {(product.isOpenBoxDelivery || product.is_open_box_delivery) && (
            <span style={{ color: '#0369a1', backgroundColor: '#f0f9ff', padding: '2px 7px', borderRadius: '4px', fontWeight: '500' }}>
              Open Box Delivery
            </span>
          )}
        </div>
        
        {isOutOfStock ? (
          <button 
            type="button" 
            className="btn-add-to-cart" 
            disabled 
            style={{ 
              backgroundColor: '#EDE8DE', 
              color: '#8A857C', 
              border: '1px solid #DDD6C8', 
              cursor: 'not-allowed', 
              boxShadow: 'none' 
            }}
          >
            Out of Stock
          </button>
        ) : (
          <button className="btn-add-to-cart" onClick={handleAddToCart}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <ShoppingBag size={18} /> Add to Cart
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
