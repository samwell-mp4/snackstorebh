import React, { useState, useEffect } from 'react';
import { ArrowRight, ShoppingBag, Search } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead';

export default function Home({ perfumes, addToCart }) {
  const navigate = useNavigate();
  const [recentBuyer, setRecentBuyer] = useState(null);
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

  const promoPerfumes = perfumes.slice(0, 4);
  const trendingPerfumes = perfumes.slice(4, 8);

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

      {/* Banner de Categorias (Masculino e Feminino) */}
      <section style={{ maxWidth: '1200px', margin: '48px auto', padding: '0 16px' }}>
        <div className="category-grid">
          
          <div 
            onClick={() => navigate('/mini-perfumes-femininos')}
            style={{
              position: 'relative', height: '240px', backgroundColor: '#faf4f4', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px',
              borderRadius: '4px', border: '1px solid #f0e6e6', overflow: 'hidden'
            }}
          >
            <div style={{ zIndex: 10 }}>
              <span style={{ fontSize: '11px', color: '#c29a9a', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>Coleção Feminina</span>
              <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#000000', margin: '8px 0 16px 0', fontFamily: 'serif' }}>Mini Perfumes Femininos</h3>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#000000', display: 'flex', alignItems: 'center', gap: '4px' }}>
                VER PRODUTOS <ArrowRight size={14} />
              </span>
            </div>
            <div style={{ position: 'absolute', right: '10%', bottom: '-10%', fontSize: '120px', color: '#f3e6e6', fontFamily: 'serif', pointerEvents: 'none' }}>♀</div>
          </div>

          <div 
            onClick={() => navigate('/mini-perfumes-masculinos')}
            style={{
              position: 'relative', height: '240px', backgroundColor: '#f4f7fa', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px',
              borderRadius: '4px', border: '1px solid #e6ecf0', overflow: 'hidden'
            }}
          >
            <div style={{ zIndex: 10 }}>
              <span style={{ fontSize: '11px', color: '#9aaac2', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>Coleção Masculina</span>
              <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#000000', margin: '8px 0 16px 0', fontFamily: 'serif' }}>Mini Perfumes Masculinos</h3>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#000000', display: 'flex', alignItems: 'center', gap: '4px' }}>
                VER PRODUTOS <ArrowRight size={14} />
              </span>
            </div>
            <div style={{ position: 'absolute', right: '10%', bottom: '-10%', fontSize: '120px', color: '#e6ecf0', fontFamily: 'serif', pointerEvents: 'none' }}>♂</div>
          </div>
          
        </div>
      </section>

      {/* Secoes Promocionais */}
      <section style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #e0e0e0', paddingBottom: '16px', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Lançamentos</h2>
            <p style={{ fontSize: '13px', color: '#888888', margin: '4px 0 0 0' }}>Novas fragrâncias adicionadas à coleção</p>
          </div>
          <Link to="/mini-perfumes-importados" style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', textDecoration: 'none', color: '#000000' }}>Ver todos</Link>
        </div>

        <div className="product-grid">
          {promoPerfumes.map(perfume => (
            <div 
              key={`promo-${perfume.code}`}
              onClick={() => navigate(`/produto/${perfume.slug}`)}
              style={{ cursor: 'pointer', transition: 'transform 0.2s', position: 'relative' }}
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
        </div>
      </section>

      <section id="vitrine" style={{ maxWidth: '1200px', margin: '80px auto 40px auto', padding: '0 16px' }}>
        <div style={{ borderBottom: '1px solid #e0e0e0', paddingBottom: '16px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>MINIATURAS DE PERFUMES 25ML ({perfumes.length})</h2>
        </div>

        <div className="product-grid">
          {perfumes.map(perfume => (
            <div 
              key={`home-all-${perfume.code}`}
              onClick={() => navigate(`/produto/${perfume.slug}`)}
              style={{
                backgroundColor: '#ffffff', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', transition: 'transform 0.2s',
                position: 'relative'
              }}
            >
              <div style={{
                height: '280px', backgroundColor: '#ffffff', display: 'flex',
                alignItems: 'center', justifyItems: 'center', justifyContent: 'center', padding: '16px',
                border: '1px solid #f0f0f0', borderRadius: '4px', position: 'relative'
              }}>
                <img src={perfume.image} alt={perfume.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#000000', color: '#ffffff', fontSize: '9px', fontWeight: 'bold', padding: '4px 8px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {perfume.gender}
                </div>
              </div>
              
              <div style={{ padding: '16px 0 0 0', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <span style={{ fontSize: '11px', color: '#888888', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{perfume.brand}</span>
                <h3 style={{ fontSize: '15px', margin: '6px 0', color: '#1a1a1a', fontWeight: 'bold', lineHeight: '1.4' }}>{perfume.name}</h3>
                <p style={{ fontSize: '12px', color: '#666666', margin: '0 0 16px 0', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '36px' }}>{perfume.description}</p>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#000000' }}>R$ 79,90</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); addToCart(perfume); }}
                    style={{ backgroundColor: '#000000', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}
                  >
                    <ShoppingBag size={14} /> Adicionar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
