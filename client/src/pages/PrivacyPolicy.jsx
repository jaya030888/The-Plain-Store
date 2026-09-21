import React, { useEffect } from 'react';
import { Shield, Lock, Eye, Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-container" style={{ paddingTop: '120px', minHeight: '80vh' }}>
      <div style={{ maxWidth: '880px', margin: '0 auto', padding: '10px 20px 80px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(70, 129, 101, 0.1)', borderRadius: '50%', marginBottom: '12px' }}>
            <Shield size={32} color="#468165" />
          </div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '8px', color: '#1a1a1a', letterSpacing: '-0.5px' }}>
            Privacy Policy
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            The Plain Store &bull; <strong>Last Updated: September 2026</strong>
          </p>
        </div>

        {/* Content Box */}
        <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', border: '1px solid #ede8de', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', lineHeight: '1.8', color: '#374151' }}>
          
          <div style={{ padding: '18px 22px', backgroundColor: '#fcfbf7', borderRadius: '8px', border: '1px solid #e8e2d5', marginBottom: '32px' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '0.96rem', color: '#444' }}>
              <strong>The Plain Store</strong> respects your privacy and is committed to protecting the personal information you provide while using our website and services.
            </p>
            <p style={{ margin: 0, fontSize: '0.96rem', color: '#444' }}>
              This Privacy Policy explains what information we collect, why we collect it, how we use it, when it may be shared, and the choices available to you.
            </p>
          </div>

          {/* Section 1 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              1. Information We Collect
            </h2>
            <p>Depending on how you use The Plain Store, we may collect:</p>
            
            <h3 style={{ fontSize: '1.05rem', color: '#1f2937', marginTop: '16px', marginBottom: '8px', fontWeight: 600 }}>
              Account Information
            </h3>
            <ul style={{ paddingLeft: '22px', listStyleType: 'disc', margin: '6px 0 16px 0' }}>
              <li style={{ marginBottom: '4px' }}>Name</li>
              <li style={{ marginBottom: '4px' }}>Email address</li>
              <li style={{ marginBottom: '4px' }}>Mobile number</li>
              <li style={{ marginBottom: '4px' }}>Login credentials</li>
              <li style={{ marginBottom: '4px' }}>Account preferences</li>
            </ul>

            <h3 style={{ fontSize: '1.05rem', color: '#1f2937', marginTop: '16px', marginBottom: '8px', fontWeight: 600 }}>
              Order Information
            </h3>
            <ul style={{ paddingLeft: '22px', listStyleType: 'disc', margin: '6px 0 16px 0' }}>
              <li style={{ marginBottom: '4px' }}>Products purchased</li>
              <li style={{ marginBottom: '4px' }}>Order number</li>
              <li style={{ marginBottom: '4px' }}>Billing information</li>
              <li style={{ marginBottom: '4px' }}>Delivery address</li>
              <li style={{ marginBottom: '4px' }}>Order history</li>
              <li style={{ marginBottom: '4px' }}>Return, replacement and refund information</li>
            </ul>

            <h3 style={{ fontSize: '1.05rem', color: '#1f2937', marginTop: '16px', marginBottom: '8px', fontWeight: 600 }}>
              Payment Information
            </h3>
            <p style={{ margin: '6px 0' }}>
              Payments may be processed through third-party payment providers.
            </p>
            <p style={{ margin: '6px 0' }}>
              We generally do not need to store complete payment-card credentials on our own systems when payment processing is handled by a payment service provider.
            </p>
            <p style={{ margin: '6px 0 16px 0' }}>
              The information required to process or verify a transaction may be received from the relevant payment provider.
            </p>

            <h3 style={{ fontSize: '1.05rem', color: '#1f2937', marginTop: '16px', marginBottom: '8px', fontWeight: 600 }}>
              Device and Technical Information
            </h3>
            <p style={{ margin: '6px 0' }}>We may automatically receive information such as:</p>
            <ul style={{ paddingLeft: '22px', listStyleType: 'disc', margin: '6px 0 0 0' }}>
              <li style={{ marginBottom: '4px' }}>IP address</li>
              <li style={{ marginBottom: '4px' }}>Browser type</li>
              <li style={{ marginBottom: '4px' }}>Device type</li>
              <li style={{ marginBottom: '4px' }}>Operating system</li>
              <li style={{ marginBottom: '4px' }}>Website interaction information</li>
              <li style={{ marginBottom: '4px' }}>Log information</li>
              <li style={{ marginBottom: '4px' }}>Approximate location derived from technical information where applicable</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              2. How We Use Information
            </h2>
            <p>We may use personal information to:</p>
            <ul style={{ paddingLeft: '22px', listStyleType: 'disc', marginTop: '8px' }}>
              <li style={{ marginBottom: '4px' }}>Create and manage accounts.</li>
              <li style={{ marginBottom: '4px' }}>Process orders.</li>
              <li style={{ marginBottom: '4px' }}>Deliver products.</li>
              <li style={{ marginBottom: '4px' }}>Process payments.</li>
              <li style={{ marginBottom: '4px' }}>Provide customer support.</li>
              <li style={{ marginBottom: '4px' }}>Process returns, replacements and refunds.</li>
              <li style={{ marginBottom: '4px' }}>Prevent fraud and unauthorized activity.</li>
              <li style={{ marginBottom: '4px' }}>Improve our website and services.</li>
              <li style={{ marginBottom: '4px' }}>Communicate about orders.</li>
              <li style={{ marginBottom: '4px' }}>Send promotional communications where permitted and where applicable.</li>
              <li style={{ marginBottom: '4px' }}>Comply with legal obligations.</li>
              <li style={{ marginBottom: '4px' }}>Resolve disputes.</li>
              <li style={{ marginBottom: '4px' }}>Maintain security.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              3. Information Sharing
            </h2>
            <p>We may share necessary information with service providers that help us operate the store, including:</p>
            <ul style={{ paddingLeft: '22px', listStyleType: 'disc', marginTop: '8px' }}>
              <li style={{ marginBottom: '4px' }}>Payment processors.</li>
              <li style={{ marginBottom: '4px' }}>Delivery and logistics providers.</li>
              <li style={{ marginBottom: '4px' }}>Technology and hosting providers.</li>
              <li style={{ marginBottom: '4px' }}>Customer-support providers.</li>
              <li style={{ marginBottom: '4px' }}>Fraud-prevention providers.</li>
              <li style={{ marginBottom: '4px' }}>Professional advisers.</li>
              <li style={{ marginBottom: '4px' }}>Government or law-enforcement authorities where legally required or permitted.</li>
            </ul>
            <p style={{ marginTop: '10px' }}>
              We do not sell personal information merely as a means of operating the store.
            </p>
          </section>

          {/* Section 4 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              4. Delivery Information
            </h2>
            <p>
              When you place an order, information necessary to deliver the order may be provided to the relevant logistics provider.
            </p>
            <p>
              This may include your name, phone number, delivery address and order information.
            </p>
          </section>

          {/* Section 5 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              5. Communications
            </h2>
            <p>We may contact you regarding:</p>
            <ul style={{ paddingLeft: '22px', listStyleType: 'disc', marginTop: '8px' }}>
              <li style={{ marginBottom: '4px' }}>Orders.</li>
              <li style={{ marginBottom: '4px' }}>Payments.</li>
              <li style={{ marginBottom: '4px' }}>Delivery.</li>
              <li style={{ marginBottom: '4px' }}>Returns.</li>
              <li style={{ marginBottom: '4px' }}>Account activity.</li>
              <li style={{ marginBottom: '4px' }}>Security.</li>
              <li style={{ marginBottom: '4px' }}>Customer support.</li>
            </ul>
            <p style={{ marginTop: '10px' }}>
              Where applicable, promotional communications may include an option to opt out.
            </p>
          </section>

          {/* Section 6 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              6. Cookies
            </h2>
            <p>The Plain Store may use cookies and similar technologies to:</p>
            <ul style={{ paddingLeft: '22px', listStyleType: 'disc', marginTop: '8px' }}>
              <li style={{ marginBottom: '4px' }}>Keep users signed in.</li>
              <li style={{ marginBottom: '4px' }}>Maintain shopping-cart functionality.</li>
              <li style={{ marginBottom: '4px' }}>Remember preferences.</li>
              <li style={{ marginBottom: '4px' }}>Understand website usage.</li>
              <li style={{ marginBottom: '4px' }}>Improve performance.</li>
              <li style={{ marginBottom: '4px' }}>Support security.</li>
              <li style={{ marginBottom: '4px' }}>Measure marketing effectiveness where applicable.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              7. Data Security
            </h2>
            <p>
              We use reasonable technical and organizational measures designed to protect personal information from unauthorized access, loss, misuse or disclosure.
            </p>
            <p>
              However, no internet transmission or electronic storage system can be guaranteed to be completely secure.
            </p>
          </section>

          {/* Section 8 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              8. Data Retention
            </h2>
            <p>
              We retain information for as long as reasonably necessary for the purposes for which it was collected, including fulfilling orders, maintaining business records, resolving disputes, preventing fraud and complying with applicable legal obligations.
            </p>
          </section>

          {/* Section 9 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              9. Your Rights and Choices
            </h2>
            <p>
              Subject to applicable law, you may have rights relating to your personal data, including rights concerning access, correction, withdrawal of consent where consent is the applicable legal basis, grievance redressal and deletion where applicable.
            </p>
            <p>
              Requests may be submitted using our published contact information.
            </p>
          </section>

          {/* Section 10 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              10. Account Deletion
            </h2>
            <p>
              Where account deletion is available, you may request deletion through the applicable account or support mechanism.
            </p>
            <p>
              Certain information may need to be retained where required by law or reasonably necessary for legitimate business purposes.
            </p>
          </section>

          {/* Section 11 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              11. Children's Privacy
            </h2>
            <p>
              The Plain Store is not intended to independently collect information from children who are not legally capable of entering into applicable transactions.
            </p>
            <p>
              Where required, transactions involving minors should be conducted with the involvement of a parent or legal guardian.
            </p>
          </section>

          {/* Section 12 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              12. Third-Party Websites
            </h2>
            <p>
              Our website may contain links or integrations involving third-party services.
            </p>
            <p>
              Their privacy practices are governed by their respective policies.
            </p>
          </section>

          {/* Section 13 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              13. Changes to this Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy when our practices, services or applicable legal requirements change.
            </p>
            <p>
              The latest version will be published on this website.
            </p>
          </section>

          {/* Section 14 */}
          <section style={{ marginBottom: '10px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              14. Contact
            </h2>
            <p>
              For privacy-related questions or requests, contact The Plain Store using the contact details published on our website:
            </p>
            <div style={{ marginTop: '14px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <p style={{ margin: '0 0 6px 0', fontWeight: '600', color: '#111827' }}>The Plain Store - Privacy & Grievance</p>
              <p style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: '#4b5563' }}>
                Email: <a href="mailto:privacy@theplainstore.com" style={{ color: '#468165', fontWeight: '500' }}>privacy@theplainstore.com</a> &bull; <a href="mailto:support@theplainstore.com" style={{ color: '#468165', fontWeight: '500' }}>support@theplainstore.com</a>
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#4b5563' }}>
                Support Page: <Link to="/contact" style={{ color: '#468165', fontWeight: '500' }}>Contact & Grievance Support</Link>
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
            <Link to="/terms" style={{ color: '#468165', fontSize: '0.9rem', textDecoration: 'none' }}>
              Terms & Conditions
            </Link>
            <Link to="/shipping-policy" style={{ color: '#468165', fontSize: '0.9rem', textDecoration: 'none' }}>
              Shipping Policy
            </Link>
            <Link to="/returns-policy" style={{ color: '#468165', fontSize: '0.9rem', textDecoration: 'none' }}>
              Returns & Refunds
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
