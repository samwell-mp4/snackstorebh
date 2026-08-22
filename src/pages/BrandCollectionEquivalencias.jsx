import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ShoppingBag, ArrowRight } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';

export default function BrandCollectionEquivalencias({ perfumes, addToCart }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter only Brand Collection perfumes
  const brandPerfumes = perfumes.filter(p => 
    p.categorySlugs && p.categorySlugs.includes('brand-collection')
  );

  const filtered = brandPerfumes.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.inspiredBy && p.inspiredBy.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <SeoHead 
        title="Tabela de Equivalências Brand Collection | Snack Store BH"
        description="Veja a tabela de equivalências dos perfumes Brand Collection. Encontre qual número corresponde à sua fragrância importada favorita."
        url="/brand-collection/equivalencias/"
      />

      <div style={{ maxWidth: '1000px', margin: '40px auto 80px auto', padding: '0 24px', fontFamily: '"Outfit", sans-serif' }}>
        
        {/* Header Section */}
        <div style={{ borderBottom: '1px solid var(--snack-border)', paddingBottom: '24px', marginBottom: '32px' }}>
          <span style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--snack-gold)' }}>Guia de Referência Olfativa</span>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', margin: '8px 0 12px 0', fontFamily: 'serif', color: 'var(--snack-green-dark)' }}>
            Tabela de Equivalência Brand Collection
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--snack-muted)', lineHeight: '1.6', margin: 0 }}>
            Quer saber qual perfume da Brand Collection é parecido com o importado de grife que você já usa? Digite o nome da marca original ou do perfume abaixo para encontrar a equivalência perfeita de 25ml.
          </p>
        </div>

        {/* Search Control */}
        <div style={{ position: 'relative', width: '100%', marginBottom: '28px' }}>
          <input 
            type="text"
            placeholder="Digite o perfume de grife (ex: Good Girl, Sauvage, Invictus...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 20px 16px 48px',
              border: '1px solid var(--snack-border)',
              borderRadius: '12px',
              fontSize: '14px',
              outline: 'none',
              color: 'var(--snack-text)',
              backgroundColor: 'var(--snack-cream)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}
          />
          <Search size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--snack-muted)' }} />
        </div>

        {/* Equivalency Table */}
        <div style={{ 
          backgroundColor: 'var(--snack-paper)', 
          border: '1px solid var(--snack-border)', 
          borderRadius: '16px', 
          overflow: 'hidden',
          boxShadow: 'var(--box-shadow-premium)'
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--snack-muted)' }}>
              Nenhuma equivalência encontrada para "{searchTerm}".
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--snack-cream)', borderBottom: '1px solid var(--snack-border)' }}>
                  <th style={{ padding: '16px 20px', fontWeight: 'bold', color: 'var(--snack-green-dark)' }}>Miniatura Brand Collection</th>
                  <th style={{ padding: '16px 20px', fontWeight: 'bold', color: 'var(--snack-green-dark)' }}>Referência / Inspiração Olfativa</th>
                  <th style={{ padding: '16px 20px', fontWeight: 'bold', color: 'var(--snack-green-dark)' }}>Gênero</th>
                  <th style={{ padding: '16px 20px', fontWeight: 'bold', color: 'var(--snack-green-dark)', textAlign: 'right' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.code} style={{ borderBottom: '1px solid rgba(41,69,31,.04)', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--snack-border)', borderRadius: '8px', padding: '2px', backgroundColor: '#fff' }}>
                        <img src={p.image} alt={p.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                      </div>
                      <div>
                        <strong style={{ display: 'block', color: 'var(--snack-text)' }}>{p.name.replace(' - Mini Perfume', '')}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--snack-muted)' }}>Cód: {p.code}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: '600', color: 'var(--snack-green-dark)' }}>
                      {p.inspiredBy || 'Fragrância Importada Exclusiva'}
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--snack-muted)' }}>
                      {p.gender}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => addToCart(p)}
                          style={{
                            backgroundColor: 'var(--snack-green-dark)',
                            color: 'var(--snack-cream)',
                            border: 'none',
                            padding: '8px 14px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <ShoppingBag size={12} /> Comprar
                        </button>
                        <Link 
                          to={`/produto/${p.slug}/`}
                          style={{
                            border: '1px solid var(--snack-border)',
                            color: 'var(--snack-text)',
                            padding: '8px 12px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}
                        >
                          Detalhes
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* EEAT Block / Info */}
        <div style={{ 
          marginTop: '48px', 
          padding: '24px', 
          backgroundColor: 'var(--snack-cream)', 
          borderRadius: '16px', 
          border: '1px solid var(--snack-border)',
          fontSize: '13px',
          color: 'var(--snack-muted)',
          lineHeight: '1.6'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--snack-green-dark)', marginBottom: '8px' }}>Esclarecimento sobre Inspiração Olfativa (EEAT)</h3>
          <p>
            As miniaturas da linha <strong>Brand Collection</strong> são produzidas com óleos essenciais de alta qualidade e são inspiradas nas pirâmides olfativas dos perfumes de grifes famosas. A indicação de "Referência / Inspiração Olfativa" serve apenas como guia de similaridade para o consumidor final, facilitando a identificação dos aromas. A Snack Store BH não possui vínculo comercial com as marcas proprietárias dos perfumes inspirados.
          </p>
        </div>

      </div>
    </>
  );
}
