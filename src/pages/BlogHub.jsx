import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../blogData';
import { SeoHead } from '../components/SeoHead';
import { Calendar, User, ArrowRight, Tag, Search, Sparkles } from 'lucide-react';

export default function BlogHub() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique categories for filters
  const categories = ['Todos', ...new Set(blogPosts.map(post => post.category))];

  // Filter posts based on search query and category
  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'Todos' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Featured post is the most important one (site oficial or first)
  const featuredPost = blogPosts.find(p => p.slug === 'brand-collection-site-oficial') || blogPosts[0];
  
  // Other posts (exclude featured if we are on 'Todos' and search is empty, otherwise show all matching)
  const displayPosts = (selectedCategory === 'Todos' && !searchQuery)
    ? filteredPosts.filter(post => post.slug !== featuredPost.slug)
    : filteredPosts;

  return (
    <>
      <SeoHead 
        title="Blog da Snack Store | Dicas, Resenhas e Guias de Perfumes Importados"
        description="Fique por dentro das últimas tendências em perfumaria de luxo. Leia nossos guias sobre perfumes Brand Collection, árabes, dicas de fixação e mais."
        url="/blog/perfumes/"
      />

      <div style={{ backgroundColor: '#faf9f6', minHeight: '100vh', padding: '60px 0 100px 0', fontFamily: '"Outfit", sans-serif' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          
          {/* Header Section */}
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{ 
              fontSize: '11px', 
              fontWeight: '800', 
              letterSpacing: '3px', 
              textTransform: 'uppercase', 
              color: 'var(--snack-gold)', 
              backgroundColor: 'rgba(196, 161, 90, 0.08)',
              padding: '6px 16px',
              borderRadius: '999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '16px'
            }}>
              <Sparkles size={12} /> Central Editorial Snack Store
            </span>
            <h1 style={{ 
              fontSize: 'clamp(32px, 5vw, 48px)', 
              fontWeight: '800', 
              color: 'var(--snack-green-dark)', 
              fontFamily: 'var(--font-display)',
              margin: '0 0 16px 0',
              letterSpacing: '-0.5px',
              lineHeight: '1.1'
            }}>
              Guia Olfativo & Dicas de Perfumaria
            </h1>
            <p style={{ 
              fontSize: 'clamp(14px, 2vw, 16px)', 
              color: 'var(--snack-muted)', 
              maxWidth: '680px', 
              margin: '0 auto', 
              lineHeight: '1.6' 
            }}>
              Aprenda a escolher fragrâncias de luxo, entenda sobre fixação real, equivalências olfativas da Brand Collection e novidades da perfumaria árabe.
            </p>
          </div>

          {/* Search and Filters Bar */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px', 
            marginBottom: '48px', 
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            paddingBottom: '24px'
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
              <input 
                type="text" 
                placeholder="Pesquisar guias e resenhas..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '14px 20px 14px 48px', 
                  borderRadius: '999px', 
                  border: '1px solid var(--snack-border)', 
                  backgroundColor: '#ffffff', 
                  fontSize: '14px', 
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--snack-gold)';
                  e.target.style.boxShadow = '0 4px 20px rgba(196,161,90,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--snack-border)';
                  e.target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.02)';
                }}
              />
            </div>

            {/* Category Tags */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '10px', 
              flexWrap: 'wrap',
              marginTop: '10px'
            }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '999px',
                    border: '1px solid',
                    borderColor: selectedCategory === cat ? 'var(--snack-green-dark)' : 'rgba(0,0,0,0.06)',
                    backgroundColor: selectedCategory === cat ? 'var(--snack-green-dark)' : '#ffffff',
                    color: selectedCategory === cat ? 'var(--snack-cream)' : 'var(--snack-text)',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: selectedCategory === cat ? '0 4px 15px rgba(41,69,31,0.15)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== cat) {
                      e.target.style.borderColor = 'var(--snack-gold)';
                      e.target.style.color = 'var(--snack-gold)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== cat) {
                      e.target.style.borderColor = 'rgba(0,0,0,0.06)';
                      e.target.style.color = 'var(--snack-text)';
                    }
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Post Card (Only shown if 'Todos' is selected and no search filter) */}
          {selectedCategory === 'Todos' && !searchQuery && featuredPost && (
            <div style={{ marginBottom: '56px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--snack-green-dark)', marginBottom: '20px' }}>Destaque Editorial</h2>
              <div className="blog-featured-card" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                borderRadius: '24px',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                border: '1px solid var(--snack-border)',
                boxShadow: '0 15px 40px rgba(0,0,0,0.03)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}>
                <div style={{ overflow: 'hidden', minHeight: '300px', position: 'relative' }}>
                  <img 
                    src={featuredPost.image} 
                    alt={featuredPost.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }} 
                    className="featured-card-img"
                  />
                  <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: 'var(--snack-gold)', color: 'var(--snack-green-dark)', padding: '6px 14px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {featuredPost.category}
                  </div>
                </div>
                <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--snack-muted)', marginBottom: '16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Calendar size={13} /> {featuredPost.publishDate}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><User size={13} /> {featuredPost.author}</span>
                  </div>
                  <h3 style={{ 
                    fontSize: 'clamp(24px, 3.5vw, 30px)', 
                    fontWeight: '800', 
                    color: 'var(--snack-green-dark)', 
                    lineHeight: '1.2',
                    margin: '0 0 16px 0',
                    fontFamily: 'serif'
                  }}>
                    <Link to={`/blog/${featuredPost.slug}/`} style={{ color: 'inherit', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--snack-gold)'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>
                      {featuredPost.title}
                    </Link>
                  </h3>
                  <p style={{ fontSize: '15px', color: 'var(--snack-muted)', lineHeight: '1.6', margin: '0 0 28px 0' }}>
                    {featuredPost.summary}
                  </p>
                  <div>
                    <Link 
                      to={`/blog/${featuredPost.slug}/`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: 'var(--snack-green-dark)',
                        color: 'var(--snack-cream)',
                        padding: '14px 32px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        textDecoration: 'none',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--snack-green)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--snack-green-dark)'}
                    >
                      Ler Guia Completo <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grid of Other Posts */}
          <div>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '800', 
              letterSpacing: '1px', 
              textTransform: 'uppercase', 
              color: 'var(--snack-green-dark)', 
              marginBottom: '24px' 
            }}>
              {selectedCategory !== 'Todos' || searchQuery ? 'Artigos Encontrados' : 'Mais Artigos e Dicas'}
            </h2>

            {displayPosts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 24px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid var(--snack-border)' }}>
                <p style={{ color: 'var(--snack-muted)', fontSize: '16px', margin: 0 }}>Nenhum artigo encontrado para o termo pesquisado.</p>
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                gap: '32px' 
              }}>
                {displayPosts.map(post => (
                  <article 
                    key={post.slug}
                    className="blog-card"
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '1px solid var(--snack-border)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                    }}
                  >
                    {/* Thumbnail */}
                    <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                      <img 
                        src={post.image || '/assets/campaign/revised_IMG_3243.webp'} 
                        alt={post.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} 
                        className="blog-card-img"
                      />
                      <span style={{ 
                        position: 'absolute', 
                        top: '16px', 
                        left: '16px', 
                        backgroundColor: 'var(--snack-cream)', 
                        color: 'var(--snack-green-dark)', 
                        border: '1px solid var(--snack-border)',
                        padding: '4px 10px', 
                        borderRadius: '4px', 
                        fontSize: '10px', 
                        fontWeight: '700', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.5px' 
                      }}>
                        {post.category}
                      </span>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '24px', flex: '1', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--snack-muted)', marginBottom: '12px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {post.publishDate}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><User size={12} /> {post.author}</span>
                      </div>

                      <h3 style={{ 
                        fontSize: '18px', 
                        fontWeight: '700', 
                        color: 'var(--snack-green-dark)', 
                        lineHeight: '1.4', 
                        margin: '0 0 10px 0',
                        flexShrink: 0
                      }}>
                        <Link to={`/blog/${post.slug}/`} style={{ color: 'inherit', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--snack-gold)'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>
                          {post.title}
                        </Link>
                      </h3>

                      <p style={{ 
                        fontSize: '13.5px', 
                        color: 'var(--snack-muted)', 
                        lineHeight: '1.6', 
                        margin: '0 0 20px 0',
                        flex: '1' 
                      }}>
                        {post.summary}
                      </p>

                      <div style={{ marginTop: 'auto' }}>
                        <Link 
                          to={`/blog/${post.slug}/`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: 'var(--snack-green-dark)',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            textDecoration: 'none',
                            transition: 'color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--snack-gold)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--snack-green-dark)'}
                        >
                          Ler Artigo <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Styled Tag Injection for Transitions */}
      <style>{`
        .blog-featured-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.06) !important;
        }
        .blog-featured-card:hover .featured-card-img {
          transform: scale(1.03);
        }
        .blog-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.04) !important;
        }
        .blog-card:hover .blog-card-img {
          transform: scale(1.05);
        }
      `}</style>
    </>
  );
}
