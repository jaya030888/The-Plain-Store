import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Brand Column */}
        <div className="footer-brand-col">
          <div className="footer-logo">The Plain Store</div>
          <p className="footer-tagline">
            Thoughtfully crafted essentials designed for modern living. Elevating everyday spaces with purposeful simplicity.
          </p>
          <div className="footer-badges">
            <span className="footer-badge-item">
              <ShieldCheck size={16} /> 100% Secure Checkout
            </span>
            <span className="footer-badge-item">
              <Truck size={16} /> Pan-India Delivery
            </span>
            <span className="footer-badge-item">
              <RefreshCw size={16} /> 7-Day Easy Returns
            </span>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="footer-col">
          <h4 className="footer-heading">Shop & Explore</h4>
          <ul className="footer-links">
            <li><Link to="/">All Products</Link></li>
            <li><Link to="/articles">Guides & Articles</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/wishlist">My Wishlist</Link></li>
            <li><Link to="/track">Track Your Order</Link></li>
          </ul>
        </div>

        {/* Customer Support Column */}
        <div className="footer-col">
          <h4 className="footer-heading">Customer Care</h4>
          <ul className="footer-links">
            <li><Link to="/contact">Contact Support</Link></li>
            <li><Link to="/shipping-policy">Shipping & Delivery</Link></li>
            <li><Link to="/returns-policy">Returns & Refunds</Link></li>
            <li><Link to="/cancellation-policy">Cancellation Policy</Link></li>
          </ul>
          <div className="footer-contact-info">
            <p><Mail size={14} /> support@theplainstore.com</p>
            <p><Phone size={14} /> +91 (Available Mon–Sat, 10am–6pm IST)</p>
          </div>
        </div>

        {/* Legal & Compliance Column */}
        <div className="footer-col">
          <h4 className="footer-heading">Legal & Policies</h4>
          <ul className="footer-links">
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms & Conditions</Link></li>
            <li><Link to="/shipping-policy">Shipping Policy</Link></li>
            <li><Link to="/returns-policy">Refund Policy</Link></li>
          </ul>
          <p className="footer-compliance-text">
            Compliant with Indian E-Commerce & IT Rules (Grievance Officer disclosed in Privacy Policy).
          </p>
        </div>
      </div>

      {/* Amazon Associate Statutory Disclosure */}
      <div className="footer-affiliate-disclosure" style={{ maxWidth: '1280px', margin: '2.5rem auto 0 auto', padding: '1.25rem 1.5rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <p style={{ margin: '0 0 6px 0', fontSize: '0.86rem', color: '#e0e7e3', fontWeight: 600 }}>
          As an Amazon Associate I earn from qualifying purchases.
        </p>
        <p style={{ margin: 0, fontSize: '0.78rem', color: '#8fa499', lineHeight: 1.5 }}>
          The Plain Store participates in the Amazon Services LLC Associates Program and the Amazon.in Associates Programme, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.in. Certain content that appears on this site comes from Amazon Services LLC. This content is provided 'as is' and is subject to change or removal at any time. Product links pointing to Amazon are paid links.
        </p>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; {new Date().getFullYear()} The Plain Store. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/articles">Articles</Link>
            <span>&bull;</span>
            <Link to="/privacy-policy">Privacy</Link>
            <span>&bull;</span>
            <Link to="/terms">Terms</Link>
            <span>&bull;</span>
            <Link to="/contact">Contact</Link>
            <span>&bull;</span>
            <Link to="/track">Track</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
