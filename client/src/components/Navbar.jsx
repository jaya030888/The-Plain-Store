import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, Search, X, MapPin, Globe } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
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

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    navigate(query ? `/?search=${encodeURIComponent(query)}` : '/');
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'glass' : ''}`}>
        
        <div className="nav-brand-area">
          <Link to="/" className="nav-logo-link" aria-label="The Plain Store home">
            <div className="nav-logo">The Plain Store</div>
          </Link>
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

              <li><Link to="/about" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--color-text)' }}>About Us</Link></li>
              
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
