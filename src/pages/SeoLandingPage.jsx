import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead';
import { seoPages } from '../seoPagesData';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

export default function SeoLandingPage({ pageSlug, perfumes, addToCart }) {
  const { seoSlug } = useParams();
  const navigate = useNavigate();
  
  const pageData = seoPages.find(p => p.slug === (pageSlug || seoSlug));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pageSlug, seoSlug]);

  if (!pageData) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2>Página não encontrada</h2>
        <Link to="/">Voltar para a loja inicial</Link>
      </div>
    );
  }

  // Obter a lista de produtos filtrada dinamicamente pelas regras de SEO
  const displayedPerfumes = pageData.filterRule(perfumes);

  return (
    <>
      <SeoHead 
        title={pageData.title}
        description={pageData.description}
        url={`/${pageData.slug}`}
        schemaType="FAQPage"
        faqs={pageData.faqs}
      />

      {/* Header Dinâmico de SEO */}
      <div style={{ backgroundColor: '#000', color: '#fff', padding: '60px 16px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '24px', lineHeight: '1.2' }}>
            {pageData.h1}
          </h1>
          <p style={{ fontSize: '18px', lineHeight: '1.6', color: '#ccc' }}>
            {pageData.introText}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '40px auto 80px auto', padding: '0 16px' }}>
        
        {/* Breadcrumb minimalista */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#555', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Voltar à loja
          </Link>
        </div>

        <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '30px' }}>
          {displayedPerfumes.map(product => (
            <div key={`seo-${product.code}`} className="product-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fff' }}>
              <div 
                style={{ cursor: 'pointer', flexGrow: 1 }}
                onClick={() => navigate(`/produto/${product.slug}`)}
              >
                <div style={{ position: 'relative', height: '300px', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                  <img src={product.image} alt={product.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} loading="lazy" />
                  <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#fff', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold' }}>
                    {product.volume}
                  </div>
                </div>
                
                <div style={{ padding: '16px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{product.brand}</span>
                    <span style={{ fontSize: '11px', backgroundColor: '#f0f0f0', padding: '2px 8px', borderRadius: '10px' }}>{product.gender}</span>
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 12px 0', lineHeight: '1.4' }}>{product.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '14px', color: '#999', textDecoration: 'line-through' }}>R$ 119,90</span>
                    <span style={{ fontSize: '18px', fontWeight: '900', color: '#000' }}>R$ {product.price.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => addToCart(product)}
                style={{ width: '100%', backgroundColor: '#fff', color: '#000', border: '1px solid #000', padding: '12px', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.2s', marginTop: 'auto' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#000'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#000'; }}
              >
                <ShoppingBag size={16} /> Adicionar
              </button>
            </div>
          ))}
        </div>

        {/* Dynamic FAQs Section */}
        {pageData.faqs && pageData.faqs.length > 0 && (
          <div style={{ marginTop: '80px', borderTop: '1px solid #eee', paddingTop: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Perguntas Frequentes</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {pageData.faqs.map((faq, index) => (
                <div key={index} style={{ backgroundColor: '#fafafa', padding: '24px', borderRadius: '4px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>{faq.question}</h3>
                  <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6', margin: 0 }}>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
