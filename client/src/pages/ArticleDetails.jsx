import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, ShieldCheck, ExternalLink, Tag, CheckCircle2, ChevronRight } from 'lucide-react';
import { ARTICLES_DATA } from '../data/articlesData';

const ArticleDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const article = ARTICLES_DATA.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div style={{ maxWidth: '800px', margin: '140px auto 80px auto', textAlign: 'center', padding: '0 20px' }}>
        <h2>Guide Not Found</h2>
        <p style={{ color: '#666', marginTop: '10px' }}>
          The requested guide could not be located.
        </p>
        <button
          className="btn-primary"
          onClick={() => navigate('/articles')}
          style={{ marginTop: '20px' }}
        >
          View All Guides
        </button>
      </div>
    );
  }

  const relatedArticles = ARTICLES_DATA
    .filter((a) => a.id !== article.id && (a.category === article.category || Math.random() > 0.5))
    .slice(0, 3);

  return (
    <div className="article-reader-container" style={{ maxWidth: '880px', margin: '0 auto', padding: '120px 24px 80px 24px' }}>
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#666', marginBottom: '24px', flexWrap: 'wrap' }}>
        <Link to="/" style={{ color: '#666', textDecoration: 'none' }}>Home</Link>
        <ChevronRight size={14} />
        <Link to="/articles" style={{ color: '#666', textDecoration: 'none' }}>Guides & Articles</Link>
        <ChevronRight size={14} />
        <span style={{ color: '#468165', fontWeight: 500 }}>{article.category}</span>
      </nav>

      <button
        onClick={() => navigate('/articles')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          color: '#468165',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: 600,
          marginBottom: '20px',
          padding: 0
        }}
      >
        <ArrowLeft size={18} /> Back to all articles
      </button>

      {/* Article Header */}
      <header style={{ marginBottom: '30px' }}>
        <span style={{ display: 'inline-block', background: '#F5F1E7', color: '#468165', fontSize: '0.8rem', fontWeight: 600, padding: '4px 12px', borderRadius: '14px', border: '1px solid #e2dac9', marginBottom: '14px' }}>
          {article.category}
        </span>
        <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.25, margin: '0 0 16px 0' }}>
          {article.title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.88rem', color: '#666', flexWrap: 'wrap', borderBottom: '1px solid #eaeaea', paddingBottom: '20px' }}>
          <span>By <strong>{article.author}</strong></span>
          <span>&bull;</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={15} /> Published: {article.publishedAt}
          </span>
          <span>&bull;</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={15} /> {article.readTime}
          </span>
        </div>
      </header>

      {/* Mandatory Statutory Amazon Associate Disclosure Notice */}
      <aside className="affiliate-disclosure-card" style={{ background: '#f8faf9', border: '1px solid #c9ded3', borderRadius: '10px', padding: '16px 20px', marginBottom: '36px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        <ShieldCheck size={22} color="#468165" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.86rem', color: '#333', lineHeight: 1.55 }}>
          <strong style={{ color: '#1a1a1a' }}>Editorial Disclosure: </strong>
          <strong>As an Amazon Associate I earn from qualifying purchases.</strong> We independently test, curate, and review products. If you click on links pointing to Amazon and make a purchase, we may receive an affiliate commission at no additional cost to you. Such links are designated as <em>(paid link)</em> in accordance with the Amazon Associates Program Operating Agreement.
        </div>
      </aside>

      {/* Featured Cover Image */}
      <div style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '40px', boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }}>
        <img
          src={article.coverImage}
          alt={article.title}
          style={{ width: '100%', height: 'auto', maxHeight: '460px', objectFit: 'cover', display: 'block' }}
        />
      </div>

      {/* Article Content */}
      <article className="article-body" style={{ fontSize: '1.05rem', lineHeight: 1.8, color: '#2b2b2b' }}>
        <p style={{ fontSize: '1.15rem', lineHeight: 1.7, color: '#333', fontStyle: 'italic', marginBottom: '32px' }}>
          {article.intro}
        </p>

        {article.sections.map((sec, idx) => (
          <section key={idx} style={{ marginBottom: '36px' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 600, color: '#1a1a1a', margin: '0 0 14px 0' }}>
              {sec.heading}
            </h2>
            <p style={{ margin: 0 }}>
              {sec.content}
            </p>
          </section>
        ))}

        {/* Featured Editorial Recommendations (Affiliate Products) */}
        {article.recommendations && article.recommendations.length > 0 && (
          <div style={{ marginTop: '50px', borderTop: '2px solid #eaeaea', paddingTop: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Tag size={20} color="#468165" />
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: '#1a1a1a' }}>
                Featured Recommendations & Buying Options
              </h3>
            </div>
            <p style={{ fontSize: '0.92rem', color: '#666', marginBottom: '24px' }}>
              Handpicked selections reviewed by our team. Live pricing and availability are determined directly on Amazon.in.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {article.recommendations.map((rec, rIdx) => (
                <div
                  key={rIdx}
                  className="affiliate-product-card"
                  style={{
                    background: '#ffffff',
                    border: '1px solid #dfded8',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '1.18rem', fontWeight: 600, color: '#1f2421', margin: 0 }}>
                      {rec.title}
                    </h4>
                    <span style={{ fontSize: '0.75rem', background: '#f5f1e7', color: '#666', padding: '3px 8px', borderRadius: '6px', border: '1px solid #e0d8c7' }}>
                      Editorial Pick
                    </span>
                  </div>

                  <p style={{ fontSize: '0.94rem', color: '#444', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                    {rec.rationale}
                  </p>

                  {rec.features && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                      {rec.features.map((feat, fIdx) => (
                        <li key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', color: '#555' }}>
                          <CheckCircle2 size={14} color="#468165" style={{ flexShrink: 0 }} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', borderTop: '1px solid #f0eee6', paddingTop: '16px' }}>
                    <a
                      href={rec.amazonUrl}
                      target="_blank"
                      rel="nofollow noopener sponsored"
                      className="btn-primary"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        textDecoration: 'none',
                        padding: '10px 20px',
                        fontSize: '0.92rem',
                        fontWeight: 600
                      }}
                    >
                      Check latest price on Amazon <ExternalLink size={15} />
                    </a>
                    <span style={{ fontSize: '0.8rem', color: '#666', fontStyle: 'italic' }}>
                      (paid link)
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#888', marginTop: '10px' }}>
                    * Product prices and availability are accurate as of the date/time indicated and are subject to change. Any price and availability information displayed on Amazon.in at the time of purchase will apply to the purchase of this product.
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Related Guides */}
      {relatedArticles.length > 0 && (
        <section style={{ marginTop: '70px', borderTop: '1px solid #eaeaea', paddingTop: '40px' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '24px' }}>
            Related Guides You Might Enjoy
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {relatedArticles.map((rel) => (
              <Link
                key={rel.id}
                to={`/articles/${rel.slug}`}
                style={{
                  textDecoration: 'none',
                  background: '#ffffff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <img src={rel.coverImage} alt={rel.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} loading="lazy" />
                <div style={{ padding: '14px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.72rem', color: '#468165', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>{rel.category}</span>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#222', margin: '0 0 8px 0', lineHeight: 1.4 }}>{rel.title}</h4>
                  <span style={{ fontSize: '0.75rem', color: '#888', marginTop: 'auto' }}>{rel.readTime}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ArticleDetails;
