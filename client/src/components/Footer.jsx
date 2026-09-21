import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

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
            <li><Link to="/grievance-policy">Grievance Redressal</Link></li>
          </ul>
          <div className="footer-contact-info">
            <p><Mail size={14} /> support@theplainstore.com</p>
            <p><Phone size={14} /> +91 (Available Mon–Sat, 10am–6pm IST)</p>
          </div>
        </div>

        {/* Legal & Policies Column */}
        <div className="footer-col">
          <h4 className="footer-heading">Legal & Policies</h4>
          <ul className="footer-links">
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms & Conditions</Link></li>
            <li><Link to="/shipping-policy">Shipping Policy</Link></li>
            <li><Link to="/refund-policy">Refund Policy</Link></li>
            <li><Link to="/grievance-policy">Grievance Policy</Link></li>
          </ul>
          <p className="footer-compliance-text">
            Compliant with Indian E-Commerce & Consumer Protection Rules.
          </p>
        </div>
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
