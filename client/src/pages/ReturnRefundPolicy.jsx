import React, { useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
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
          <h1 style={{ fontSize: '2.2rem', marginBottom: '8px', color: '#1a1a1a' }}>Returns & Refunds Policy</h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            The Plain Store • Official Customer Care Policy
          </p>
        </div>

        {/* Content Box */}
        <div style={{ background: '#fff', padding: '35px', borderRadius: '12px', border: '1px solid #ede8de', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', lineHeight: '1.8', color: '#374151' }}>
          
          <p style={{ fontSize: '1.05rem', color: '#222', marginBottom: '28px', lineHeight: '1.7' }}>
            At <strong>The Plain Store</strong>, we want you to have a smooth shopping experience. If you receive a product that is eligible for return, replacement, or refund under this policy, you may raise a request through our customer support process.
          </p>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              1. Return Eligibility
            </h2>
            <p>A product may be eligible for return or replacement if:</p>
            <ul style={{ paddingLeft: '20px', listStyleType: 'disc', marginTop: '8px' }}>
              <li style={{ marginBottom: '6px' }}>You received a damaged product.</li>
              <li style={{ marginBottom: '6px' }}>You received a defective or non-functional product.</li>
              <li style={{ marginBottom: '6px' }}>You received a product different from the one ordered.</li>
              <li style={{ marginBottom: '6px' }}>The product is missing essential components or accessories.</li>
              <li style={{ marginBottom: '6px' }}>The product is otherwise eligible for return as specified on its product page.</li>
            </ul>
            <p style={{ marginTop: '10px' }}>
              The applicable return period and eligibility may vary depending on the product.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              2. Condition of the Product
            </h2>
            <p>Products returned to The Plain Store should, where applicable:</p>
            <ul style={{ paddingLeft: '20px', listStyleType: 'disc', marginTop: '8px' }}>
              <li style={{ marginBottom: '6px' }}>Be unused and in their original condition.</li>
              <li style={{ marginBottom: '6px' }}>Include the original packaging, accessories, manuals, tags, and other components supplied with the product.</li>
              <li style={{ marginBottom: '6px' }}>Not show signs of misuse, alteration, or damage caused after delivery.</li>
            </ul>
            <p style={{ marginTop: '10px' }}>
              A return request may be rejected where the returned product does not satisfy the applicable return conditions.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              3. Damaged, Defective or Incorrect Products
            </h2>
            <p>
              If you receive a damaged, defective, or incorrect product, contact us as soon as reasonably possible after delivery.
            </p>
            <p style={{ marginTop: '8px' }}>
              We may request photographs, videos, order details, or other information necessary to verify the issue.
            </p>
            <p style={{ marginTop: '8px' }}>
              Depending on the circumstances and product availability, we may provide a replacement, refund, or another appropriate resolution.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              4. Return Process
            </h2>
            <p>To request a return:</p>
            <ol style={{ paddingLeft: '20px', marginTop: '8px' }}>
              <li style={{ marginBottom: '8px' }}>
                Contact The Plain Store through the support channel provided on our website or directly through your <Link to="/orders" style={{ color: '#468165' }}>My Orders</Link> dashboard.
              </li>
              <li style={{ marginBottom: '8px' }}>
                Provide your order number and the relevant product details.
              </li>
              <li style={{ marginBottom: '8px' }}>
                Describe the reason for the return.
              </li>
              <li style={{ marginBottom: '8px' }}>
                Provide any supporting photographs or other information requested by our support team.
              </li>
              <li style={{ marginBottom: '8px' }}>
                Follow the return instructions provided by us.
              </li>
            </ol>
            <p style={{ marginTop: '10px' }}>
              A return is considered accepted only after the request has been reviewed and approved where approval is required.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              5. Inspection
            </h2>
            <p>
              Returned products may be inspected after they are received.
            </p>
            <p style={{ marginTop: '8px' }}>
              The outcome of a return request may depend on the condition of the product and whether the applicable return requirements have been satisfied.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              6. Refunds
            </h2>
            <p>
              Where a refund is approved, the refund will generally be processed using the applicable payment method or another appropriate method communicated by The Plain Store.
            </p>
            <p style={{ marginTop: '8px' }}>
              The time taken for the refund to appear in your account may depend on the payment provider or financial institution.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              7. Replacement
            </h2>
            <p>
              Where replacement is approved and the same product is available, The Plain Store may arrange a replacement.
            </p>
            <p style={{ marginTop: '8px' }}>
              If a replacement is unavailable, we may provide an alternative resolution, including a refund where applicable.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              8. Non-Returnable Products
            </h2>
            <p>
              Certain products may not be eligible for return because of their nature, hygiene considerations, customization, usage, or other applicable restrictions.
            </p>
            <p style={{ marginTop: '8px' }}>
              Any product-specific return restrictions will be communicated on the relevant product page or at the time of purchase.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              9. Cancellation
            </h2>
            <p>
              Customers may request cancellation before an order is dispatched, subject to the status of the order.
            </p>
            <p style={{ marginTop: '8px' }}>
              Once an order has been dispatched, cancellation may no longer be possible and the applicable return process may apply instead.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              10. Policy Changes
            </h2>
            <p>
              The Plain Store may update this policy from time to time. The latest version published on this website will apply to orders placed after the effective date of the updated policy, subject to applicable law.
            </p>
          </section>

          <section style={{ marginBottom: '10px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              11. Contact Us
            </h2>
            <p>
              For questions regarding returns, replacements, cancellations, or refunds, please contact The Plain Store using the contact information provided on our website or email us at <a href="mailto:support@theplainstore.com" style={{ color: '#468165' }}>support@theplainstore.com</a>.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
};

export default ReturnRefundPolicy;
