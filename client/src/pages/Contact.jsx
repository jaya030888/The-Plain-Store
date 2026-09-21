import React, { useState } from 'react';
import { Mail, Clock, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { API_URL } from '../utils/api';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    orderId: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [inquiryId, setInquiryId] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        setInquiryId(data.inquiryId || '');
        setFormData({ name: '', email: '', phone: '', orderId: '', subject: '', message: '' });
      } else {
        setError(data.message || 'Failed to submit message. Please try again.');
      }
    } catch (err) {
      console.error('Contact error:', err);
      setError('Unable to send message. Please check your internet connection or email us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container" style={{ paddingTop: '120px', minHeight: '85vh' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '10px 20px 60px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(70, 129, 101, 0.1)', borderRadius: '50%', marginBottom: '15px' }}>
            <Mail size={32} color="#468165" />
          </div>
          <h1 style={{ fontSize: '2.3rem', marginBottom: '10px', color: '#1a1a1a' }}>Contact Us</h1>
          <p style={{ color: '#666', fontSize: '15px', maxWidth: '520px', margin: '0 auto', lineHeight: '1.6' }}>
            Have a question about an order, product details, or custom assistance? Reach out to <strong>The Plain Store</strong> customer support.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', alignItems: 'start' }}>
          
          {/* Contact Information Card */}
          <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #ede8de', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '20px', color: '#222' }}>Customer Care</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                <div style={{ padding: '10px', background: '#faf8f5', borderRadius: '8px', color: '#468165' }}>
                  <Mail size={20} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Support</h4>
                  <a href="mailto:support@theplainstore.com" style={{ color: '#468165', fontWeight: '600', fontSize: '15px', textDecoration: 'none' }}>
                    support@theplainstore.com
                  </a>
                  <div style={{ fontSize: '12px', color: '#777', marginTop: '2px' }}>Response time: 24–48 business hours</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                <div style={{ padding: '10px', background: '#faf8f5', borderRadius: '8px', color: '#468165' }}>
                  <Clock size={20} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Operating Hours</h4>
                  <div style={{ fontSize: '15px', fontWeight: '500', color: '#333' }}>
                    Monday – Saturday
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>10:00 AM – 6:00 PM IST</div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>(Closed on Sundays & National Holidays)</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                <div style={{ padding: '10px', background: '#faf8f5', borderRadius: '8px', color: '#468165' }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delivery Coverage</h4>
                  <div style={{ fontSize: '15px', fontWeight: '500', color: '#333' }}>Pan-India Shipping</div>
                  <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>
                    Reliable courier delivery across all serviceable pin codes in India.
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '30px', padding: '16px', background: '#faf8f5', borderRadius: '8px', border: '1px solid #f0eae1', fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
              <strong>Need to track your package?</strong><br/>
              Use our live <a href="/track" style={{ color: '#468165', fontWeight: '600', textDecoration: 'underline' }}>Track Order</a> page anytime with your Order ID.
            </div>
          </div>

          {/* Contact Inquiry Form */}
          <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #ede8de', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '8px', color: '#222' }}>Send a Message</h3>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>Fill out the form below and we will respond promptly.</p>

            {submitted ? (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '25px', borderRadius: '8px', textAlign: 'center', color: '#166534' }}>
                <CheckCircle2 size={36} color="#16a34a" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>Message Received!</h4>
                <p style={{ fontSize: '14px', margin: '0 0 10px 0', color: '#15803d' }}>
                  Thank you for reaching out to The Plain Store. Your inquiry reference number is <strong>{inquiryId}</strong>.
                </p>
                <p style={{ fontSize: '13px', margin: 0, color: '#166534' }}>
                  Our customer care team will review your request and reply to your email within 24 to 48 business hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn-outline"
                  style={{ marginTop: '20px', padding: '8px 18px', fontSize: '13px' }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {error && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '6px', fontSize: '13px' }}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '5px' }}>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '5px' }}>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '5px' }}>Phone (Optional)</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit number"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '5px' }}>Order ID (If applicable)</label>
                    <input
                      type="text"
                      name="orderId"
                      value={formData.orderId}
                      onChange={handleChange}
                      placeholder="e.g. #1"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '5px' }}>Subject</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none', background: '#fff' }}
                    >
                      <option value="Order Status">Order Status</option>
                      <option value="Product Question">Product Question</option>
                      <option value="Return / Exchange">Return / Exchange</option>
                      <option value="Shipping Inquiry">Shipping Inquiry</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '5px' }}>Your Message *</label>
                  <textarea
                    name="message"
                    required
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we assist you today?"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                  style={{ padding: '12px 24px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', marginTop: '5px' }}
                >
                  <Send size={16} />
                  <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
                </button>
              </form>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default Contact;
