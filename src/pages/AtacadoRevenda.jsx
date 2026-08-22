import React from 'react';
import { Truck, ShieldCheck, CreditCard, MessageCircle, HelpCircle, Check } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';

export default function AtacadoRevenda() {
  const WHATSAPP_NUMBER = "553175650503";

  const faqs = [
    { question: 'Qual a quantidade mínima (pedido mínimo) no atacado?', answer: 'O pedido mínimo para atacado é de apenas 10 miniaturas (25ml), podendo misturar fragrâncias masculinas, femininas e árabes.' },
    { question: 'Quais as margens de lucro recomendadas na revenda?', answer: 'Com as miniaturas da Brand Collection e árabes, nossos revendedores trabalham com margens de lucro entre 80% e 120%, dependendo da sua região de atuação.' },
    { question: 'Vocês realizam envio para todo o Brasil?', answer: 'Sim! Enviamos para todos os estados do Brasil via Correios (Sedex ou PAC) ou transportadoras parceiras, com seguro total contra extravios.' },
    { question: 'Como são feitos os pagamentos dos pedidos de atacado?', answer: 'Aceitamos pagamentos via Pix (com desconto adicional), boleto bancário ou parcelamento no cartão de crédito em até 12x via checkout seguro.' }
  ];

  return (
    <>
      <SeoHead 
        title="Distribuidora de Miniaturas de Perfumes no Atacado | Snack Store BH"
        description="Seja um revendedor de mini perfumes importados de 25ml. Brand Collection e árabes no atacado com pedido mínimo baixo e margens de mais de 100% de lucro."
        url="/atacado-revenda-perfumes/"
        faqs={faqs}
      />

      <div style={{ fontFamily: '"Outfit", sans-serif' }}>
        
        {/* Hero Banner Section */}
        <section style={{ 
          background: 'linear-gradient(135deg, var(--snack-green-dark) 0%, #11200e 100%)', 
          color: 'var(--snack-cream)', 
          padding: '80px 24px', 
          textAlign: 'center',
          borderBottom: '1px solid rgba(196,161,90,0.2)'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--snack-gold)', display: 'block', marginBottom: '16px' }}>Revenda de Sucesso • Oportunidade 2026</span>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 54px)', fontWeight: 'bold', fontFamily: 'var(--font-display)', margin: '0 0 20px 0', lineHeight: '1.1', textTransform: 'uppercase', letterSpacing: '1px' }}>
              LUCRE MAIS DE 100% COM <br/>
              <span style={{ color: 'var(--snack-gold)', fontStyle: 'italic', textTransform: 'none', fontWeight: 'normal' }}>Mini Perfumes no Atacado</span>
            </h1>
            <p style={{ fontSize: '16px', color: 'rgba(245,241,232,0.85)', lineHeight: '1.6', marginBottom: '32px', fontWeight: '300' }}>
              As miniaturas de perfumes importados (25ml) são fáceis de vender, possuem alto giro de estoque e alta aceitação no mercado. Comece hoje mesmo sua própria distribuidora.
            </p>

            <a 
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá! Quero receber a tabela de preços e catálogo para compras no atacado/revenda de mini perfumes.')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--snack-gold)',
                color: 'var(--snack-green-dark)',
                textDecoration: 'none',
                padding: '16px 36px',
                borderRadius: '999px',
                fontWeight: 'bold',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                boxShadow: '0 4px 15px rgba(196,161,90,0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--snack-gold-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--snack-gold)'}
            >
              💬 Receber Tabela de Atacado no WhatsApp
            </a>
          </div>
        </section>

        {/* Benefits Grid */}
        <section style={{ padding: '80px 24px', backgroundColor: 'var(--snack-paper)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <span style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--snack-gold)' }}>Por que trabalhar conosco?</span>
              <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--snack-green-dark)', marginTop: '8px' }}>Vantagens Exclusivas da Nossa Parceria</h2>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
              gap: '30px'
            }}>
              {[
                { icon: <Check size={28} />, title: 'Pedido Mínimo Baixo', desc: 'Apenas 10 unidades mistas para obter preço de atacado. Perfeito para quem quer começar pequeno.' },
                { icon: <Truck size={28} />, title: 'Logística Expressa', desc: 'Envio no mesmo dia para Belo Horizonte e despacho imediato para todas as regiões do Brasil.' },
                { icon: <ShieldCheck size={28} />, title: 'Produtos 100% Originais', desc: 'Garantia de procedência em cada miniatura Brand Collection ou árabe. Seus clientes vão notar a qualidade.' },
                { icon: <CreditCard size={28} />, title: 'Facilidade de Pagamento', desc: 'Descontos agressivos no Pix ou parcelamento em até 12 vezes no cartão para manter seu fluxo de caixa saudável.' }
              ].map((benefit, idx) => (
                <div key={idx} style={{ 
                  backgroundColor: 'var(--snack-cream)', 
                  border: '1px solid var(--snack-border)', 
                  borderRadius: '16px', 
                  padding: '32px 24px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.01)'
                }}>
                  <div style={{ color: 'var(--snack-gold)', marginBottom: '16px' }}>{benefit.icon}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--snack-green-dark)', marginBottom: '8px' }}>{benefit.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--snack-muted)', lineHeight: '1.5' }}>{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EEAT Block: Como Funciona o Atacado */}
        <section style={{ padding: '80px 24px', backgroundColor: 'var(--snack-cream)', borderTop: '1px solid var(--snack-border)', borderBottom: '1px solid var(--snack-border)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--snack-green-dark)', textAlign: 'center', marginBottom: '40px' }}>Como Iniciar sua Revenda</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {[
                { step: '1', title: 'Solicite o Catálogo', text: 'Clique em um de nossos botões e entre em contato via WhatsApp. Enviaremos a tabela de preços de atacado e o PDF com as fotos de cada miniatura.' },
                { step: '2', title: 'Monte o seu Pedido', text: 'Selecione no mínimo 10 unidades da sua preferência. Você pode variar as fragrâncias para oferecer mais opções aos seus clientes.' },
                { step: '3', title: 'Escolha o Envio e Finalize', text: 'Calculamos a melhor taxa de envio para sua cidade ou agendamos o motoboy em Belo Horizonte. Os pagamentos são processados com segurança.' },
                { step: '4', title: 'Comece a Revender', text: 'Os produtos chegam selados, limpos e prontos para venda. Use nosso material de apoio (fotos e vídeos) para divulgar nas redes sociais.' }
              ].map((s, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--snack-green-dark)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '14px', flexShrink: 0
                  }}>{s.step}</div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--snack-green-dark)', marginBottom: '4px' }}>{s.title}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--snack-muted)', lineHeight: '1.5' }}>{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section style={{ padding: '80px 24px', backgroundColor: 'var(--snack-paper)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--snack-green-dark)', textAlign: 'center', marginBottom: '40px' }}>Perguntas Frequentes sobre Atacado</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {faqs.map((faq, idx) => (
                <div key={idx} style={{ borderBottom: '1px solid var(--snack-border)', paddingBottom: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--snack-text)', marginBottom: '8px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <HelpCircle size={18} style={{ color: 'var(--snack-gold)', flexShrink: 0 }} /> {faq.question}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--snack-muted)', lineHeight: '1.6', paddingLeft: '26px' }}>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
