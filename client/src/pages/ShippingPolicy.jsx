import React, { useEffect } from 'react';
import { Truck, Clock, MapPin, Package, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ShippingPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-container" style={{ paddingTop: '120px', minHeight: '80vh' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto', padding: '10px 20px 80px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(70, 129, 101, 0.1)', borderRadius: '50%', marginBottom: '12px' }}>
            <Truck size={32} color="#468165" />
          </div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '8px', color: '#1a1a1a' }}>Shipping & Delivery Policy</h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            The Plain Store • Last updated: September 2026
          </p>
        </div>

        {/* Content Box */}
        <div style={{ background: '#fff', padding: '35px', borderRadius: '12px', border: '1px solid #ede8de', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', lineHeight: '1.8', color: '#374151' }}>
          
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              1. Overview
            </h2>
            <p>
              At <strong>The Plain Store</strong>, every item is carefully inspected, securely packaged, and dispatched through established logistics partners to ensure safe delivery to your doorstep. We strive to provide transparent and prompt shipping across all serviceable postal codes in India.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              2. Order Processing & Dispatch
            </h2>
            <ul style={{ paddingLeft: '20px', listStyleType: 'disc', marginTop: '8px' }}>
              <li style={{ marginBottom: '8px' }}>
                <strong>Processing Time:</strong> Orders are verified, packed, and dispatched within <strong>1 to 2 business days</strong> (Monday to Saturday, excluding national holidays).
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Confirmation:</strong> Upon dispatch, you receive an automated confirmation with your courier partner name and unique tracking number.
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              3. Estimated Delivery Timelines
            </h2>
            <p>Delivery timelines vary depending on your delivery location:</p>
            <div style={{ overflowX: 'auto', marginTop: '12px', marginBottom: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#faf8f5', borderBottom: '2px solid #ede8de' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>Destination Region</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>Estimated Delivery Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 14px' }}>Tier-1 Metro Cities (Delhi NCR, Mumbai, Bengaluru, etc.)</td>
                    <td style={{ padding: '10px 14px' }}>2 – 4 business days</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 14px' }}>Tier-2 & Tier-3 Cities</td>
                    <td style={{ padding: '10px 14px' }}>3 – 6 business days</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 14px' }}>Northeast & Remote Pin Codes</td>
                    <td style={{ padding: '10px 14px' }}>5 – 8 business days</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '13px', color: '#666' }}>
              *Please note that external circumstances such as extreme weather, natural events, or regional holidays may occasionally affect delivery schedules.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              4. Shipping Charges
            </h2>
            <p>
              Standard delivery fees are calculated and clearly displayed at checkout before order payment. We occasionally offer free shipping promotions or orders above specified cart thresholds, which are highlighted on our storefront.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              5. Real-Time Order Tracking
            </h2>
            <p>
              Once your package leaves our facility, you can monitor its progress in real time using our live <Link to="/track" style={{ color: '#468165', fontWeight: '600' }}>Track Order page</Link>. Simply input your Order ID or tracking number to view your shipment’s current stage, courier partner, and expected delivery date.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              6. Damaged or Tampered Shipments
            </h2>
            <p>
              If your package appears physically tampered with or severely damaged upon arrival:
            </p>
            <ul style={{ paddingLeft: '20px', listStyleType: 'disc', marginTop: '6px' }}>
              <li>Refuse acceptance from the courier and make a note on the delivery sheet, OR</li>
              <li>If accepted, record unboxing photographs/video and report it to our customer care team within <strong>48 hours</strong> of delivery at <a href="mailto:support@theplainstore.com" style={{ color: '#468165' }}>support@theplainstore.com</a>.</li>
            </ul>
            <p style={{ marginTop: '10px' }}>
              We will arrange a swift replacement or full refund after review.
            </p>
          </section>

          <section style={{ marginBottom: '10px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              7. Need Shipping Assistance?
            </h2>
            <p>
              If you have questions regarding your delivery or need address adjustments prior to dispatch, contact us at <a href="mailto:support@theplainstore.com" style={{ color: '#468165' }}>support@theplainstore.com</a> or visit our <Link to="/contact" style={{ color: '#468165' }}>Contact Us</Link> page.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
};

export default ShippingPolicy;
