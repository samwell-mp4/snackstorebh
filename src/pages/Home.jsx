import React, { useState, useEffect, useRef } from 'react';
import ScrollCarousel from '../components/ScrollCarousel';
import { ArrowRight, ShoppingBag, AtSign, Star, Heart, Truck, ShieldCheck, CreditCard, MessageCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead';

export default function Home({ perfumes, addToCart }) {
  const navigate = useNavigate();
  const [recentBuyer, setRecentBuyer] = useState(null);
  const [activeCollection, setActiveCollection] = useState('todos');
  const [activeBrand, setActiveBrand] = useState(null);
  const names = ['Ana Silva', 'Marcos Souza', 'Mariana Costa', 'Gabriel Santos', 'Juliana Rezende', 'Thiago Moreira'];
  const cities = ['Savassi, BH', 'Lourdes, BH', 'Buritis, BH', 'Belvedere, BH', 'Sion, BH', 'Pampulha, BH'];
  const perfumesList = perfumes.map(p => p.name);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      const randomPerfume = perfumesList[Math.floor(Math.random() * perfumesList.length)];
      setRecentBuyer({ name: randomName, city: randomCity, product: randomPerfume });
      
      setTimeout(() => setRecentBuyer(null), 5000);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const isBrand = p => p.categorySlugs && p.categorySlugs.includes('brand-collection');
  const isArabic = p => p.categorySlugs && p.categorySlugs.includes('arabic-collection');

  const brandPerfumes = perfumes.filter(isBrand);
  const arabicPerfumes = perfumes.filter(isArabic);
  const allBrands = [...new Set(brandPerfumes.map(p => p.brand))].sort((a, b) => a.localeCompare(b));
  const bestSellers = [...brandPerfumes.slice(0, 8), ...arabicPerfumes.slice(0, 4)];

  const selectCollection = (c) => {
    setActiveCollection(c);
    if (c === 'arabic') setActiveBrand(null);
  };

  const visiblePerfumes = perfumes.filter(p => {
    if (activeCollection === 'brand' && !isBrand(p)) return false;
    if (activeCollection === 'arabic' && !isArabic(p)) return false;
    if (activeBrand && p.brand !== activeBrand) return false;
    return true;
  });

  const brandCountMap = {};
  brandPerfumes.forEach(p => { brandCountMap[p.brand] = (brandCountMap[p.brand] || 0) + 1; });
  const brandOptions = Object.entries(brandCountMap).sort((a, b) => b[1] - a[1]);

  const brandRowRef = useRef(null);
  const scrollBrands = (offset) => {
    if (brandRowRef.current) brandRowRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const vitrineRef = useRef(null);
  const scrollVitrine = (offset) => {
    if (vitrineRef.current) vitrineRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const brandPill = (active) => ({
    backgroundColor: active ? '#000000' : '#ffffff',
    color: active ? '#ffffff' : '#1a1a1a',
    border: '1px solid #e0e0e0', padding: '8px 14px', fontSize: '11px',
    fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', borderRadius: '99px', whiteSpace: 'nowrap'
  });

  const paginationBtn = {
    backgroundColor: '#ffffff', color: '#1a1a1a', border: '1px solid #e0e0e0',
    padding: '10px 16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer',
    borderRadius: '2px', textTransform: 'uppercase', letterSpacing: '1px'
  };

  return (
    <>
      <SeoHead 
        title="Mini Perfumes Importados 25ml | Miniaturas de Perfumes – Snack Store BH"
        description="Compre mini perfumes importados de 25ml, femininos e masculinos, com diversas fragrâncias. Miniaturas de perfumes em BH e envio para todo o Brasil."
        url="/"
      />

      {recentBuyer && (
        <div style={{
          position: 'fixed', bottom: '20px', left: '20px', zIndex: 999,
          backgroundColor: '#ffffff', border: '1px solid #e0e0e0',
          borderRadius: '4px', padding: '16px', maxWidth: '320px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderLeft: '4px solid #000000'
        }}>
          <p style={{ fontSize: '10px', color: '#888888', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Pedido Recente</p>
          <p style={{ fontSize: '14px', fontWeight: 'bold', margin: '4px 0', color: '#000000' }}>{recentBuyer.name} ({recentBuyer.city})</p>
          <p style={{ fontSize: '12px', color: '#555555', margin: 0 }}>Comprou 1x {recentBuyer.product}</p>
        </div>
      )}

      {/* Hero Banner Principal */}
      <div className="hero-banner" style={{ position: 'relative', height: '380px', backgroundColor: '#f6f6f6', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #e0e0e0', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', zIndex: 10, padding: '0 20px' }}>
          <span style={{ color: '#888888', fontSize: '11px', letterSpacing: '3px', fontWeight: 'bold', textTransform: 'uppercase' }}>O LUXO DO ORIENTE EM BELO HORIZONTE</span>
          <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#000000', margin: '12px 0 20px 0', fontFamily: 'serif', letterSpacing: '1px' }}>Mini Perfumes Importados 25ml</h1>
          <p style={{ color: '#555555', fontSize: '15px', maxWidth: '600px', margin: '0 auto 28px auto', lineHeight: '1.6' }}>
            Frascos luxuosos de 25ml com fragrâncias originais de alta fixação. Compre com exclusividade por apenas R$ 79,90.
          </p>
          <button 
            onClick={() => {
              navigate('/mini-perfumes-importados');
              window.scrollTo(0, 0);
            }}
            style={{ backgroundColor: '#000000', color: '#ffffff', border: 'none', padding: '14px 36px', fontWeight: 'bold', letterSpacing: '1px', fontSize: '12px', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '2px' }}
          >
            Ver Todas as Miniaturas
          </button>
        </div>
      </div>

      {/* Navegue por Categorias */}
      <section style={{ maxWidth: '1200px', margin: '48px auto', padding: '0 16px' }}>
        <div style={{ borderBottom: '1px solid #e0e0e0', paddingBottom: '16px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Categorias</h2>
          <Link to="/mini-perfumes-importados" style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', textDecoration: 'none', color: '#000000' }}>Ver tudo</Link>
        </div>

        <div className="category-grid">
          {[
            { url: '/mini-perfumes-femininos', eyebrow: 'Coleção Feminina', title: 'Femininos', bg: '#faf4f4', border: '#f0e6e6', sym: '♀' },
            { url: '/mini-perfumes-masculinos', eyebrow: 'Coleção Masculina', title: 'Masculinos', bg: '#f4f7fa', border: '#e6ecf0', sym: '♂' },
            { url: '/brand-collection', eyebrow: 'Marcas Famosas', title: 'Brand Collection', bg: '#f7f5f1', border: '#efe9df', sym: '◆' },
            { url: '/arabic-collection', eyebrow: 'Perfumes Árabes', title: 'Arabic Collection', bg: '#f3f7f4', border: '#e6efe8', sym: '✦' }
          ].map(c => (
            <div
              key={c.url}
              onClick={() => navigate(c.url)}
              style={{
                position: 'relative', height: '170px', backgroundColor: c.bg, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px',
                borderRadius: '4px', border: `1px solid ${c.border}`, overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ zIndex: 10 }}>
                <span style={{ fontSize: '10px', color: '#a08d8d', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>{c.eyebrow}</span>
                <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#000000', margin: '6px 0 12px 0', fontFamily: 'serif' }}>{c.title}</h3>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#000000', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  VER PRODUTOS <ArrowRight size={13} />
                </span>
              </div>
              <div style={{ position: 'absolute', right: '8%', bottom: '-12%', fontSize: '90px', color: 'rgba(0,0,0,0.06)', fontFamily: 'serif', pointerEvents: 'none' }}>{c.sym}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Marcas: faixa horizontal (carrossel) */}
      <section style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #e0e0e0', paddingBottom: '16px', marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Marcas</h2>
            <p style={{ fontSize: '13px', color: '#888888', margin: '4px 0 0 0' }}>Toque para ver todas as miniaturas de cada marca</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => scrollBrands(-320)} style={paginationBtn} aria-label="Marcas anteriores">←</button>
            <button onClick={() => scrollBrands(320)} style={paginationBtn} aria-label="Próximas marcas">→</button>
          </div>
        </div>

        <div
          ref={brandRowRef}
          style={{
            display: 'flex', gap: '12px', overflowX: 'auto', padding: '4px 4px 12px 4px',
            scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch'
          }}
        >
          {brandOptions.map(([brand, count]) => (
            <button
              key={brand}
              onClick={() => navigate(`/mini-perfumes-importados?marca=${encodeURIComponent(brand)}`)}
              style={{
                flex: '0 0 auto', minWidth: '160px', backgroundColor: '#ffffff', border: '1px solid #e0e0e0',
                borderRadius: '8px', padding: '16px 20px', cursor: 'pointer', textAlign: 'left',
                display: 'flex', flexDirection: 'column', gap: '4px', transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>{brand}</span>
              <span style={{ fontSize: '11px', color: '#888888', textTransform: 'uppercase', letterSpacing: '1px' }}>{count} miniaturas</span>
            </button>
          ))}
        </div>
      </section>

      {/* Secao Brand Collection */}
      <section style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #e0e0e0', paddingBottom: '16px', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Brand Collection</h2>
            <p style={{ fontSize: '13px', color: '#888888', margin: '4px 0 0 0' }}>Miniaturas de marcas famosas: Dior, Chanel, Carolina Herrera, Hugo Boss e mais</p>
          </div>
          <Link to="/brand-collection" style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', textDecoration: 'none', color: '#000000' }}>Ver todos</Link>
        </div>

        <ScrollCarousel pageSize={5}>

          {brandPerfumes.slice(0, 12).map(perfume => (
            <div 
              key={`brand-${perfume.code}`}
              className="product-card"
              onClick={() => navigate(`/produto/${perfume.slug}`)}
            >
              <div style={{ height: '240px', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', borderRadius: '4px', border: '1px solid #f0f0f0' }}>
                <img src={perfume.image} alt={perfume.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ padding: '12px 0' }}>
                <span style={{ fontSize: '10px', color: '#888888', fontWeight: 'bold', textTransform: 'uppercase' }}>{perfume.brand}</span>
                <h4 style={{ fontSize: '14px', margin: '4px 0', color: '#1a1a1a', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{perfume.name}</h4>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#888888', textDecoration: 'line-through' }}>R$ 119,90</span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>R$ 79,90</span>
                </div>
              </div>
            </div>
          ))}
        </ScrollCarousel>
      </section>

      {/* Secao Arabic Collection */}
      <section style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #e0e0e0', paddingBottom: '16px', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Arabic Collection</h2>
            <p style={{ fontSize: '13px', color: '#888888', margin: '4px 0 0 0' }}>Perfumes árabes Lattafa, Armaf e Afnan em miniatura</p>
          </div>
          <Link to="/arabic-collection" style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', textDecoration: 'none', color: '#000000' }}>Ver todos</Link>
        </div>

        <ScrollCarousel pageSize={5}>

          {arabicPerfumes.map(perfume => (
            <div 
              key={`arabic-${perfume.code}`}
              className="product-card"
              onClick={() => navigate(`/produto/${perfume.slug}`)}
            >
              <div style={{ height: '240px', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', borderRadius: '4px', border: '1px solid #f0f0f0' }}>
                <img src={perfume.image} alt={perfume.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ padding: '12px 0' }}>
                <span style={{ fontSize: '10px', color: '#888888', fontWeight: 'bold', textTransform: 'uppercase' }}>{perfume.brand}</span>
                <h4 style={{ fontSize: '14px', margin: '4px 0', color: '#1a1a1a', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{perfume.name}</h4>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#888888', textDecoration: 'line-through' }}>R$ 119,90</span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>R$ 79,90</span>
                </div>
              </div>
            </div>
          ))}
        </ScrollCarousel>
      </section>

      {/* Clientes no Instagram */}
      <section className="instagram-clients" style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #e0e0e0', paddingBottom: '16px', marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Clientes no Instagram</h2>
            <p style={{ fontSize: '13px', color: '#888888', margin: '4px 0 0 0' }}>Veja a confiança de quem já comprou: depoimentos e clientes reais</p>
          </div>
          <a
            href="https://www.instagram.com/snackstorebh"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', textDecoration: 'none', color: '#000000' }}
          >
            @snackstorebh
          </a>
        </div>

        <div style={{ display: 'flex', gap: '28px', overflowX: 'auto', padding: '4px 4px 16px 4px', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
          {[
            {
              href: 'https://www.instagram.com/stories/highlights/17865704509551791/',
              icon: <Star size={26} color="#ffffff" />,
              label: 'Depoimentos',
              sub: 'Feedbacks de quem comprou'
            },
            {
              href: 'https://www.instagram.com/stories/highlights/17875198793085549/',
              icon: <Heart size={26} color="#ffffff" />,
              label: 'Clientes',
              sub: 'Quem já recebeu o seu'
            },
            {
              href: 'https://www.instagram.com/snackstorebh',
              icon: <AtSign size={26} color="#ffffff" />,
              label: 'Seguir @snackstorebh',
              sub: 'Acompanhe todas as novidades'
            }
          ].map(h => (
            <a
              key={h.label}
              href={h.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', textDecoration: 'none', cursor: 'pointer' }}
            >
              <span
                style={{
                  width: '88px', height: '88px', borderRadius: '50%', padding: '3px',
                  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <span style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, #262626, #1a1a1a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {h.icon}
                  </span>
                </span>
              </span>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#000000', textAlign: 'center' }}>{h.label}</span>
              <span style={{ fontSize: '11px', color: '#888888', textAlign: 'center', maxWidth: '120px' }}>{h.sub}</span>
            </a>
          ))}
        </div>
      </section>

      <section id="vitrine" style={{ maxWidth: '1200px', margin: '80px auto 40px auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #e0e0e0', paddingBottom: '16px', marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Miniaturas de Perfumes 25ml ({visiblePerfumes.length})</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => scrollVitrine(-320)} style={paginationBtn} aria-label="Anterior">←</button>
            <button onClick={() => scrollVitrine(320)} style={paginationBtn} aria-label="Próximos">→</button>
          </div>
        </div>

        <div style={{ display: 'flex', backgroundColor: '#f2f2f2', borderRadius: '99px', padding: '4px', marginBottom: '16px', width: 'fit-content', maxWidth: '100%', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {[
            { key: 'todos', label: 'Todas' },
            { key: 'brand', label: 'Brand Collection' },
            { key: 'arabic', label: 'Arabic Collection' }
          ].map(c => (
            <button
              key={c.key}
              onClick={() => selectCollection(c.key)}
              style={{
                flex: '1 0 auto', padding: '10px 22px', borderRadius: '99px', border: 'none', cursor: 'pointer',
                fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap',
                backgroundColor: activeCollection === c.key ? '#000000' : 'transparent',
                color: activeCollection === c.key ? '#ffffff' : '#555555', transition: 'all 0.2s'
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {activeCollection !== 'arabic' && (
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 4px 12px 4px', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch', marginBottom: '8px' }}>
            <button onClick={() => setActiveBrand(null)} style={{ flex: '0 0 auto', ...brandPill(!activeBrand) }}>Todas as Marcas</button>
            {allBrands.map(brand => (
              <button key={brand} onClick={() => setActiveBrand(activeBrand === brand ? null : brand)} style={{ flex: '0 0 auto', ...brandPill(activeBrand === brand) }}>
                {brand} <span style={{ opacity: 0.6 }}>({brandCountMap[brand]})</span>
              </button>
            ))}
          </div>
        )}

        <ScrollCarousel containerRef={vitrineRef} pageSize={4}>
          {visiblePerfumes.map(perfume => (
            <div
              key={`home-all-${perfume.code}`}
              className="product-card"
              onClick={() => navigate(`/produto/${perfume.slug}`)}
            >
              <div style={{ position: 'relative', height: '240px', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', borderRadius: '4px', border: '1px solid #f0f0f0' }}>
                <img src={perfume.image} alt={perfume.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#000000', color: '#ffffff', fontSize: '9px', fontWeight: 'bold', padding: '4px 8px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {perfume.gender}
                </div>
              </div>

              <div style={{ padding: '12px 0' }}>
                <span style={{ fontSize: '10px', color: '#888888', fontWeight: 'bold', textTransform: 'uppercase' }}>{perfume.brand}</span>
                <h4 style={{ fontSize: '14px', margin: '4px 0', color: '#1a1a1a', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{perfume.name}</h4>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#888888', textDecoration: 'line-through' }}>R$ 119,90</span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>R$ 79,90</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); addToCart(perfume); }}
                  style={{ width: '100%', backgroundColor: '#000000', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}
                >
                  <ShoppingBag size={14} /> Adicionar
                </button>
              </div>
            </div>
          ))}
        </ScrollCarousel>
      </section>

      {/* Mais Vendidos da Semana */}
      <section style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #e0e0e0', paddingBottom: '16px', marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Mais Vendidos da Semana</h2>
            <p style={{ fontSize: '13px', color: '#888888', margin: '4px 0 0 0' }}>Os queridinhos que todo mundo está levando</p>
          </div>
          <Link to="/mini-perfumes-importados" style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', textDecoration: 'none', color: '#000000' }}>Ver todos</Link>
        </div>

        <ScrollCarousel pageSize={4}>
          {bestSellers.map(perfume => (
            <div
              key={`best-${perfume.code}`}
              className="product-card"
              onClick={() => navigate(`/produto/${perfume.slug}`)}
            >
              <div style={{ position: 'relative', height: '240px', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', borderRadius: '4px', border: '1px solid #f0f0f0' }}>
                <img src={perfume.image} alt={perfume.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#000000', color: '#ffffff', fontSize: '9px', fontWeight: 'bold', padding: '4px 8px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {perfume.gender}
                </div>
              </div>

              <div style={{ padding: '12px 0' }}>
                <span style={{ fontSize: '10px', color: '#888888', fontWeight: 'bold', textTransform: 'uppercase' }}>{perfume.brand}</span>
                <h4 style={{ fontSize: '14px', margin: '4px 0', color: '#1a1a1a', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{perfume.name}</h4>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#888888', textDecoration: 'line-through' }}>R$ 119,90</span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>R$ 79,90</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); addToCart(perfume); }}
                  style={{ width: '100%', backgroundColor: '#000000', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}
                >
                  <ShoppingBag size={14} /> Adicionar
                </button>
              </div>
            </div>
          ))}
        </ScrollCarousel>
      </section>

      {/* Por que comprar na Snack Store */}
      <section style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {[
            { icon: <Truck size={28} />, title: 'Envio para todo o Brasil', text: 'Sua miniatura chega rápida e com rastreio' },
            { icon: <ShieldCheck size={28} />, title: 'Compra 100% segura', text: 'Dados protegidos e pagamento garantido' },
            { icon: <CreditCard size={28} />, title: 'Parcelamento fácil', text: 'Você escolhe a forma que cabe no bolso' },
            { icon: <MessageCircle size={28} />, title: 'Atendimento no WhatsApp', text: 'Tire dúvidas e acompanhe seu pedido' }
          ].map(b => (
            <div key={b.title} style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '10px', padding: '32px 16px', backgroundColor: '#fafafa', border: '1px solid #eeeeee', borderRadius: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#000000', color: '#ffffff' }}>{b.icon}</span>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0', color: '#000000' }}>{b.title}</h3>
              <p style={{ fontSize: '12px', color: '#666666', margin: '0', lineHeight: '1.5' }}>{b.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
