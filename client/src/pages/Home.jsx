import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HeroProductSlider from '../components/HeroProductSlider';
import ProductList from '../components/ProductList';
import SaleBanner from '../components/SaleBanner';
import { API_URL } from '../utils/api';
import { Sparkles, Layers, Flame } from 'lucide-react';

const asProductArray = (payload) => Array.isArray(payload) ? payload : payload?.products || [];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search');
  const activeCategory = searchParams.get('category') || 'all';
  const showSaleOnly = searchParams.get('onSale') === 'true';

  // Load categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Load products based on search & category & onSale
  useEffect(() => {
    const loadStorefront = async () => {
      setLoading(true);
      setError('');

      try {
        const queryParts = [];
        if (searchQuery) {
          queryParts.push(`search=${encodeURIComponent(searchQuery)}`);
        }
        if (activeCategory && activeCategory !== 'all') {
          queryParts.push(`category=${encodeURIComponent(activeCategory)}`);
        }
        if (showSaleOnly) {
          queryParts.push('onSale=true');
        }
        
        let productsUrl = `${API_URL}/api/products`;
        if (queryParts.length > 0) {
          productsUrl += `?${queryParts.join('&')}`;
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
  }, [searchQuery, activeCategory, showSaleOnly]);

  const handleSelectCategory = (slug) => {
    const nextParams = new URLSearchParams(location.search);
    if (slug === 'all') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', slug);
    }
    const query = nextParams.toString();
    navigate(query ? `/?${query}` : '/', { replace: true });
  };

  const handleToggleSaleFilter = () => {
    const nextParams = new URLSearchParams(location.search);
    if (showSaleOnly) {
      nextParams.delete('onSale');
    } else {
      nextParams.set('onSale', 'true');
    }
    const query = nextParams.toString();
    navigate(query ? `/?${query}` : '/', { replace: true });
  };

  const handleShopSale = () => {
    const nextParams = new URLSearchParams(location.search);
    nextParams.set('onSale', 'true');
    navigate(`/?${nextParams.toString()}`);
    const el = document.getElementById('shop-products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main>
      {featuredProducts.length > 0 && !searchQuery && activeCategory === 'all' && (
        <HeroProductSlider products={featuredProducts} />
      )}

      {/* Seasonal Sale Banner */}
      {!searchQuery && (
        <div style={{ marginTop: (featuredProducts.length > 0 && activeCategory === 'all') ? '40px' : '20px' }}>
          <SaleBanner onShopSale={handleShopSale} saleCount={products.filter(p => p.isOnSale).length} />
        </div>
      )}

      <section 
        id="shop-products-section"
        className={`shop-section ${(featuredProducts.length > 0 && !searchQuery && activeCategory === 'all') ? '' : 'shop-section-without-hero'}`}
      >
        
        {/* Category Navigation Bar */}
        <div style={{ maxWidth: '1200px', margin: '0 auto 30px', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#468165" />
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: '#222' }}>
                {searchQuery 
                  ? `Search results for "${searchQuery}"` 
                  : showSaleOnly 
                  ? '🔥 On-Sale Items' 
                  : 'Browse by Category'}
              </h3>
            </div>
            {!loading && products.length > 0 && (
              <span style={{ fontSize: '13px', color: '#666' }}>
                Showing {products.length} {products.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            overflowX: 'auto', 
            paddingBottom: '8px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            <button
              onClick={() => {
                if (showSaleOnly) {
                  const nextParams = new URLSearchParams(location.search);
                  nextParams.delete('onSale');
                  navigate(nextParams.toString() ? `/?${nextParams.toString()}` : '/', { replace: true });
                }
                handleSelectCategory('all');
              }}
              style={{
                padding: '8px 18px',
                borderRadius: '30px',
                fontSize: '14px',
                fontWeight: activeCategory === 'all' && !showSaleOnly ? '600' : '400',
                background: activeCategory === 'all' && !showSaleOnly ? '#468165' : '#fff',
                color: activeCategory === 'all' && !showSaleOnly ? '#fff' : '#444',
                border: `1.5px solid ${activeCategory === 'all' && !showSaleOnly ? '#468165' : '#e2ddd4'}`,
                boxShadow: activeCategory === 'all' && !showSaleOnly ? '0 2px 8px rgba(70, 129, 101, 0.25)' : 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Layers size={15} /> All Products
            </button>

            {/* Quick Sale Toggle Pill */}
            <button
              onClick={handleToggleSaleFilter}
              style={{
                padding: '8px 18px',
                borderRadius: '30px',
                fontSize: '14px',
                fontWeight: showSaleOnly ? '700' : '500',
                background: showSaleOnly ? '#dc2626' : '#fff',
                color: showSaleOnly ? '#fff' : '#dc2626',
                border: `1.5px solid ${showSaleOnly ? '#dc2626' : '#fecaca'}`,
                boxShadow: showSaleOnly ? '0 2px 8px rgba(220, 38, 38, 0.3)' : 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Flame size={15} color={showSaleOnly ? '#fff' : '#dc2626'} />
              🔥 On Sale
            </button>

            {categories.map((cat) => {
              const isActive = activeCategory === cat.slug && !showSaleOnly;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (showSaleOnly) {
                      const nextParams = new URLSearchParams(location.search);
                      nextParams.delete('onSale');
                      navigate(nextParams.toString() ? `/?${nextParams.toString()}` : '/', { replace: true });
                    }
                    handleSelectCategory(cat.slug);
                  }}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '30px',
                    fontSize: '14px',
                    fontWeight: isActive ? '600' : '400',
                    background: isActive ? '#468165' : '#fff',
                    color: isActive ? '#fff' : '#444',
                    border: `1.5px solid ${isActive ? '#468165' : '#e2ddd4'}`,
                    boxShadow: isActive ? '0 2px 8px rgba(70, 129, 101, 0.25)' : 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>



        <div className="product-listing">
          {loading && <div className="storefront-status">Loading products...</div>}
          {!loading && error && <div className="storefront-status storefront-error">{error}</div>}
          {!loading && !error && products.length === 0 && (
            <div className="storefront-status" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <p style={{ fontSize: '1.1rem', color: '#555', marginBottom: '15px' }}>
                No products found in this category.
              </p>
              <button 
                onClick={() => handleSelectCategory('all')} 
                className="btn-outline"
                style={{ padding: '8px 20px', fontSize: '14px' }}
              >
                View All Products
              </button>
            </div>
          )}
          {!loading && !error && products.length > 0 && <ProductList products={products} />}
        </div>
      </section>
    </main>
  );
};

export default Home;
