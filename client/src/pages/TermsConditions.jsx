import React, { useEffect } from 'react';
import { FileText, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsConditions = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-container" style={{ paddingTop: '120px', minHeight: '80vh' }}>
      <div style={{ maxWidth: '880px', margin: '0 auto', padding: '10px 20px 80px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(70, 129, 101, 0.1)', borderRadius: '50%', marginBottom: '12px' }}>
            <FileText size={32} color="#468165" />
          </div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '8px', color: '#1a1a1a', letterSpacing: '-0.5px' }}>
            Terms & Conditions
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            The Plain Store &bull; <strong>Last Updated: September 2026</strong>
          </p>
        </div>

        {/* Content Box */}
        <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', border: '1px solid #ede8de', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', lineHeight: '1.8', color: '#374151' }}>
          
          <div style={{ padding: '18px 22px', backgroundColor: '#fcfbf7', borderRadius: '8px', border: '1px solid #e8e2d5', marginBottom: '32px' }}>
            <p style={{ margin: 0, fontSize: '0.96rem', color: '#444' }}>
              Welcome to <strong>The Plain Store</strong>. These Terms & Conditions govern your access to and use of the The Plain Store website, applications, services, products and related features. By accessing, browsing, registering on, or purchasing through The Plain Store, you agree to these Terms & Conditions and the policies referenced in them. If you do not agree with these Terms, please do not use our website or services.
            </p>
          </div>

          {/* Section 1 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              1. About The Plain Store
            </h2>
            <p>
              The Plain Store is an online shopping platform through which customers may browse, purchase and receive products offered through the platform.
            </p>
            <p>
              Information about the business entity operating The Plain Store is provided in the <Link to="/contact" style={{ color: '#468165', fontWeight: 500 }}>Contact and Legal Information</Link> section of this website.
            </p>
          </section>

          {/* Section 2 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              2. Eligibility
            </h2>
            <p>
              You must be legally capable of entering into a binding contract under applicable Indian law to place an order.
            </p>
            <p>
              If you are under 18 years of age, you may use The Plain Store only with the involvement and supervision of a parent or legal guardian.
            </p>
          </section>

          {/* Section 3 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              3. Your Account
            </h2>
            <p>Certain features may require you to create an account. You are responsible for:</p>
            <ul style={{ paddingLeft: '22px', listStyleType: 'disc', marginTop: '8px' }}>
              <li style={{ marginBottom: '6px' }}>Providing accurate information.</li>
              <li style={{ marginBottom: '6px' }}>Keeping your login credentials confidential.</li>
              <li style={{ marginBottom: '6px' }}>Maintaining the security of your account.</li>
              <li style={{ marginBottom: '6px' }}>Not allowing unauthorized persons to use your account.</li>
              <li style={{ marginBottom: '6px' }}>Informing us if you believe your account has been compromised.</li>
            </ul>
            <p style={{ marginTop: '10px' }}>
              You are responsible for activity carried out through your account, subject to applicable law.
            </p>
          </section>

          {/* Section 4 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              4. Product Information
            </h2>
            <p>
              We attempt to provide accurate product names, descriptions, specifications, images, prices, availability and other information.
            </p>
            <p>
              However, minor differences may occur between product images and the actual product because of photography, lighting, screen settings, manufacturing variations or packaging changes.
            </p>
            <p>
              Product-specific information displayed at the time of purchase will apply to the relevant order, subject to applicable law.
            </p>
          </section>

          {/* Section 5 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              5. Product Availability
            </h2>
            <p>
              Products displayed on the website may become unavailable without notice.
            </p>
            <p>
              An item being displayed on the website does not guarantee that it will remain available until an order is successfully confirmed.
            </p>
            <p>
              If an accepted order cannot be fulfilled because of an availability issue, we may cancel the affected order or portion of the order and provide the applicable refund.
            </p>
          </section>

          {/* Section 6 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              6. Prices
            </h2>
            <p>
              Prices displayed on The Plain Store are subject to change.
            </p>
            <p>
              We make reasonable efforts to ensure that pricing information is accurate.
            </p>
            <p>
              If a material pricing or listing error is discovered, we may contact you before processing the order or cancel the affected order and provide an applicable refund.
            </p>
          </section>

          {/* Section 7 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              7. Placing an Order
            </h2>
            <p>
              When you place an order, you are submitting a request to purchase the selected products.
            </p>
            <p>
              An order confirmation does not necessarily mean that the order has been dispatched.
            </p>
            <p>
              The order becomes subject to fulfillment according to the information communicated by The Plain Store.
            </p>
          </section>

          {/* Section 8 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              8. Order Acceptance and Cancellation
            </h2>
            <p>
              We reserve the right to refuse or cancel an order where permitted by law, including circumstances involving:
            </p>
            <ul style={{ paddingLeft: '22px', listStyleType: 'disc', marginTop: '8px' }}>
              <li style={{ marginBottom: '6px' }}>Product unavailability.</li>
              <li style={{ marginBottom: '6px' }}>Pricing or listing errors.</li>
              <li style={{ marginBottom: '6px' }}>Suspected fraudulent activity.</li>
              <li style={{ marginBottom: '6px' }}>Payment problems.</li>
              <li style={{ marginBottom: '6px' }}>Incorrect or incomplete information.</li>
              <li style={{ marginBottom: '6px' }}>Delivery limitations.</li>
              <li style={{ marginBottom: '6px' }}>Abuse of promotional offers.</li>
              <li style={{ marginBottom: '6px' }}>Technical errors.</li>
            </ul>
            <p style={{ marginTop: '10px' }}>
              Where payment has already been received for a cancelled order, the applicable refund will be processed.
            </p>
          </section>

          {/* Section 9 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              9. Payments
            </h2>
            <p>
              Payments may be made through the payment methods displayed at checkout.
            </p>
            <p>
              Available methods may include cards, UPI, net banking, wallets or other supported payment methods.
            </p>
            <p>
              COD may also be offered for eligible orders and locations.
            </p>
            <p>
              Additional terms may apply to particular payment methods.
            </p>
          </section>

          {/* Section 10 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              10. Shipping and Delivery
            </h2>
            <p>
              Delivery is subject to product availability, destination, shipping method and other operational factors.
            </p>
            <p>
              Estimated delivery dates are estimates and are not guarantees unless expressly stated otherwise.
            </p>
            <p>
              For complete information, see our <Link to="/shipping-policy" style={{ color: '#468165', fontWeight: 500 }}>Shipping & Delivery Policy</Link>.
            </p>
          </section>

          {/* Section 11 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              11. Returns, Replacements and Exchanges
            </h2>
            <p>
              Returns, replacements and exchanges are subject to the applicable product-specific eligibility requirements.
            </p>
            <p>
              Please review our <Link to="/returns-policy" style={{ color: '#468165', fontWeight: 500 }}>Returns & Replacement Policy and Exchange Policy</Link> before placing an order.
            </p>
          </section>

          {/* Section 12 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              12. Prohibited Use
            </h2>
            <p>You must not use The Plain Store to:</p>
            <ul style={{ paddingLeft: '22px', listStyleType: 'disc', marginTop: '8px' }}>
              <li style={{ marginBottom: '6px' }}>Commit fraud or unlawful activity.</li>
              <li style={{ marginBottom: '6px' }}>Attempt unauthorized access.</li>
              <li style={{ marginBottom: '6px' }}>Interfere with website security.</li>
              <li style={{ marginBottom: '6px' }}>Introduce malicious software.</li>
              <li style={{ marginBottom: '6px' }}>Scrape or misuse website data without authorization.</li>
              <li style={{ marginBottom: '6px' }}>Submit false information.</li>
              <li style={{ marginBottom: '6px' }}>Abuse promotions or coupons.</li>
              <li style={{ marginBottom: '6px' }}>Impersonate another person.</li>
              <li style={{ marginBottom: '6px' }}>Infringe intellectual-property rights.</li>
              <li style={{ marginBottom: '6px' }}>Harm or disrupt other users or our services.</li>
            </ul>
          </section>

          {/* Section 13 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              13. Reviews and User Content
            </h2>
            <p>
              Where The Plain Store permits reviews, ratings or other user-generated content, you must ensure that your submissions are genuine, lawful and do not infringe another person's rights.
            </p>
            <p>
              We may remove content that violates our policies or applicable law.
            </p>
          </section>

          {/* Section 14 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              14. Intellectual Property
            </h2>
            <p>
              The Plain Store's website design, branding, logos, graphics, text, software and other original content are protected by applicable intellectual-property laws.
            </p>
            <p>
              You may not reproduce, distribute, modify, commercially exploit or otherwise use our protected content without appropriate authorization.
            </p>
          </section>

          {/* Section 15 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              15. Third-Party Services
            </h2>
            <p>
              The Plain Store may use third-party providers for services such as:
            </p>
            <ul style={{ paddingLeft: '22px', listStyleType: 'disc', marginTop: '8px' }}>
              <li style={{ marginBottom: '6px' }}>Payment processing.</li>
              <li style={{ marginBottom: '6px' }}>Shipping and logistics.</li>
              <li style={{ marginBottom: '6px' }}>Authentication.</li>
              <li style={{ marginBottom: '6px' }}>Analytics.</li>
              <li style={{ marginBottom: '6px' }}>Communication.</li>
              <li style={{ marginBottom: '6px' }}>Hosting.</li>
              <li style={{ marginBottom: '6px' }}>Customer support.</li>
            </ul>
            <p style={{ marginTop: '10px' }}>
              Your use of such services may also be subject to the relevant provider's terms.
            </p>
          </section>

          {/* Section 16 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              16. Website Availability
            </h2>
            <p>
              We aim to keep The Plain Store available and functioning reliably.
            </p>
            <p>
              However, temporary interruptions may occur because of maintenance, technical problems, network failures, security incidents or circumstances beyond our reasonable control.
            </p>
          </section>

          {/* Section 17 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              17. Fraud Prevention
            </h2>
            <p>
              We may take reasonable measures to identify and prevent fraudulent, unauthorized or abusive transactions.
            </p>
            <p>
              Where permitted by law, we may restrict, cancel or investigate transactions that present legitimate security or fraud concerns.
            </p>
          </section>

          {/* Section 18 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              18. Limitation of Liability
            </h2>
            <p>
              Nothing in these Terms excludes or limits any liability or consumer right that cannot lawfully be excluded or limited.
            </p>
            <p>
              Subject to applicable law, The Plain Store will not be responsible for losses arising solely from circumstances beyond our reasonable control.
            </p>
          </section>

          {/* Section 19 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              19. Events Beyond Our Control
            </h2>
            <p>
              We will not be responsible for delays or failures caused by circumstances beyond our reasonable control, including natural disasters, transportation disruptions, government restrictions, network failures, strikes, or other comparable events.
            </p>
            <p>
              This does not affect your statutory rights.
            </p>
          </section>

          {/* Section 20 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              20. Policy Changes
            </h2>
            <p>
              We may update these Terms from time to time.
            </p>
            <p>
              The updated version will be published on this website with the applicable effective date.
            </p>
          </section>

          {/* Section 21 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              21. Governing Law
            </h2>
            <p>
              These Terms shall be governed by the applicable laws of India.
            </p>
            <p>
              Nothing in these Terms limits any consumer rights or remedies available under applicable law.
            </p>
          </section>

          {/* Section 22 */}
          <section style={{ marginBottom: '10px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              22. Contact
            </h2>
            <p>
              For questions concerning these Terms, please contact us using the contact information published on our website:
            </p>
            <div style={{ marginTop: '14px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <p style={{ margin: '0 0 6px 0', fontWeight: '600', color: '#111827' }}>The Plain Store</p>
              <p style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: '#4b5563' }}>
                Email: <a href="mailto:support@theplainstore.com" style={{ color: '#468165', fontWeight: '500' }}>support@theplainstore.com</a>
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#4b5563' }}>
                Website & Legal Info: <Link to="/contact" style={{ color: '#468165', fontWeight: '500' }}>Contact & Grievance Support</Link>
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
            <Link to="/privacy-policy" style={{ color: '#468165', fontSize: '0.9rem', textDecoration: 'none' }}>
              Privacy Policy
            </Link>
            <Link to="/returns-policy" style={{ color: '#468165', fontSize: '0.9rem', textDecoration: 'none' }}>
              Returns & Refunds
            </Link>
            <Link to="/shipping-policy" style={{ color: '#468165', fontSize: '0.9rem', textDecoration: 'none' }}>
              Shipping Policy
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TermsConditions;
