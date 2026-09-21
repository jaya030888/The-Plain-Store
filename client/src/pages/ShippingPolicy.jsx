import React, { useEffect } from 'react';
import { Truck, Clock, MapPin, PackageCheck, AlertCircle, Phone, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ShippingPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-container" style={{ paddingTop: '120px', minHeight: '80vh' }}>
      <div style={{ maxWidth: '880px', margin: '0 auto', padding: '10px 20px 80px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(70, 129, 101, 0.1)', borderRadius: '50%', marginBottom: '12px' }}>
            <Truck size={32} color="#468165" />
          </div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '8px', color: '#1a1a1a', letterSpacing: '-0.5px' }}>
            Shipping & Delivery Policy
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
              1. Delivery Locations
            </h2>
            <p>
              The Plain Store may deliver to locations within India where delivery service is available.
            </p>
            <p>
              Availability may vary by product, postal code and logistics coverage.
            </p>
            <p>
              International delivery, where offered, will be subject to the specific terms displayed at checkout.
            </p>
          </section>

          {/* Section 2 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              2. Processing Time
            </h2>
            <p>
              Orders are normally processed after successful order confirmation and payment authorization where applicable.
            </p>
            <p>
              Processing time may vary depending on the product and seller/fulfillment arrangement.
            </p>
          </section>

          {/* Section 3 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              3. Estimated Delivery
            </h2>
            <p>
              The estimated delivery date displayed during shopping or checkout is based on the delivery destination, product availability and selected shipping method.
            </p>
            <p>
              It is an estimate and may change because of circumstances affecting fulfillment or transportation.
            </p>
          </section>

          {/* Section 4 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              4. Shipping Charges
            </h2>
            <p>
              Applicable shipping charges, if any, will be displayed before the order is completed.
            </p>
            <p>
              Some products, locations or promotional campaigns may qualify for free shipping.
            </p>
          </section>

          {/* Section 5 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              5. Order Tracking
            </h2>
            <p>
              Where tracking is available, tracking information may be provided through your account, order page, email, SMS or other supported communication channels.
            </p>
            <p style={{ marginTop: '10px' }}>
              You can track your order at any time on our <Link to="/track" style={{ color: '#468165', fontWeight: 500 }}>Track Order Page</Link> using your Order ID.
            </p>
          </section>

          {/* Section 6 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              6. Delivery Attempts
            </h2>
            <p>
              The logistics provider may make delivery attempts at the provided address.
            </p>
            <p>
              You may be contacted where additional information is required to complete delivery.
            </p>
          </section>

          {/* Section 7 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              7. Incorrect Address
            </h2>
            <p>
              Customers are responsible for providing accurate delivery information.
            </p>
            <p>
              If an order cannot be delivered because of an incorrect or incomplete address, additional delivery attempts, return-to-origin or other charges may apply where permitted and disclosed.
            </p>
          </section>

          {/* Section 8 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              8. Delayed Delivery
            </h2>
            <p>Delivery may be delayed because of:</p>
            <ul style={{ paddingLeft: '22px', listStyleType: 'disc', marginTop: '8px' }}>
              <li style={{ marginBottom: '4px' }}>Weather.</li>
              <li style={{ marginBottom: '4px' }}>Transportation disruptions.</li>
              <li style={{ marginBottom: '4px' }}>Operational issues.</li>
              <li style={{ marginBottom: '4px' }}>Incorrect address information.</li>
              <li style={{ marginBottom: '4px' }}>Public holidays.</li>
              <li style={{ marginBottom: '4px' }}>Regulatory restrictions.</li>
              <li style={{ marginBottom: '4px' }}>Natural disasters.</li>
              <li style={{ marginBottom: '4px' }}>Other circumstances outside reasonable control.</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              9. Lost or Undelivered Orders
            </h2>
            <p>
              If tracking indicates that an order has been delivered but you have not received it, contact us promptly so that we can investigate with the relevant delivery provider.
            </p>
          </section>

          {/* Section 10 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              10. Damaged Package
            </h2>
            <p>
              If a package appears seriously damaged at delivery, you should document the condition where reasonably possible and contact The Plain Store promptly.
            </p>
          </section>

          {/* Section 11 */}
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              11. Delivery to Another Person
            </h2>
            <p>
              Depending on the delivery method, an order may be received by an authorized person at the delivery address.
            </p>
            <p>
              Customers should ensure that the delivery address is secure and accessible.
            </p>
          </section>

          {/* Section 12 */}
          <section style={{ marginBottom: '10px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              12. Contact
            </h2>
            <p>
              For delivery-related assistance, contact The Plain Store through the customer-support channels listed on the website:
            </p>
            <div style={{ marginTop: '14px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <p style={{ margin: '0 0 6px 0', fontWeight: '600', color: '#111827' }}>The Plain Store - Shipping & Logistics Support</p>
              <p style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: '#4b5563' }}>
                Email: <a href="mailto:support@theplainstore.com" style={{ color: '#468165', fontWeight: '500' }}>support@theplainstore.com</a>
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#4b5563' }}>
                Help Desk: <Link to="/contact" style={{ color: '#468165', fontWeight: '500' }}>Customer Contact Center</Link>
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
            <Link to="/track" style={{ color: '#468165', fontSize: '0.9rem', textDecoration: 'none' }}>
              Track Order
            </Link>
            <Link to="/returns-policy" style={{ color: '#468165', fontSize: '0.9rem', textDecoration: 'none' }}>
              Returns & Refunds
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

export default ShippingPolicy;
