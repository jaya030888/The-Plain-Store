import React, { useEffect } from 'react';
import { RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ReturnRefundPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-container" style={{ paddingTop: '120px', minHeight: '80vh' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto', padding: '10px 20px 80px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(70, 129, 101, 0.1)', borderRadius: '50%', marginBottom: '12px' }}>
            <RotateCcw size={32} color="#468165" />
          </div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '8px', color: '#1a1a1a' }}>Returns & Refund Policy</h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            The Plain Store • Last updated: September 2026
          </p>
        </div>

        {/* Content Box */}
        <div style={{ background: '#fff', padding: '35px', borderRadius: '12px', border: '1px solid #ede8de', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', lineHeight: '1.8', color: '#374151' }}>
          
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              1. Our 7-Day Return Commitment
            </h2>
            <p>
              At <strong>The Plain Store</strong>, customer satisfaction is central to our values. If you are not completely satisfied with your purchase, or if an item arrives in damaged or defective condition, you may initiate a return request within <strong>7 days</strong> of the confirmed delivery date.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              2. Return Eligibility Requirements
            </h2>
            <p>To qualify for a return and refund, items must satisfy the following conditions:</p>
            <ul style={{ paddingLeft: '20px', listStyleType: 'disc', marginTop: '8px' }}>
              <li style={{ marginBottom: '6px' }}>The item must be in its original, unused, and undamaged condition.</li>
              <li style={{ marginBottom: '6px' }}>All original tags, labels, and protective wrapping must remain intact.</li>
              <li style={{ marginBottom: '6px' }}>The product must be returned in its original product packaging along with any accessories, manuals, or complementary inserts.</li>
              <li style={{ marginBottom: '6px' }}>Proof of purchase (Order ID or invoice receipt) must accompany the request.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              3. Non-Returnable Items
            </h2>
            <p>For health, hygiene, and custom constraints, certain items cannot be returned:</p>
            <ul style={{ paddingLeft: '20px', listStyleType: 'disc', marginTop: '8px' }}>
              <li style={{ marginBottom: '6px' }}>Personal care or wellness items (such as incense sticks or essential oils) once opened or unsealed.</li>
              <li style={{ marginBottom: '6px' }}>Items marked explicitly as "Final Sale" or "Non-Returnable" at the time of purchase.</li>
              <li style={{ marginBottom: '6px' }}>Products showing clear signs of usage, wear, or alterations after delivery.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              4. How to Initiate a Return
            </h2>
            <ol style={{ paddingLeft: '20px', marginTop: '8px' }}>
              <li style={{ marginBottom: '8px' }}>
                <strong>Step 1:</strong> Email our support team at <a href="mailto:support@theplainstore.com" style={{ color: '#468165' }}>support@theplainstore.com</a> or message us via our <Link to="/contact" style={{ color: '#468165' }}>Contact page</Link> within 7 days of receiving your order.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Step 2:</strong> Include your Order ID, item name, reason for return, and 1–2 clear photographs (especially if damaged or defective).
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Step 3:</strong> Once approved, we will arrange a reverse pickup with our courier partner from your delivery address.
              </li>
            </ol>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              5. Refund Process & Timelines
            </h2>
            <p>
              Once the returned product arrives at our facility and passes physical inspection:
            </p>
            <ul style={{ paddingLeft: '20px', listStyleType: 'disc', marginTop: '8px' }}>
              <li style={{ marginBottom: '6px' }}>
                <strong>Prepaid Orders:</strong> The refund will be initiated directly to your original payment source (Credit/Debit Card, Net Banking, or UPI) within <strong>5 to 7 business days</strong>.
              </li>
              <li style={{ marginBottom: '6px' }}>
                <strong>Cash on Delivery (COD) Orders:</strong> Our customer support team will contact you to collect bank account details (Account Name, Account Number, IFSC) to transfer the refund via NEFT/IMPS within 5 to 7 business days.
              </li>
            </ul>
            <p style={{ marginTop: '10px' }}>
              You will receive an email confirmation as soon as the refund transaction is completed.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              6. Replacements & Exchanges
            </h2>
            <p>
              If your item arrived defective or damaged in transit, we will provide a complimentary replacement at no extra charge. If the item is out of stock, a full refund will be provided immediately.
            </p>
          </section>

          <section style={{ marginBottom: '10px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              7. Contact Support
            </h2>
            <p>
              For return inquiries or status updates, reach out to <a href="mailto:support@theplainstore.com" style={{ color: '#468165' }}>support@theplainstore.com</a>.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
};

export default ReturnRefundPolicy;
