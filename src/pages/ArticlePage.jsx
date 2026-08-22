import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogPosts } from '../blogData';
import { SeoHead } from '../components/SeoHead';
import { Calendar, User, ArrowLeft, Heart, Share2, Sparkles, MessageCircle } from 'lucide-react';

export default function ArticlePage() {
  const { articleSlug } = useParams();
  const post = blogPosts.find(p => p.slug === articleSlug);

  if (!post) {
    return (
      <div style={{ padding: '120px 24px', textAlign: 'center', fontFamily: '"Outfit", sans-serif', backgroundColor: '#faf9f6', minHeight: '80vh' }}>
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '40px', backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid var(--snack-border)' }}>
          <h1 style={{ fontSize: '28px', color: 'var(--snack-green-dark)', fontWeight: '800', marginBottom: '16px' }}>Guia Não Encontrado</h1>
          <p style={{ margin: '0 0 32px 0', color: 'var(--snack-muted)', fontSize: '15px', lineHeight: '1.6' }}>
            O artigo olfativo que você está procurando pode ter sido movido ou removido.
          </p>
          <Link to="/blog/perfumes/" style={{ 
            display: 'inline-block', 
            backgroundColor: 'var(--snack-gold)', 
            color: 'var(--snack-green-dark)', 
            padding: '14px 28px', 
            borderRadius: '999px', 
            textDecoration: 'none', 
            fontWeight: 'bold',
            fontSize: '13px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Voltar ao Blog
          </Link>
        </div>
      </div>
    );
  }

  // Handle share action
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.summary,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link do artigo copiado para a área de transferência!");
    }
  };

  return (
    <>
      <SeoHead 
        title={`${post.title} | Blog Snack Store`}
        description={post.description}
        url={`/blog/${post.slug}/`}
        schemaType="BlogPosting"
        faqs={post.faqs}
      />

      <div style={{ backgroundColor: '#faf9f6', minHeight: '100vh', padding: '40px 0 100px 0', fontFamily: '"Outfit", sans-serif' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
          
          {/* Navigation Breadcrumb */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <Link 
              to="/blog/perfumes/" 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px', 
                color: 'var(--snack-green-dark)', 
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--snack-gold)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--snack-green-dark)'}
            >
              <ArrowLeft size={16} /> Voltar ao Blog
            </Link>

            {/* Micro Share Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={handleShare}
                aria-label="Compartilhar Artigo"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '38px', 
                  height: '38px', 
                  borderRadius: '50%', 
                  backgroundColor: '#ffffff', 
                  border: '1px solid var(--snack-border)', 
                  cursor: 'pointer',
                  color: 'var(--snack-text)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--snack-gold)'; e.currentTarget.style.color = 'var(--snack-gold)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--snack-border)'; e.currentTarget.style.color = 'var(--snack-text)'; }}
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>

          {/* Main Article Container */}
          <article style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '24px', 
            overflow: 'hidden', 
            border: '1px solid var(--snack-border)', 
            boxShadow: '0 15px 45px rgba(0,0,0,0.02)' 
          }}>
            
            {/* Banner/Featured Image */}
            <div style={{ height: 'clamp(250px, 45vw, 420px)', width: '100%', overflow: 'hidden', position: 'relative' }}>
              <img 
                src={post.image || '/assets/campaign/revised_IMG_3243.webp'} 
                alt={post.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <div style={{ 
                position: 'absolute', 
                bottom: 0, 
                left: 0, 
                right: 0, 
                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)', 
                padding: '40px 32px 32px 32px' 
              }}>
                <span style={{ 
                  backgroundColor: 'var(--snack-gold)', 
                  color: 'var(--snack-green-dark)', 
                  padding: '4px 12px', 
                  borderRadius: '4px', 
                  fontSize: '11px', 
                  fontWeight: 'bold', 
                  textTransform: 'uppercase', 
                  letterSpacing: '1px',
                  display: 'inline-block',
                  marginBottom: '12px'
                }}>
                  {post.category}
                </span>
                <h1 style={{ 
                  color: '#ffffff', 
                  fontSize: 'clamp(22px, 4vw, 36px)', 
                  fontWeight: '800', 
                  margin: 0, 
                  lineHeight: '1.2',
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  fontFamily: 'serif'
                }}>
                  {post.h1 || post.title}
                </h1>
              </div>
            </div>

            {/* Article Inner Wrapper */}
            <div style={{ padding: '40px 32px' }}>
              
              {/* Metadata & Author Bar */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                flexWrap: 'wrap', 
                gap: '16px',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                paddingBottom: '20px',
                marginBottom: '32px'
              }}>
                <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: 'var(--snack-muted)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {post.publishDate}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><User size={14} /> Por: {post.author}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--snack-gold)', fontWeight: 'bold' }}>
                  <Sparkles size={14} /> Leitura Estimada: ~5 min
                </div>
              </div>

              {/* Rich Body Content */}
              <div 
                className="blog-content-body"
                style={{ 
                  maxWidth: '740px',
                  margin: '0 auto',
                  fontSize: '16.5px', 
                  color: 'var(--snack-text)', 
                  lineHeight: '1.8'
                }}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

            </div>
          </article>

          {/* Styled FAQ Section (EEAT) */}
          {post.faqs && post.faqs.length > 0 && (
            <div style={{ marginTop: '48px' }}>
              <h2 style={{ 
                fontSize: '22px', 
                fontWeight: '800', 
                color: 'var(--snack-green-dark)', 
                marginBottom: '24px', 
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <MessageCircle size={22} style={{ color: 'var(--snack-gold)' }} /> Dúvidas Frequentes Resolvidas
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {post.faqs.map((faq, idx) => (
                  <div 
                    key={idx}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      padding: '24px 28px',
                      border: '1px solid var(--snack-border)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.01)'
                    }}
                  >
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--snack-green-dark)', margin: '0 0 10px 0', lineHeight: '1.4' }}>
                      {faq.question}
                    </h3>
                    <p style={{ fontSize: '14.5px', color: 'var(--snack-muted)', lineHeight: '1.6', margin: 0 }}>
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Conversion Banner (Stunning CTA) */}
          <div style={{ 
            marginTop: '56px',
            background: 'linear-gradient(135deg, var(--snack-green-dark) 0%, #11200e 100%)', 
            color: 'var(--snack-cream)', 
            padding: '48px 36px', 
            borderRadius: '24px', 
            textAlign: 'center',
            border: '1px solid rgba(196,161,90,0.15)',
            boxShadow: '0 15px 40px rgba(41,69,31,0.1)'
          }}>
            <span style={{ 
              color: 'var(--snack-gold)', 
              fontSize: '11px', 
              fontWeight: '800', 
              letterSpacing: '3px', 
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '12px'
            }}>
              Oferta Exclusiva Snack Store
            </span>
            <h3 style={{ fontSize: 'clamp(20px, 3.5vw, 26px)', fontWeight: '800', margin: '0 0 16px 0', lineHeight: '1.3' }}>
              Leve a Essência do Luxo para a Sua Rotina
            </h3>
            <p style={{ fontSize: '14.5px', color: 'rgba(245,241,232,0.8)', maxWidth: '560px', margin: '0 auto 28px auto', lineHeight: '1.6' }}>
              Explore nossa curadoria de miniaturas de 25ml importadas e árabes com preço fixo de R$ 79,90 e ganhe frete grátis em BH a partir de 2 perfumes.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link 
                to="/mini-perfumes-25ml/"
                style={{
                  backgroundColor: 'var(--snack-gold)',
                  color: 'var(--snack-green-dark)',
                  textDecoration: 'none',
                  padding: '14px 36px',
                  borderRadius: '999px',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  boxShadow: '0 4px 15px rgba(196,161,90,0.2)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e0b85a'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--snack-gold)'; }}
              >
                Ver Miniaturas 25ml
              </Link>
              <Link 
                to="/brand-collection/equivalencias"
                style={{
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.25)',
                  textDecoration: 'none',
                  padding: '14px 36px',
                  borderRadius: '999px',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ffffff'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                Tabela de Equivalências
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Styled Tag Injection for Body Layout */}
      <style>{`
        .blog-content-body p {
          margin: 0 0 20px 0;
          color: var(--snack-text);
        }
        .blog-content-body h2 {
          font-size: 22px;
          font-weight: 800;
          color: var(--snack-green-dark);
          margin: 36px 0 16px 0;
          font-family: serif;
        }
        .blog-content-body h3 {
          font-size: 18px;
          font-weight: 800;
          color: var(--snack-green-dark);
          margin: 28px 0 12px 0;
        }
        .blog-content-body ul, .blog-content-body ol {
          margin: 0 0 24px 0;
          padding-left: 20px;
        }
        .blog-content-body li {
          margin-bottom: 8px;
          color: var(--snack-text);
        }
        .blog-content-body strong {
          color: var(--snack-green-dark);
        }
      `}</style>
    </>
  );
}
