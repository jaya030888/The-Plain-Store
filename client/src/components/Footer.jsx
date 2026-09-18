import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-logo">The Plain Store</div>
      <p className="footer-text">With love. Crafted for elegance.</p>
      <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#888' }}>
        &copy; {new Date().getFullYear()} The Plain Store. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
