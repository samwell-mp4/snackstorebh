import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Download, ShoppingBag, Eye } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';

export default function BrandCollectionCatalogo({ perfumes, addToCart }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter only Brand Collection perfumes
  const brandPerfumes = perfumes.filter(p => 
    p.categorySlugs && p.categorySlugs.includes('brand-collection')
  );

  const filtered = brandPerfumes.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.inspiredBy && p.inspiredBy.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <SeoHead 
        title="Catálogo Brand Collection 25ml | Snack Store BH"
        description="Confira o catálogo completo de perfumes Brand Collection em miniaturas de 25ml. Baixe o PDF oficial e veja as fragrâncias disponíveis."
        url="/brand-collection/catalogo/"
      />

      <div style={{ maxWidth: '1200px', margin: '40px auto 80px auto', padding: '0 24px', fontFamily: '"Outfit", sans-serif' }}>
        
        {/* Header Section */}
        <div style={{ 
          background: 'linear-gradient(135deg, var(--snack-green-dark) 0%, #11200e 100%)', 
          color: 'var(--snack-cream)', 
          padding: '48px 32px', 
          borderRadius: '24px', 
          marginBottom: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          border: '1px solid rgba(196,161,90,0.2)'
        }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--snack-gold)', marginBottom: '12px' }}>Downloads & Catálogos</span>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 'bold', fontFamily: 'var(--font-display)', margin: '0 0 16px 0', color: 'var(--snack-gold)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Catálogo Brand Collection 2026
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(245,241,232,0.8)', maxWidth: '600px', lineHeight: '1.6', margin: '0 0 28px 0' }}>
            Explore e baixe o nosso catálogo oficial completo de miniaturas de perfumes importados. Praticidade de 25ml com fragrâncias idênticas às de grife.
          </p>

          <a 
            href="/Miniaturas_Arabes.pdf" 
            download="Catalogo_Miniaturas_SnackStore.pdf"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--snack-gold)',
              color: 'var(--snack-green-dark)',
              textDecoration: 'none',
              padding: '16px 32px',
              borderRadius: '999px',
              fontWeight: 'bold',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: '0 4px 15px rgba(196,161,90,0.3)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--snack-gold-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--snack-gold)'}
          >
            <Download size={16} /> Baixar Catálogo Oficial (PDF)
          </a>
        </div>

        {/* Filter Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '32px', borderBottom: '1px solid var(--snack-border)', paddingBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--snack-green-dark)' }}>Miniaturas Disponíveis ({filtered.length})</h2>
            <p style={{ fontSize: '12px', color: 'var(--snack-muted)', margin: '4px 0 0 0' }}>Busque por nome do perfume, número ou inspiração olfativa</p>
          </div>

          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
            <input 
              type="text"
              placeholder="Buscar perfume no catálogo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 40px',
                border: '1px solid var(--snack-border)',
                borderRadius: '999px',
                fontSize: '13px',
                outline: 'none',
                color: 'var(--snack-text)',
                backgroundColor: 'var(--snack-cream)'
              }}
            />
            <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--snack-muted)' }} />
          </div>
        </div>

        {/* Catalog Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--snack-muted)' }}>
            Nenhum perfume encontrado no catálogo com esses critérios.
          </div>
        ) : (
          <div className="product-grid">
            {filtered.map(p => (
              <div 
                key={p.code} 
                className="product-card"
                onClick={() => navigate(`/produto/${p.slug}/`)}
              >
                <div className="product-card-image-container">
                  <img src={p.image} alt={p.name} />
                  {p.inspiredBy && (
                    <span className="product-card-badge" style={{ backgroundColor: 'var(--snack-gold)', color: 'var(--snack-green-dark)' }}>
                      Inspirado no {p.inspiredBy.split(' - ')[0]}
                    </span>
                  )}
                </div>

                <div style={{ padding: '14px 0 0 0', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '9px', color: 'var(--snack-gold)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{p.brand}</span>
                  <h4 style={{ fontSize: '14px', margin: '4px 0', color: 'var(--snack-text)', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</h4>
                  <span style={{ fontSize: '11px', color: 'var(--snack-muted)', marginBottom: '12px' }}>{p.gender} • 25ml</span>
                  
                  {p.olfactoryFamily && (
                    <span style={{ fontSize: '11px', color: 'var(--snack-green-dark)', fontWeight: '600', marginBottom: '8px' }}>
                      Família: {p.olfactoryFamily}
                    </span>
                  )}

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: 'auto', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--snack-muted)', textDecoration: 'line-through' }}>R$ 119,90</span>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--snack-green-dark)' }}>R$ 79,90</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                      style={{
                        flex: 1, backgroundColor: 'var(--snack-green-dark)', color: 'var(--snack-cream)',
                        border: 'none', padding: '10px', borderRadius: '999px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px'
                      }}
                    >
                      <ShoppingBag size={12} /> Comprar
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/produto/${p.slug}/`); }}
                      style={{
                        padding: '10px 14px', backgroundColor: 'transparent', border: '1px solid var(--snack-border)',
                        borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--snack-text)'
                      }}
                      aria-label="Ver detalhes"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </>
  );
}
