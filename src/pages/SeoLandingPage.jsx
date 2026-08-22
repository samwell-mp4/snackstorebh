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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  
  const pageData = seoPages.find(p => p.slug === (pageSlug || seoSlug));

  useEffect(() => {
    window.scrollTo(0, 0);
    setCurrentPage(1);
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
  
  // Lógica de paginação
  const totalPages = Math.ceil(displayedPerfumes.length / itemsPerPage);
  const paginatedPerfumes = displayedPerfumes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

      {/* Header Dinâmico de SEO Premium - Light/Clean Mode */}
      <div style={{ 
        backgroundColor: '#fafafa', 
        color: '#111', 
        padding: '80px 20px', 
        textAlign: 'center',
        borderBottom: '1px solid #eaeaea',
        boxShadow: 'inset 0 -10px 20px rgba(0,0,0,0.01)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: '900', marginBottom: '24px', lineHeight: '1.1', letterSpacing: '-1.5px', color: '#000' }}>
            {pageData.h1}
          </h1>
          <p style={{ fontSize: '19px', lineHeight: '1.7', color: '#555', fontWeight: '400', maxWidth: '680px', margin: '0 auto' }}>
            {pageData.introText}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '40px auto 80px auto', padding: '0 16px' }}>
        
        {/* Breadcrumb minimalista */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#555', textDecoration: 'none', fontWeight: '500' }}>
            <ArrowLeft size={16} /> Voltar à loja
          </Link>
        </div>

        {/* Dynamic Videos Feature Section - Side by Side layout */}
        {pageData.videos && pageData.videos.length > 0 && pageData.videoFeatures && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '40px', 
            marginBottom: '80px',
            alignItems: 'center',
            backgroundColor: '#fff',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
            border: '1px solid #eaeaea'
          }}>
            {/* Video Side */}
            <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#000', aspectRatio: '9/16', maxHeight: '500px', width: '100%', maxWidth: '360px', margin: '0 auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
              <video src={pageData.videos[0]} autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: '16px', left: '16px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '6px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: 'bold', color: '#000' }}>
                Timelapse Original
              </div>
            </div>
            
            {/* Text / Copywriting Side */}
            <div style={{ padding: '20px 0' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '12px' }}>
                {pageData.videoFeatures.eyebrow}
              </span>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: '900', lineHeight: '1.1', marginBottom: '16px', color: '#111', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
                {pageData.videoFeatures.title.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>)}
              </h2>
              <p style={{ fontSize: '16px', color: '#555', lineHeight: '1.6', marginBottom: '32px' }}>
                {pageData.videoFeatures.subtitle}
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {pageData.videoFeatures.bullets.map((bullet, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                       <span style={{ color: '#fff', fontSize: '10px' }}>✓</span>
                    </div>
                    <span style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '30px' }}>
          {paginatedPerfumes.map(product => (
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '60px' }}>
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ padding: '8px 16px', border: '1px solid #eaeaea', backgroundColor: currentPage === 1 ? '#fafafa' : '#fff', color: currentPage === 1 ? '#ccc' : '#000', borderRadius: '99px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '13px', transition: 'all 0.2s' }}
            >
              Anterior
            </button>
            
            <div style={{ display: 'flex', gap: '4px' }}>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  style={{
                    width: '36px', height: '36px', borderRadius: '50%', border: 'none',
                    backgroundColor: currentPage === i + 1 ? '#000' : 'transparent',
                    color: currentPage === i + 1 ? '#fff' : '#555',
                    fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{ padding: '8px 16px', border: '1px solid #eaeaea', backgroundColor: currentPage === totalPages ? '#fafafa' : '#fff', color: currentPage === totalPages ? '#ccc' : '#000', borderRadius: '99px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '13px', transition: 'all 0.2s' }}
            >
              Próxima
            </button>
          </div>
        )}

        {/* Dynamic FAQs Section - Premium UI */}
        {pageData.faqs && pageData.faqs.length > 0 && (
          <div style={{ marginTop: '80px', paddingTop: '40px', borderTop: '2px solid #f0f0f0' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '900', marginBottom: '32px', color: '#111', letterSpacing: '-0.5px' }}>
              Perguntas Frequentes
            </h2>
            <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
              {pageData.faqs.map((faq, index) => (
                <div key={index} style={{ 
                  backgroundColor: '#ffffff', 
                  padding: '28px', 
                  borderRadius: '16px', 
                  border: '1px solid #eaeaea',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0, marginTop: '2px' }}>
                      ?
                    </div>
                    <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#1a1a1a', lineHeight: '1.4', margin: 0 }}>
                      {faq.question}
                    </h3>
                  </div>
                  <p style={{ fontSize: '15px', color: '#555', lineHeight: '1.7', margin: '0 0 0 36px' }}>
                    {faq.answer}
                  </p>
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
