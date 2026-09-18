import React, { useEffect, useRef } from 'react';
import { ShoppingBag, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { useNavigate } from 'react-router-dom';
import { replaceWithFallbackImage } from '../utils/productImage';

gsap.registerPlugin(ScrollTrigger);

const ProductCard = ({ product }) => {
  const { addToCart, setIsCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const cardRef = useRef(null);
  const imageRef = useRef(null);
  const navigate = useNavigate();

  const isWished = isInWishlist(product.id);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Subtle parallax on the product image while scrolling
      gsap.to(imageRef.current, {
        y: '15%',
        ease: 'none',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      });
    }, cardRef);

    return () => ctx.revert();
  }, []);

  const handleAddToCart = (e) => {
    e.stopPropagation();
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
    <div className="product-card" ref={cardRef} onClick={handleCardClick} style={{ cursor: 'pointer', position: 'relative' }}>
      <div className="product-image-wrapper">
        <button 
          onClick={handleToggleWishlist}
          className={`product-wishlist-button ${isWished ? 'is-wishlisted' : ''}`}
          aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={20} fill={isWished ? '#e03a3a' : 'none'} />
        </button>
        <img 
          ref={imageRef}
          src={product.image} 
          alt={product.title} 
          className="product-image" 
          onError={(event) => replaceWithFallbackImage(event, product.id)}
          style={{ height: '115%', top: '-7.5%' }}
        />
      </div>
      <div className="product-info">
        <h3 className="product-title">{product.title}</h3>
        <p className="product-price">{product.price}</p>
        <button className="btn-add-to-cart" onClick={handleAddToCart}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <ShoppingBag size={18} /> Add to Cart
          </span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
