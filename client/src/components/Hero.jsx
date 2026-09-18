import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { MOCK_PRODUCTS } from '../data';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const containerRef = useRef(null);
  const slidesRef = useRef([]);
  const navigate = useNavigate();

  // Use the first 4 products for the showcase
  const showcaseProducts = MOCK_PRODUCTS.slice(0, 4);

  useEffect(() => {
    let ctx = gsap.context(() => {
      let mm = gsap.matchMedia();
      const masterTl = gsap.timeline();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // --- 1. Cinematic Entrance Animation ---
        gsap.set('.navbar', { yPercent: -100, opacity: 0 });
        gsap.set(slidesRef.current[0].querySelector('.hero-product-image-container'), { clipPath: 'inset(35% 35% 35% 35%)' });
        gsap.set(slidesRef.current[0].querySelector('.hero-product-img'), { scale: 1.5 });
        gsap.set(slidesRef.current[0].querySelectorAll('.hero-content-anim'), { x: -40, opacity: 0 });

        masterTl
          .to(slidesRef.current[0].querySelector('.hero-product-image-container'), {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.5,
            ease: 'expo.inOut'
          })
          .to(slidesRef.current[0].querySelector('.hero-product-img'), {
            scale: 1,
            duration: 1.5,
            ease: 'power3.out'
          }, '<')
          .to(slidesRef.current[0].querySelectorAll('.hero-content-anim'), {
            x: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power2.out'
          }, '-=0.8')
          .to('.navbar', {
            yPercent: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out'
          }, '-=0.6')
          
          // --- 2. Looping Horizontal Slider ---
          .add(() => {
            // Start the looping animation after entrance finishes
            const loopTl = gsap.timeline({ repeat: -1 });
            const totalSlides = showcaseProducts.length;
            const slideDuration = 3.5; // Time slide is visible
            const transitionDuration = 1.2; // Time to slide in/out
            
            for (let i = 0; i < totalSlides; i++) {
              const currentSlide = slidesRef.current[i];
              const nextSlide = slidesRef.current[(i + 1) % totalSlides];
              
              // Prepare next slide position offscreen right
              loopTl.set(nextSlide, { xPercent: 100, opacity: 1, scale: 0.95 }, `+=${slideDuration}`);
              
              // Slide transition
              loopTl.to(currentSlide, {
                xPercent: -100,
                scale: 0.95,
                opacity: 0,
                duration: transitionDuration,
                ease: 'power3.inOut'
              }, '<');
              
              loopTl.to(nextSlide, {
                xPercent: 0,
                scale: 1,
                opacity: 1,
                duration: transitionDuration,
                ease: 'power3.inOut'
              }, '<');
            }
          });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set('.navbar', { yPercent: 0, opacity: 1 });
        gsap.set(slidesRef.current[0].querySelector('.hero-product-image-container'), { clipPath: 'inset(0% 0% 0% 0%)' });
        gsap.fromTo(slidesRef.current[0], { opacity: 0 }, { opacity: 1, duration: 1 });
      });

    }, containerRef);

    return () => ctx.revert();
  }, [showcaseProducts.length]);

  return (
    <section ref={containerRef} className="hero-scroll-container">
      {/* Stable Background */}
      <div className="hero-stable-bg"></div>

      {showcaseProducts.map((product, index) => (
        <div 
          key={product.id} 
          ref={(el) => (slidesRef.current[index] = el)}
          className="hero-product-slide"
          style={{ 
            zIndex: showcaseProducts.length - index, 
            opacity: index === 0 ? 1 : 0,
            transform: index === 0 ? 'translateX(0)' : 'translateX(100%)'
          }}
        >
          <div className="hero-product-content">
            <div className="hero-product-info">
              <h1 className="hero-title hero-content-anim">{product.title}</h1>
              <p className="hero-subtitle hero-content-anim">{product.description}</p>
              <p className="hero-price hero-content-anim" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '2rem' }}>{product.price}</p>
              <button 
                className="btn-primary hero-content-anim" 
                onClick={() => navigate(`/product/${product.id}`)}
              >
                Discover Product
              </button>
            </div>

            <div className="hero-product-image-wrapper hero-content-anim">
              <div className="hero-product-image-container" style={{ clipPath: index === 0 ? 'inset(35% 35% 35% 35%)' : 'inset(0% 0% 0% 0%)' }}>
                <img 
                  src={product.image} 
                  alt={product.title} 
                  className="hero-product-img" 
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default Hero;
