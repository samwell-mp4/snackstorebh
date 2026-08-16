import React from 'react';
import { ArrowLeft, ShoppingBag, ShieldCheck, MapPin, Tag } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead';

export default function ProductPage({ perfumes, addToCart }) {
  const { slug } = useParams();
  const navigate = useNavigate();

  const product = perfumes.find(p => p.slug === slug);

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2>Produto não encontrado</h2>
        <Link to="/">Voltar para a página inicial</Link>
      </div>
    );
  }

  const relatedPerfumes = perfumes.filter(p => p.code !== product.code && p.gender === product.gender).slice(0, 4);

  return (
    <>
      <SeoHead 
        title={`${product.name} | Mini Perfume ${product.gender}`}
        description={`${product.name}: ${product.description} Compre mini perfumes importados em BH.`}
        url={`/produto/${product.slug}`}
        imageUrl={product.image}
        schemaType="Product"
        productData={product}
      />

      {/* Breadcrumb e Voltar */}
      <div style={{ padding: '24px 16px', borderBottom: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Link to="/" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#555', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Voltar à loja inicial
          </Link>
          <span style={{ color: '#ccc', margin: '0 8px' }}>/</span>
          <Link to="/mini-perfumes-importados" style={{ fontSize: '12px', color: '#888', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Miniaturas
          </Link>
          <span style={{ color: '#ccc', margin: '0 8px' }}>/</span>
          <span style={{ fontSize: '12px', color: '#1a1a1a', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {product.name}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '40px auto 80px auto', padding: '0 16px' }}>
        <div className="product-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #f0f0f0', borderRadius: '4px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '500px' }}>
              <img src={product.image} alt={product.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', backgroundColor: '#f5f5f5', padding: '4px 12px', borderRadius: '99px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {product.brand}
              </span>
              <span style={{ fontSize: '11px', backgroundColor: '#000000', color: '#ffffff', padding: '4px 12px', borderRadius: '99px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {product.gender}
              </span>
            </div>

            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 16px 0', lineHeight: '1.2' }}>{product.name}</h1>
            
            <p style={{ fontSize: '15px', color: '#555555', lineHeight: '1.6', margin: '0 0 24px 0' }}>
              {product.description}
            </p>

            <div style={{ backgroundColor: '#fafafa', padding: '24px', borderRadius: '4px', marginBottom: '32px', border: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '16px', color: '#888888', textDecoration: 'line-through', marginBottom: '4px' }}>R$ 119,90</span>
                <span style={{ fontSize: '32px', fontWeight: '900', color: '#000000' }}>R$ 79,90</span>
              </div>
              <p style={{ fontSize: '13px', color: '#666', margin: '0 0 24px 0' }}>Pagamento via Pix. 100% Seguro.</p>
              
              <button 
                onClick={() => addToCart(product)}
                style={{ width: '100%', backgroundColor: '#000000', color: '#ffffff', border: 'none', padding: '16px', borderRadius: '2px', fontSize: '14px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              >
                <ShoppingBag size={18} /> Adicionar à Sacola
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <ShieldCheck size={20} style={{ color: '#000' }} />
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold' }}>Produto Original</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Garantia de procedência em todas as fragrâncias.</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <MapPin size={20} style={{ color: '#000' }} />
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold' }}>Entrega Expressa BH</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Receba no mesmo dia em Belo Horizonte via motoboy.</p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '40px', borderTop: '1px solid #f0f0f0', paddingTop: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Notas Olfativas</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {product.notes.map((note, index) => (
                  <span key={index} style={{ backgroundColor: '#f5f5f5', padding: '6px 12px', borderRadius: '2px', fontSize: '12px', color: '#333' }}>
                    {note}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Produtos Relacionados */}
      {relatedPerfumes.length > 0 && (
        <section style={{ maxWidth: '1200px', margin: '0 auto 80px auto', padding: '0 16px' }}>
          <div style={{ borderBottom: '1px solid #e0e0e0', paddingBottom: '16px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Você também pode gostar</h2>
          </div>
          <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {relatedPerfumes.map(related => (
              <div 
                key={`related-${related.code}`}
                onClick={() => {
                  navigate(`/produto/${related.slug}`);
                  window.scrollTo(0, 0);
                }}
                style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
              >
                <div style={{ height: '240px', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                  <img src={related.image} alt={related.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ padding: '12px 0' }}>
                  <span style={{ fontSize: '10px', color: '#888888', fontWeight: 'bold', textTransform: 'uppercase' }}>{related.brand}</span>
                  <h4 style={{ fontSize: '13px', margin: '4px 0', color: '#1a1a1a', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{related.name}</h4>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>R$ 79,90</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
