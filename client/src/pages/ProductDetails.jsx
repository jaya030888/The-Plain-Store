import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Heart, ShieldCheck, Truck, RefreshCw, CheckCircle2, AlertCircle, ExternalLink, Award, PackageCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { replaceWithFallbackImage } from '../utils/productImage';
import { API_URL } from '../utils/api';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, setIsCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          setSelectedImage(data.image);
        }
      } catch (error) {
        console.error('Failed to load product details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const isWished = product ? isInWishlist(product.id) : false;

  if (loading) {
    return (
      <div className="pd-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading curated product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pd-container" style={{ minHeight: '60vh', textAlign: 'center', padding: '4rem 2rem' }}>
        <h2>Product Not Found</h2>
        <p style={{ color: '#666', marginTop: '8px' }}>We couldn't find the product you're looking for.</p>
        <button 
          className="btn-primary" 
          style={{ marginTop: '20px' }}
          onClick={() => navigate('/')}
        >
          Back to Store
        </button>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login', { state: { from: location, message: 'Please log in to add items to your cart.' } });
      return;
    }
    const success = await addToCart(product);
    if (success) {
      setIsCartOpen(true);
    }
  };

  const handleToggleWishlist = () => {
    if (!user) {
      navigate('/login', { state: { from: location, message: 'Please log in to add items to your wishlist.' } });
      return;
    }
    toggleWishlist(product);
  };

  const galleryImages = (product.images && product.images.length > 0)
    ? product.images
    : (product.image ? [product.image] : []);

  const inStock = product.stock !== undefined && product.stock !== null ? Number(product.stock) > 0 : true;

  return (
    <div className="pd-container">
      <div className="pd-breadcrumbs" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#666', marginBottom: '1.5rem' }}>
        <Link to="/" style={{ color: '#666', textDecoration: 'none' }}>Home</Link>
        <span>/</span>
        <Link to="/" style={{ color: '#666', textDecoration: 'none' }}>{product.category || 'Products'}</Link>
        <span>/</span>
        <span style={{ color: '#222', fontWeight: 500 }}>{product.title}</span>
      </div>

      <button 
        className="pd-back-btn" 
        onClick={() => navigate('/')}
      >
        <ArrowLeft size={20} /> Back to Store
      </button>

      <div className="pd-grid">
        <div className="pd-image-wrapper">
          <img 
            src={selectedImage || product.image} 
            alt={product.title} 
            className="pd-image" 
            onError={(event) => replaceWithFallbackImage(event, product.id)} 
          />
          {galleryImages.length > 1 && (
            <div className="pd-thumbnails" style={{ display: 'flex', gap: '10px', marginTop: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  style={{
                    border: (selectedImage || product.image) === img ? '2px solid #468165' : '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '2px',
                    background: 'none',
                    cursor: 'pointer',
                    width: '64px',
                    height: '64px',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}
                  aria-label={`View thumbnail ${idx + 1}`}
                >
                  <img src={img} alt={`${product.title} view ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} onError={(e) => replaceWithFallbackImage(e, product.id)} />
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="pd-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase', color: '#468165', fontWeight: 600 }}>The Plain Store</span>
            {product.category && (
              <span style={{ fontSize: '0.75rem', background: '#F5F1E7', color: '#555', padding: '3px 8px', borderRadius: '12px', border: '1px solid #E6DEC9' }}>
                {product.category}
              </span>
            )}
            {product.badge && (
              <span style={{ fontSize: '0.72rem', background: '#e6f3ed', color: '#2b7a4b', padding: '3px 10px', borderRadius: '12px', fontWeight: 600, letterSpacing: '0.6px', border: '1px solid #c1e1cf', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Award size={12} /> {product.badge}
              </span>
            )}
            {product.isOnSale && (
              <span style={{ fontSize: '0.72rem', background: '#F5ECE6', color: '#8F422E', padding: '3px 10px', borderRadius: '12px', fontWeight: 600, letterSpacing: '0.6px', border: '1px solid #E5D5CB' }}>
                SALE
              </span>
            )}
          </div>

          <h1 className="pd-title">{product.title}</h1>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', margin: '0.75rem 0' }}>
            {product.isOnSale && product.discountPrice ? (
              <>
                <p className="pd-price" style={{ margin: 0, color: '#8F422E', fontWeight: '700' }}>
                  {product.discountPrice}
                </p>
                <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '1.1rem' }}>
                  {product.price}
                </span>
              </>
            ) : (
              <p className="pd-price" style={{ margin: 0 }}>{product.price}</p>
            )}
            <span style={{ fontSize: '0.8rem', color: '#666' }}>Inclusive of all taxes</span>
          </div>

          {/* Stock availability */}
          <div style={{ margin: '0.75rem 0 1.25rem 0' }}>
            {inStock ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2b7a4b', fontSize: '0.9rem', fontWeight: 500 }}>
                <CheckCircle2 size={16} /> In Stock &bull; Dispatched in 24-48 Hours
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#8F422E', fontSize: '0.9rem', fontWeight: 500 }}>
                <AlertCircle size={16} /> Currently Out of Stock
              </span>
            )}
          </div>
          
          <div className="pd-desc">
            <p>{product.description || 'Elevate your space with this piece, designed with minimalism, elegance, and everyday utility in mind.'}</p>
          </div>

          <div className="pd-actions">
            <button className="btn-primary pd-add-btn" onClick={handleAddToCart} disabled={!inStock}>
              <ShoppingBag size={22} /> {inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <button
              className={`btn-secondary pd-wishlist-btn ${isWished ? 'is-wishlisted' : ''}`}
              onClick={handleToggleWishlist}
            >
              <Heart size={22} fill={isWished ? '#8F422E' : 'none'} color={isWished ? '#8F422E' : 'currentColor'} /> {isWished ? 'In Wishlist' : 'Add to Wishlist'}
            </button>
          </div>

          {/* Amazon Marketplace Option */}
          <div className="pd-amazon-option" style={{ marginTop: '1.25rem', padding: '12px 16px', background: '#fbfaf7', borderRadius: '8px', border: '1px solid #e7e2d7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: '0.86rem', color: '#444' }}>
                Also available via Amazon India:
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <a
                  href={`https://www.amazon.in/s?k=${encodeURIComponent(product.title + ' The Plain Store')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.85rem',
                    color: '#2b5a44',
                    background: '#ffffff',
                    border: '1px solid #b8d4c5',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                >
                  View on Amazon India <ExternalLink size={13} />
                </a>
              </div>
            </div>
          </div>

          {/* Reassurance & Value Props (Return Policy & Open Box Delivery) */}
          <div style={{ marginTop: '2rem', borderTop: '1px solid #eaeaea', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: '#444' }}>
              <ShieldCheck size={18} color="#468165" />
              <span><strong>100% Genuine:</strong> Authentic design from The Plain Store</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: '#444' }}>
              <Truck size={18} color="#468165" />
              <span><strong>Pan-India Express:</strong> Tracked shipping with updates via SMS/Email</span>
            </div>

            {/* Return Policy Declaration */}
            {product.isReturnable === false || product.is_returnable === false ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.88rem', color: '#991b1b', background: '#fef2f2', padding: '10px 12px', borderRadius: '6px', border: '1px solid #fecaca' }}>
                <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Non-Returnable:</strong> This product is final sale and not eligible for return or refund.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: '#444' }}>
                <RefreshCw size={18} color="#468165" />
                <span><strong>{product.returnPolicyType || `${product.returnWindowDays || product.return_window_days || 7}-Day Returns`}:</strong> Hassle-free returns & replacements for damaged or incorrect items within {product.returnWindowDays || product.return_window_days || 7} days of delivery.</span>
              </div>
            )}

            {/* Open Box Delivery Feature */}
            {(product.isOpenBoxDelivery || product.is_open_box_delivery) && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.88rem', color: '#0369a1', background: '#f0f9ff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #bae6fd' }}>
                <PackageCheck size={18} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Open Box Delivery Available:</strong> Delivery agent will open the package at your doorstep so you can inspect the product before accepting delivery.</span>
              </div>
            )}
          </div>

          {/* Product Specifications & Details Table */}
          <div style={{ marginTop: '2rem', borderTop: '1px solid #eaeaea', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '1rem' }}>Product Specifications</h3>
            <table style={{ width: '100%', fontSize: '0.88rem', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px 0', color: '#666', width: '40%' }}>Brand</td>
                  <td style={{ padding: '8px 0', color: '#222', fontWeight: 500 }}>The Plain Store</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px 0', color: '#666' }}>Category</td>
                  <td style={{ padding: '8px 0', color: '#222' }}>{product.category || 'Home & Lifestyle'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px 0', color: '#666' }}>Return & Refund</td>
                  <td style={{ padding: '8px 0', color: product.isReturnable === false || product.is_returnable === false ? '#dc2626' : '#2b7a4b', fontWeight: 500 }}>
                    {product.isReturnable === false || product.is_returnable === false ? 'Non-Returnable (Final Sale)' : `${product.returnWindowDays || product.return_window_days || 7} Days Returnable`}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px 0', color: '#666' }}>Delivery Option</td>
                  <td style={{ padding: '8px 0', color: '#222', fontWeight: 500 }}>
                    {(product.isOpenBoxDelivery || product.is_open_box_delivery) ? 'Open Box Delivery Eligible' : 'Standard Secure Delivery'}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px 0', color: '#666' }}>Item Identifier / SKU</td>
                  <td style={{ padding: '8px 0', color: '#222' }}>TPS-{String(product.id).padStart(4, '0')}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px 0', color: '#666' }}>Country of Origin / Dispatch</td>
                  <td style={{ padding: '8px 0', color: '#222' }}>India</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', color: '#666' }}>Customer Care</td>
                  <td style={{ padding: '8px 0', color: '#222' }}>support@theplainstore.com</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
