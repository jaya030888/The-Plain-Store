import React, { useState } from 'react';
import { Tag, ArrowRight, Check, Copy } from 'lucide-react';

const SaleBanner = ({ onShopSale }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('PLAIN20');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="sale-banner-wrapper"
      style={{
        maxWidth: '1200px',
        margin: '0 auto 20px',
        padding: '0 20px',
      }}
    >
      <div
        style={{
          background: '#f8f6f1',
          border: '1px solid #e7e2d7',
          borderRadius: '10px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Left: Simple concise text & tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: '#e7f0eb',
              color: '#2e5b44',
              padding: '3px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.3px',
              textTransform: 'uppercase'
            }}
          >
            <Tag size={12} /> Special Offer
          </span>

          <span style={{ fontSize: '14px', color: '#333' }}>
            Get <strong>20% off</strong> all minimalist essentials with coupon code <strong style={{ color: '#2e5b44', letterSpacing: '0.5px' }}>PLAIN20</strong>
          </span>
        </div>

        {/* Right: Compact simple actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={handleCopyCode}
            style={{
              backgroundColor: copied ? '#2e5b44' : '#ffffff',
              color: copied ? '#ffffff' : '#333',
              border: '1px solid #d5cfc2',
              borderRadius: '6px',
              padding: '5px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.2s ease'
            }}
            title="Copy coupon code PLAIN20"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>

          <button
            type="button"
            onClick={onShopSale}
            style={{
              backgroundColor: 'transparent',
              color: '#2e5b44',
              border: 'none',
              padding: '5px 8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>Shop Sale</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaleBanner;
