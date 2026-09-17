import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, 
  Sparkles, 
  TrendingUp, 
  Package, 
  Truck, 
  ShieldCheck, 
  CreditCard, 
  MessageCircle, 
  Check, 
  ArrowRight, 
  Star, 
  ChevronRight, 
  DollarSign, 
  Store, 
  Users, 
  ShoppingBag, 
  Eye, 
  X, 
  Loader2, 
  Award,
  Zap,
  HelpCircle,
  CheckCircle2,
  Lock,
  Phone,
  Mail,
  User,
  Sliders
} from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { useAuth } from '../context/AuthContext';

export default function AtacadoRevenda() {
  const navigate = useNavigate();
  const { register, currentUser, switchRole } = useAuth();
  const WHATSAPP_NUMBER = "553175650503";

  // Simulator state
  const [simulatorUnits, setSimulatorUnits] = useState(30);

  // Dashboard preview tabs state
  const [previewTab, setPreviewTab] = useState('catalog'); // 'catalog' | 'dropshipping' | 'logistics' | 'customers'

  // Onboarding Step Wizard states
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    password: '',
    sellingMethod: 'whatsapp',
    volumeGoal: '20-50',
    region: 'bh'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wizardError, setWizardError] = useState('');

  // Financial calculations for the simulator
  const unitRetailPrice = 79.90;
  const unitWholesaleCost = 45.92;
  const unitProfit = unitRetailPrice - unitWholesaleCost; // R$ 33.98
  const monthlyRevenue = simulatorUnits * unitRetailPrice;
  const monthlyCost = simulatorUnits * unitWholesaleCost;
  const monthlyProfit = simulatorUnits * unitProfit;
  const roiPercentage = ((unitProfit / unitWholesaleCost) * 100).toFixed(0);

  // Handle Wizard Submission
  const handleCompleteRegistration = async (e) => {
    if (e) e.preventDefault();
    setWizardError('');

    if (!wizardData.name?.trim()) {
      setWizardError('Por favor, informe seu nome completo.');
      return;
    }
    if (!wizardData.phone?.trim()) {
      setWizardError('Por favor, informe seu WhatsApp com DDD.');
      return;
    }
    if (!wizardData.email?.trim() || !wizardData.email.includes('@')) {
      setWizardError('Por favor, informe um e-mail válido.');
      return;
    }
    if (!wizardData.password || wizardData.password.length < 4) {
      setWizardError('Crie uma senha de acesso com no mínimo 4 dígitos.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (register) {
        const res = await register({
          name: wizardData.name.trim(),
          email: wizardData.email.trim().toLowerCase(),
          password: wizardData.password,
          phone: wizardData.phone.trim(),
          role: 'revendedor',
          selling_method: wizardData.sellingMethod,
          volume_goal: wizardData.volumeGoal,
          region: wizardData.region
        });

        if (res && res.success) {
          setWizardStep(3);
        } else {
          // If already exists or fallback, switch role and proceed
          if (switchRole) switchRole('revendedor');
          setWizardStep(3);
        }
      } else {
        if (switchRole) switchRole('revendedor');
        setWizardStep(3);
      }
    } catch (err) {
      console.warn('Erro ao cadastrar revendedor, utilizando ativação local:', err);
      if (switchRole) switchRole('revendedor');
      setWizardStep(3);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnterDashboard = () => {
    setIsWizardOpen(false);
    navigate('/revendedor?tab=catalogo&tour=true', { state: { tab: 'catalogo', showTour: true } });
  };

  const faqs = [
    { 
      question: 'Qual é o pedido mínimo para comprar no atacado?', 
      answer: 'O pedido mínimo é de apenas 10 miniaturas (25ml). Você pode mesclar livremente perfumes masculinos, femininos e árabes no mesmo pedido!' 
    },
    { 
      question: 'Como funciona o Dropshipping com Embalagem Neutra?', 
      answer: 'Você faz a venda para seu cliente final pelo seu WhatsApp ou Instagram, cobra dele e faz o pedido pelo nosso portal informando o endereço do seu cliente. A Snack Store BH prepara o pacote em caixa 100% neutra, sem nenhuma menção à nossa loja, e entrega direto na casa dele com rastreamento.' 
    },
    { 
      question: 'Quais são as margens de lucro reais?', 
      answer: 'Nossos revendedores adquirem as miniaturas a partir de R$ 45,92 e revendem entre R$ 74,90 e R$ 99,90, garantindo lucros de 80% a 120% por unidade vendida.' 
    },
    { 
      question: 'Quais são as opções e prazos de frete?', 
      answer: 'Em Belo Horizonte e Região Metropolitana entregamos via Motoboy Expresso em 1 a 6 horas. Para outras cidades e estados enviamos via Correios (SEDEX e PAC) ou transportadoras com seguro total.' 
    },
    { 
      question: 'Como são feitos os pagamentos?', 
      answer: 'Aceitamos PIX com aprovação instantânea e QR Code na tela, ou Cartão de Crédito com parcelamento em até 12x via Mercado Pago.' 
    }
  ];

  return (
    <>
      <SeoHead 
        title="Seja um Revendedor VIP de Mini Perfumes | Distribuidora Oficial Snack Store BH"
        description="Cadastre-se como revendedor oficial de mini perfumes importados 25ml. Acesso à dashboard com preços de atacado a partir de R$ 45,92, dropshipping neutro e entrega expressa."
        url="/atacado-revenda-perfumes/"
        faqs={faqs}
      />

      <div style={{ fontFamily: '"Outfit", sans-serif', backgroundColor: '#faf8f5', color: '#1a2e16' }}>
        
        {/* =========================================================================
            HERO SECTION - LUXURY DARK GREEN & GOLD
        ========================================================================= */}
        <section style={{ 
          background: 'radial-gradient(circle at 50% 20%, #152d11 0%, #081507 100%)', 
          color: '#ffffff', 
          padding: '80px 24px 100px 24px', 
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(196,161,90,0.25)'
        }}>
          {/* Subtle gold glow background effects */}
          <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(196,161,90,0.12) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
            
            {/* Crown Club Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(196,161,90,0.15)', border: '1px solid rgba(196,161,90,0.4)', borderRadius: '999px', padding: '6px 18px', marginBottom: '24px' }}>
              <Crown size={16} color="var(--snack-gold)" />
              <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--snack-gold)' }}>
                PORTAL OFICIAL DE REVENDEDORES • SNACK STORE BH
              </span>
            </div>

            <h1 style={{ 
              fontSize: 'clamp(32px, 5.5vw, 56px)', 
              fontWeight: '900', 
              fontFamily: 'var(--font-display)', 
              margin: '0 0 24px 0', 
              lineHeight: '1.12', 
              letterSpacing: '-0.5px' 
            }}>
              Lucre de 80% a 120% com as <br />
              <span style={{ 
                background: 'linear-gradient(135deg, #e6c875 0%, #c4a15a 100%)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent',
                fontStyle: 'italic'
              }}>
                Miniaturas Mais Desejadas
              </span> do Brasil.
            </h1>

            <p style={{ 
              fontSize: '17px', 
              color: 'rgba(255,255,255,0.85)', 
              lineHeight: '1.6', 
              maxWidth: '780px', 
              margin: '0 auto 36px auto', 
              fontWeight: '300' 
            }}>
              Acesse nossa plataforma exclusiva de atacado: frascos de 25ml a partir de <strong>R$ 45,92</strong>, pronta entrega com motoboy em BH (1 a 6h) e sistema de <strong>Dropshipping Neutro</strong> para enviar direto para seus clientes sem você ter que investir em estoque antecipado!
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '48px' }}>
              <button
                onClick={() => { setWizardStep(1); setIsWizardOpen(true); }}
                style={{
                  backgroundColor: 'var(--snack-gold)',
                  color: 'var(--snack-green-dark)',
                  border: 'none',
                  padding: '18px 36px',
                  borderRadius: '999px',
                  fontWeight: '800',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 8px 25px rgba(196,161,90,0.4)',
                  transition: 'transform 0.2s, background-color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Sparkles size={18} />
                <span>Quero me Cadastrar como Revendedor VIP</span>
                <ArrowRight size={18} />
              </button>

              <a
                href="#simulador"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '16px 28px',
                  borderRadius: '999px',
                  fontWeight: '700',
                  fontSize: '13px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <DollarSign size={16} color="var(--snack-gold)" />
                <span>Simular Meus Lucros Mensais</span>
              </a>
            </div>

            {/* Quick 4 Metrics Bar */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
              gap: '16px', 
              maxWidth: '900px', 
              margin: '0 auto',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '16px 20px',
              backdropFilter: 'blur(6px)'
            }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--snack-gold)' }}>R$ 45,92</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Preço no Atacado</div>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#34d399' }}>80% a 120%</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Margem de Lucro</div>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#60a5fa' }}>1 a 6 Horas</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Expresso BH via Motoboy</div>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#f472b6' }}>100% Neutro</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dropshipping p/ Clientes</div>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            SIMULADOR INTERATIVO DE LUCRO DO REVENDEDOR
        ========================================================================= */}
        <section id="simulador" style={{ padding: '80px 24px', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--snack-gold)' }}>
                CALCULADORA DE PROJEÇÃO FINANCEIRA
              </span>
              <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--snack-green-dark)', margin: '8px 0 12px 0' }}>
                Quanto Você Pode Lucrar Todo Mês?
              </h2>
              <p style={{ fontSize: '15px', color: '#4b5563', maxWidth: '640px', margin: '0 auto' }}>
                Arraste o botão ou escolha a quantidade de perfumes para ver em tempo real o seu faturamento e o lucro líquido que vai direto para o seu bolso.
              </p>
            </div>

            {/* Interactive Calculator Card */}
            <div style={{
              backgroundColor: '#faf8f2',
              borderRadius: '24px',
              border: '2px solid rgba(196,161,90,0.3)',
              padding: '36px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.04)'
            }}>
              
              {/* Pills selectors */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
                {[15, 30, 60, 100, 150].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSimulatorUnits(n)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: '800',
                      border: simulatorUnits === n ? '2px solid var(--snack-green-dark)' : '1px solid #d1d5db',
                      backgroundColor: simulatorUnits === n ? 'var(--snack-green-dark)' : '#ffffff',
                      color: simulatorUnits === n ? '#ffffff' : '#374151',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {n} Perfumes / Mês
                  </button>
                ))}
              </div>

              {/* Slider */}
              <div style={{ marginBottom: '36px', textAlign: 'center' }}>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  value={simulatorUnits}
                  onChange={e => setSimulatorUnits(parseInt(e.target.value, 10))}
                  style={{
                    width: '100%',
                    maxWidth: '560px',
                    accentColor: 'var(--snack-green-dark)',
                    cursor: 'pointer'
                  }}
                />
                <div style={{ fontSize: '14px', color: '#4b5563', marginTop: '8px', fontWeight: '600' }}>
                  Simulando venda de: <strong style={{ color: 'var(--snack-green-dark)', fontSize: '18px' }}>{simulatorUnits} frascos</strong> por mês ({Math.round((simulatorUnits / 30) * 10) / 10} frascos/dia)
                </div>
              </div>

              {/* Results Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.5px' }}>
                    Faturamento Bruto
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#1f2937', marginTop: '4px' }}>
                    R$ {monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>Venda a R$ 79,90/unidade</div>
                </div>

                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.5px' }}>
                    Custo de Atacado
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#4b5563', marginTop: '4px' }}>
                    R$ {monthlyCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>Compra a R$ 45,92/unidade</div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
                  borderRadius: '16px',
                  padding: '20px',
                  color: '#ffffff',
                  textAlign: 'center',
                  boxShadow: '0 8px 20px rgba(22,101,52,0.25)',
                  border: '1px solid #bbf7d0'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#bbf7d0', letterSpacing: '1px' }}>
                    🚀 SEU LUCRO LÍQUIDO NO BOLSO
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: '#ffffff', marginTop: '4px' }}>
                    R$ {monthlyProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '12px', color: '#dcfce7', marginTop: '2px', fontWeight: '700' }}>
                    Retorno de +{roiPercentage}% do capital!
                  </div>
                </div>

              </div>

              {/* Action Inside Simulator */}
              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => { setWizardStep(1); setIsWizardOpen(true); }}
                  style={{
                    backgroundColor: 'var(--snack-green-dark)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '16px 36px',
                    borderRadius: '999px',
                    fontWeight: '800',
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 15px rgba(23,43,20,0.3)'
                  }}
                >
                  <Crown size={16} color="var(--snack-gold)" />
                  <span>Quero Garantir Meu Acesso e Lucrar R$ {monthlyProfit.toFixed(0)}/mês →</span>
                </button>
              </div>

            </div>

          </div>
        </section>

        {/* =========================================================================
            PRÉVIA E EXPERIÊNCIA ÚNICA DA DASHBOARD (SHOWCASE INTERATIVO)
        ========================================================================= */}
        <section style={{ padding: '80px 24px', backgroundColor: '#faf8f5', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--snack-gold)' }}>
                EXPERIÊNCIA EXCLUSIVA DO REVENDEDOR
              </span>
              <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--snack-green-dark)', margin: '8px 0 12px 0' }}>
                Conheça a Sua Dashboard Por Dentro
              </h2>
              <p style={{ fontSize: '15px', color: '#4b5563', maxWidth: '680px', margin: '0 auto' }}>
                Desenvolvemos uma plataforma completa para você gerenciar seus clientes, escolher perfumes a preços de custo e faturar sem dor de cabeça.
              </p>
            </div>

            {/* Interactive Feature Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
              {[
                { id: 'catalog', label: '1. Catálogo & Preços de Atacado', icon: <ShoppingBag size={16} /> },
                { id: 'dropshipping', label: '2. Dropshipping Neutro', icon: <Package size={16} /> },
                { id: 'logistics', label: '3. Frete Expresso & Prazos', icon: <Zap size={16} /> },
                { id: 'customers', label: '4. Gestão de Clientes e Vendas', icon: <Users size={16} /> }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setPreviewTab(t.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    border: previewTab === t.id ? '2px solid var(--snack-green-dark)' : '1px solid #e5e7eb',
                    backgroundColor: previewTab === t.id ? 'var(--snack-green-dark)' : '#ffffff',
                    color: previewTab === t.id ? '#ffffff' : '#4b5563',
                    cursor: 'pointer',
                    boxShadow: previewTab === t.id ? '0 4px 12px rgba(23,43,20,0.15)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Interactive Mockup Container */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
              overflow: 'hidden'
            }}>
              
              {/* Browser/Dashboard Title Bar */}
              <div style={{ backgroundColor: '#f3f4f6', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600', marginLeft: '8px' }}>
                    painel.snackstorebh.com.br/revendedor
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: '800', backgroundColor: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '999px' }}>
                  <Sparkles size={12} />
                  <span>MODO REVENDEDOR VIP ATIVO</span>
                </div>
              </div>

              {/* Dynamic Preview Content */}
              <div style={{ padding: '32px' }}>
                
                {previewTab === 'catalog' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--snack-green-dark)' }}>
                          Catálogo com Preço de Custo Desbloqueado
                        </h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                          Mais de 350 perfumes disponíveis com margem de até 120%. Faça compras unitárias ou pedidos rápidos em massa.
                        </p>
                      </div>
                      <div style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700' }}>
                        💡 Pedido mínimo de apenas 10 frascos mistos
                      </div>
                    </div>

                    {/* Product Mockup Cards Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                      
                      {/* Card 1 */}
                      <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', backgroundColor: '#ffffff' }}>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                          <img src="/assets/campaign/revised_IMG_3243.webp" alt="Perfume" style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#f9fafb', border: '1px solid #f3f4f6' }} />
                          <div>
                            <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--snack-gold)', textTransform: 'uppercase' }}>BRAND COLLECTION • 25ML</span>
                            <div style={{ fontSize: '13px', fontWeight: '800', color: '#111827' }}>Versace Dylan Blue (Nº 265)</div>
                            <span style={{ fontSize: '10px', backgroundColor: '#dcfce7', color: '#166534', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>9 un. pronta entrega</span>
                          </div>
                        </div>
                        <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6b7280' }}>
                            <span>Preço Varejo Consumidor:</span>
                            <span style={{ textDecoration: 'line-through' }}>R$ 74,90</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--snack-green-dark)' }}>Preço Atacado VIP:</span>
                            <span style={{ fontSize: '18px', fontWeight: '900', color: '#15803d' }}>R$ 45,92</span>
                          </div>
                          <div style={{ fontSize: '10px', fontWeight: '800', color: '#b45309', marginTop: '2px', textAlign: 'right' }}>
                            Seu Lucro Líquido: + R$ 28,98/frasco
                          </div>
                        </div>
                        <button type="button" style={{ width: '100%', backgroundColor: 'var(--snack-green-dark)', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '700', fontSize: '11px', cursor: 'pointer' }}>
                          + Adicionar à Comanda de Revenda
                        </button>
                      </div>

                      {/* Card 2 */}
                      <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', backgroundColor: '#ffffff' }}>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                          <img src="/assets/campaign/revised_IMG_3254.webp" alt="Perfume" style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#f9fafb', border: '1px solid #f3f4f6' }} />
                          <div>
                            <span style={{ fontSize: '9px', fontWeight: '800', color: '#4338ca', textTransform: 'uppercase' }}>ARABIC COLLECTION • 25ML</span>
                            <div style={{ fontSize: '13px', fontWeight: '800', color: '#111827' }}>Lattafa Asad Men Luxury</div>
                            <span style={{ fontSize: '10px', backgroundColor: '#dcfce7', color: '#166534', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>14 un. pronta entrega</span>
                          </div>
                        </div>
                        <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6b7280' }}>
                            <span>Preço Varejo Consumidor:</span>
                            <span style={{ textDecoration: 'line-through' }}>R$ 89,90</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--snack-green-dark)' }}>Preço Atacado VIP:</span>
                            <span style={{ fontSize: '18px', fontWeight: '900', color: '#15803d' }}>R$ 49,90</span>
                          </div>
                          <div style={{ fontSize: '10px', fontWeight: '800', color: '#b45309', marginTop: '2px', textAlign: 'right' }}>
                            Seu Lucro Líquido: + R$ 40,00/frasco
                          </div>
                        </div>
                        <button type="button" style={{ width: '100%', backgroundColor: 'var(--snack-green-dark)', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '700', fontSize: '11px', cursor: 'pointer' }}>
                          + Adicionar à Comanda de Revenda
                        </button>
                      </div>

                    </div>
                  </div>
                )}

                {previewTab === 'dropshipping' && (
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800', color: 'var(--snack-green-dark)' }}>
                      📦 Fulfillment & Dropshipping com Embalagem 100% Neutra
                    </h3>
                    <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#4b5563', lineHeight: '1.5' }}>
                      Você não precisa empacotar nada nem ir aos Correios. Cadastre os dados do seu cliente no painel e nós cuidamos de toda a separação e entrega:
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                      <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#166534', marginBottom: '4px' }}>✓ Embalagem Descaracterizada</div>
                        <div style={{ fontSize: '11px', color: '#4b5563', lineHeight: '1.4' }}>Caixa parda e fita adesiva sem nenhuma menção à Snack Store. O remetente leva o seu nome.</div>
                      </div>
                      <div style={{ backgroundColor: '#e0e7ff', border: '1px solid #c7d2fe', borderRadius: '12px', padding: '16px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#4338ca', marginBottom: '4px' }}>✓ Múltiplos Destinos no Mesmo Pedido</div>
                        <div style={{ fontSize: '11px', color: '#4b5563', lineHeight: '1.4' }}>Comprou 5 ou mais unidades? Pode despachar frascos diferentes para clientes em endereços distintos!</div>
                      </div>
                      <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '12px', padding: '16px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#92400e', marginBottom: '4px' }}>✓ Rastreio Automático</div>
                        <div style={{ fontSize: '11px', color: '#4b5563', lineHeight: '1.4' }}>Código de envio gerado diretamente no seu painel para você enviar no WhatsApp do comprador.</div>
                      </div>
                    </div>
                  </div>
                )}

                {previewTab === 'logistics' && (
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800', color: 'var(--snack-green-dark)' }}>
                      ⚡ 3 Modalidades de Frete com Descontos Inteligentes
                    </h3>
                    <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#4b5563' }}>
                      Escolha a modalidade ideal para sua estratégia de venda e maximize o lucro por unidade:
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                      <div style={{ border: '2px solid #16a34a', borderRadius: '12px', padding: '16px', backgroundColor: '#f0fdf4' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: '900', fontSize: '13px' }}>
                          <Zap size={16} />
                          <span>EXPRESSO BH (1 A 6 HORAS)</span>
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: '900', color: '#15803d', margin: '8px 0 4px 0' }}>R$ 14,90 <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#6b7280' }}>(ou Grátis &gt; R$ 150)</span></div>
                        <div style={{ fontSize: '11px', color: '#4b5563', lineHeight: '1.4' }}>Motoboy próprio em toda Belo Horizonte. Ideal para vendas com urgência de clientes na cidade.</div>
                      </div>

                      <div style={{ border: '1px solid #0284c7', borderRadius: '12px', padding: '16px', backgroundColor: '#f0f9ff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0369a1', fontWeight: '900', fontSize: '13px' }}>
                          <Package size={16} />
                          <span>PROGRAMADO (7 DIAS)</span>
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: '900', color: '#0284c7', margin: '8px 0 4px 0' }}>Desconto Extra</div>
                        <div style={{ fontSize: '11px', color: '#4b5563', lineHeight: '1.4' }}>Para pedidos sob encomenda planejados. Custo reduzido por frasco para garantir margem maior.</div>
                      </div>

                      <div style={{ border: '1px solid #d97706', borderRadius: '12px', padding: '16px', backgroundColor: '#fffbeb' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b45309', fontWeight: '900', fontSize: '13px' }}>
                          <DollarSign size={16} />
                          <span>ECONÔMICO (15 DIAS)</span>
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: '900', color: '#b45309', margin: '8px 0 4px 0' }}>Maior Lucro Líquido</div>
                        <div style={{ fontSize: '11px', color: '#4b5563', lineHeight: '1.4' }}>Máxima rentabilidade para quem compra em lote antecipado para abastecer mostruário ou pronta entrega.</div>
                      </div>
                    </div>
                  </div>
                )}

                {previewTab === 'customers' && (
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800', color: 'var(--snack-green-dark)' }}>
                      📊 Central de Clientes, Comandas e Cancelamentos
                    </h3>
                    <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#4b5563' }}>
                      Seu CRM de vendas integrado. Saiba quem são seus melhores clientes, envie comprovantes com 1 clique e cancele pedidos com total autonomia:
                    </p>

                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                      <div style={{ backgroundColor: '#f9fafb', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '800', color: '#6b7280' }}>
                        <span>CLIENTE / CONTATO</span>
                        <span>ÚLTIMA COMPRA</span>
                        <span>TOTAL GASTO</span>
                        <span>AÇÕES</span>
                      </div>
                      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3f4f6', fontSize: '12px' }}>
                        <div>
                          <strong style={{ color: '#111827' }}>Ana Carolina Mendes</strong>
                          <div style={{ fontSize: '10px', color: '#6b7280' }}>(31) 98844-2211 • Lourdes, BH</div>
                        </div>
                        <div style={{ color: '#4b5563', fontSize: '11px' }}>2x Dylan Blue (Expresso)</div>
                        <div style={{ fontWeight: '800', color: '#15803d' }}>R$ 159,80</div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span style={{ backgroundColor: '#25D366', color: '#ffffff', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '700', cursor: 'pointer' }}>💬 WhatsApp</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>
        </section>

        {/* =========================================================================
            FAQ SECTION
        ========================================================================= */}
        <section style={{ padding: '80px 24px', backgroundColor: '#ffffff' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--snack-green-dark)', textAlign: 'center', marginBottom: '36px' }}>
              Dúvidas Frequentes de Novos Revendedores
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {faqs.map((f, idx) => (
                <div key={idx} style={{ backgroundColor: '#faf8f5', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: '800', color: 'var(--snack-green-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HelpCircle size={18} color="var(--snack-gold)" />
                    <span>{f.question}</span>
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#4b5563', lineHeight: '1.6', paddingLeft: '26px' }}>
                    {f.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            FINAL CALL TO ACTION BANNER
        ========================================================================= */}
        <section style={{ 
          background: 'linear-gradient(135deg, var(--snack-green-dark) 0%, #0c180a 100%)', 
          color: '#ffffff', 
          padding: '60px 24px', 
          textAlign: 'center',
          borderTop: '1px solid rgba(196,161,90,0.2)'
        }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '900', fontFamily: 'var(--font-display)', margin: '0 0 16px 0' }}>
              Pronto para Construir Seu Negócio de Perfumes?
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', margin: '0 0 32px 0' }}>
              Cadastre-se gratuitamente agora mesmo, conheça sua nova dashboard e faça seu primeiro pedido com margem garantida.
            </p>
            <button
              onClick={() => { setWizardStep(1); setIsWizardOpen(true); }}
              style={{
                backgroundColor: 'var(--snack-gold)',
                color: 'var(--snack-green-dark)',
                border: 'none',
                padding: '18px 40px',
                borderRadius: '999px',
                fontWeight: '900',
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 8px 25px rgba(196,161,90,0.4)'
              }}
            >
              <span>Cadastrar Minha Conta de Revendedor VIP Grátis 🚀</span>
            </button>
          </div>
        </section>

        {/* =========================================================================
            ONBOARDING STEP WIZARD MODAL (CADASTRO EM 3 PASSOS)
        ========================================================================= */}
        {isWizardOpen && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 150,
            backgroundColor: 'rgba(7, 18, 8, 0.85)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
          }}>
            <div style={{
              backgroundColor: '#ffffff', borderRadius: '24px', maxWidth: '520px', width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.4)', overflow: 'hidden', position: 'relative'
            }}>
              
              {/* Modal Header */}
              <div style={{
                background: 'linear-gradient(135deg, var(--snack-green-dark) 0%, #0d1a0b 100%)',
                padding: '24px', color: '#ffffff', position: 'relative'
              }}>
                <button
                  type="button"
                  onClick={() => setIsWizardOpen(false)}
                  style={{
                    position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.1)',
                    border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: '#ffffff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Crown size={20} color="var(--snack-gold)" />
                  <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--snack-gold)' }}>
                    CADASTRO DE REVENDEDOR VIP
                  </span>
                </div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>
                  {wizardStep === 1 && 'Passo 1: Seus Dados de Acesso'}
                  {wizardStep === 2 && 'Passo 2: Seu Perfil de Venda'}
                  {wizardStep === 3 && '🎉 Conta de Revendedor Ativada!'}
                </h3>

                {/* Step Indicators */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <div style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: wizardStep >= 1 ? 'var(--snack-gold)' : 'rgba(255,255,255,0.2)' }} />
                  <div style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: wizardStep >= 2 ? 'var(--snack-gold)' : 'rgba(255,255,255,0.2)' }} />
                  <div style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: wizardStep >= 3 ? 'var(--snack-gold)' : 'rgba(255,255,255,0.2)' }} />
                </div>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '28px' }}>
                
                {wizardError && (
                  <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#b91c1c', fontSize: '12px' }}>
                    ⚠️ {wizardError}
                  </div>
                )}

                {/* STEP 1: DADOS PESSOAIS */}
                {wizardStep === 1 && (
                  <form onSubmit={(e) => { e.preventDefault(); if (wizardData.name && wizardData.phone && wizardData.email && wizardData.password) { setWizardError(''); setWizardStep(2); } else { setWizardError('Preencha todos os campos para avançar.'); } }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4b5563', marginBottom: '4px' }}>
                          Nome Completo *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Camila Silva"
                          value={wizardData.name}
                          onChange={e => setWizardData({ ...wizardData, name: e.target.value })}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4b5563', marginBottom: '4px' }}>
                          WhatsApp com DDD * (Para suporte e envios)
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="(31) 99999-9999"
                          value={wizardData.phone}
                          onChange={e => setWizardData({ ...wizardData, phone: e.target.value })}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4b5563', marginBottom: '4px' }}>
                          Seu E-mail *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="seu@email.com"
                          value={wizardData.email}
                          onChange={e => setWizardData({ ...wizardData, email: e.target.value })}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4b5563', marginBottom: '4px' }}>
                          Crie uma Senha de Acesso *
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="Mínimo 4 caracteres"
                          value={wizardData.password}
                          onChange={e => setWizardData({ ...wizardData, password: e.target.value })}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      style={{
                        width: '100%', backgroundColor: 'var(--snack-green-dark)', color: '#ffffff',
                        border: 'none', padding: '14px', borderRadius: '10px', fontWeight: '800',
                        fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                      }}
                    >
                      <span>Avançar para o Perfil de Vendas</span>
                      <ArrowRight size={16} />
                    </button>
                  </form>
                )}

                {/* STEP 2: PERFIL DE REVENDEDOR */}
                {wizardStep === 2 && (
                  <form onSubmit={handleCompleteRegistration}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                      
                      {/* Como pretende vender */}
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '8px' }}>
                          Como você pretende realizar suas vendas?
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          {[
                            { id: 'whatsapp', label: 'WhatsApp & Instagram' },
                            { id: 'dropshipping', label: 'Dropshipping Direto' },
                            { id: 'store', label: 'Loja / Pronta Entrega' },
                            { id: 'direct', label: 'Venda Pessoal / Amigos' }
                          ].map(opt => (
                            <div
                              key={opt.id}
                              onClick={() => setWizardData({ ...wizardData, sellingMethod: opt.id })}
                              style={{
                                padding: '10px', borderRadius: '8px', cursor: 'pointer',
                                border: wizardData.sellingMethod === opt.id ? '2px solid var(--snack-green-dark)' : '1px solid #e5e7eb',
                                backgroundColor: wizardData.sellingMethod === opt.id ? '#f0fdf4' : '#fafafa',
                                fontSize: '11px', fontWeight: '700', color: wizardData.sellingMethod === opt.id ? 'var(--snack-green-dark)' : '#4b5563',
                                textAlign: 'center'
                              }}
                            >
                              {opt.label}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Meta Inicial */}
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '8px' }}>
                          Previsão de frascos para o 1º mês:
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                          {[
                            { id: '10-20', label: '10 a 20 un.' },
                            { id: '20-50', label: '20 a 50 un.' },
                            { id: '50+', label: 'Mais de 50' }
                          ].map(opt => (
                            <div
                              key={opt.id}
                              onClick={() => setWizardData({ ...wizardData, volumeGoal: opt.id })}
                              style={{
                                padding: '10px', borderRadius: '8px', cursor: 'pointer',
                                border: wizardData.volumeGoal === opt.id ? '2px solid var(--snack-green-dark)' : '1px solid #e5e7eb',
                                backgroundColor: wizardData.volumeGoal === opt.id ? '#f0fdf4' : '#fafafa',
                                fontSize: '11px', fontWeight: '700', color: wizardData.volumeGoal === opt.id ? 'var(--snack-green-dark)' : '#4b5563',
                                textAlign: 'center'
                              }}
                            >
                              {opt.label}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Região */}
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '8px' }}>
                          Sua Região de Atuação:
                        </label>
                        <select
                          value={wizardData.region}
                          onChange={e => setWizardData({ ...wizardData, region: e.target.value })}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '12px', outline: 'none' }}
                        >
                          <option value="bh">Belo Horizonte e Região Metropolitana (Motoboy 1 a 6h)</option>
                          <option value="mg">Interior de Minas Gerais (Correios / Transportadora)</option>
                          <option value="brasil">Outro Estado do Brasil (Envio Nacional)</option>
                        </select>
                      </div>

                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setWizardStep(1)}
                        style={{ padding: '12px 18px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'none', color: '#6b7280', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Voltar
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                          flex: 1, backgroundColor: 'var(--snack-gold)', color: 'var(--snack-green-dark)',
                          border: 'none', padding: '14px', borderRadius: '10px', fontWeight: '900',
                          fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px',
                          cursor: isSubmitting ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Ativando Cadastro...</span>
                          </>
                        ) : (
                          <>
                            <span>Finalizar e Acessar Atacado</span>
                            <Check size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* STEP 3: CONFIRMAÇÃO & ENTRADA DIRETA NA DASHBOARD */}
                {wizardStep === 3 && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: '#166534' }}>
                      <Crown size={32} color="var(--snack-gold)" />
                    </div>

                    <h4 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '900', color: 'var(--snack-green-dark)' }}>
                      Parabéns, {wizardData.name || 'Revendedor'}!
                    </h4>
                    <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#4b5563', lineHeight: '1.5' }}>
                      Seu acesso ao Portal de Atacado da Snack Store BH foi liberado com sucesso. Você já pode fazer pedidos e vender com até 120% de lucro!
                    </p>

                    <div style={{ backgroundColor: '#faf8f2', borderRadius: '12px', padding: '16px', border: '1px solid rgba(196,161,90,0.3)', marginBottom: '24px', textAlign: 'left' }}>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--snack-gold)', textTransform: 'uppercase', marginBottom: '6px' }}>
                        ✦ BENEFÍCIOS DESBLOQUEADOS:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#374151', lineHeight: '1.6' }}>
                        <li>Preço de atacado em mais de 350 fragrâncias</li>
                        <li>Dropshipping direto com embalagem neutra</li>
                        <li>Pronta entrega com Motoboy em BH em 1 a 6h</li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={handleEnterDashboard}
                      style={{
                        width: '100%', backgroundColor: 'var(--snack-green-dark)', color: '#ffffff',
                        border: 'none', padding: '16px', borderRadius: '12px', fontWeight: '900',
                        fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.8px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        boxShadow: '0 6px 20px rgba(23,43,20,0.35)'
                      }}
                    >
                      <span>Entrar no Meu Painel de Revenda Agora 🚀</span>
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
