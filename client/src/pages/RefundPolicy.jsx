import React, { useEffect } from 'react';
import { RefreshCw, CreditCard, CheckCircle, AlertCircle, HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const RefundPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-container" style={{ paddingTop: '120px', minHeight: '80vh' }}>
      <div style={{ maxWidth: '880px', margin: '0 auto', padding: '10px 20px 80px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(70, 129, 101, 0.1)', borderRadius: '50%', marginBottom: '12px' }}>
            <CreditCard size={32} color="#468165" />
          </div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '8px', color: '#1a1a1a', letterSpacing: '-0.5px' }}>
            Refund Policy
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            The Plain Store &bull; <strong>Last Updated: September 2026</strong>
          </p>
        </div>

        {/* Content Box */}
        <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', border: '1px solid #ede8de', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', lineHeight: '1.8', color: '#374151' }}>
          
          {/* Section 1 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              1. When a Refund May Be Issued
            </h2>
            <p>A refund may be applicable following:</p>
            <ul style={{ paddingLeft: '22px', listStyleType: 'disc', marginTop: '8px' }}>
              <li style={{ marginBottom: '4px' }}>Approved cancellation.</li>
              <li style={{ marginBottom: '4px' }}>Approved return.</li>
              <li style={{ marginBottom: '4px' }}>Approved refund request.</li>
              <li style={{ marginBottom: '4px' }}>Undelivered order.</li>
              <li style={{ marginBottom: '4px' }}>Product unavailability after payment.</li>
              <li style={{ marginBottom: '4px' }}>Approved defective, damaged or incorrect-product resolution.</li>
              <li style={{ marginBottom: '4px' }}>Duplicate payment or payment-processing issue.</li>
              <li style={{ marginBottom: '4px' }}>Other circumstances requiring a refund under applicable law.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              2. Refund Method
            </h2>
            <p>
              Where possible, refunds for prepaid orders will be processed through the applicable payment method or payment provider.
            </p>
            <p>
              The exact method may depend on the payment system used for the transaction.
            </p>
          </section>

          {/* Section 3 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              3. COD Refunds
            </h2>
            <p>
              For eligible COD transactions requiring a refund, The Plain Store may request appropriate bank-account, UPI or other payment information necessary to process the refund.
            </p>
            <p>
              Customers should provide accurate payment information.
            </p>
          </section>

          {/* Section 4 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              4. Refund Processing
            </h2>
            <p>
              The Plain Store will initiate approved refunds within the applicable operational and legal timeframe.
            </p>
            <p>
              The time required for the refunded amount to appear in the customer's account may depend on the payment provider or financial institution.
            </p>
          </section>

          {/* Section 5 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              5. Partial Refunds
            </h2>
            <p>
              Where only part of an order is cancelled, returned or otherwise eligible for a refund, the refund may relate only to the affected portion.
            </p>
          </section>

          {/* Section 6 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              6. Shipping Charges
            </h2>
            <p>
              Treatment of shipping charges may depend on the reason for the refund and the applicable product policy.
            </p>
            <p>
              Where required by applicable law, the customer's statutory rights will apply.
            </p>
          </section>

          {/* Section 7 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              7. Failed Transactions
            </h2>
            <p>
              If an amount is debited but an order is not successfully created, the payment may be automatically reversed by the payment provider.
            </p>
            <p>
              If the amount does not return within the applicable timeframe, customers should contact us with the transaction details.
            </p>
          </section>

          {/* Section 8 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              8. Duplicate Payments
            </h2>
            <p>
              If you believe you have been charged more than once for the same transaction, contact us with the relevant payment information so that we can investigate.
            </p>
          </section>

          {/* Section 9 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              9. Refund Status
            </h2>
            <p>
              Where supported, refund status may be communicated through your account, email, SMS or customer support.
            </p>
            <p style={{ marginTop: '10px' }}>
              You can also check your return & refund requests directly in your <Link to="/orders" style={{ color: '#468165', fontWeight: 500 }}>Orders Dashboard</Link>.
            </p>
          </section>

          {/* Section 10 */}
          <section style={{ marginBottom: '10px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              10. Fraud and Unauthorized Transactions
            </h2>
            <p>
              If you believe an unauthorized transaction has occurred, contact your payment provider and The Plain Store promptly.
            </p>
            <p>
              We may request information necessary to investigate the transaction.
            </p>
            <div style={{ marginTop: '14px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <p style={{ margin: '0 0 6px 0', fontWeight: '600', color: '#111827' }}>The Plain Store - Refund Helpdesk</p>
              <p style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: '#4b5563' }}>
                Email: <a href="mailto:support@theplainstore.com" style={{ color: '#468165', fontWeight: '500' }}>support@theplainstore.com</a>
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#4b5563' }}>
                Returns Information: <Link to="/returns-policy" style={{ color: '#468165', fontWeight: '500' }}>Returns & Replacement Policy</Link>
              </p>
            </div>
          </section>

        </div>

        {/* Footer Link Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <Link to="/" style={{ color: '#64748b', fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            &larr; Back to Home
          </Link>
          <div style={{ display: 'flex', gap: '18px' }}>
            <Link to="/returns-policy" style={{ color: '#468165', fontSize: '0.9rem', textDecoration: 'none' }}>
              Returns Policy
            </Link>
            <Link to="/cancellation-policy" style={{ color: '#468165', fontSize: '0.9rem', textDecoration: 'none' }}>
              Cancellation Policy
            </Link>
            <Link to="/terms" style={{ color: '#468165', fontSize: '0.9rem', textDecoration: 'none' }}>
              Terms & Conditions
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RefundPolicy;
