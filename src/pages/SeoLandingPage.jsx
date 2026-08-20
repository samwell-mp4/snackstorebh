import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead';
import { seoPages } from '../seoPagesData';
import { ArrowLeft, ShoppingBag, Search, ExternalLink } from 'lucide-react';
import { brandCollectionRawMappings } from '../brandCollectionSeoPages';

export default function SeoLandingPage({ pageSlug, perfumes, addToCart }) {
  const { seoSlug } = useParams();
  const navigate = useNavigate();
  const [tableSearch, setTableSearch] = useState('');
  
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

  // Páginas relacionadas do mesmo grupo (linkagem interna para SEO)
  const relatedPages = pageData.group
    ? seoPages.filter(p => p.group === pageData.group && p.slug !== pageData.slug).slice(0, 8)
    : [];

  if (pageData.slug === 'tabela-brand-collection') {
    const filteredMappings = brandCollectionRawMappings.filter(item => {
      const query = tableSearch.toLowerCase();
      const idStr = String(item.id).padStart(3, '0');
      return (
        idStr.includes(query) ||
        item.name.toLowerCase().includes(query) ||
        (item.inspiredBy && item.inspiredBy.toLowerCase().includes(query)) ||
        (item.brand && item.brand.toLowerCase().includes(query))
      );
    });

    return (
      <>
        <SeoHead 
          title={pageData.title}
          description={pageData.description}
          url={`/${pageData.slug}`}
          schemaType="FAQPage"
          faqs={pageData.faqs}
        />

        {/* Header Dinâmico */}
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
          
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#555', textDecoration: 'none' }}>
              <ArrowLeft size={16} /> Voltar à loja
            </Link>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto 40px auto' }}>
            <input
              type="text"
              placeholder="Buscar por número, nome, grife ou inspiração..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              style={{
                width: '100%', padding: '14px 20px 14px 50px', backgroundColor: '#f9f9f9',
                border: '1px solid #e0e0e0', borderRadius: '99px', fontSize: '15px', outline: 'none', color: '#000'
              }}
            />
            <Search size={20} style={{ position: 'absolute', left: '20px', top: '15px', color: '#888' }} />
          </div>

          {/* Look up table */}
          <div style={{ overflowX: 'auto', backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #eee' }}>
                  <th style={{ padding: '16px', fontWeight: 'bold' }}>Número</th>
                  <th style={{ padding: '16px', fontWeight: 'bold' }}>Nome na Caixa</th>
                  <th style={{ padding: '16px', fontWeight: 'bold' }}>Inspiração Olfativa</th>
                  <th style={{ padding: '16px', fontWeight: 'bold' }}>Grife</th>
                  <th style={{ padding: '16px', fontWeight: 'bold' }}>Gênero</th>
                  <th style={{ padding: '16px', fontWeight: 'bold', textAlign: 'center' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {filteredMappings.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#888' }}>
                      Nenhuma inspiração encontrada para "{tableSearch}".
                    </td>
                  </tr>
                ) : (
                  filteredMappings.map(item => {
                    const numStr = String(item.id).padStart(3, '0');
                    const hasInspiration = item.inspiredBy && item.inspiredBy !== '—';
                    
                    // Match with live product catalog dynamically
                    const matchedProduct = perfumes.find(p => 
                      p.categorySlugs?.includes('brand-collection') && 
                      hasInspiration &&
                      (p.name.toLowerCase().includes(item.inspiredBy.toLowerCase()) || 
                       p.description.toLowerCase().includes(item.inspiredBy.toLowerCase()))
                    );

                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '16px', fontWeight: 'bold' }}>
                          <Link to={`/brand-collection-${numStr}`} style={{ color: '#000', textDecoration: 'underline' }}>
                            #{numStr}
                          </Link>
                        </td>
                        <td style={{ padding: '16px', color: '#555' }}>
                          {item.name === '—' ? <span style={{ color: '#aaa' }}>Sem Nome</span> : item.name}
                        </td>
                        <td style={{ padding: '16px', fontWeight: '500' }}>
                          {hasInspiration ? item.inspiredBy : <span style={{ color: '#aaa' }}>Reservado</span>}
                        </td>
                        <td style={{ padding: '16px', color: '#555' }}>
                          {hasInspiration ? item.brand : <span style={{ color: '#aaa' }}>—</span>}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                            backgroundColor: item.gender === 'M' ? '#e3f2fd' : item.gender === 'F' ? '#fce4ec' : '#f5f5f5',
                            color: item.gender === 'M' ? '#1565c0' : item.gender === 'F' ? '#c2185b' : '#616161'
                          }}>
                            {item.gender === 'M' ? 'Masculino' : item.gender === 'F' ? 'Feminino' : 'Unissex'}
                          </span>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          {matchedProduct ? (
                            <button
                              onClick={() => navigate(`/produto/${matchedProduct.slug}`)}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                backgroundColor: '#000', color: '#fff', border: 'none',
                                padding: '8px 16px', borderRadius: '4px', fontSize: '12px',
                                fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase'
                              }}
                            >
                              <ShoppingBag size={12} /> Comprar
                            </button>
                          ) : (
                            <a
                              href={`https://wa.me/553175650503?text=${encodeURIComponent(`Olá! Gostaria de encomendar a miniatura Brand Collection #${numStr} inspired by ${hasInspiration ? `${item.inspiredBy} (${item.brand})` : 'referência'}.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                backgroundColor: '#25D366', color: '#fff', textDecoration: 'none',
                                padding: '8px 16px', borderRadius: '4px', fontSize: '12px',
                                fontWeight: 'bold', textTransform: 'uppercase'
                              }}
                            >
                              <ExternalLink size={12} /> Encomendar
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
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

        {/* Linkagem interna relacionada */}
        {relatedPages.length > 0 && (
          <div style={{ marginTop: '80px', borderTop: '1px solid #eee', paddingTop: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Veja também</h2>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {relatedPages.map(p => (
                <Link
                  key={p.slug}
                  to={`/${p.slug}`}
                  style={{ padding: '10px 18px', backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '99px', textDecoration: 'none', color: '#1a1a1a', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}
                >
                  {p.h1.split(':')[0]}
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
