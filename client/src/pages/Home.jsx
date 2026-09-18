import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import HeroProductSlider from '../components/HeroProductSlider';
import ProductList from '../components/ProductList';

const API_URL = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`;
const asProductArray = (payload) => Array.isArray(payload) ? payload : payload?.products || [];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    const loadStorefront = async () => {
      setLoading(true);
      setError('');

      try {
        let productsUrl = `${API_URL}/api/products`;
        if (searchQuery) {
          productsUrl += `?search=${encodeURIComponent(searchQuery)}`;
        }
        
        const [productsResult, featuredResult] = await Promise.allSettled([
          fetch(productsUrl),
          fetch(`${API_URL}/api/products/featured`),
        ]);
        const productsResponse = productsResult.value;
        const featuredResponse = featuredResult.value;

        if (productsResult.status !== 'fulfilled' || !productsResponse.ok) {
          throw new Error('Unable to load products');
        }

        setProducts(asProductArray(await productsResponse.json()));
        if (featuredResult.status === 'fulfilled' && featuredResponse.ok) {
          setFeaturedProducts(asProductArray(await featuredResponse.json()).slice(0, 4));
        }
      } catch (loadError) {
        console.error('Failed to load storefront:', loadError);
        setError('Unable to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadStorefront();
  }, [searchQuery]);

  return (
    <main>
      {featuredProducts.length > 0 && <HeroProductSlider products={featuredProducts} />}
      <section className={`shop-section ${featuredProducts.length > 0 ? '' : 'shop-section-without-hero'}`}>
        <div className="product-listing">
          {loading && <div className="storefront-status">Loading products...</div>}
          {!loading && error && <div className="storefront-status storefront-error">{error}</div>}
          {!loading && !error && products.length === 0 && <div className="storefront-status">No products are available right now.</div>}
          {!loading && !error && products.length > 0 && <ProductList products={products} />}
        </div>
      </section>
    </main>
  );
};

export default Home;
