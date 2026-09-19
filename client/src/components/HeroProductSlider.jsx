import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { replaceWithFallbackImage } from '../utils/productImage';

const HeroProductSlider = ({ products }) => {
  const containerRef = useRef(null);
  const slidesRef = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const timerRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const navigate = useNavigate();

  const totalSlides = products.length;
  const displayTime = 3000; // 3 seconds hold
  const transitionTime = 1; // 1 second animation

  // Set initial states
  useEffect(() => {
    let ctx = gsap.context(() => {
      // Hide all slides initially except the first one
      slidesRef.current.forEach((slide, i) => {
        if (i !== 0) {
          gsap.set(slide, { xPercent: 100, opacity: 0, scale: 0.85 });
          // Also pre-hide text
          gsap.set(slide.querySelectorAll('.h-slide-text'), { x: 30, opacity: 0 });
        } else {
          gsap.set(slide, { xPercent: 0, opacity: 1, scale: 1 });
          gsap.set(slide.querySelectorAll('.h-slide-text'), { x: 0, opacity: 1 });
        }
      });

      // Optional: Initial cinematic entrance for slide 0
      gsap.from(slidesRef.current[0].querySelector('.h-slide-image'), {
        scale: 1.2,
        duration: 1.5,
        ease: 'power3.out'
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const goToSlide = useCallback((nextIndex, direction = 'next') => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const currentIndex = activeIndexRef.current;
    const currentSlide = slidesRef.current[currentIndex];
    const incomingSlide = slidesRef.current[nextIndex];

    const outX = direction === 'next' ? -100 : 100;
    const inX = direction === 'next' ? 100 : -100;

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimatingRef.current = false;
        activeIndexRef.current = nextIndex;
        setActiveIndex(nextIndex);
      }
    });

    // Prepare incoming slide
    tl.set(incomingSlide, { xPercent: inX, opacity: 0, scale: 0.85 });
    tl.set(incomingSlide.querySelectorAll('.h-slide-text'), { x: direction === 'next' ? 30 : -30, opacity: 0 });

    // Animate current out
    tl.to(currentSlide, {
      xPercent: outX,
      opacity: 0,
      scale: 0.9,
      duration: transitionTime,
      ease: 'power3.inOut'
    }, 0);
    
    tl.to(currentSlide.querySelectorAll('.h-slide-text'), {
      x: direction === 'next' ? -30 : 30,
      opacity: 0,
      duration: transitionTime * 0.8,
      ease: 'power2.inOut'
    }, 0);

    // Animate next in
    tl.to(incomingSlide, {
      xPercent: 0,
      opacity: 1,
      scale: 1,
      duration: transitionTime,
      ease: 'power3.inOut'
    }, 0);

    tl.to(incomingSlide.querySelectorAll('.h-slide-text'), {
      x: 0,
      opacity: 1,
      duration: transitionTime * 0.9,
      stagger: 0.1,
      ease: 'power2.out'
    }, transitionTime * 0.2);

  }, []);

  const nextSlide = useCallback(() => {
    if (totalSlides < 2) return;
    const next = (activeIndexRef.current + 1) % totalSlides;
    goToSlide(next, 'next');
  }, [goToSlide, totalSlides]);

  const prevSlide = useCallback(() => {
    if (totalSlides < 2) return;
    const prev = (activeIndexRef.current - 1 + totalSlides) % totalSlides;
    goToSlide(prev, 'prev');
  }, [goToSlide, totalSlides]);

  const resetAutoplay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      nextSlide();
    }, displayTime + transitionTime * 1000);
  }, [nextSlide]);

  useEffect(() => {
    if (totalSlides < 2) return undefined;
    resetAutoplay();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetAutoplay, totalSlides]);

  const handleNext = () => {
    nextSlide();
    resetAutoplay();
  };

  const handlePrev = () => {
    prevSlide();
    resetAutoplay();
  };

  return (
    <section className="h-slider-section" ref={containerRef}>
      {/* Slider Track */}
      <div className="h-slider-track">
        {products.map((product, i) => (
          <div 
            key={product.id} 
            className="h-slide"
            ref={el => slidesRef.current[i] = el}
          >
            <div className="h-slide-content">
              
              <div className="h-slide-info">
                <h2 className="h-slide-title h-slide-text">{product.title}</h2>
                <p className="h-slide-desc h-slide-text">{product.description}</p>
                <p className="h-slide-price h-slide-text">
                  {product.price}
                  {product.stock !== undefined && product.stock !== null && Number(product.stock) <= 0 && (
                    <span style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 600, marginLeft: '10px' }}>
                      (Out of Stock)
                    </span>
                  )}
                </p>
                
                <div className="h-slide-text">
                  <button 
                    className="btn-primary" 
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    Discover Product
                  </button>
                </div>
              </div>

              <div 
                className="h-slide-image-wrapper"
                onClick={() => navigate(`/product/${product.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <img src={product.image} alt={product.title} className="h-slide-image" onError={(event) => replaceWithFallbackImage(event, product.id)} />
              </div>
              
            </div>
          </div>
        ))}
      </div>

      {/* Side Navigation Arrows */}
      {totalSlides > 1 && <>
        <button className="h-control-btn h-control-prev" onClick={handlePrev} aria-label="Previous">
          <ArrowLeft size={24} />
        </button>
        <button className="h-control-btn h-control-next" onClick={handleNext} aria-label="Next">
          <ArrowRight size={24} />
        </button>
      </>}

      {/* Dots Indicator */}
      {totalSlides > 1 && <div className="h-dots-container">
        {products.map((_, idx) => (
          <button 
            key={idx} 
            className={`h-dot ${idx === activeIndex ? 'active' : ''}`}
            onClick={() => {
              if (idx !== activeIndexRef.current && !isAnimatingRef.current) {
                const direction = idx > activeIndexRef.current ? 'next' : 'prev';
                goToSlide(idx, direction);
                resetAutoplay();
              }
            }}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>}
    </section>
  );
};

export default HeroProductSlider;
