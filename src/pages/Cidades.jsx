import React from 'react';
import { Link } from 'react-router-dom';
import { cities } from '../citiesData';
import { seoPages } from '../seoPagesData';
import { SeoHead } from '../components/SeoHead';
import { ArrowLeft, MapPin } from 'lucide-react';

export default function Cidades() {
  // Agrupar cidades por UF
  const ufs = [...new Set(cities.map(c => c.uf))].sort();

  return (
    <>
      <SeoHead 
        title="Nossas Lojas e Cidades Atendidas | Snack Store BH"
        description="Encontre a Snack Store na sua região. Atendemos mais de 100 cidades com envio expresso de miniaturas e perfumes importados."
        url="/cidades"
      />

      <div style={{ maxWidth: '1000px', margin: '40px auto 80px auto', padding: '0 16px', fontFamily: '"Outfit", sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#555', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Voltar à página inicial
          </Link>
        </div>

        <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '20px', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 12px 0', fontFamily: 'serif' }}>Nossas Lojas e Cidades Atendidas</h1>
          <p style={{ fontSize: '15px', color: '#666', margin: 0 }}>Escolha sua região para ver promoções exclusivas, prazos e opções de entrega de perfumes importados 25ml.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {ufs.map(uf => {
            const citiesInUf = cities.filter(c => c.uf === uf).sort((a, b) => a.name.localeCompare(b.name));
            
            return (
              <div key={uf} style={{ borderBottom: '1px solid #f9f9f9', paddingBottom: '30px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#000', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={18} /> {uf} (Cidades Atendidas)
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px 24px' }}>
                  {citiesInUf.map(city => {
                    const miniaturaSlug = `miniaturas-de-perfumes-importados-em-${city.slug}-${city.uf.toLowerCase()}`;
                    const arabesSlug = `perfumes-arabes-importados-em-${city.slug}-${city.uf.toLowerCase()}`;

                    // Especial para Belo Horizonte que é manual
                    const isBH = city.slug === 'belo-horizonte';
                    const finalMiniaturaSlug = isBH ? 'loja-de-perfumes-importados-bh' : miniaturaSlug;

                    return (
                      <div key={city.slug} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a1a' }}>{city.name}</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '8px', borderLeft: '1px solid #eee' }}>
                          <Link to={`/${finalMiniaturaSlug}`} style={{ fontSize: '12px', color: '#666', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = '#000'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                            • Miniaturas 25ml
                          </Link>
                          {!isBH && (
                            <Link to={`/${arabesSlug}`} style={{ fontSize: '12px', color: '#666', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = '#000'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                              • Perfumes Árabes
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
