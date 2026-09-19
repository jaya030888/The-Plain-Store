import React, { useEffect } from 'react';
import { Sparkles, Package, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-container" style={{ paddingTop: '120px', minHeight: '85vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '10px 20px 80px' }}>
        
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(70, 129, 101, 0.1)', borderRadius: '50%', marginBottom: '15px' }}>
            <Sparkles size={32} color="#468165" />
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '12px', color: '#1a1a1a', fontFamily: 'var(--font-main)', fontWeight: '700' }}>
            About The Plain Store
          </h1>
          <p style={{ color: '#555', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto', lineHeight: '1.7' }}>
            Designing intentional spaces through minimalist lifestyle essentials, refined home decor, and functional organizational pieces.
          </p>
        </div>

        {/* Brand Narrative Cards */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', border: '1px solid #ede8de', boxShadow: '0 4px 25px rgba(0,0,0,0.03)', marginBottom: '40px', lineHeight: '1.8', color: '#374151' }}>
          
          <div style={{ marginBottom: '35px' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#111827', marginBottom: '12px' }}>Our Story & Philosophy</h2>
            <p style={{ marginBottom: '15px' }}>
              <strong>The Plain Store</strong> was founded on a simple realization: the objects we surround ourselves with shape our daily peace of mind. In a world crowded with clutter and fleeting trends, we wanted to curate lifestyle essentials that stand out for their calm, understated aesthetics and practical utility.
            </p>
            <p>
              From solid wooden organizers that declutter your desk to ceramic vases and wellness accents that bring warmth into your living space, each product is chosen to integrate seamlessly into your modern routine.
            </p>
          </div>

          <div style={{ marginBottom: '35px' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#111827', marginBottom: '12px' }}>What We Offer</h2>
            <p style={{ marginBottom: '15px' }}>
              Our curated catalog spans thoughtfully designed everyday lifestyle categories:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '15px' }}>
              <div style={{ background: '#faf8f5', padding: '20px', borderRadius: '8px', border: '1px solid #f0eae1' }}>
                <h4 style={{ margin: '0 0 6px 0', color: '#468165', fontSize: '1.05rem' }}>Home Decor</h4>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#666' }}>
                  Minimalist ceramic vases, stone coasters, and decorative accents designed to add calm character to any room.
                </p>
              </div>

              <div style={{ background: '#faf8f5', padding: '20px', borderRadius: '8px', border: '1px solid #f0eae1' }}>
                <h4 style={{ margin: '0 0 6px 0', color: '#468165', fontSize: '1.05rem' }}>Organization</h4>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#666' }}>
                  Handcrafted wooden jewellery boxes, desktop organizers, and functional trays to keep your spaces orderly.
                </p>
              </div>

              <div style={{ background: '#faf8f5', padding: '20px', borderRadius: '8px', border: '1px solid #f0eae1' }}>
                <h4 style={{ margin: '0 0 6px 0', color: '#468165', fontSize: '1.05rem' }}>Wellness & Living</h4>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#666' }}>
                  Incense holders, essential oil diffusers, and organic textiles crafted to elevate moments of daily calm.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: '1.4rem', color: '#111827', marginBottom: '12px' }}>Our Commitment to Customers</h2>
            <p style={{ marginBottom: '15px' }}>
              At The Plain Store, our relationship with you does not end when you place an order. We are dedicated to providing:
            </p>
            <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
              <li style={{ marginBottom: '8px' }}>
                <strong>Prompt Pan-India Delivery:</strong> Orders are dispatched within 1–2 business days with full online tracking.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Hassle-Free Returns:</strong> A straightforward 7-day return policy for eligible products.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Dedicated Support:</strong> Real, responsive customer care available Monday through Saturday to answer questions and resolve inquiries.
              </li>
            </ul>
          </div>

          {/* Editorial Transparency & Amazon Associates Disclosure */}
          <div style={{ marginTop: '35px', paddingTop: '30px', borderTop: '1px solid #eee' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#111827', marginBottom: '12px' }}>
              Editorial Independence & Amazon Associates Participation
            </h2>
            <div style={{ background: '#f8faf9', border: '1px solid #c8ddd2', borderRadius: '8px', padding: '16px 20px', marginBottom: '16px' }}>
              <p style={{ margin: '0 0 6px 0', fontWeight: 600, color: '#1b4332' }}>
                As an Amazon Associate I earn from qualifying purchases.
              </p>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#444', lineHeight: 1.6 }}>
                The Plain Store is an independent e-commerce brand and curated lifestyle publication. We participate in the Amazon Services LLC Associates Program and the Amazon.in Associates Programme, an affiliate advertising initiative that enables independent websites to earn referral fees by recommending and linking to products on Amazon.in.
              </p>
            </div>
            <p style={{ fontSize: '0.92rem', color: '#555', lineHeight: 1.6, margin: 0 }}>
              Please note: The Plain Store is an independent business. We are not owned, operated, or officially endorsed by Amazon.com, Inc. or any of its affiliates. All Amazon product recommendations on our site are independently curated by our editorial team. Links pointing to Amazon are paid affiliate links.
            </p>
          </div>

        </div>

        {/* Call to Action Bar */}
        <div style={{ background: '#f5f1e7', padding: '30px', borderRadius: '12px', textAlign: 'center', border: '1px solid #ede8de', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#222' }}>Explore The Plain Store Collection</h3>
          <p style={{ margin: 0, color: '#666', fontSize: '14px', maxWidth: '450px' }}>
            Browse our catalog to discover functional minimalist essentials designed for your space.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/" className="btn-primary" style={{ padding: '10px 24px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              Browse Store <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="btn-outline" style={{ padding: '10px 24px', fontSize: '14px' }}>
              Contact Customer Support
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;
