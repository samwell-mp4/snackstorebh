import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead';
import { seoPages } from '../seoPagesData';
import { ArrowLeft, ShoppingBag, Search, ExternalLink, Check } from 'lucide-react';
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

  const renderWhatsappLayout = () => {
    const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/Ewekdu2vXJq45pJ5MHFZio?utm_source=google&utm_medium=organic&utm_campaign=grupo_whatsapp_perfumes";
    const limitPerfumes = paginatedPerfumes.slice(0, 4);

    return (
      <>
        <SeoHead 
          title={pageData.title}
          description={pageData.description}
          url={`/${pageData.slug}`}
          schemaType="FAQPage"
          faqs={pageData.faqs}
        />

        <div style={{ backgroundColor: 'var(--snack-paper)', color: 'var(--snack-text)', minHeight: '100vh' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px 0 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--snack-muted)' }}>
              <Link to="/" style={{ color: 'var(--snack-green-dark)', textDecoration: 'none', fontWeight: 'bold' }}>Início</Link>
              <span>&gt;</span>
              {pageData.slug === 'grupos-whatsapp' ? (
                <span style={{ color: '#888' }}>Grupos WhatsApp</span>
              ) : (
                <>
                  <Link to="/grupos-whatsapp/" style={{ color: 'var(--snack-green-dark)', textDecoration: 'none', fontWeight: 'bold' }}>Grupos WhatsApp</Link>
                  <span>&gt;</span>
                  <span style={{ color: '#888' }}>{pageData.h1}</span>
                </>
              )}
            </div>
          </div>

          <header style={{ 
            backgroundColor: '#F6F2E9', 
            borderBottom: '1px solid rgba(30, 64, 24, 0.1)',
            padding: '60px 16px 80px 16px',
            margin: '20px 0 60px 0'
          }}>
            <div style={{ 
              maxWidth: '1200px', 
              margin: '0 auto', 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
              gap: '40px',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: 'bold', 
                  letterSpacing: '2.5px', 
                  color: 'var(--snack-gold)',
                  textTransform: 'uppercase'
                }}>
                  Comunidade Oficial • Entrada Gratuita
                </span>
                <h1 style={{ 
                  fontSize: 'clamp(32px, 4.5vw, 48px)', 
                  fontWeight: '900', 
                  color: '#1E4018',
                  fontFamily: 'var(--font-display)',
                  lineHeight: '1.1',
                  textTransform: 'uppercase',
                  margin: 0
                }}>
                  {pageData.h1}
                </h1>
                <p style={{ 
                  fontSize: '18px', 
                  lineHeight: '1.6', 
                  color: 'var(--snack-text)',
                  fontWeight: '400',
                  margin: 0
                }}>
                  {pageData.introText}
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                  <a 
                    href={WHATSAPP_GROUP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      backgroundColor: '#1E4018',
                      color: '#F6F2E9',
                      textDecoration: 'none',
                      padding: '18px 36px',
                      borderRadius: '999px',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '1.5px',
                      boxShadow: '0 8px 24px rgba(30, 64, 24, 0.2)',
                      transition: 'all 0.2s',
                      textAlign: 'center'
                    }}
                  >
                    💬 ENTRAR NO GRUPO DO WHATSAPP
                  </a>
                  <span style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
                    ✓ Novidades • ✓ Reposições • ✓ Ofertas Exclusivas
                  </span>
                </div>
              </div>

              <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
                <img 
                  src={pageData.slug.includes('arabes') || pageData.slug.includes('lattafa')
                    ? '/assets/campaign/revised_IMG_3254.webp'
                    : '/assets/campaign/revised_IMG_3297.webp'
                  } 
                  alt="Coleção de Perfumes Snack Store" 
                  style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '500px', objectFit: 'cover' }}
                />
                <div style={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                  padding: '24px',
                  color: '#fff'
                }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold' }}>Snack Store BH</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#ccc' }}>Pequenos frascos. Grandes histórias. Direto no seu WhatsApp.</p>
                </div>
              </div>
            </div>

            <div style={{ 
              maxWidth: '1200px', 
              margin: '60px auto 0 auto', 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
              gap: '20px'
            }}>
              {[
                { title: 'PERFUMES ÁRABES', desc: 'As fragrâncias mais desejadas do momento', badge: 'Lattafa & Armaf' },
                { title: 'MINIATURAS 25ML', desc: 'Frascos colecionáveis de alta fixação', badge: 'Brand Collection' },
                { title: 'NOVIDADES', desc: 'Alertas imediatos assim que chegam', badge: 'Lançamentos' },
                { title: 'OFERTAS', desc: 'Descontos no Pix e combos promocionais', badge: 'Exclusivas' }
              ].map((card, idx) => (
                <div key={idx} style={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid rgba(30, 64, 24, 0.05)', 
                  borderRadius: '16px', 
                  padding: '20px', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                }}>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--snack-gold)', letterSpacing: '1px', textTransform: 'uppercase' }}>{card.badge}</span>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1E4018', margin: '4px 0 8px 0' }}>{card.title}</h4>
                  <p style={{ fontSize: '12px', color: '#666', margin: 0, lineHeight: '1.4' }}>{card.desc}</p>
                </div>
              ))}
            </div>
          </header>

          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px 80px 16px' }}>

            {pageData.slug === 'grupos-whatsapp' && (
              <section style={{ marginBottom: '80px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1E4018', textAlign: 'center', marginBottom: '40px', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
                  Nossas Comunidades Temáticas
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                  {seoPages.filter(p => p.group === 'whatsapp-groups' && p.slug !== 'grupos-whatsapp').map(groupPage => (
                    <div key={groupPage.slug} style={{ 
                      backgroundColor: '#fff', 
                      borderRadius: '20px', 
                      border: '1px solid #eaeaea', 
                      padding: '30px', 
                      boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '20px'
                    }}>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1E4018', margin: '0 0 12px 0' }}>{groupPage.h1}</h3>
                        <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5', margin: 0 }}>{groupPage.description}</p>
                      </div>
                      <Link 
                        to={`/${groupPage.slug}/`}
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          padding: '12px 20px', 
                          backgroundColor: '#F6F2E9', 
                          color: '#1E4018', 
                          textDecoration: 'none', 
                          borderRadius: '99px', 
                          fontSize: '12px', 
                          fontWeight: 'bold',
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                          textAlign: 'center'
                        }}
                      >
                        Acessar Grupo →
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section style={{ marginBottom: '80px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1E4018', textAlign: 'center', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
                O que você encontra no nosso grupo?
              </h2>
              <p style={{ color: '#666', textAlign: 'center', maxWidth: '600px', margin: '0 auto 48px auto', fontSize: '15px' }}>
                Ao fazer parte do grupo de WhatsApp Snack Store, você tem acesso em primeira mão a uma curadoria pensada para amantes de fragrâncias.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
                {[
                  { title: 'Perfumes Importados', desc: 'Seleção das principais fragrâncias de grifes mundiais disponíveis na Snack Store.' },
                  { title: 'Perfumes Árabes', desc: 'Os maiores lançamentos e novidades da Lattafa, Armaf, Afnan e outros nomes procurados.' },
                  { title: 'Miniaturas 25ml', desc: 'Frascos compactos idênticos aos de luxo, ideais para levar na bolsa e colecionar.' },
                  { title: 'Novidades', desc: 'Avisos imediatos de reposições de estoque e lançamentos recentes no mercado.' },
                  { title: 'Ofertas', desc: 'Preços especiais, cupons extras e combos imperdíveis divulgados na comunidade.' }
                ].map((item, idx) => (
                  <div key={idx} style={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '20px', 
                    padding: '24px', 
                    boxShadow: '0 8px 24px rgba(0,0,0,0.02)',
                    border: '1px solid rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#F6F2E9', color: '#1E4018', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginBottom: '16px' }}>
                      ✓
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1E4018', marginBottom: '8px' }}>{item.title}</h3>
                    <p style={{ fontSize: '13px', color: '#666', margin: 0, lineHeight: '1.5' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section style={{ 
              backgroundColor: '#1E4018', 
              borderRadius: '24px', 
              padding: '48px 32px', 
              color: '#F6F2E9', 
              marginBottom: '80px',
              textAlign: 'center'
            }}>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', fontFamily: 'var(--font-display)', color: 'var(--snack-gold)', marginBottom: '16px', textTransform: 'uppercase' }}>
                Grupo de Ofertas de Perfumes no WhatsApp
              </h2>
              <p style={{ maxWidth: '750px', margin: '0 auto 32px auto', fontSize: '15px', color: 'rgba(246, 242, 233, 0.85)', lineHeight: '1.6' }}>
                Não perca nenhuma oportunidade olfativa. Divulgamos no nosso canal as promoções semanais, cupons relâmpago, descontos generosos para pagamentos no Pix e condições especiais de frete grátis para toda a região de Belo Horizonte. O grupo é silenciado e você recebe apenas as melhores curadorias de ofertas.
              </p>
              <a 
                href={WHATSAPP_GROUP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--snack-gold)',
                  color: '#1E4018',
                  textDecoration: 'none',
                  padding: '16px 32px',
                  borderRadius: '999px',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                💬 RECEBER OFERTAS NO WHATSAPP
              </a>
            </section>

            {limitPerfumes.length > 0 && (
              <section style={{ marginBottom: '80px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1E4018', textAlign: 'center', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
                  {pageData.slug.includes('arabes') || pageData.slug.includes('lattafa') ? 'Fragrâncias Árabes em Destaque' : 'Alguns dos Nossos Perfumes Desejados'}
                </h2>
                <p style={{ color: '#666', textAlign: 'center', maxWidth: '600px', margin: '0 auto 40px auto', fontSize: '15px' }}>
                  Essas e outras marcas renomadas como Lattafa, Armaf, Dior e Chanel são notificadas no grupo oficial.
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '30px', marginBottom: '40px' }}>
                  {limitPerfumes.map(product => {
                    const isOut = (product.stock !== undefined && product.stock <= 0) || product.is_active === false;
                    return (
                    <div key={product.code} style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #eaeaea', overflow: 'hidden', padding: '16px', opacity: isOut ? 0.85 : 1 }}>
                      <div style={{ cursor: 'pointer', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9', borderRadius: '12px', padding: '12px', position: 'relative' }} onClick={() => navigate(`/produto/${product.slug}`)}>
                        <img src={product.image} alt={product.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', filter: isOut ? 'grayscale(35%)' : 'none' }} />
                        <div style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#fff', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', border: '1px solid rgba(0,0,0,0.05)' }}>{product.volume}</div>
                        {isOut && (
                          <div style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: '#ef4444', color: '#fff', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>ESGOTADO</div>
                        )}
                      </div>
                      <div style={{ padding: '12px 0 0 0', display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
                        <span style={{ fontSize: '10px', color: 'var(--snack-gold)', fontWeight: 'bold', textTransform: 'uppercase' }}>{product.brand}</span>
                        <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#1a1a1a', margin: 0, lineHeight: '1.4' }}>{product.name}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <span style={{ fontSize: '16px', fontWeight: '900', color: isOut ? '#9ca3af' : '#1e4018' }}>R$ {product.price.toFixed(2).replace('.', ',')}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => { if (!isOut) addToCart(product); }}
                        disabled={isOut}
                        style={{ 
                          width: '100%', 
                          backgroundColor: isOut ? '#e5e7eb' : '#1E4018', 
                          color: isOut ? '#9ca3af' : '#F6F2E9', 
                          border: 'none', padding: '10px', borderRadius: '8px', 
                          fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', 
                          cursor: isOut ? 'not-allowed' : 'pointer', 
                          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '12px' 
                        }}
                      >
                        <ShoppingBag size={14} /> {isOut ? 'Esgotado' : 'Adicionar'}
                      </button>
                    </div>
                  );
                })}
                </div>

                <div style={{ textAlign: 'center' }}>
                  <Link 
                    to={pageData.slug.includes('arabes') || pageData.slug.includes('lattafa') ? '/perfumes-arabes/' : '/mini-perfumes-25ml/'}
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      padding: '12px 30px', 
                      border: '1px solid #1E4018', 
                      color: '#1E4018', 
                      textDecoration: 'none', 
                      borderRadius: '99px', 
                      fontSize: '12px', 
                      fontWeight: 'bold',
                      letterSpacing: '1px',
                      textTransform: 'uppercase'
                    }}
                  >
                    Ver Catálogo Completo →
                  </Link>
                </div>
              </section>
            )}

            {pageData.faqs && pageData.faqs.length > 0 && (
              <section style={{ marginBottom: '80px', borderTop: '1px solid #eee', paddingTop: '60px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1E4018', textAlign: 'center', marginBottom: '32px', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
                  Perguntas Frequentes
                </h2>
                <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
                  {pageData.faqs.map((faq, idx) => (
                    <div key={idx} style={{ 
                      backgroundColor: '#ffffff', 
                      padding: '24px', 
                      borderRadius: '16px', 
                      border: '1px solid rgba(0,0,0,0.05)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
                    }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1E4018', margin: '0 0 8px 0', lineHeight: '1.4' }}>{faq.question}</h3>
                      <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', margin: 0 }}>{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section style={{ 
              border: '1px solid var(--snack-gold)', 
              borderRadius: '24px', 
              padding: '60px 24px', 
              backgroundColor: '#F6F2E9', 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--snack-gold)', letterSpacing: '2px', textTransform: 'uppercase' }}>Snack Store BH</span>
              <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#1E4018', margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                PEQUENOS FRASCOS.<br/>GRANDES HISTÓRIAS.
              </h2>
              <p style={{ color: '#555', maxWidth: '500px', margin: '0 0 16px 0', fontSize: '14px', lineHeight: '1.5' }}>
                Descubra novas fragrâncias em miniaturas de alta qualidade e acompanhe todas as reposições e novidades direto no seu WhatsApp.
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <a 
                  href={WHATSAPP_GROUP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: '#1E4018',
                    color: '#F6F2E9',
                    textDecoration: 'none',
                    padding: '14px 28px',
                    borderRadius: '99px',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    boxShadow: '0 4px 12px rgba(30,64,24,0.15)'
                  }}
                >
                  ENTRAR NO GRUPO DO WHATSAPP
                </a>
                <Link 
                  to="/mini-perfumes-25ml/"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#1E4018',
                    border: '1px solid #1E4018',
                    textDecoration: 'none',
                    padding: '14px 28px',
                    borderRadius: '99px',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                >
                  VER MINIATURAS
                </Link>
              </div>
            </section>

          </div>
        </div>
      </>
    );
  };

  const renderResellerLayout = () => {
    const WHATSAPP_RESELLER_LINK = "https://wa.me/553175650503?text=Olá! Quero receber a tabela de preços e catálogo para compras no atacado/revenda de mini perfumes.&utm_source=google&utm_medium=organic&utm_campaign=revenda_lojistas_perfumes";
    const b2bPerfumes = paginatedPerfumes.slice(0, 4);

    return (
      <>
        <SeoHead 
          title={pageData.title}
          description={pageData.description}
          url={`/${pageData.slug}`}
          schemaType="FAQPage"
          faqs={pageData.faqs}
        />

        <div style={{ backgroundColor: 'var(--snack-paper)', color: 'var(--snack-text)', minHeight: '100vh' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px 0 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--snack-muted)' }}>
              <Link to="/" style={{ color: 'var(--snack-green-dark)', textDecoration: 'none', fontWeight: 'bold' }}>Início</Link>
              <span>&gt;</span>
              <span style={{ color: '#888' }}>{pageData.h1}</span>
            </div>
          </div>

          <header style={{ 
            background: 'linear-gradient(135deg, var(--snack-green-dark) 0%, #11200e 100%)',
            borderBottom: '1px solid rgba(196,161,90,0.2)',
            padding: '80px 16px',
            color: 'var(--snack-cream)',
            margin: '20px 0 60px 0',
            textAlign: 'center'
          }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--snack-gold)', display: 'block', marginBottom: '16px' }}>
                Distribuição Direta B2B • Oportunidade Comercial
              </span>
              <h1 style={{ 
                fontSize: 'clamp(32px, 5vw, 54px)', 
                fontWeight: 'bold', 
                fontFamily: 'var(--font-display)', 
                margin: '0 0 20px 0', 
                lineHeight: '1.1', 
                textTransform: 'uppercase', 
                letterSpacing: '1px' 
              }}>
                {pageData.h1}
              </h1>
              <p style={{ 
                fontSize: '16px', 
                color: 'rgba(245,241,232,0.85)', 
                lineHeight: '1.6', 
                marginBottom: '32px', 
                fontWeight: '300' 
              }}>
                {pageData.introText}
              </p>

              <a 
                href={WHATSAPP_RESELLER_LINK}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--snack-gold)',
                  color: 'var(--snack-green-dark)',
                  textDecoration: 'none',
                  padding: '16px 36px',
                  borderRadius: '999px',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  boxShadow: '0 4px 15px rgba(196,161,90,0.3)',
                  transition: 'all 0.2s'
                }}
              >
                💬 FALAR COM ATENDIMENTO (ATACADO)
              </a>
            </div>
          </header>

          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px 80px 16px' }}>

            <section style={{ marginBottom: '80px' }}>
              <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <span style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--snack-gold)' }}>Nossa Parceria</span>
                <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--snack-green-dark)', marginTop: '8px' }}>Condições de Atacado da Snack Store</h2>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
                gap: '30px'
              }}>
                {[
                  { title: 'Pedido Mínimo Baixo', desc: 'Apenas 10 unidades mistas para obter preço de atacado. Perfeito para começar com baixo investimento.' },
                  { title: 'Alta Lucratividade', desc: 'Nossos revendedores trabalham com margens de lucro entre 80% e 120%, dependendo da região.' },
                  { title: 'Logística Expressa', desc: 'Envio no mesmo dia para Belo Horizonte e postagem rápida para todo o Brasil via Sedex.' },
                  { title: 'Pagamento Facilitado', desc: 'Descontos adicionais no Pix ou parcelamento flexível no cartão de crédito em até 12x.' }
                ].map((benefit, idx) => (
                  <div key={idx} style={{ 
                    backgroundColor: 'var(--snack-cream)', 
                    border: '1px solid var(--snack-border)', 
                    borderRadius: '16px', 
                    padding: '32px 24px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.01)'
                  }}>
                    <div style={{ color: 'var(--snack-gold)', fontWeight: 'bold', fontSize: '24px', marginBottom: '16px' }}><Check size={24} /></div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--snack-green-dark)', marginBottom: '8px' }}>{benefit.title}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--snack-muted)', lineHeight: '1.5', margin: 0 }}>{benefit.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {b2bPerfumes.length > 0 && (
              <section style={{ marginBottom: '80px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--snack-green-dark)', textAlign: 'center', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
                  Alguns dos Perfumes no Catálogo de Revenda
                </h2>
                <p style={{ color: '#666', textAlign: 'center', maxWidth: '600px', margin: '0 auto 40px auto', fontSize: '15px' }}>
                  Variedade de perfumes árabes e importados de 25ml ideais para o seu estoque.
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '30px', marginBottom: '40px' }}>
                  {b2bPerfumes.map(product => (
                    <div key={product.code} style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #eaeaea', overflow: 'hidden', padding: '16px' }}>
                      <div style={{ cursor: 'pointer', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9', borderRadius: '12px', padding: '12px' }} onClick={() => navigate(`/produto/${product.slug}`)}>
                        <img src={product.image} alt={product.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                      </div>
                      <div style={{ padding: '12px 0 0 0', display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
                        <span style={{ fontSize: '10px', color: 'var(--snack-gold)', fontWeight: 'bold', textTransform: 'uppercase' }}>{product.brand}</span>
                        <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#1a1a1a', margin: 0, lineHeight: '1.4' }}>{product.name}</h4>
                        <p style={{ fontSize: '11px', color: 'var(--snack-muted)', margin: 0 }}>Código: {product.code}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {pageData.faqs && pageData.faqs.length > 0 && (
              <section style={{ marginBottom: '80px', borderTop: '1px solid #eee', paddingTop: '60px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--snack-green-dark)', textAlign: 'center', marginBottom: '32px', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
                  Perguntas Frequentes sobre Revenda
                </h2>
                <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
                  {pageData.faqs.map((faq, idx) => (
                    <div key={idx} style={{ 
                      backgroundColor: '#ffffff', 
                      padding: '24px', 
                      borderRadius: '16px', 
                      border: '1px solid rgba(0,0,0,0.05)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
                    }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--snack-green-dark)', margin: '0 0 8px 0', lineHeight: '1.4' }}>{faq.question}</h3>
                      <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', margin: 0 }}>{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section style={{ 
              border: '1px solid var(--snack-gold)', 
              borderRadius: '24px', 
              padding: '60px 24px', 
              backgroundColor: '#F6F2E9', 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--snack-gold)', letterSpacing: '2px', textTransform: 'uppercase' }}>Snack Store Distribuidora</span>
              <h2 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--snack-green-dark)', margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                COMECE A REVENDA HOJE
              </h2>
              <p style={{ color: '#555', maxWidth: '500px', margin: '0 0 16px 0', fontSize: '14px', lineHeight: '1.5' }}>
                Fale agora com o nosso atendimento no WhatsApp para tirar dúvidas e solicitar o catálogo atualizado com preços de atacado.
              </p>
              <a 
                href={WHATSAPP_RESELLER_LINK}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: 'var(--snack-green-dark)',
                  color: '#F6F2E9',
                  textDecoration: 'none',
                  padding: '14px 28px',
                  borderRadius: '99px',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  boxShadow: '0 4px 12px rgba(30,64,24,0.15)'
                }}
              >
                FALAR COM DISTRIBUIDOR
              </a>
            </section>

          </div>
        </div>
      </>
    );
  };

  if (pageData.group === 'whatsapp-groups') {
    return renderWhatsappLayout();
  }

  if (pageData.group === 'reseller') {
    return renderResellerLayout();
  }

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
          {paginatedPerfumes.map(product => {
            const isOut = (product.stock !== undefined && product.stock <= 0) || product.is_active === false;
            return (
            <div key={`seo-${product.code}`} className="product-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fff', opacity: isOut ? 0.85 : 1 }}>
              <div 
                style={{ cursor: 'pointer', flexGrow: 1 }}
                onClick={() => navigate(`/produto/${product.slug}`)}
              >
                <div style={{ position: 'relative', height: '300px', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                  <img src={product.image} alt={product.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', filter: isOut ? 'grayscale(35%)' : 'none' }} loading="lazy" />
                  <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#fff', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold' }}>
                    {product.volume}
                  </div>
                  {isOut && (
                    <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#ef4444', color: '#fff', padding: '4px 8px', fontSize: '10px', fontWeight: '800', borderRadius: '4px' }}>
                      ESGOTADO
                    </div>
                  )}
                </div>
                
                <div style={{ padding: '16px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{product.brand}</span>
                    <span style={{ fontSize: '11px', backgroundColor: '#f0f0f0', padding: '2px 8px', borderRadius: '10px' }}>{product.gender}</span>
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 12px 0', lineHeight: '1.4' }}>{product.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '14px', color: '#999', textDecoration: 'line-through' }}>R$ 119,90</span>
                    <span style={{ fontSize: '18px', fontWeight: '900', color: isOut ? '#9ca3af' : '#000' }}>R$ {product.price.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => { if (!isOut) addToCart(product); }}
                disabled={isOut}
                style={{ 
                  width: '100%', 
                  backgroundColor: isOut ? '#e5e7eb' : '#fff', 
                  color: isOut ? '#9ca3af' : '#000', 
                  border: isOut ? '1px solid #e5e7eb' : '1px solid #000', 
                  padding: '12px', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', 
                  cursor: isOut ? 'not-allowed' : 'pointer', 
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.2s', marginTop: 'auto' 
                }}
                onMouseEnter={(e) => { if (!isOut) { e.currentTarget.style.backgroundColor = '#000'; e.currentTarget.style.color = '#fff'; } }}
                onMouseLeave={(e) => { if (!isOut) { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#000'; } }}
              >
                <ShoppingBag size={16} /> {isOut ? 'Esgotado' : 'Adicionar'}
              </button>
            </div>
          );
        })}
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
