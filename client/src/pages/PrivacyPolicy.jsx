import React, { useEffect } from 'react';
import { Shield, Lock, Eye, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-container" style={{ paddingTop: '120px', minHeight: '80vh' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto', padding: '10px 20px 80px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(70, 129, 101, 0.1)', borderRadius: '50%', marginBottom: '12px' }}>
            <Shield size={32} color="#468165" />
          </div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '8px', color: '#1a1a1a' }}>Privacy Policy</h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            The Plain Store • Last updated: September 2026
          </p>
        </div>

        {/* Content Box */}
        <div style={{ background: '#fff', padding: '35px', borderRadius: '12px', border: '1px solid #ede8de', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', lineHeight: '1.8', color: '#374151' }}>
          
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              1. Introduction
            </h2>
            <p>
              Welcome to <strong>The Plain Store</strong>. We value the trust you place in us and are dedicated to protecting your privacy and personal data. This Privacy Policy describes how we collect, use, store, and safeguard your personal information when you browse our website, create an account, purchase products, or interact with our customer support.
            </p>
            <p>
              By accessing or using the services of The Plain Store, you agree to the practices outlined in this policy.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              2. Information We Collect
            </h2>
            <p>We collect information necessary to fulfill your orders and enhance your browsing experience:</p>
            <ul style={{ paddingLeft: '20px', listStyleType: 'disc', marginTop: '10px' }}>
              <li style={{ marginBottom: '8px' }}>
                <strong>Contact & Account Details:</strong> Name, email address, phone number, and account credentials when you register.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Delivery & Shipping Information:</strong> House/flat number, street address, city, state, postal/pincode, and recipient contact number.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Transaction & Order Details:</strong> Products ordered, order value, payment status, coupon codes used, and delivery status.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Payment Information:</strong> All online payment transactions are processed securely through certified payment gateways (e.g. Razorpay). The Plain Store does not collect, access, or store your credit/debit card numbers or CVV.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Technical Data:</strong> IP address, device type, browser information, and session data collected via cookies for operational purposes.
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              3. How We Use Your Information
            </h2>
            <p>Your information is utilized solely for lawful and legitimate e-commerce operations, including:</p>
            <ul style={{ paddingLeft: '20px', listStyleType: 'disc', marginTop: '10px' }}>
              <li style={{ marginBottom: '6px' }}>Processing, packing, and delivering your orders.</li>
              <li style={{ marginBottom: '6px' }}>Sending order confirmations, shipment updates, and invoice receipts.</li>
              <li style={{ marginBottom: '6px' }}>Providing customer care, managing returns, and resolving queries.</li>
              <li style={{ marginBottom: '6px' }}>Preventing fraudulent transactions and maintaining site security.</li>
              <li style={{ marginBottom: '6px' }}>Complying with applicable legal, accounting, and tax obligations.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              4. Information Sharing & Third Parties
            </h2>
            <p>
              The Plain Store does not sell, rent, or trade your personal data to any third party for marketing purposes. We share information only with authorized service partners essential for order fulfillment:
            </p>
            <ul style={{ paddingLeft: '20px', listStyleType: 'disc', marginTop: '10px' }}>
              <li style={{ marginBottom: '6px' }}>
                <strong>Logistics & Courier Partners:</strong> Third-party carriers (e.g., Delhivery, BlueDart, Standard Couriers) receive your name, delivery address, and phone number solely to transport and deliver your package.
              </li>
              <li style={{ marginBottom: '6px' }}>
                <strong>Payment Processors:</strong> Certified, PCI-DSS compliant payment gateways that process online transactions securely.
              </li>
              <li style={{ marginBottom: '6px' }}>
                <strong>Legal Authorities:</strong> Only when required by applicable law, court order, or governmental regulation.
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              5. Cookies & Local Storage
            </h2>
            <p>
              We use cookies and browser local storage to maintain session state, remember items added to your shopping cart, and preserve your wishlist across visits. You may configure your browser to reject cookies, though certain shopping features (such as persistent carts) may not function optimally.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              6. Amazon Associates Program & Affiliate Advertising Cookies
            </h2>
            <p>
              <strong>The Plain Store</strong> participates in the Amazon Services LLC Associates Program and the Amazon.in Associates Programme, an affiliate advertising program designed to provide a means for websites to earn advertising fees by advertising and linking to Amazon.in.
            </p>
            <p>
              <strong>As an Amazon Associate I earn from qualifying purchases.</strong> When you click on an external link pointing to Amazon on our website and subsequently make a purchase, Amazon may set third-party cookies on your browser to track the referral and credit qualifying purchases made during the session. These cookies collect non-personally identifiable referral and browsing data in accordance with Amazon’s own Privacy Notice.
            </p>
            <p>
              You can opt out of or control third-party advertising cookies at any time through your web browser preferences. For detailed information regarding how Amazon collects and processes data, please review the Amazon.in Privacy Notice.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              7. Data Security
            </h2>
            <p>
              We employ industry-standard administrative and technical security measures—including SSL/TLS encryption for all data in transit—to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              8. Your Rights
            </h2>
            <p>
              You have the right to access, update, or correct your personal information stored in your account profile. You may also request the deletion of your account and associated personal data by contacting our support team.
            </p>
          </section>

          <section style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              9. Grievance Officer & Contact Information
            </h2>
            <p>
              In accordance with the Information Technology Act 2000 and the Consumer Protection (E-Commerce) Rules 2020, if you have any questions or grievances regarding this Privacy Policy or our data handling practices, you may contact our Grievance Officer:
            </p>
            <div style={{ background: '#faf8f5', padding: '16px', borderRadius: '8px', border: '1px solid #ede8de', marginTop: '12px' }}>
              <p style={{ margin: '0 0 6px 0' }}><strong>The Plain Store — Grievance Officer</strong></p>
              <p style={{ margin: '0 0 6px 0' }}>Email: <a href="mailto:support@theplainstore.com" style={{ color: '#468165' }}>support@theplainstore.com</a></p>
              <p style={{ margin: '0 0 6px 0' }}>Support Hours: Monday to Saturday, 10:00 AM to 6:00 PM IST</p>
              <p style={{ margin: 0 }}>Response Time: Within 48 business hours</p>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
