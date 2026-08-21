import React, { useState, useEffect, useRef } from 'react';
import ScrollCarousel from '../components/ScrollCarousel';
import { ArrowRight, ShoppingBag, AtSign, Star, Heart, Truck, ShieldCheck, CreditCard, MessageCircle, Sparkles, Check, ChevronRight, HelpCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead';
import PerfumeScrollytelling from '../components/scrollytelling/PerfumeScrollytelling';

export default function Home({ perfumes, addToCart }) {
  const navigate = useNavigate();
  const [recentBuyer, setRecentBuyer] = useState(null);
  const [activeCollection, setActiveCollection] = useState('todos');
  const [activeBrand, setActiveBrand] = useState(null);
  const [favoriteCodes, setFavoriteCodes] = useState([]); // Dynamic wishlist array

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

  // Programmatic scroll helper to target a selector
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleFavorite = (code, e) => {
    e.stopPropagation();
    if (favoriteCodes.includes(code)) {
      setFavoriteCodes(favoriteCodes.filter(c => c !== code));
    } else {
      setFavoriteCodes([...favoriteCodes, code]);
    }
  };

  const brandPill = (active) => ({
    backgroundColor: active ? 'var(--snack-green-dark)' : 'transparent',
    color: active ? 'var(--snack-cream)' : 'var(--snack-text)',
    border: '1px solid var(--snack-border)', padding: '8px 16px', fontSize: '11px',
    fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', borderRadius: '99px', whiteSpace: 'nowrap',
    transition: 'all 0.2s'
  });

  const paginationBtn = {
    backgroundColor: 'var(--snack-paper)', color: 'var(--snack-text)', border: '1px solid var(--snack-border)',
    padding: '10px 16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer',
    borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.2s'
  };

  return (
    <>
      <SeoHead
        title="Mini Perfumes Importados 25ml | Miniaturas de Perfumes - Snack Store BH"
        description="Compre mini perfumes importados de 25ml, femininos e masculinos, com diversas fragrâncias. Miniaturas de perfumes em BH e envio para todo o Brasil."
        url="/"
        videoUrl="/assets/campaign/hero-video.mp4"
        videoTitle="Review de Miniaturas de Perfumes Importados - Snack Store BH"
        videoDescription="Descubra a praticidade e a fixação incrível das miniaturas de perfumes importados de 25ml. Compre na Snack Store BH com frete grátis."
        videoThumbnail="/scrollytelling/desktop/01.webp"
        videoUploadDate="2026-08-18T10:00:00-03:00"
      />

      {recentBuyer && (
        <div style={{
          position: 'fixed', bottom: '20px', left: '20px', zIndex: 999,
          backgroundColor: 'var(--snack-paper)', border: '1px solid var(--snack-border)',
          borderRadius: '12px', padding: '16px', maxWidth: '320px',
          boxShadow: 'var(--box-shadow-premium)', borderLeft: '4px solid var(--snack-gold)'
        }}>
          <p style={{ fontSize: '9px', color: 'var(--snack-gold)', margin: 0, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Pedido Recente</p>
          <p style={{ fontSize: '14px', fontWeight: 'bold', margin: '4px 0', color: 'var(--snack-green-dark)' }}>{recentBuyer.name} ({recentBuyer.city})</p>
          <p style={{ fontSize: '12px', color: 'var(--snack-muted)', margin: 0 }}>Comprou 1x {recentBuyer.product}</p>
        </div>
      )}

      {/* 2. HERO SECTOR */}
      <section style={{
        position: 'relative',
        height: '85vh',
        minHeight: '580px',
        backgroundColor: 'var(--snack-cream)',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        borderBottom: '1px solid var(--snack-border)'
      }}>
        {/* Video Background Wrapper */}
        <div style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          backgroundColor: 'var(--snack-green-dark)',
          overflow: 'hidden'
        }}>
          {/* Native HTML5 Video Background Frame for seamless looping */}
          <div style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            pointerEvents: 'none'
          }}>
            <video
              src="/assets/campaign/hero-video.mp4"
              autoPlay
              muted
              loop
              playsInline
              style={{
                width: '100%',
                height: '100%',
                opacity: 0.65,
                pointerEvents: 'none',
                objectFit: 'cover',
                maxWidth: 'calc(85vh * 9 / 16)', // Maintain 9:16 ratio on desktop relative to container height
                minWidth: '280px',
                aspectRatio: '9/16'
              }}
            />
          </div>

          {/* Gradient overlay to ensure text contrast */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(23, 43, 20, 0.98) 0%, rgba(23, 43, 20, 0.8) 50%, rgba(23, 43, 20, 0.5) 100%)'
          }}></div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', zIndex: 10, width: '100%', textAlign: 'left' }}>
          <div style={{ maxWidth: '650px', color: 'var(--snack-paper)' }}>

            {/* SEO Semantics: Keep H1 structure but integrate with premium UI */}
            <h1 className="editorial-eyebrow" style={{ color: 'var(--snack-gold)', marginBottom: '8px' }}>
              Mini Perfumes Importados 25ml
            </h1>

            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 5vw, 68px)',
              lineHeight: '0.9',
              fontWeight: '700',
              margin: '0 0 20px 0',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase'
            }}>
              PEQUENOS FRASCOS.<br />
              <span style={{ fontStyle: 'italic', fontWeight: '400', color: 'var(--snack-gold)', textTransform: 'none' }}>Grandes Histórias.</span>
            </p>

            <p style={{ color: 'rgba(250, 248, 242, 0.85)', fontSize: 'clamp(14px, 2.5vw, 18px)', margin: '0 auto 28px 0', lineHeight: '1.5', fontWeight: '300' }}>
              Fragrâncias que você ama em um tamanho feito para acompanhar sua rotina. Práticos, luxuosos e com excelente fixação.
            </p>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(8px)',
              padding: '6px 16px',
              borderRadius: '99px',
              fontSize: '13px',
              color: 'var(--snack-gold)',
              border: '1px solid rgba(196, 161, 90, 0.3)',
              marginBottom: '32px',
              fontWeight: '500'
            }}>
              Miniaturas 25ml • Diversas fragrâncias • Apenas R$ 79,90
            </div>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={() => scrollToSection('vitrine')}
                style={{
                  backgroundColor: 'var(--snack-gold)',
                  color: 'var(--snack-green-dark)',
                  border: 'none',
                  padding: '16px 36px',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  borderRadius: '999px',
                  boxShadow: '0 4px 15px rgba(196,161,90,0.3)',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--snack-gold-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--snack-gold)'}
              >
                Ver Miniaturas →
              </button>

              <button
                onClick={() => navigate('/arabic-collection')}
                style={{
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.4)',
                  padding: '15px 32px',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  borderRadius: '999px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = '#ffffff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
              >
                Conhecer a Arabic Collection
              </button>
            </div>

            {/* Badges line under CTAs */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '36px', fontSize: '11px', color: 'rgba(250, 248, 242, 0.65)', fontWeight: '600', letterSpacing: '0.5px' }}>
              <span>✓ 25ml Original Size</span>
              <span>✓ Envio para todo o Brasil</span>
              <span>✓ Entrega rápida em BH</span>
            </div>

          </div>
        </div>
      </section>

      {/* 3. BRANDS ROW SECTION */}
      <section style={{ borderBottom: '1px solid var(--snack-border)', backgroundColor: 'var(--snack-paper)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 24px 0 24px', textAlign: 'center' }}>
          <span style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '1.5px', color: 'var(--snack-muted)', textTransform: 'uppercase' }}>
            Fragrâncias inspiradas nos grandes ícones da perfumaria
          </span>
        </div>
        <div className="brands-marquee-container">
          <div className="brands-marquee-inner">
            {/* Double the list to support infinite loop marquee scrolling */}
            {['DIOR', 'CHANEL', 'CAROLINA HERRERA', 'LANCÔME', 'VERSACE', 'ARMANI', 'PACO RABANNE', 'YSL', 'BVLGARI', 'DIOR', 'CHANEL', 'CAROLINA HERRERA', 'LANCÔME', 'VERSACE', 'ARMANI', 'PACO RABANNE', 'YSL', 'BVLGARI'].map((brand, i) => (
              <span key={`${brand}-${i}`} className="brands-marquee-item">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* 4. POR QUE 25ML SECTION */}
      <section style={{ padding: '80px 24px', backgroundColor: 'var(--snack-paper)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="details-grid" style={{ alignItems: 'center' }}>

            {/* Image Column */}
            <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', height: '480px', border: '1px solid var(--snack-border)' }}>
              <img
                src="/assets/campaign/revised_IMG_3268.webp"
                alt="Mini perfume de 25ml ao lado de uma bolsa Snack Store"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Text details column */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span className="editorial-eyebrow">Por que 25ml?</span>
              <h2 className="editorial-title" style={{ fontSize: 'clamp(32px, 4vw, 48px)', marginBottom: '32px' }}>
                O PERFUME QUE CABE<br />
                <span className="italic">na sua rotina.</span>
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '36px' }}>
                {[
                  { title: 'Cabe na Bolsa', text: 'Leve sua fragrância favorita para onde quiser sem ocupar espaço ou pesar.' },
                  { title: 'Mais Variedade', text: 'Tenha diferentes aromas para diferentes momentos: mude o perfume conforme o dia, a noite ou seu humor.' },
                  { title: 'Perfeito para Presentear', text: 'Um frasco elegante, útil e cheio de personalidade que agrada a qualquer estilo.' }
                ].map((b, i) => (
                  <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--snack-green)',
                      display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 'bold', flexShrink: 0, marginTop: '2px'
                    }}>
                      {i + 1}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--snack-green-dark)', marginBottom: '4px' }}>{b.title}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--snack-muted)', lineHeight: '1.5' }}>{b.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => scrollToSection('vitrine')}
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: 'var(--snack-green)',
                  color: 'var(--snack-cream)',
                  border: 'none',
                  padding: '14px 32px',
                  borderRadius: '999px',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--snack-green-dark)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--snack-green)'}
              >
                Encontre a sua <ArrowRight size={14} />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 4b. BLOC DE ESCALA ("Pequeno no tamanho. Gigante na experiência.") */}
      <section style={{ padding: '80px 24px', backgroundColor: 'var(--snack-cream)', borderTop: '1px solid var(--snack-border)', borderBottom: '1px solid var(--snack-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="details-grid" style={{ alignItems: 'center', gridTemplateColumns: '1fr 1.3fr' }}>

            {/* Text details column */}
            <div>
              <span className="editorial-eyebrow">Equilíbrio Perfeito</span>
              <h2 className="editorial-title" style={{ fontSize: 'clamp(32px, 4vw, 44px)', marginBottom: '20px' }}>
                PEQUENO NO TAMANHO.<br />
                <span className="italic">Gigante na experiência.</span>
              </h2>

              <p style={{ fontSize: '14px', color: 'var(--snack-muted)', lineHeight: '1.6', marginBottom: '32px', maxWidth: '480px' }}>
                25ml é o equilíbrio entre praticidade e experiência: compacto para levar com você e perfeito para variar suas fragrâncias favoritas do dia a dia.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {[
                  { title: '25ML', text: 'Volume ideal de alta fixação' },
                  { title: 'COMPACTO', text: 'Não pesa na nécessaire' },
                  { title: 'FÁCIL DE LEVAR', text: 'Permitido em bagagem de mão' },
                  { title: 'IDEAL PARA VARIAR', text: 'Preço acessível para coleções' }
                ].map((ind, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '2px solid var(--snack-gold)', paddingLeft: '14px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '900', color: 'var(--snack-green-dark)', letterSpacing: '0.5px' }}>{ind.title}</span>
                    <span style={{ fontSize: '11px', color: 'var(--snack-muted)' }}>{ind.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Column showing hand scale (Now Video) */}
            <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', height: '420px', border: '1px solid var(--snack-border)' }}>
              <video
                src="/assets/campaign/why-25ml-video.mp4"
                autoPlay
                muted
                loop
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.01)' }}
              />
            </div>

          </div>
        </div>
      </section>

      {/* 5. CATEGORIAS VISUAIS SECTION */}
      <section style={{ padding: '80px 24px', backgroundColor: 'var(--snack-paper)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="editorial-eyebrow">Explore as Coleções</span>
            <h2 className="editorial-title" style={{ fontSize: 'clamp(32px, 3.5vw, 44px)' }}>
              CATEGORIAS <span className="italic">Editoriais</span>
            </h2>
          </div>

          <div className="editorial-mosaic">

            {/* CARD GRANDE: FEMININOS */}
            <div className="mosaic-card" style={{ gridRow: 'span 2' }} onClick={() => navigate('/mini-perfumes-femininos')}>
              <div className="mosaic-card-bg">
                <img src="/assets/campaign/revised_IMG_3243.webp" alt="Coleção Feminina" />
              </div>
              <div className="mosaic-card-overlay"></div>
              <div className="mosaic-card-content">
                <span style={{ fontSize: '9px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--snack-gold)' }}>Coleção Exclusiva</span>
                <h3 className="mosaic-card-title">FEMININOS</h3>
                <p className="mosaic-card-desc">Florais, doces, elegantes e marcantes em frascos de luxo.</p>
                <span className="mosaic-card-cta">Explorar →</span>
              </div>
            </div>

            {/* CARD 2: MASCULINOS */}
            <div className="mosaic-card" onClick={() => navigate('/mini-perfumes-masculinos')}>
              <div className="mosaic-card-bg">
                <img src="/assets/campaign/revised_IMG_3248.webp" alt="Coleção Masculina" />
              </div>
              <div className="mosaic-card-overlay"></div>
              <div className="mosaic-card-content">
                <h3 className="mosaic-card-title" style={{ fontSize: '20px' }}>MASCULINOS</h3>
                <p className="mosaic-card-desc" style={{ fontSize: '11px', marginBottom: '8px' }}>Frescos, amadeirados e intensos.</p>
                <span className="mosaic-card-cta" style={{ fontSize: '10px' }}>Explorar →</span>
              </div>
            </div>

            {/* CARD 3: BRAND COLLECTION */}
            <div className="mosaic-card" onClick={() => navigate('/brand-collection')}>
              <div className="mosaic-card-bg">
                <img src="/assets/campaign/revised_IMG_3252.webp" alt="Brand Collection" />
              </div>
              <div className="mosaic-card-overlay"></div>
              <div className="mosaic-card-content">
                <h3 className="mosaic-card-title" style={{ fontSize: '20px' }}>BRAND COLLECTION</h3>
                <p className="mosaic-card-desc" style={{ fontSize: '11px', marginBottom: '8px' }}>Grandes ícones da perfumaria em 25ml.</p>
                <span className="mosaic-card-cta" style={{ fontSize: '10px' }}>Explorar →</span>
              </div>
            </div>

          </div>

          {/* CARD VISUALMENTE DIFERENTE: ARABIC COLLECTION */}
          <div
            className="mosaic-card mosaic-card-arabic"
            onClick={() => navigate('/arabic-collection')}
            style={{
              marginTop: '24px',
              height: '180px',
              display: 'flex',
              alignItems: 'center',
              padding: '32px',
              borderRadius: '24px',
              backgroundColor: 'var(--snack-green-dark)'
            }}
          >
            <div className="mosaic-card-bg" style={{ opacity: 0.4 }}>
              <img src="/assets/campaign/revised_IMG_3254.webp" alt="Arabic Collection Background" />
            </div>
            <div style={{ zIndex: 10, color: 'var(--snack-cream)' }}>
              <span style={{ fontSize: '9px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--snack-gold)' }}>Campanha Premium</span>
              <h3 className="mosaic-card-title" style={{ fontSize: '28px', color: 'var(--snack-gold)' }}>ARABIC COLLECTION</h3>
              <p className="mosaic-card-desc" style={{ maxWidth: '480px', margin: '4px 0 16px 0' }}>Intensidade, personalidade, fixação excepcional e presença olfativa incomparável.</p>
              <span className="mosaic-card-cta" style={{ color: '#ffffff' }}>Descobrir Alta Perfumaria Árabe →</span>
            </div>
          </div>

        </div>
      </section>


      {/* 7. MAIS VENDIDOS SECTION */}
      <section style={{ padding: '80px 24px', backgroundColor: 'var(--snack-paper)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--snack-border)', paddingBottom: '20px', marginBottom: '36px', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <span className="editorial-eyebrow">Os Queridinhos da Semana</span>
              <h2 className="editorial-title" style={{ fontSize: 'clamp(30px, 3.5vw, 44px)' }}>
                DIFÍCIL É ESCOLHER <span className="italic">só um.</span>
              </h2>
              <p className="editorial-subtitle" style={{ marginTop: '8px' }}>
                Descubra as miniaturas que estão conquistando mais espaço nas bolsas e coleções.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => scrollBrands(-320)} style={paginationBtn} aria-label="Marcas anteriores">←</button>
              <button onClick={() => scrollBrands(320)} style={paginationBtn} aria-label="Próximas marcas">→</button>
            </div>
          </div>

          <ScrollCarousel pageSize={5}>
            {bestSellers.map(perfume => (
              <div
                key={`best-sel-${perfume.code}`}
                className="product-card"
                onClick={() => navigate(`/produto/${perfume.slug}`)}
              >
                <div className="product-card-image-container">
                  <img src={perfume.image} alt={perfume.name} />
                  <span className="product-card-badge">Queridinho</span>
                  <button className="product-card-fav-btn" onClick={(e) => toggleFavorite(perfume.code, e)} aria-label="Adicionar aos favoritos">
                    <Heart size={16} fill={favoriteCodes.includes(perfume.code) ? 'var(--snack-gold)' : 'none'} stroke={favoriteCodes.includes(perfume.code) ? 'var(--snack-gold)' : 'currentColor'} />
                  </button>
                </div>
                <div style={{ padding: '14px 0 0 0', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '9px', color: 'var(--snack-gold)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{perfume.brand}</span>
                  <h4 style={{ fontSize: '14px', margin: '4px 0', color: 'var(--snack-text)', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{perfume.name}</h4>
                  <span style={{ fontSize: '11px', color: 'var(--snack-muted)', marginBottom: '12px' }}>{perfume.gender} • 25ml</span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: 'auto', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--snack-muted)', textDecoration: 'line-through' }}>R$ 119,90</span>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--snack-green-dark)' }}>R$ 79,90</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); addToCart(perfume); }}
                    style={{
                      width: '100%', backgroundColor: 'var(--snack-green-dark)', color: 'var(--snack-cream)',
                      border: 'none', padding: '10px', borderRadius: '999px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--snack-green)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--snack-green-dark)'}
                  >
                    <ShoppingBag size={14} /> Adicionar à Sacola
                  </button>
                </div>
              </div>
            ))}
          </ScrollCarousel>

        </div>
      </section>

      {/* 9. ARABIC COLLECTION SECTION */}
      <section style={{
        position: 'relative',
        padding: '120px 24px',
        backgroundColor: 'var(--snack-green-dark)',
        color: 'var(--snack-cream)',
        overflow: 'hidden'
      }}>
        {/* Oriental backdrop overlay */}
        <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, opacity: 0.15 }}>
          <img src="/assets/campaign/revised_IMG_3254.webp" alt="Background oriental" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(23,43,20,0.9) 0%, rgba(23,43,20,0.7) 100%)', zIndex: 2 }}></div>

        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <span className="editorial-eyebrow" style={{ color: 'var(--snack-gold)' }}>Arabic Collection</span>
          <h2 className="editorial-title" style={{ fontSize: 'clamp(32px, 5vw, 54px)', color: 'var(--snack-gold)', marginTop: '8px', marginBottom: '24px' }}>
            INTENSIDADE QUE<br />
            <span style={{ fontStyle: 'italic', fontWeight: '400', color: 'var(--snack-cream)' }}>não passa despercebida.</span>
          </h2>

          <p style={{ fontSize: '15px', color: 'rgba(245,241,232,0.8)', lineHeight: '1.7', maxWidth: '600px', margin: '0 auto 36px auto', fontWeight: '300' }}>
            Fragrâncias marcantes, envolventes e cheias de personalidade em frascos de miniaturas 25ml. Lattafa, Armaf, Afnan e o melhor do luxo oriental.
          </p>

          <button
            onClick={() => navigate('/arabic-collection')}
            style={{
              backgroundColor: 'var(--snack-gold)',
              color: 'var(--snack-green-dark)',
              border: 'none',
              padding: '16px 44px',
              borderRadius: '999px',
              fontWeight: 'bold',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(196,161,90,0.3)',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--snack-gold-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--snack-gold)'}
          >
            Descobrir Perfumes Árabes →
          </button>
        </div>
      </section>

      {/* 10. VITRINE (CATÁLOGO GERAL) SECTION */}
      <section id="vitrine" style={{ padding: '80px 24px', backgroundColor: 'var(--snack-paper)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--snack-border)', paddingBottom: '20px', marginBottom: '32px', gap: '12px', flexWrap: 'wrap' }}>
            <div>
              <span className="editorial-eyebrow">Catálogo de Miniaturas</span>
              <h2 className="editorial-title" style={{ fontSize: '28px' }}>
                Miniaturas de Perfumes 25ml <span style={{ opacity: 0.6, fontSize: '18px', fontWeight: 'normal' }}>({visiblePerfumes.length})</span>
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => scrollVitrine(-320)} style={paginationBtn} aria-label="Anterior">←</button>
              <button onClick={() => scrollVitrine(320)} style={paginationBtn} aria-label="Próximos">→</button>
            </div>
          </div>

          {/* Collection Tab Selector */}
          <div style={{ display: 'flex', backgroundColor: 'var(--snack-cream)', borderRadius: '99px', padding: '4px', marginBottom: '24px', width: 'fit-content', maxWidth: '100%', overflowX: 'auto', border: '1px solid var(--snack-border)' }}>
            {[
              { key: 'todos', label: 'Todas' },
              { key: 'brand', label: 'Brand Collection' },
              { key: 'arabic', label: 'Arabic Collection' }
            ].map(c => (
              <button
                key={c.key}
                onClick={() => selectCollection(c.key)}
                style={{
                  flex: '1 0 auto', padding: '10px 24px', borderRadius: '99px', border: 'none', cursor: 'pointer',
                  fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap',
                  backgroundColor: activeCollection === c.key ? 'var(--snack-green-dark)' : 'transparent',
                  color: activeCollection === c.key ? 'var(--snack-cream)' : 'var(--snack-muted)', transition: 'all 0.2s'
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Brands Tab Selector (Brand Collection only) */}
          {activeCollection !== 'arabic' && (
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 4px 12px 4px', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch', marginBottom: '24px' }}>
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
                <div className="product-card-image-container">
                  <img src={perfume.image} alt={perfume.name} />
                  <span className="product-card-badge">{perfume.gender}</span>
                  <button className="product-card-fav-btn" onClick={(e) => toggleFavorite(perfume.code, e)} aria-label="Adicionar aos favoritos">
                    <Heart size={16} fill={favoriteCodes.includes(perfume.code) ? 'var(--snack-gold)' : 'none'} stroke={favoriteCodes.includes(perfume.code) ? 'var(--snack-gold)' : 'currentColor'} />
                  </button>
                </div>

                <div style={{ padding: '14px 0 0 0', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '9px', color: 'var(--snack-gold)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{perfume.brand}</span>
                  <h4 style={{ fontSize: '14px', margin: '4px 0', color: 'var(--snack-text)', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{perfume.name}</h4>
                  <span style={{ fontSize: '11px', color: 'var(--snack-muted)', marginBottom: '12px' }}>{perfume.gender} • 25ml</span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: 'auto', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--snack-muted)', textDecoration: 'line-through' }}>R$ 119,90</span>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--snack-green-dark)' }}>R$ 79,90</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); addToCart(perfume); }}
                    style={{
                      width: '100%', backgroundColor: 'var(--snack-green-dark)', color: 'var(--snack-cream)',
                      border: 'none', padding: '12px 10px', borderRadius: '999px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--snack-green)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--snack-green-dark)'}
                  >
                    <ShoppingBag size={14} /> Adicionar à Sacola
                  </button>
                </div>
              </div>
            ))}
          </ScrollCarousel>

        </div>
      </section>

      {/* 11. SCROLLYTELLING SECTION */}
      <PerfumeScrollytelling />

      {/* 12. COMPRE 2 / FRETE GRÁTIS BH SECTION */}
      <section style={{ padding: '80px 24px', backgroundColor: 'var(--snack-cream)', borderTop: '1px solid var(--snack-border)', borderBottom: '1px solid var(--snack-border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="details-grid" style={{ alignItems: 'center', gridTemplateColumns: '1.2fr 1fr' }}>

            {/* Context promo column */}
            <div>
              <span className="editorial-eyebrow">📍 Entrega Expressa</span>
              <h2 className="editorial-title" style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', marginBottom: '18px' }}>
                É DE BELO HORIZONTE?<br />
                <span className="italic" style={{ color: 'var(--snack-gold)' }}>Compre 2 miniaturas e aproveite o frete grátis.*</span>
              </h2>

              <p style={{ fontSize: '13px', color: 'var(--snack-muted)', lineHeight: '1.6', marginBottom: '28px' }}>
                Como cada miniatura custa R$ 79,90, ao levar duas peças (2 × R$ 79,90 = R$ 159,80) você ultrapassa automaticamente o limite mínimo de R$ 150 e recebe com entrega rápida e frete grátis na capital mineira.
              </p>

              <button
                onClick={() => scrollToSection('vitrine')}
                style={{
                  backgroundColor: 'var(--snack-green)',
                  color: 'var(--snack-cream)',
                  border: 'none',
                  padding: '16px 36px',
                  borderRadius: '999px',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--snack-green-dark)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--snack-green)'}
              >
                Montar Minha Dupla →
              </button>
            </div>

            {/* Campaign promo visual image */}
            <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', height: '360px', border: '1px solid var(--snack-border)' }}>
              <img
                src="/assets/campaign/revised_IMG_3306.webp"
                alt="Duas miniaturas de perfume juntas - Promoção frete grátis BH"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

          </div>
        </div>
      </section>

      {/* 13. BENEFÍCIOS SECTION */}
      <section style={{ padding: '48px 24px', backgroundColor: 'var(--snack-paper)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            gap: '24px',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--snack-border)',
            borderBottom: '1px solid var(--snack-border)',
            padding: '32px 0'
          }}>
            {[
              { icon: <Truck size={24} />, title: 'Envio para todo o Brasil', text: 'Sua miniatura rápida e com código de rastreamento' },
              { icon: <ShieldCheck size={24} />, title: 'Compra 100% segura', text: 'Transações criptografadas e checkout verificado' },
              { icon: <CreditCard size={24} />, title: 'Parcelamento Fácil', text: 'Até 12x no cartão ou pagamento Pix simplificado' },
              { icon: <MessageCircle size={24} />, title: 'Suporte humanizado', text: 'Tire dúvidas e finalize pelo canal do WhatsApp' }
            ].map((b, i) => (
              <div key={i} style={{ flex: '1 1 240px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--snack-gold)', flexShrink: 0, marginTop: '2px' }}>{b.icon}</span>
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--snack-green-dark)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{b.title}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--snack-muted)', lineHeight: '1.4' }}>{b.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 14. CLIENTES INSTAGRAM SECTION */}
      <section className="instagram-clients" style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--snack-border)', paddingBottom: '16px', marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--snack-green-dark)' }}>Clientes no Instagram</h2>
            <p style={{ fontSize: '12px', color: 'var(--snack-muted)', margin: '4px 0 0 0' }}>Veja a confiança de quem já comprou: depoimentos e clientes reais</p>
          </div>
          <a
            href="https://www.instagram.com/snackstorebh"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--snack-gold)' }}
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
                  width: '80px', height: '80px', borderRadius: '50%', padding: '3px',
                  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <span style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: 'var(--snack-paper)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, var(--snack-green-dark), #111)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {h.icon}
                  </span>
                </span>
              </span>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--snack-text)', textAlign: 'center' }}>{h.label}</span>
              <span style={{ fontSize: '10px', color: 'var(--snack-muted)', textAlign: 'center', maxWidth: '120px' }}>{h.sub}</span>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
