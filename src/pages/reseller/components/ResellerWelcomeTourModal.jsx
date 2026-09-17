import React, { useState } from 'react';
import { Crown, ShoppingBag, Package, Zap, ChevronRight, ChevronLeft, Check, Sparkles, X, ArrowRight } from 'lucide-react';

export default function ResellerWelcomeTourModal({ isOpen, onClose, userName, onGoToCatalog }) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  if (!isOpen) return null;

  const slides = [
    {
      step: 1,
      badge: '👑 ACESSO VIP LIBERADO',
      badgeColor: '#b45309',
      badgeBg: '#fef3c7',
      title: 'Bem-vindo ao seu Portal de Revenda Snack Store!',
      subtitle: `Olá, ${userName || 'Revendedor VIP'}! Seu cadastro foi concluído e sua conta agora possui acesso oficial de atacado.`,
      icon: <Crown size={42} color="var(--snack-gold)" />,
      highlights: [
        { title: 'Margens de 80% a 120%', desc: 'Compre perfumes a partir de R$ 45,92 e venda de R$ 74,90 a R$ 99,90.' },
        { title: 'Mais de 350 Fragrâncias em Estoque', desc: 'Brand Collection 25ml, Árabes (Lattafa, Armaf, Afnan) e miniaturas femininas e masculinas.' },
        { title: 'Preço Direto de Distribuidora', desc: 'Sem intermediários, com suporte comercial diário pelo WhatsApp.' }
      ]
    },
    {
      step: 2,
      badge: '🛍️ COMPRAS E PEDIDOS EM 1 CLIQUE',
      badgeColor: '#166534',
      badgeBg: '#dcfce7',
      title: 'Você Já Está na Aba "Catálogo & Pedidos"',
      subtitle: 'Aqui você encontra tudo o que precisa para abastecer seu estoque ou vender sob encomenda.',
      icon: <ShoppingBag size={42} color="#166534" />,
      highlights: [
        { title: 'Seleção em Massa de Fragrâncias', desc: 'Marque vários perfumes de uma vez usando as caixas de seleção e crie um pedido unificado.' },
        { title: 'Estoque Sincronizado em Tempo Real', desc: 'Saiba exatamente quantas unidades estão disponíveis para pronta entrega imediata em BH.' },
        { title: 'Filtros Inteligentes por Marca e Gênero', desc: 'Encontre rapidamente Dior, Chanel, Carolina Herrera, Versace e coleções árabes.' }
      ]
    },
    {
      step: 3,
      badge: '📦 DROPSHIPPING & MULTI-CLIENTES',
      badgeColor: '#4338ca',
      badgeBg: '#e0e7ff',
      title: 'Venda Sem Precisar de Estoque Físico em Casa!',
      subtitle: 'Nossa estrutura de Fulfillment faz todo o trabalho logístico pesado para você.',
      icon: <Package size={42} color="#4338ca" />,
      highlights: [
        { title: 'Embalagem 100% Neutra', desc: 'Despachamos para seu cliente final sem nenhuma etiqueta ou menção à Snack Store BH. O cliente acha que você mesmo enviou!' },
        { title: 'Múltiplos Destinatários em 1 Único Pedido', desc: 'Comprou 5 ou mais frascos? Você pode dividir a entrega para 2 ou mais clientes com endereços diferentes!' },
        { title: 'Rastreamento Completo', desc: 'Você recebe o código de rastreio de cada pacote para repassar aos seus compradores.' }
      ]
    },
    {
      step: 4,
      badge: '⚡ PRAZOS E LOGÍSTICA INTELIGENTE',
      badgeColor: '#9a3412',
      badgeBg: '#ffedd5',
      title: 'Modalidades de Frete Sob Medida para Seu Lucro',
      subtitle: 'Escolha a velocidade ideal para cada cliente ou aproveite descontos adicionais por volume.',
      icon: <Zap size={42} color="#ea580c" />,
      highlights: [
        { title: '⚡ Expresso BH (1 a 6 horas)', desc: 'Motoboy rápido em toda Belo Horizonte e Região Metropolitana. Perfeito para vendas imediatas.' },
        { title: '📦 Programado (7 dias)', desc: 'Para clientes que podem esperar alguns dias, com preço de custo ainda menor.' },
        { title: '💰 Econômico (15 dias)', desc: 'A modalidade com o maior lucro líquido por frasco do mercado para pedidos programados.' }
      ]
    }
  ];

  const currentSlide = slides[currentStep - 1];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      if (onGoToCatalog) onGoToCatalog();
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 140,
      backgroundColor: 'rgba(5, 15, 6, 0.82)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '24px', maxWidth: '560px', width: '100%',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(196,161,90,0.25)',
        overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column'
      }}>
        {/* Top Gradient Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--snack-green-dark) 0%, #0d1a0b 100%)',
          padding: '24px 28px', color: '#ffffff', position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '18px', right: '18px', background: 'rgba(255,255,255,0.12)',
              border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            title="Pular apresentação"
          >
            <X size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(196,161,90,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {currentSlide.icon}
            </div>
            <div>
              <span style={{
                fontSize: '10px', fontWeight: '800', letterSpacing: '1.2px', textTransform: 'uppercase',
                backgroundColor: currentSlide.badgeBg, color: currentSlide.badgeColor,
                padding: '4px 8px', borderRadius: '6px', display: 'inline-block', marginBottom: '6px'
              }}>
                {currentSlide.badge}
              </span>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>
                Passo {currentStep} de {totalSteps} • Tour de Iniciação
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '28px', flex: 1 }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--snack-green-dark)', margin: '0 0 8px 0', lineHeight: '1.25' }}>
            {currentSlide.title}
          </h2>
          <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.5', margin: '0 0 20px 0' }}>
            {currentSlide.subtitle}
          </p>

          {/* Highlights List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {currentSlide.highlights.map((h, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex', gap: '12px', alignItems: 'flex-start',
                  backgroundColor: '#f9fafb', borderRadius: '12px', padding: '12px 14px',
                  border: '1px solid #f3f4f6'
                }}
              >
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  backgroundColor: 'var(--snack-green-dark)', color: '#ffffff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px'
                }}>
                  <Check size={12} strokeWidth={3} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#111827' }}>
                    {h.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px', lineHeight: '1.4' }}>
                    {h.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Step Indicators */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            {slides.map(s => (
              <div
                key={s.step}
                onClick={() => setCurrentStep(s.step)}
                style={{
                  height: '8px', width: currentStep === s.step ? '28px' : '8px',
                  borderRadius: '999px',
                  backgroundColor: currentStep === s.step ? 'var(--snack-gold)' : '#e5e7eb',
                  transition: 'all 0.3s ease', cursor: 'pointer'
                }}
              />
            ))}
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                style={{
                  padding: '12px 20px', borderRadius: '10px', border: '1px solid #d1d5db',
                  backgroundColor: '#ffffff', color: '#374151', fontSize: '12px', fontWeight: '700',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <ChevronLeft size={16} />
                <span>Voltar</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '12px 20px', border: 'none', background: 'none',
                  color: '#9ca3af', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                }}
              >
                Pular tour
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              style={{
                flex: currentStep === 1 ? 1 : 'none',
                padding: '14px 28px', borderRadius: '12px', border: 'none',
                background: currentStep === totalSteps
                  ? 'linear-gradient(135deg, var(--snack-gold) 0%, #a67c2e 100%)'
                  : 'linear-gradient(135deg, var(--snack-green-dark) 0%, #152712 100%)',
                color: currentStep === totalSteps ? 'var(--snack-green-dark)' : '#ffffff',
                fontSize: '13px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: currentStep === totalSteps ? '0 6px 20px rgba(196,161,90,0.4)' : '0 4px 15px rgba(23,43,20,0.3)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {currentStep === totalSteps ? (
                <>
                  <span>Ir para o Catálogo e Comprar 🚀</span>
                  <ArrowRight size={16} />
                </>
              ) : (
                <>
                  <span>Próximo Passo</span>
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
