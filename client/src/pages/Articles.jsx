import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Calendar, Search, ArrowRight, ShieldCheck } from 'lucide-react';
import { ARTICLES_DATA } from '../data/articlesData';

const CATEGORIES = [
  'All',
  'Home Decor',
  'Organization',
  'Workspace',
  'Wellness & Living',
  'Guides & Care',
  'Product Reviews'
];

const Articles = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = ARTICLES_DATA.filter((article) => {
    const matchesCategory = activeCategory === 'All' || article.category === activeCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="articles-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '120px 20px 80px 20px' }}>
      {/* Header & Title */}
      <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 40px auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#F5F1E7', color: '#468165', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid #e2dac9', marginBottom: '16px' }}>
          <BookOpen size={16} />
          <span>Independent Editorial Guides</span>
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 700, color: '#1a1a1a', marginBottom: '14px', lineHeight: 1.2 }}>
          Guides & Articles for Mindful Living
        </h1>
        <p style={{ fontSize: '1.05rem', color: '#666', lineHeight: 1.6 }}>
          Practical advice, decluttering strategies, and curated buying recommendations to help you create a calm, functional home.
        </p>

        {/* Amazon Associate Statutory Disclosure Notice */}
        <div className="affiliate-disclosure-banner" style={{ marginTop: '24px', background: '#ffffff', border: '1px solid #d4e5dc', borderRadius: '10px', padding: '14px 20px', textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <ShieldCheck size={20} color="#468165" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.5 }}>
            <strong style={{ color: '#222' }}>Amazon Associate Disclosure: </strong>
            As an Amazon Associate I earn from qualifying purchases. Our editorial team independently selects and reviews all products. When you purchase through links on our site, we may earn an affiliate commission at no additional cost to you. Product links directed to Amazon are paid links.
          </div>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '40px', borderBottom: '1px solid #eaeaea', paddingBottom: '24px' }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                background: activeCategory === cat ? '#468165' : '#ffffff',
                color: activeCategory === cat ? '#ffffff' : '#555',
                border: activeCategory === cat ? '1px solid #468165' : '1px solid #ddd',
                padding: '8px 16px',
                borderRadius: '24px',
                fontSize: '0.88rem',
                fontWeight: activeCategory === cat ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', minWidth: '260px', flex: '0 1 320px' }}>
          <Search size={18} color="#888" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search guides & topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '24px', border: '1px solid #ccc', fontSize: '0.9rem', outline: 'none' }}
          />
        </div>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
          <h3>No articles found matching "{searchQuery}"</h3>
          <p>Try searching for a different keyword or selecting "All" categories.</p>
        </div>
      ) : (
        <div className="articles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 290px), 1fr))', gap: '24px' }}>
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              className="article-card"
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #e8e6e1',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              {/* Cover Image */}
              <Link to={`/articles/${article.slug}`} style={{ textDecoration: 'none', display: 'block', height: '210px', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={article.coverImage}
                  alt={article.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                  loading="lazy"
                />
                <span style={{ position: 'absolute', top: '14px', left: '14px', background: 'rgba(23, 32, 27, 0.85)', color: '#ffffff', fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
                  {article.category}
                </span>
              </Link>

              {/* Card Body */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.8rem', color: '#777', marginBottom: '10px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} /> {article.publishedAt}
                  </span>
                  <span>&bull;</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} /> {article.readTime}
                  </span>
                </div>

                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2421', lineHeight: 1.4, margin: '0 0 10px 0' }}>
                  <Link to={`/articles/${article.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {article.title}
                  </Link>
                </h2>

                <p style={{ fontSize: '0.92rem', color: '#555', lineHeight: 1.6, margin: '0 0 20px 0', flexGrow: 1 }}>
                  {article.excerpt}
                </p>

                <div style={{ borderTop: '1px solid #f0eee6', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#888' }}>
                    By {article.author}
                  </span>
                  <Link
                    to={`/articles/${article.slug}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#468165',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      textDecoration: 'none'
                    }}
                  >
                    Read Guide <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Articles;
