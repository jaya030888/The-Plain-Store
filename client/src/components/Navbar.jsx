import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Menu, Search, X, ChevronDown, Heart, Truck, Package, User, LogIn, LogOut, Info, Mail, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from '../utils/api';

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Home Decor', slug: 'home-decor' },
  { id: 2, name: 'Organization', slug: 'organization' },
  { id: 3, name: 'Kitchen & Dining', slug: 'kitchen-dining' },
  { id: 4, name: 'Wellness & Living', slug: 'wellness' }
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const dropdownRef = useRef(null);
  const { setIsCartOpen, cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchNavCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/categories`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCategories(data);
          }
        }
      } catch {
        // Fallback already present in DEFAULT_CATEGORIES
      }
    };
    fetchNavCategories();
  }, []);

  // Close category dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalWishlist = wishlistItems.length;

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    navigate(query ? `/?search=${encodeURIComponent(query)}` : '/');
  };

  const handleCategorySelect = (slug) => {
    setIsCategoryDropdownOpen(false);
    setIsMobileMenuOpen(false);
    if (slug === 'all') {
      navigate('/');
    } else {
      navigate(`/?category=${encodeURIComponent(slug)}`);
    }
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Left: Brand Logo */}
          <div className="nav-brand-area">
            <Link to="/" className="nav-logo-link" aria-label="The Plain Store home">
              <div className="nav-logo">The Plain Store</div>
            </Link>
            
            {/* Desktop Navigation Links */}
            <div className="nav-desktop-links">
              <Link to="/" className={`nav-desktop-link ${location.pathname === '/' && !location.search ? 'active' : ''}`}>
                Shop
              </Link>
              
              {/* Categories Dropdown */}
              <div 
                className="nav-dropdown-wrapper" 
                ref={dropdownRef}
                onMouseEnter={() => setIsCategoryDropdownOpen(true)}
                onMouseLeave={() => setIsCategoryDropdownOpen(false)}
              >
                <button 
                  type="button"
                  className={`nav-desktop-link nav-dropdown-trigger ${location.search.includes('category=') ? 'active' : ''}`}
                  onClick={() => setIsCategoryDropdownOpen(prev => !prev)}
                  aria-expanded={isCategoryDropdownOpen}
                >
                  <span>Categories</span>
                  <ChevronDown size={13} style={{ transform: isCategoryDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                </button>

                {isCategoryDropdownOpen && (
                  <div className="nav-dropdown-menu">
                    <div className="nav-dropdown-header">Shop By Category</div>
                    <button 
                      type="button"
                      className="nav-dropdown-item"
                      onClick={() => handleCategorySelect('all')}
                    >
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button 
                        key={cat.id || cat.slug}
                        type="button"
                        className="nav-dropdown-item"
                        onClick={() => handleCategorySelect(cat.slug)}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link to="/about" className={`nav-desktop-link ${location.pathname === '/about' ? 'active' : ''}`}>
                About
              </Link>
              <Link to="/contact" className={`nav-desktop-link ${location.pathname === '/contact' ? 'active' : ''}`}>
                Contact
              </Link>
            </div>
          </div>
          
          {/* Center/Right: Sleek Search Bar */}
          <form className="nav-search-container" onSubmit={handleSearch}>
            <input
              type="search"
              className="search-input"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search essentials..."
              aria-label="Search products"
            />
            <button className="search-btn" aria-label="Search" type="submit">
              <Search size={16} />
            </button>
          </form>

          {/* Right: Actions */}
          <div className="nav-actions">
            {user ? (
              <Link to="/profile" className="nav-desktop-link nav-user-link">
                Account
              </Link>
            ) : (
              <Link to="/login" state={{ from: location }} className="nav-desktop-link nav-user-link">
                Login
              </Link>
            )}

            {/* Wishlist Link */}
            <Link to="/wishlist" className="nav-icon-link" aria-label="Wishlist" title="Wishlist">
              <Heart size={20} />
              {totalWishlist > 0 && <span className="cart-badge">{totalWishlist}</span>}
            </Link>

            {/* Cart Button */}
            <button
              className="cart-icon-container nav-icon-link"
              onClick={() => setIsCartOpen(true)}
              aria-label={totalItems > 0 ? `Open cart, ${totalItems} items` : 'Open cart'}
              title="Shopping Cart"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </button>

            {/* Hamburger Toggle (Always visible on desktop & mobile) */}
            <button 
              className="nav-menu-btn nav-icon-link" 
              onClick={() => setIsMobileMenuOpen(true)} 
              aria-label="Open navigation menu"
              title="Menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Menu Overlay & Drawer */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={() => setIsMobileMenuOpen(false)} 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            backgroundColor: 'rgba(0,0,0,0.4)', 
            backdropFilter: 'blur(2px)', 
            zIndex: 1000, 
            display: 'flex', 
            justifyContent: 'flex-end' 
          }}
        >
          <div 
            className="mobile-menu" 
            data-lenis-prevent="true"
            onClick={e => e.stopPropagation()}
            style={{
              width: '320px',
              maxWidth: '85vw',
              height: '100%',
              maxHeight: '100vh',
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#fff',
              padding: '24px 20px 60px 24px',
              boxShadow: '-8px 0 30px rgba(0,0,0,0.12)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f0eee6' }}>
              <span className="logo" style={{ fontSize: '1.4rem', margin: 0, color: 'var(--color-primary)', fontFamily: 'var(--font-logo)' }}>The Plain Store</span>
              <button 
                className="icon-btn" 
                onClick={() => setIsMobileMenuOpen(false)} 
                aria-label="Close menu"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: '4px' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Navigation List */}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '1.02rem' }}>

              <li>
                <Link 
                  to="/" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', textDecoration: 'none', color: '#333', transition: 'background 0.2s ease' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f7f5ef'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <ShoppingBag size={19} color="#468165" />
                  <span>Shop All</span>
                </Link>
              </li>

              <li>
                <Link 
                  to="/track" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', textDecoration: 'none', color: '#333', transition: 'background 0.2s ease' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f7f5ef'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Truck size={19} color="#468165" />
                  <span>Track Order</span>
                </Link>
              </li>

              <li>
                <Link 
                  to="/orders" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', textDecoration: 'none', color: '#333', transition: 'background 0.2s ease' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f7f5ef'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Package size={19} color="#468165" />
                  <span>My Orders</span>
                </Link>
              </li>

              <li>
                <Link 
                  to="/wishlist" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', textDecoration: 'none', color: '#333', transition: 'background 0.2s ease' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f7f5ef'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Heart size={19} color="#468165" />
                    <span>Wishlist</span>
                  </div>
                  {totalWishlist > 0 && (
                    <span style={{ background: '#468165', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                      {totalWishlist}
                    </span>
                  )}
                </Link>
              </li>

              {/* Categories Sub-section */}
              <li style={{ borderTop: '1px solid #f0eee6', borderBottom: '1px solid #f0eee6', padding: '12px 6px', margin: '6px 0' }}>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#7b8882', fontWeight: 600, marginBottom: '8px' }}>
                  Categories
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {categories.map(c => (
                    <button
                      key={c.id || c.slug}
                      type="button"
                      onClick={() => handleCategorySelect(c.slug)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        textAlign: 'left', 
                        cursor: 'pointer', 
                        color: '#555', 
                        padding: '6px 10px', 
                        borderRadius: '6px',
                        fontSize: '0.92rem', 
                        fontFamily: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f7f5ef'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#468165' }}></span>
                      {c.name}
                    </button>
                  ))}
                </div>
              </li>

              <li>
                <Link 
                  to="/about" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', textDecoration: 'none', color: '#333', transition: 'background 0.2s ease' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f7f5ef'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Info size={19} color="#468165" />
                  <span>About Us</span>
                </Link>
              </li>

              <li>
                <Link 
                  to="/contact" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', textDecoration: 'none', color: '#333', transition: 'background 0.2s ease' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f7f5ef'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Mail size={19} color="#468165" />
                  <span>Contact Us</span>
                </Link>
              </li>

              {/* Account Section */}
              <li style={{ borderTop: '1px solid #f0eee6', paddingTop: '12px', marginTop: '6px' }}>
                {user ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <Link 
                      to="/profile" 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', textDecoration: 'none', color: '#333' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f7f5ef'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <User size={19} color="#468165" />
                      <span>Account ({user.name || 'Profile'})</span>
                    </Link>
                    <button 
                      onClick={() => { logout(); setIsMobileMenuOpen(false); }} 
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', background: 'none', border: 'none', color: '#e03a3a', fontSize: '1rem', fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fee2e2'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <LogOut size={19} color="#e03a3a" />
                      <span>Log Out</span>
                    </button>
                  </div>
                ) : (
                  <Link 
                    to="/login" 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', textDecoration: 'none', color: 'var(--color-primary)', fontWeight: 600 }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f7f5ef'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogIn size={19} color="#468165" />
                    <span>Log In / Sign Up</span>
                  </Link>
                )}
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
