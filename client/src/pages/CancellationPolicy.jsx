import React, { useEffect } from 'react';
import { XCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const CancellationPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-container" style={{ paddingTop: '120px', minHeight: '80vh' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto', padding: '10px 20px 80px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(70, 129, 101, 0.1)', borderRadius: '50%', marginBottom: '12px' }}>
            <XCircle size={32} color="#468165" />
          </div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '8px', color: '#1a1a1a' }}>Cancellation Policy</h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            The Plain Store • Last updated: September 2026
          </p>
        </div>

        {/* Content Box */}
        <div style={{ background: '#fff', padding: '35px', borderRadius: '12px', border: '1px solid #ede8de', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', lineHeight: '1.8', color: '#374151' }}>
          
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              1. Cancellation Before Dispatch
            </h2>
            <p>
              At <strong>The Plain Store</strong>, you can cancel your order free of charge at any time <strong>before it has been dispatched</strong> from our warehouse facility.
            </p>
            <p>
              To cancel your order prior to shipment:
            </p>
            <ul style={{ paddingLeft: '20px', listStyleType: 'disc', marginTop: '8px' }}>
              <li style={{ marginBottom: '6px' }}>
                Email our customer care team at <a href="mailto:support@theplainstore.com" style={{ color: '#468165' }}>support@theplainstore.com</a> with your <strong>Order ID</strong> and cancellation request, OR
              </li>
              <li style={{ marginBottom: '6px' }}>
                Submit a quick cancellation note via our <Link to="/contact" style={{ color: '#468165' }}>Contact page</Link> mentioning your Order ID.
              </li>
            </ul>
            <p style={{ marginTop: '10px' }}>
              Once received before dispatch, the order will be cancelled immediately, and a 100% full refund will be initiated back to your original payment method.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              2. Cancellation After Dispatch
            </h2>
            <p>
              If your order has already been handed over to the courier and assigned a tracking number, it cannot be intercepted in transit. In this scenario:
            </p>
            <ul style={{ paddingLeft: '20px', listStyleType: 'disc', marginTop: '8px' }}>
              <li style={{ marginBottom: '6px' }}>
                You may refuse acceptance of the package when the courier partner attempts delivery at your doorstep, OR
              </li>
              <li style={{ marginBottom: '6px' }}>
                If accepted, you may return the package within 7 days under our <Link to="/returns-policy" style={{ color: '#468165' }}>Returns & Refund Policy</Link>.
              </li>
            </ul>
            <p style={{ marginTop: '10px' }}>
              Once the rejected package returns to our warehouse, a full refund will be processed promptly.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              3. Cancellation by The Plain Store
            </h2>
            <p>
              While rare, The Plain Store reserves the right to cancel an order under specific circumstances, such as:
            </p>
            <ul style={{ paddingLeft: '20px', listStyleType: 'disc', marginTop: '8px' }}>
              <li style={{ marginBottom: '6px' }}>Unforeseen inventory stockouts or item quality check failure.</li>
              <li style={{ marginBottom: '6px' }}>Inability to deliver to a non-serviceable pin code.</li>
              <li style={{ marginBottom: '6px' }}>Pricing or typographical errors on the storefront.</li>
              <li style={{ marginBottom: '6px' }}>Suspected fraudulent or unauthorized payment activity.</li>
            </ul>
            <p style={{ marginTop: '10px' }}>
              In any such event, the customer will be notified via email, and a 100% refund will be issued immediately.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              4. Refund Timelines on Cancellation
            </h2>
            <p>
              Refunds on successfully cancelled orders are triggered immediately:
            </p>
            <ul style={{ paddingLeft: '20px', listStyleType: 'disc', marginTop: '8px' }}>
              <li style={{ marginBottom: '6px' }}>
                <strong>UPI & Net Banking:</strong> 2 to 4 business days.
              </li>
              <li style={{ marginBottom: '6px' }}>
                <strong>Credit & Debit Cards:</strong> 4 to 7 business days, depending on your issuing bank.
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: '10px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              5. Questions?
            </h2>
            <p>
              If you need help cancelling an order, write to us at <a href="mailto:support@theplainstore.com" style={{ color: '#468165' }}>support@theplainstore.com</a>.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
};

export default CancellationPolicy;
