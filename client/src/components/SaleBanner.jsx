import React, { useState } from 'react';
import { Flame, ArrowRight, Tag, Check, Sparkles, Percent } from 'lucide-react';

const SaleBanner = ({ onShopSale, saleCount = 0 }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('PLAIN20');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section 
      className="sale-banner-wrapper"
      style={{
        maxWidth: '1200px',
        margin: '0 auto 35px',
        padding: '0 20px',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #1E3A2F 0%, #2D5A47 60%, #468165 100%)',
          borderRadius: '16px',
          padding: '30px 35px',
          color: '#F5F1E7',
          boxShadow: '0 10px 30px rgba(30, 58, 47, 0.15)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px'
        }}
      >
        {/* Subtle decorative background circle */}
        <div
          style={{
            position: 'absolute',
            right: '-40px',
            top: '-50px',
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none'
          }}
        />

        <div style={{ flex: '1 1 500px', minWidth: '280px', position: 'relative', zIndex: 2 }}>
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(245, 241, 231, 0.15)',
              border: '1px solid rgba(245, 241, 231, 0.3)',
              borderRadius: '30px',
              padding: '4px 14px',
              fontSize: '0.78rem',
              fontWeight: '700',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: '#FCD34D',
              marginBottom: '12px'
            }}
          >
            <Flame size={14} color="#F59E0B" />
            <span>SEASONAL SALE • LIMITED TIME</span>
          </div>

          <h2
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: '700',
              margin: '0 0 10px 0',
              color: '#FFFFFF',
              letterSpacing: '-0.5px',
              lineHeight: 1.2
            }}
          >
            Calm Living, Thoughtful Prices.
          </h2>

          <p
            style={{
              margin: '0 0 16px 0',
              fontSize: '0.95rem',
              color: '#E2E8F0',
              lineHeight: 1.5,
              maxWidth: '560px'
            }}
          >
            Discover hand-finished ceramics, organic cotton linens, and purposeful accessories at up to <strong>30% off</strong>. Crafted for durability and sustainable everyday beauty.
          </p>

          {/* Quick Perks */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              fontSize: '0.82rem',
              color: '#CBD5E1'
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={13} color="#FCD34D" /> Plastic-free eco packaging
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Percent size={13} color="#FCD34D" /> Special clearance discounts
            </span>
          </div>
        </div>

        {/* Action / Coupon Section */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            alignItems: 'flex-start',
            position: 'relative',
            zIndex: 2
          }}
        >
          {/* Promo code badge */}
          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              border: '1px dashed rgba(255, 255, 255, 0.35)',
              borderRadius: '10px',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backdropFilter: 'blur(4px)'
            }}
          >
            <div>
              <span style={{ display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94A3B8' }}>
                Coupon Code
              </span>
              <strong style={{ fontSize: '1rem', letterSpacing: '1px', color: '#FFFFFF' }}>
                PLAIN20
              </strong>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              style={{
                backgroundColor: copied ? '#16A34A' : '#FFFFFF',
                color: copied ? '#FFFFFF' : '#1E3A2F',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.2s ease'
              }}
            >
              {copied ? (
                <>
                  <Check size={13} /> Copied!
                </>
              ) : (
                <>
                  <Tag size={13} /> Copy Code
                </>
              )}
            </button>
          </div>

          {/* Shop sale button */}
          <button
            type="button"
            onClick={onShopSale}
            style={{
              backgroundColor: '#F59E0B',
              color: '#1E293B',
              border: 'none',
              borderRadius: '30px',
              padding: '12px 24px',
              fontSize: '0.95rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <span>Explore On-Sale Items</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default SaleBanner;
