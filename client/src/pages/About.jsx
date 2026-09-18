import React from 'react';

const About = () => {
  return (
    <div className="page-container" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', paddingTop: '160px' }}>
      <h1 className="section-title" style={{ marginTop: 0 }}>About Us</h1>
      <div style={{ fontSize: '1.2rem', color: 'var(--color-text-light)', lineHeight: '1.8' }}>
        <p style={{ marginBottom: '20px' }}>
          Welcome to The Plain Store. We believe in simplicity, elegance, and quality.
        </p>
        <p style={{ marginBottom: '20px' }}>
          Our journey started with a simple idea: everyday items should be beautiful and functional. 
          We carefully curate and craft products that bring a touch of minimalist elegance to your life.
        </p>
        <p>
          Thank you for being part of our story.
        </p>
      </div>
    </div>
  );
};

export default About;
