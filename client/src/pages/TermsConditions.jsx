import React, { useEffect } from 'react';
import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsConditions = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-container" style={{ paddingTop: '120px', minHeight: '80vh' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto', padding: '10px 20px 80px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(70, 129, 101, 0.1)', borderRadius: '50%', marginBottom: '12px' }}>
            <FileText size={32} color="#468165" />
          </div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '8px', color: '#1a1a1a' }}>Terms & Conditions</h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            The Plain Store • Last updated: September 2026
          </p>
        </div>

        {/* Content Box */}
        <div style={{ background: '#fff', padding: '35px', borderRadius: '12px', border: '1px solid #ede8de', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', lineHeight: '1.8', color: '#374151' }}>
          
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              1. Acceptance of Terms
            </h2>
            <p>
              These Terms & Conditions ("Terms") govern your use of the website and services provided by <strong>The Plain Store</strong> ("we", "us", "our"). By browsing, accessing, or placing an order through our website, you agree to be bound by these Terms and our accompanying policies, including our <Link to="/privacy-policy" style={{ color: '#468165' }}>Privacy Policy</Link>, <Link to="/shipping-policy" style={{ color: '#468165' }}>Shipping Policy</Link>, and <Link to="/returns-policy" style={{ color: '#468165' }}>Returns Policy</Link>.
            </p>
            <p>
              If you do not agree with any part of these Terms, please refrain from using our website.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              2. User Accounts & Responsibilities
            </h2>
            <p>
              When you create an account with The Plain Store, you agree to provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.
            </p>
            <p>
              You agree not to use the website for any unlawful purpose, to transmit malicious software, or to interfere with the proper functioning of the site.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              3. Products, Imagery & Pricing
            </h2>
            <ul style={{ paddingLeft: '20px', listStyleType: 'disc', marginTop: '8px' }}>
              <li style={{ marginBottom: '8px' }}>
                <strong>Product Descriptions:</strong> We make every effort to display the colors, textures, and details of our products accurately. Because screen resolutions vary, slight color variations may occur.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Pricing:</strong> All prices displayed on our website are stated in the local currency (INR / USD as indicated) and are inclusive of applicable taxes unless stated otherwise. Shipping fees are detailed during checkout.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Availability:</strong> Products are subject to availability. In the rare event an item is ordered but unavailable, we will notify you promptly and issue a full refund.
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              4. Orders & Payment
            </h2>
            <p>
              Placing an order constitutes an offer to purchase. An order is confirmed once payment has been authorized and an order confirmation email/receipt with an Order ID is generated.
            </p>
            <p>
              We accept online payments via certified payment gateways supporting cards, UPI, net banking, and digital wallets. We reserve the right to refuse or cancel orders suspected of fraud, pricing errors, or unauthorized transactions.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              5. Shipping, Returns & Cancellations
            </h2>
            <p>
              Shipment and fulfillment timelines are outlined in our <Link to="/shipping-policy" style={{ color: '#468165' }}>Shipping Policy</Link>. Customers may cancel orders prior to shipment dispatch as detailed in our <Link to="/cancellation-policy" style={{ color: '#468165' }}>Cancellation Policy</Link>, and return eligible products within 7 days in accordance with our <Link to="/returns-policy" style={{ color: '#468165' }}>Returns & Refund Policy</Link>.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              6. Intellectual Property
            </h2>
            <p>
              All content on this website—including the brand name <strong>"The Plain Store"</strong>, logos, product designs, product photographs, text, graphics, and code—is the property of The Plain Store and protected under applicable copyright, trademark, and intellectual property laws. Reproduction, duplication, or retransmission without prior written consent is strictly prohibited.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              7. External Links & Affiliate Relationships
            </h2>
            <p>
              Our website, editorial articles, and product showcases may contain links to external third-party websites, notably Amazon.in. <strong>As an Amazon Associate I earn from qualifying purchases.</strong> Links directing users to Amazon are paid links.
            </p>
            <p>
              External websites operate independently and have their own distinct terms of service, privacy practices, and transaction policies. The Plain Store does not control, supervise, or assume responsibility for external marketplace availability, product pricing fluctuations, order fulfillment, or customer service conducted on third-party websites such as Amazon.in.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              8. Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by applicable law, The Plain Store shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our products or website. Our total liability for any claim arising out of a purchase is limited to the amount paid for the product in question.
            </p>
          </section>

          <section style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              9. Governing Law & Jurisdiction
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India. Any legal action or proceeding arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts in India.
            </p>
            <p style={{ marginTop: '15px' }}>
              For any questions regarding these Terms, please contact us at <a href="mailto:support@theplainstore.com" style={{ color: '#468165' }}>support@theplainstore.com</a>.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
};

export default TermsConditions;
