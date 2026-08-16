import React from 'react';
import { ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead';

export default function CategoryPage({ perfumes, addToCart }) {
  const navigate = useNavigate();
  const { categorySlug } = useParams();

  // Mapping slugs to filters
  let filteredPerfumes = perfumes;
  let pageTitle = "Mini Perfumes Importados";
  let h1Title = "Mini Perfumes Importados";
  
  if (categorySlug === 'mini-perfumes-femininos') {
    filteredPerfumes = perfumes.filter(p => p.gender === 'Feminino');
    pageTitle = "Mini Perfumes Femininos 25ml | Perfumes Importados";
    h1Title = "Mini Perfumes Femininos 25ml";
  } else if (categorySlug === 'mini-perfumes-masculinos') {
    filteredPerfumes = perfumes.filter(p => p.gender === 'Masculino');
    pageTitle = "Mini Perfumes Masculinos 25ml | Perfumes Importados";
    h1Title = "Mini Perfumes Masculinos 25ml";
  } else if (categorySlug === 'mini-perfumes-unissex') {
    filteredPerfumes = perfumes.filter(p => p.gender === 'Compartilhável');
    pageTitle = "Mini Perfumes Unissex 25ml | Miniaturas Importadas";
    h1Title = "Mini Perfumes Unissex 25ml";
  } else if (categorySlug === 'brand-collection') {
    filteredPerfumes = perfumes.filter(p => p.categorySlugs && p.categorySlugs.includes('brand-collection'));
    pageTitle = "Brand Collection 25ml | Mini Perfumes Femininos e Masculinos";
    h1Title = "Perfumes Brand Collection 25ml";
  } else if (categorySlug === 'arabic-collection') {
    filteredPerfumes = perfumes.filter(p => p.categorySlugs && p.categorySlugs.includes('arabic-collection'));
    pageTitle = "Arabic Collection 25ml | Mini Perfumes Árabes";
    h1Title = "Perfumes Arabic Collection 25ml";
  } else if (categorySlug === 'mini-perfumes-para-presente') {
    filteredPerfumes = perfumes.filter(p => p.categorySlugs && p.categorySlugs.includes('mini-perfumes-para-presente'));
    pageTitle = "Mini Perfumes para Presente | Perfumes 25ml";
    h1Title = "Mini Perfumes para Presente";
  } else if (categorySlug === 'mini-perfumes-em-bh') {
    pageTitle = "Mini Perfumes em BH | Miniaturas de Perfumes 25ml";
    h1Title = "Mini Perfumes em Belo Horizonte";
  }

  return (
    <>
      <SeoHead 
        title={pageTitle}
        description={`Descubra nossa seleção especial de ${h1Title}. Fragrâncias exclusivas em miniaturas de 25ml por apenas R$ 79,90.`}
        url={`/${categorySlug}`}
        schemaType="CollectionPage"
      />

      <div style={{ padding: '24px 16px', borderBottom: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#555', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Voltar à loja inicial
          </Link>
        </div>
      </div>

      <section style={{ maxWidth: '1200px', margin: '40px auto 80px auto', padding: '0 16px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px 0' }}>{h1Title}</h1>
          <span style={{ fontSize: '14px', color: '#555555' }}>Mostrando {filteredPerfumes.length} perfumes correspondentes</span>
        </div>

        {filteredPerfumes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#888888' }}>
            Nenhum perfume encontrado nesta categoria.
          </div>
        ) : (
          <div className="product-grid">
            {filteredPerfumes.map(perfume => (
              <div 
                key={perfume.code}
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
                  <span style={{ fontSize: '10px', color: '#888888', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{perfume.brand}</span>
                  <h3 style={{ fontSize: '14px', margin: '4px 0', color: '#1a1a1a', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{perfume.name}</h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#888888', textDecoration: 'line-through' }}>R$ 119,90</span>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>R$ 79,90</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); addToCart(perfume); }}
                    style={{ marginTop: 'auto', backgroundColor: '#ffffff', color: '#000000', border: '1px solid #000000', padding: '10px', borderRadius: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#000000'; e.currentTarget.style.color = '#ffffff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#000000'; }}
                  >
                    <ShoppingBag size={14} /> Adicionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {categorySlug === 'mini-perfumes-em-bh' && (
          <div style={{ marginTop: '60px', padding: '40px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Entregas Expressas em Belo Horizonte</h2>
            <p>A Snack Store oferece entregas no mesmo dia para diversos bairros de BH. Consulte taxa e disponibilidade via WhatsApp.</p>
          </div>
        )}
      </section>
    </>
  );
}
