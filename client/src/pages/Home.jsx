import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tag } from 'lucide-react';
import HeroProductSlider from '../components/HeroProductSlider';
import ProductList from '../components/ProductList';
import { API_URL } from '../utils/api';
import { cachedFetch } from '../utils/apiCache';

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

  // Load categories once with deduplicated cache
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await cachedFetch(`${API_URL}/api/categories`, {}, 120000);
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Load products based on search & category & onSale with parallel cached fetches
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
        
        const [productsData, featuredData] = await Promise.all([
          cachedFetch(productsUrl, {}, 60000),
          cachedFetch(`${API_URL}/api/products/featured`, {}, 60000).catch(() => [])
        ]);

        setProducts(asProductArray(productsData));
        setFeaturedProducts(asProductArray(featuredData).slice(0, 4));
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

  const handleSaleDropdownChange = (value) => {
    const nextParams = new URLSearchParams(location.search);
    if (value === 'sale') {
      nextParams.set('onSale', 'true');
    } else {
      nextParams.delete('onSale');
    }
    const query = nextParams.toString();
    navigate(query ? `/?${query}` : '/', { replace: true });
  };

  const currentCategoryObj = categories.find((c) => c.slug === activeCategory);
  const currentCategoryName = currentCategoryObj?.name;

  let headerTitle = 'Browse by Category';
  if (searchQuery) {
    headerTitle = `Search results for "${searchQuery}"`;
  } else if (showSaleOnly && activeCategory !== 'all') {
    headerTitle = `${currentCategoryName || 'Category'} — On Sale`;
  } else if (showSaleOnly) {
    headerTitle = 'All On-Sale Items';
  } else if (activeCategory !== 'all') {
    headerTitle = currentCategoryName || 'Category';
  }

  return (
    <main>
      {featuredProducts.length > 0 && !searchQuery && activeCategory === 'all' && !showSaleOnly && (
        <HeroProductSlider products={featuredProducts} />
      )}

      <section 
        id="shop-products-section"
        className={`shop-section ${(featuredProducts.length > 0 && !searchQuery && activeCategory === 'all' && !showSaleOnly) ? '' : 'shop-section-without-hero'}`}
      >
        
        {/* Category & Filter Navigation Bar */}
        <div style={{ marginBottom: '25px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {headerTitle}
                {showSaleOnly && (
                  <span style={{ fontSize: '12px', background: '#8F422E', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                    SALE
                  </span>
                )}
              </h3>
            </div>

            {/* Dropdown Selector for All Products vs On Sale */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label htmlFor="sale-view-dropdown" style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                  Filter:
                </label>
                <select
                  id="sale-view-dropdown"
                  value={showSaleOnly ? 'sale' : 'all'}
                  onChange={(e) => handleSaleDropdownChange(e.target.value)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '20px',
                    border: showSaleOnly ? '1.5px solid #8F422E' : '1.5px solid #cbd5e1',
                    backgroundColor: showSaleOnly ? '#fffaf8' : '#ffffff',
                    color: showSaleOnly ? '#8F422E' : '#1e293b',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: showSaleOnly ? '0 1px 4px rgba(143,66,46,0.15)' : '0 1px 2px rgba(0,0,0,0.04)'
                  }}
                >
                  <option value="all">
                    All Products {activeCategory !== 'all' ? `(${currentCategoryName || 'in Category'})` : ''}
                  </option>
                  <option value="sale">
                    On Sale Only {activeCategory !== 'all' ? `(${currentCategoryName || 'in Category'})` : ''}
                  </option>
                </select>
              </div>

              {!loading && products.length > 0 && (
                <span style={{ fontSize: '13px', color: '#666', background: '#f3f4f6', padding: '4px 10px', borderRadius: '12px' }}>
                  {products.length} {products.length === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>
          </div>

          {/* Category Tabs & Quick Sale Pill */}
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            overflowX: 'auto', 
            paddingBottom: '8px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            {/* All Categories Tab */}
            <button
              onClick={() => handleSelectCategory('all')}
              style={{
                padding: '8px 18px',
                borderRadius: '30px',
                fontSize: '14px',
                fontWeight: activeCategory === 'all' ? '600' : '400',
                background: activeCategory === 'all' ? '#468165' : '#fff',
                color: activeCategory === 'all' ? '#fff' : '#444',
                border: `1.5px solid ${activeCategory === 'all' ? '#468165' : '#E6DEC9'}`,
                boxShadow: activeCategory === 'all' ? '0 2px 8px rgba(70, 129, 101, 0.25)' : 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              All Categories
            </button>

            {/* Quick Sale Toggle Pill */}
            <button
              onClick={handleToggleSaleFilter}
              style={{
                padding: '8px 18px',
                borderRadius: '30px',
                fontSize: '14px',
                fontWeight: showSaleOnly ? '600' : '500',
                background: showSaleOnly ? '#8F422E' : '#fff',
                color: showSaleOnly ? '#fff' : '#8F422E',
                border: `1.5px solid ${showSaleOnly ? '#8F422E' : '#E5D5CB'}`,
                boxShadow: showSaleOnly ? '0 2px 8px rgba(143, 66, 46, 0.2)' : 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Tag size={13} />
              <span>{showSaleOnly ? 'On Sale (Active)' : 'On Sale'}</span>
            </button>

            {/* Category Pills */}
            {categories.map((cat) => {
              const isActive = activeCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.slug)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '30px',
                    fontSize: '14px',
                    fontWeight: isActive ? '600' : '400',
                    background: isActive ? '#468165' : '#fff',
                    color: isActive ? '#fff' : '#444',
                    border: `1.5px solid ${isActive ? '#468165' : '#E6DEC9'}`,
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

          {/* Active Sale Filter Banner */}
          {showSaleOnly && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 12px', background: '#fdf2f0', borderRadius: '16px', border: '1px solid #fecdd3', fontSize: '12px', color: '#9f1239', marginTop: '10px' }}>
              <Tag size={12} />
              <span>
                Showing only <strong>On-Sale</strong> products {activeCategory !== 'all' ? `in ${currentCategoryName}` : 'across all categories'}
              </span>
              <button
                onClick={() => handleSaleDropdownChange('all')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9f1239', fontWeight: 'bold', padding: '0 4px', display: 'inline-flex', alignItems: 'center', textDecoration: 'underline' }}
                title="View all products"
              >
                Clear sale filter
              </button>
            </div>
          )}
        </div>

        <div className="product-listing">
          {loading && (
            <div className="product-grid" aria-label="Loading products">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="product-card" style={{ opacity: 0.75, pointerEvents: 'none' }}>
                  <div className="product-image-wrapper" style={{ backgroundColor: '#ECE7DD', minHeight: '260px' }} />
                  <div className="product-info" style={{ padding: '16px 0 0 0' }}>
                    <div style={{ height: '14px', backgroundColor: '#E2DDD2', borderRadius: '4px', width: '70%', marginBottom: '8px' }} />
                    <div style={{ height: '18px', backgroundColor: '#E2DDD2', borderRadius: '4px', width: '40%', marginBottom: '14px' }} />
                    <div style={{ height: '38px', backgroundColor: '#E2DDD2', borderRadius: '20px', width: '100%' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && error && <div className="storefront-status storefront-error">{error}</div>}
          {!loading && !error && products.length === 0 && (
            <div className="storefront-status" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <p style={{ fontSize: '1.1rem', color: '#555', marginBottom: '15px' }}>
                {showSaleOnly 
                  ? `No items currently on sale in ${currentCategoryName || 'this category'}.` 
                  : 'No products found in this category.'}
              </p>
              {showSaleOnly ? (
                <button 
                  onClick={() => handleSaleDropdownChange('all')} 
                  className="btn-primary" 
                  style={{ border: 'none', cursor: 'pointer', display: 'inline-block' }}
                >
                  View All {currentCategoryName ? `${currentCategoryName} Products` : 'Products'}
                </button>
              ) : (
                <button 
                  onClick={() => handleSelectCategory('all')} 
                  className="btn-primary" 
                  style={{ border: 'none', cursor: 'pointer', display: 'inline-block' }}
                >
                  View All Categories
                </button>
              )}
            </div>
          )}
          {!loading && !error && products.length > 0 && (
            <ProductList products={products} />
          )}
        </div>
      </section>
    </main>
  );
};

export default Home;
