import React, { useState } from 'react';
import { Tag, ArrowRight, Check, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SaleBanner = ({ onShopSale }) => {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopyCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText('PLAIN20');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShopSale = (e) => {
    e.preventDefault();
    if (onShopSale) {
      onShopSale();
      return;
    }
    navigate('/?onSale=true');
    setTimeout(() => {
      const el = document.getElementById('shop-products-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="top-sale-banner">
      <div className="top-sale-banner-container">
        {/* Left: Simple concise text & tag */}
        <div className="top-sale-left">
          <span className="top-sale-badge">
            <Tag size={12} /> Special Offer
          </span>

          <span className="top-sale-text">
            Get <strong>20% off</strong> all minimalist essentials with coupon code <strong className="top-sale-code">PLAIN20</strong>
          </span>
        </div>

        {/* Right: Compact actions */}
        <div className="top-sale-right">
          <button
            type="button"
            onClick={handleCopyCode}
            className="top-sale-copy-btn"
            title="Copy coupon code PLAIN20"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>

          <button
            type="button"
            onClick={handleShopSale}
            className="top-sale-shop-btn"
          >
            <span>Shop Sale</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaleBanner;

