import React, { useEffect } from 'react';
import { Scale, Mail, Phone, MapPin, Clock, ShieldCheck, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const GrievanceRedressalPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-container" style={{ paddingTop: '120px', minHeight: '80vh' }}>
      <div style={{ maxWidth: '880px', margin: '0 auto', padding: '10px 20px 80px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(70, 129, 101, 0.1)', borderRadius: '50%', marginBottom: '12px' }}>
            <Scale size={32} color="#468165" />
          </div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '8px', color: '#1a1a1a', letterSpacing: '-0.5px' }}>
            Grievance Redressal Policy
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            The Plain Store &bull; <strong>Last Updated: September 2026</strong>
          </p>
        </div>

        {/* Content Box */}
        <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', border: '1px solid #ede8de', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', lineHeight: '1.8', color: '#374151' }}>
          
          <div style={{ padding: '18px 22px', backgroundColor: '#fcfbf7', borderRadius: '8px', border: '1px solid #e8e2d5', marginBottom: '32px' }}>
            <p style={{ margin: 0, fontSize: '0.96rem', color: '#444' }}>
              <strong>The Plain Store</strong> is committed to addressing customer complaints fairly and efficiently in accordance with the Consumer Protection (E-Commerce) Rules and applicable Indian consumer laws.
            </p>
          </div>

          {/* Section 1 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              1. How to Raise a Grievance
            </h2>
            <p>Customers may submit a complaint through:</p>
            
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px', background: '#faf8f5', padding: '16px 20px', borderRadius: '8px', border: '1px solid #ede8de' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={16} color="#468165" />
                <span><strong>Email:</strong> <a href="mailto:support@theplainstore.com" style={{ color: '#468165', textDecoration: 'none' }}>support@theplainstore.com</a></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={16} color="#468165" />
                <span><strong>Customer Support:</strong> +91 (Available Mon–Sat, 10:00 AM – 6:00 PM IST)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <MapPin size={16} color="#468165" style={{ flexShrink: 0, marginTop: '4px' }} />
                <span><strong>Address:</strong> The Plain Store, Retail & Logistics Hub, Sector 18, Gurugram, Haryana 122002, India</span>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              2. Information to Include
            </h2>
            <p>Where possible, include:</p>
            <ul style={{ paddingLeft: '22px', listStyleType: 'disc', marginTop: '8px' }}>
              <li style={{ marginBottom: '4px' }}>Name</li>
              <li style={{ marginBottom: '4px' }}>Order number</li>
              <li style={{ marginBottom: '4px' }}>Registered email/mobile number</li>
              <li style={{ marginBottom: '4px' }}>Description of the issue</li>
              <li style={{ marginBottom: '4px' }}>Relevant photographs or documents</li>
              <li style={{ marginBottom: '4px' }}>Preferred resolution</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              3. Acknowledgement
            </h2>
            <p>
              We will acknowledge receipt of a consumer grievance within the period required under applicable law (ordinarily within 48 hours). A unique ticket or reference number will be provided for all grievance submissions.
            </p>
          </section>

          {/* Section 4 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              4. Resolution
            </h2>
            <p>
              We will investigate and seek to resolve grievances within the period prescribed under applicable law (ordinarily within one month / 30 days from the date of receipt of the grievance).
            </p>
          </section>

          {/* Section 5 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              5. Grievance Officer
            </h2>
            <p>
              In accordance with the Information Technology Act, 2000 and Consumer Protection (E-Commerce) Rules, 2020, the details of the designated Grievance Officer are published below:
            </p>
            
            <div style={{ marginTop: '14px', padding: '18px 22px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>Name:</strong> Grievance Officer</div>
              <div><strong>Designation:</strong> Nodal Grievance Redressal Officer</div>
              <div><strong>Email:</strong> <a href="mailto:grievance@theplainstore.com" style={{ color: '#468165', fontWeight: '500' }}>grievance@theplainstore.com</a></div>
              <div><strong>Phone:</strong> +91 (Available Monday to Saturday, 10:00 AM to 6:00 PM IST)</div>
              <div><strong>Address:</strong> The Plain Store, Retail & Logistics Hub, Sector 18, Gurugram, Haryana 122002, India</div>
            </div>
          </section>

          {/* Section 6 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              6. Complaint Tracking
            </h2>
            <p>
              Where a complaint or support system provides a ticket number, customers may use that number to track the status of the complaint by replying to the support thread or contacting our care team.
            </p>
          </section>

          {/* Section 7 */}
          <section style={{ marginBottom: '10px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              7. Escalation
            </h2>
            <p>
              If you believe that your grievance has not been appropriately resolved, you may contact the Grievance Officer using the details above or pursue any remedies available under applicable law.
            </p>
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/contact" className="btn-primary" style={{ padding: '8px 18px', fontSize: '13.5px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                Contact Support Desk <ArrowRight size={15} />
              </Link>
              <Link to="/returns-policy" className="btn-outline" style={{ padding: '8px 18px', fontSize: '13.5px', textDecoration: 'none' }}>
                Returns & Refunds Policy
              </Link>
            </div>
          </section>

        </div>

        {/* Footer Link Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <Link to="/" style={{ color: '#64748b', fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            &larr; Back to Home
          </Link>
          <div style={{ display: 'flex', gap: '18px' }}>
            <Link to="/contact" style={{ color: '#468165', fontSize: '0.9rem', textDecoration: 'none' }}>
              Contact Us
            </Link>
            <Link to="/privacy-policy" style={{ color: '#468165', fontSize: '0.9rem', textDecoration: 'none' }}>
              Privacy Policy
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

export default GrievanceRedressalPolicy;
