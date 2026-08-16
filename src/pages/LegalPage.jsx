import React from 'react';
import { ShieldCheck, RefreshCw, FileText, HelpCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead';

export default function LegalPage({ type }) {
  let title = "";
  let h1 = "";
  let icon = null;
  let content = null;

  if (type === 'privacy') {
    title = "Política de Privacidade | Snack Store BH";
    h1 = "Política de Privacidade";
    icon = <ShieldCheck size={32} />;
    content = (
      <>
        <p>A sua privacidade é de extrema importância para nós na Snack Store. Esta política descreve como coletamos, usamos e protegemos suas informações pessoais em conformidade com a LGPD (Lei Geral de Proteção de Dados - Lei nº 13.709/2018).</p>
        
        <h2>1. Coleta de Informações</h2>
        <p>Coletamos dados necessários para processar suas comandas e pedidos, tais como:</p>
        <ul>
          <li><strong>Dados de Contato:</strong> Nome completo, telefone/WhatsApp para envio da comanda e contato logístico.</li>
          <li><strong>Dados de Entrega:</strong> Endereço residencial ou comercial em Belo Horizonte ou outras cidades.</li>
          <li><strong>Dados de Navegação:</strong> Armazenamento local (localStorage) de suas avaliações de produtos e dados de carrinho de compras para garantir uma boa experiência de navegação.</li>
        </ul>

        <h2>2. Uso dos Dados</h2>
        <p>As suas informações pessoais são utilizadas exclusivamente para:</p>
        <ul>
          <li>Processar compras e redirecionar a comanda correta para o WhatsApp comercial.</li>
          <li>Realizar entregas expressas via motoboy em BH ou enviar encomendas via transportadoras/Correios.</li>
          <li>Responder a dúvidas, feedbacks ou reclamações de suporte.</li>
        </ul>

        <h2>3. Compartilhamento de Dados</h2>
        <p>A Snack Store <strong>não vende, aluga ou compartilha</strong> seus dados pessoais com terceiros para fins de marketing. O tráfego de dados do carrinho é processado de forma segura e redirecionado para o chat seguro do WhatsApp.</p>

        <h2>4. Armazenamento e Segurança</h2>
        <p>Utilizamos cookies e o armazenamento local do seu navegador para manter itens salvos no carrinho e suas avaliações de produtos. Você pode limpar estes dados a qualquer momento diretamente nas configurações de privacidade do seu navegador.</p>
      </>
    );
  } else if (type === 'returns') {
    title = "Trocas, Devoluções e Direito de Arrependimento | Snack Store BH";
    h1 = "Trocas e Devoluções";
    icon = <RefreshCw size={32} />;
    content = (
      <>
        <p>Nossa política de trocas e devoluções é baseada no Código de Defesa do Consumidor (CDC) e na Lei do E-commerce (Decreto nº 7.962/2013), assegurando total transparência para suas compras de perfumes importados.</p>

        <h2>1. Direito de Arrependimento (Devolução por Desistência)</h2>
        <p>De acordo com o Artigo 49 do CDC, o consumidor tem o direito de desistir da compra no prazo de <strong>até 7 (sete) dias corridos</strong> a contar da data de recebimento do produto.</p>
        <ul>
          <li>O perfume deve estar em sua <strong>embalagem original, lacrado (celofane intacto) e sem indícios de uso ou borrifadas</strong>. Devido à natureza higiênica e pessoal de fragrâncias, produtos abertos/borrifados não serão aceitos para devolução por arrependimento.</li>
          <li>Para iniciar o processo, entre em contato via WhatsApp informado no rodapé. O frete de retorno neste caso é de responsabilidade da loja.</li>
        </ul>

        <h2>2. Troca por Defeito ou Avaria no Transporte</h2>
        <p>Caso o frasco chegue quebrado, vazando ou com falha no borrifador:</p>
        <ul>
          <li>O cliente deve nos notificar em até <strong>30 dias corridos</strong> após o recebimento.</li>
          <li>Solicitamos o envio de uma foto ou vídeo curto demonstrando o defeito ou o vazamento via WhatsApp para agilizarmos a substituição ou o estorno do valor pago.</li>
        </ul>

        <h2>3. Reembolso dos Valores</h2>
        <p>O estorno será realizado no mesmo método de pagamento utilizado na compra (geralmente PIX instantâneo) em até 3 dias úteis após o recebimento e análise do produto retornado em nossa central.</p>
      </>
    );
  } else if (type === 'terms') {
    title = "Termos de Serviço e Condições de Uso | Snack Store BH";
    h1 = "Termos de Serviço";
    icon = <FileText size={32} />;
    content = (
      <>
        <p>Ao navegar ou realizar pedidos no site da Snack Store, você concorda com os seguintes termos e condições de uso do nosso e-commerce de miniaturas de perfumes.</p>

        <h2>1. Descrição dos Serviços e Preços</h2>
        <p>O site Snack Store funciona como um catálogo digital interativo. Os pedidos gerados criam comandas comerciais que são enviadas para fechamento direto e atendimento humanizado via WhatsApp. Os preços exibidos (R$ 79,90 por miniatura de 25ml) são válidos para pagamentos via PIX.</p>

        <h2>2. Originalidade e Qualidade</h2>
        <p>Comprometemo-nos com a procedência de todas as marcas árabes e importadas distribuídas (Lattafa, Armaf, Afnan, etc.). Todas as miniaturas são originais e seladas de fábrica em sua volumetria de 25ml.</p>

        <h2>3. Envio e Logística BH</h2>
        <p>Entregas via motoboy em Belo Horizonte ocorrem em dias úteis no horário comercial. Caso ocorram divergências de endereço fornecidas pelo cliente, o custo do reenvio do motoboy poderá ser repassado ao comprador.</p>

        <h2>4. Limitação de Responsabilidade</h2>
        <p>Não nos responsabilizamos por reações alérgicas dermatológicas de uso pessoal das fragrâncias. Recomendamos sempre aplicar uma pequena quantidade na pele do pulso para teste antes do uso contínuo.</p>
      </>
    );
  } else if (type === 'faq') {
    title = "Perguntas Frequentes (FAQ) | Snack Store BH";
    h1 = "Perguntas Frequentes";
    icon = <HelpCircle size={32} />;
    content = (
      <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h3>❓ As miniaturas de 25ml são perfumes originais ou imitações?</h3>
            <p>Todas as nossas miniaturas de 25ml são 100% originais da grife correspondente (como Lattafa, Armaf ou marcas que produzem sob licença comercial oficial). Elas possuem o frasco proporcional e a mesma concentração de fragrância (Eau de Parfum) dos tamanhos tradicionais de 100ml.</p>
          </div>
          <div>
            <h3>❓ Qual o valor do frete e o prazo de entrega para BH?</h3>
            <p>Temos frete grátis em Belo Horizonte para pedidos acima de R$ 150. Para valores menores, o frete via motoboy é calculado na finalização do WhatsApp. A entrega é expressa e geralmente ocorre no mesmo dia da compra.</p>
          </div>
          <div>
            <h3>❓ Como funciona o fechamento da compra?</h3>
            <p>Você adiciona os perfumes na sacola digital, clica em "Enviar Comanda", e nosso sistema gera uma mensagem automática formatada para o seu WhatsApp. O atendimento comercial finaliza o seu cadastro, recebe o PIX e despacha o motoboy.</p>
          </div>
          <div>
            <h3>❓ Como posso testar a fixação das fragrâncias?</h3>
            <p>Os perfumes árabes e as miniaturas têm fixação variando entre 8 e 12 horas, dependendo do tipo da pele e das notas olfativas (notas amadeiradas e orientais duram mais do que notas frescas cítricas).</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SeoHead title={title} description={`${h1} completa da Snack Store. Conheça as políticas legais e regras de conformidade.`} url={`/${type}`} />

      <div style={{ maxWidth: '800px', margin: '40px auto 80px auto', padding: '0 16px', fontFamily: '"Outfit", sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#555', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Voltar à loja
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #f0f0f0', paddingBottom: '20px', marginBottom: '40px' }}>
          <div style={{ color: '#000' }}>{icon}</div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, fontFamily: 'serif' }}>{h1}</h1>
        </div>

        <div className="legal-content" style={{ fontSize: '15px', color: '#444', lineHeight: '1.8' }}>
          {content}
        </div>
      </div>
    </>
  );
}
