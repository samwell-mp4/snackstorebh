import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, ShieldCheck, MapPin, Star, User, MessageCircle, Info } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead';

const StarRating = ({ rating, size = 16, color = '#facc15' }) => {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star} 
          size={size} 
          fill={star <= rating ? color : 'none'} 
          stroke={star <= rating ? color : '#d1d5db'} 
        />
      ))}
    </div>
  );
};

export default function ProductPage({ perfumes, addToCart }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const product = perfumes.find(p => p.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    
    // Carregar avaliações do localStorage
    const savedReviews = localStorage.getItem(`reviews_${product.code}`);
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    } else {
      // Gerar avaliações falsas iniciais se não houver
      const fakeReviews = [
        {
          id: 1,
          name: "Carlos M.",
          rating: 5,
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
          comment: `Achei sensacional. Comprei às cegas e me surpreendi. Lembra muito o ${product.inspiredBy || 'importado famoso'}, fixação durou o dia todo. Recomendo!`
        },
        {
          id: 2,
          name: "Mariana Silva",
          rating: 5,
          date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
          comment: "Entrega super rápida aqui em BH, chegou no mesmo dia. O cheiro é maravilhoso, minha nova assinatura."
        },
        {
          id: 3,
          name: "Lucas T.",
          rating: 4,
          date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
          comment: "Perfume excelente, projeção muito boa. Só dei 4 estrelas porque queria que o frasco fosse maior, mas por 25ml vale cada centavo."
        }
      ];
      setReviews(fakeReviews);
      localStorage.setItem(`reviews_${product.code}`, JSON.stringify(fakeReviews));
    }
  }, [product]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      const reviewObj = {
        id: Date.now(),
        name: newReview.name,
        rating: newReview.rating,
        date: new Date().toLocaleDateString('pt-BR'),
        comment: newReview.comment
      };
      const updatedReviews = [reviewObj, ...reviews];
      setReviews(updatedReviews);
      localStorage.setItem(`reviews_${product.code}`, JSON.stringify(updatedReviews));
      setNewReview({ name: '', rating: 5, comment: '' });
      setIsSubmitting(false);
    }, 600);
  };

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2>Produto não encontrado</h2>
        <Link to="/">Voltar para a página inicial</Link>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
    : "5.0";

  const relatedPerfumes = perfumes.filter(p => p.code !== product.code && p.gender === product.gender).slice(0, 4);

  const isBrandCollection = product.categorySlugs && product.categorySlugs.includes('brand-collection');

  return (
    <>
      <SeoHead 
        title={`${product.name} | Mini Perfume ${product.gender}${isBrandCollection ? ' | Brand Collection' : ''}`}
        description={`${product.name}: ${product.description} Compre mini perfumes importados da Brand Collection em BH.`}
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

      <div style={{ maxWidth: '1200px', margin: '40px auto 40px auto', padding: '0 16px' }}>
        <div className="product-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #f0f0f0', borderRadius: '4px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '500px', position: 'relative' }}>
              <img src={product.image} alt={product.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
              <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: '#000', color: '#fff', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {product.volume}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', backgroundColor: '#f5f5f5', padding: '4px 12px', borderRadius: '99px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {product.brand}
              </span>
              <span style={{ fontSize: '11px', backgroundColor: '#000000', color: '#ffffff', padding: '4px 12px', borderRadius: '99px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {product.gender}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                <StarRating rating={Math.round(averageRating)} size={14} />
                <span style={{ fontSize: '12px', color: '#666' }}>({reviews.length} avaliações)</span>
              </div>
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
                style={{ width: '100%', backgroundColor: '#000000', color: '#ffffff', border: 'none', padding: '16px', borderRadius: '2px', fontSize: '14px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'background-color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#000'}
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
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 80px auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', marginBottom: '32px' }}>
          <button 
            onClick={() => setActiveTab('details')}
            style={{ 
              padding: '16px 24px', 
              backgroundColor: 'transparent', 
              border: 'none', 
              borderBottom: activeTab === 'details' ? '2px solid #000' : '2px solid transparent',
              color: activeTab === 'details' ? '#000' : '#888',
              fontSize: '14px', 
              fontWeight: 'bold', 
              textTransform: 'uppercase', 
              letterSpacing: '1px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Info size={16} /> Detalhes do Produto
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            style={{ 
              padding: '16px 24px', 
              backgroundColor: 'transparent', 
              border: 'none', 
              borderBottom: activeTab === 'reviews' ? '2px solid #000' : '2px solid transparent',
              color: activeTab === 'reviews' ? '#000' : '#888',
              fontSize: '14px', 
              fontWeight: 'bold', 
              textTransform: 'uppercase', 
              letterSpacing: '1px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <MessageCircle size={16} /> Avaliações ({reviews.length})
          </button>
        </div>

        {/* Tab Content: Details */}
        {activeTab === 'details' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', fontFamily: 'serif' }}>Sobre a Fragrância</h3>
              <p style={{ fontSize: '15px', color: '#555', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                {product.longDescription || product.description}
              </p>

              {product.topNotes && (
                <div style={{ marginTop: '32px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Pirâmide Olfativa</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#000' }}>Notas de Topo:</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                        {product.topNotes.map((n, i) => <span key={i} style={{ backgroundColor: '#f5f5f5', padding: '4px 10px', borderRadius: '2px', fontSize: '12px' }}>{n}</span>)}
                      </div>
                    </div>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#000' }}>Notas de Coração:</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                        {product.heartNotes.map((n, i) => <span key={i} style={{ backgroundColor: '#f5f5f5', padding: '4px 10px', borderRadius: '2px', fontSize: '12px' }}>{n}</span>)}
                      </div>
                    </div>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#000' }}>Notas de Fundo:</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                        {product.baseNotes.map((n, i) => <span key={i} style={{ backgroundColor: '#f5f5f5', padding: '4px 10px', borderRadius: '2px', fontSize: '12px' }}>{n}</span>)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div style={{ backgroundColor: '#f9f9f9', padding: '32px', borderRadius: '4px', border: '1px solid #f0f0f0' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px' }}>Ficha Técnica</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#666' }}>Marca</span>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#000' }}>{product.brand}</span>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#666' }}>Família Olfativa</span>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#000', textAlign: 'right' }}>{product.olfactoryFamily || 'Oriental'}</span>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#666' }}>Inspiração (Referência)</span>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#000', textAlign: 'right' }}>{product.inspiredBy || 'Exclusiva'}</span>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#666' }}>Projeção</span>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#000', textAlign: 'right' }}>{product.projection || 'Marcante'}</span>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#666' }}>Fixação na Pele</span>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#000', textAlign: 'right' }}>{product.duration || 'Longa duração'}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Reviews */}
        {activeTab === 'reviews' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            
            {/* Review List */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '48px', fontWeight: '900', fontFamily: 'serif', margin: 0 }}>{averageRating}</h3>
                <div>
                  <StarRating rating={Math.round(averageRating)} size={20} />
                  <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>Baseado em {reviews.length} avaliações</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {reviews.map(review => (
                  <div key={review.id} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={16} color="#888" />
                        </div>
                        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{review.name}</span>
                        <span style={{ backgroundColor: '#000', color: '#fff', fontSize: '9px', padding: '2px 6px', borderRadius: '2px', textTransform: 'uppercase' }}>Comprador Verificado</span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#888' }}>{review.date}</span>
                    </div>
                    <StarRating rating={review.rating} size={14} />
                    <p style={{ fontSize: '14px', color: '#444', lineHeight: '1.6', marginTop: '12px' }}>{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Write a Review Form */}
            <div>
              <div style={{ backgroundColor: '#f9f9f9', padding: '32px', borderRadius: '4px', border: '1px solid #f0f0f0', position: 'sticky', top: '100px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '24px', fontFamily: 'serif' }}>Escreva uma Avaliação</h3>
                <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Sua Nota</label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star}
                          type="button"
                          onClick={() => setNewReview({...newReview, rating: star})}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <Star size={24} fill={star <= newReview.rating ? '#facc15' : 'none'} stroke={star <= newReview.rating ? '#facc15' : '#d1d5db'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Seu Nome</label>
                    <input 
                      type="text" 
                      required
                      value={newReview.name}
                      onChange={(e) => setNewReview({...newReview, name: e.target.value})}
                      placeholder="Ex: João Souza"
                      style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '2px', fontSize: '14px', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Seu Comentário</label>
                    <textarea 
                      required
                      rows="4"
                      value={newReview.comment}
                      onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                      placeholder="O que você achou da fragrância, fixação e entrega?"
                      style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '2px', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    style={{ 
                      backgroundColor: '#000', color: '#fff', border: 'none', padding: '14px', 
                      borderRadius: '2px', fontWeight: 'bold', textTransform: 'uppercase', 
                      letterSpacing: '1px', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 
                    }}
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
                  </button>
                </form>
              </div>
            </div>

          </div>
        )}
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
