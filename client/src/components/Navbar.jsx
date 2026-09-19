import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Menu, Search, X, MapPin, Globe, Truck, ChevronDown, Layers } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
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
      } catch (err) {
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

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

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
      <nav className={`navbar ${scrolled ? 'glass' : ''}`}>
        
        <div className="nav-brand-area">
          <Link to="/" className="nav-logo-link" aria-label="The Plain Store home">
            <div className="nav-logo">The Plain Store</div>
          </Link>
          <div className="nav-desktop-links">
            <Link to="/" className={`nav-desktop-link ${location.pathname === '/' && !location.search ? 'active' : ''}`}>Shop</Link>
            
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
                <ChevronDown size={14} style={{ transform: isCategoryDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
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

            <Link to="/articles" className={`nav-desktop-link ${location.pathname.startsWith('/articles') ? 'active' : ''}`}>Articles</Link>
            <Link to="/about" className={`nav-desktop-link ${location.pathname === '/about' ? 'active' : ''}`}>About</Link>
            <Link to="/contact" className={`nav-desktop-link ${location.pathname === '/contact' ? 'active' : ''}`}>Contact</Link>
            <Link to="/track" className={`nav-desktop-link ${location.pathname === '/track' ? 'active' : ''}`}>Track Order</Link>
          </div>
        </div>
        
        <form className="nav-search-container" onSubmit={handleSearch}>
            <input
              type="search"
              className="search-input"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search The Plain Store..."
              aria-label="Search products"
            />
            <button className="search-btn" aria-label="Search">
              <Search size={20} color="white" />
            </button>
        </form>

        <div className="nav-actions">
          {user && (
            <div className="nav-user-location" style={{ textAlign: 'right', alignItems: 'flex-end', paddingRight: '10px' }} onClick={() => navigate('/profile')}>
              <span className="nav-greeting">Hello, {user.name}</span>
              <div className="nav-address">
                <MapPin size={16} />
                <span>Deliver to New York 10001</span>
              </div>
            </div>
          )}
          
          <Link to="/track" className="nav-track-link" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#444', textDecoration: 'none', padding: '6px 10px', borderRadius: '4px', background: 'rgba(0,0,0,0.03)' }} title="Track Order">
            <Truck size={16} color="#468165" />
            <span className="track-text">Track</span>
          </Link>

          {!user && (
            <div className="nav-login-link">
              <Link to="/login" state={{ from: location }}>Login</Link>
            </div>
          )}

          <button
            className="cart-icon-container icon-btn"
            onClick={() => setIsCartOpen(true)}
            aria-label={totalItems > 0 ? `Open cart, ${totalItems} items` : 'Open cart'}
          >
            <ShoppingCart size={24} />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>
          <button className="icon-btn" onClick={() => setIsMobileMenuOpen(true)} aria-label="Open menu">
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
          <div className="mobile-menu" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <h2 className="logo" style={{ fontSize: '1.5rem', margin: 0 }}>Menu</h2>
              <button className="icon-btn" onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '1.2rem', fontFamily: 'var(--font-body)' }}>

              <li><Link to="/" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--color-text)' }}>Shop All</Link></li>
              
              <li style={{ borderTop: '1px solid #f0eee6', borderBottom: '1px solid #f0eee6', padding: '12px 0' }}>
                <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#468165', fontWeight: 600, marginBottom: '10px' }}>
                  Categories
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '8px', fontSize: '1rem' }}>
                  {categories.map(c => (
                    <button
                      key={c.id || c.slug}
                      type="button"
                      onClick={() => handleCategorySelect(c.slug)}
                      style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#555', padding: '2px 0', fontSize: '1rem', fontFamily: 'inherit' }}
                    >
                      &bull; {c.name}
                    </button>
                  ))}
                </div>
              </li>

              <li><Link to="/articles" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--color-text)' }}>Guides & Articles</Link></li>
              <li><Link to="/about" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--color-text)' }}>About Us</Link></li>
              <li><Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--color-text)' }}>Contact Us</Link></li>
              <li><Link to="/track" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '8px' }}><Truck size={20} color="#468165" /> Track Order</Link></li>
              
              {user ? (
                <>
                  <li style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '10px' }}><Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--color-text)' }}>My Profile</Link></li>
                  <li><Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--color-text)' }}>My Orders</Link></li>
                  <li><Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--color-text)' }}>Wishlist</Link></li>
                  <li><button onClick={() => { logout(); setIsMobileMenuOpen(false); }} style={{ background: 'none', border: 'none', color: '#e03a3a', fontSize: '1.2rem', fontFamily: 'inherit', padding: 0, cursor: 'pointer', textAlign: 'left' }}>Logout</button></li>
                </>
              ) : (
                <>
                  <li style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '10px' }}><Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--color-text)' }}>Wishlist</Link></li>
                  <li><Link to="/login" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--color-text)' }}>Login</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
