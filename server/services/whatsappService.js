/**
 * WhatsApp Notification Service (Evolution API Integration)
 * Conectado à instância 'notification_snackstore' do Ads Manager
 */

const EVOLUTION_API_URL = (process.env.EVOLUTION_API_URL || 'https://plug-sales-dispatch-app-evolution-api.hx8235.easypanel.host').replace(/\/$/, '');
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || '429683C4C977415CAAFCCE10F7D57E11';
const EVOLUTION_INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME || 'notification_snackstore';
const ADMIN_WHATSAPP_PHONE = process.env.ADMIN_WHATSAPP_PHONE || '5531988868362';

/**
 * Higieniza e padroniza o número para o padrão internacional (DDI 55)
 */
function sanitizePhone(phone) {
  if (!phone) return null;
  let cleaned = String(phone).trim();
  if (cleaned.includes('@')) return cleaned; // remoteJid já formatado
  cleaned = cleaned.replace(/\D/g, '');
  if (!cleaned) return null;

  // Se tem 10 ou 11 dígitos (ex: 31988868362 ou 3188868362), adiciona o DDI 55
  if (cleaned.length === 10 || cleaned.length === 11) {
    cleaned = '55' + cleaned;
  }
  // Se já tem DDI 55 e tem 12 ou 13 dígitos
  return cleaned;
}

/**
 * Gera alternativa do número celular (com o 9 ou sem o 9 no DDD)
 */
function getPhoneAlternative(phoneClean) {
  if (!phoneClean || phoneClean.includes('@')) return null;
  // Padrão Brasil com DDI: 55 + 2 dígitos DDD + restante
  // Com o nono dígito: 55 + DD + 9XXXXXXXX (13 dígitos) -> sem o 9: 55 + DD + XXXXXXXX (12 dígitos)
  if (phoneClean.startsWith('55') && phoneClean.length === 13) {
    const ddd = phoneClean.slice(2, 4);
    const ninth = phoneClean.slice(4, 5);
    if (ninth === '9') {
      return '55' + ddd + phoneClean.slice(5); // Versão sem o 9
    }
  }
  // Sem o nono dígito: 55 + DD + XXXXXXXX (12 dígitos) -> com o 9: 55 + DD + 9 + XXXXXXXX (13 dígitos)
  if (phoneClean.startsWith('55') && phoneClean.length === 12) {
    const ddd = phoneClean.slice(2, 4);
    return '55' + ddd + '9' + phoneClean.slice(4); // Versão com o 9
  }
  return null;
}

/**
 * Envia mensagem de texto na Evolution API
 */
async function sendRawMessage(recipient, text) {
  const url = `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE_NAME}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        number: recipient,
        text: text,
        delay: 1000,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, status: response.status, data };
    }
    return { success: true, data };
  } catch (err) {
    clearTimeout(timeoutId);
    return { success: false, error: err.message };
  }
}

/**
 * Envia mensagem com fallback automático (tentando formato alternativo com/sem o 9º dígito caso falhe)
 */
async function sendTextMessage(phone, text) {
  const cleanPhone = sanitizePhone(phone);
  if (!cleanPhone) {
    return { success: false, error: 'Telefone inválido ou vazio' };
  }

  // Primeira tentativa com o número fornecido
  let result = await sendRawMessage(cleanPhone, text);
  if (result.success) {
    console.log(`[WhatsApp Service] ✅ Mensagem enviada com sucesso para ${cleanPhone}`);
    return result;
  }

  // Se falhou, tenta a versão alternativa (com o 9 ou sem o 9)
  const altPhone = getPhoneAlternative(cleanPhone);
  if (altPhone && altPhone !== cleanPhone) {
    console.log(`[WhatsApp Service] ⚠️ Tentativa 1 falhou para ${cleanPhone}. Tentando formato alternativo ${altPhone}...`);
    const altResult = await sendRawMessage(altPhone, text);
    if (altResult.success) {
      console.log(`[WhatsApp Service] ✅ Mensagem enviada com sucesso no fallback para ${altPhone}`);
      return altResult;
    }
    result = altResult;
  }

  console.warn(`[WhatsApp Service] ❌ Falha no envio para ${cleanPhone}:`, result.error || result.data);
  return result;
}

/**
 * Envia notificação espelho para o Administrador da Snack Store BH
 */
async function sendAdminNotification(title, content) {
  if (!ADMIN_WHATSAPP_PHONE) return;
  const adminMsg = `👑 *[SNACK STORE BH - ADMIN]*\n*${title}*\n\n${content}\n\n🕒 _${new Date().toLocaleString('pt-BR')}_`;
  try {
    return await sendTextMessage(ADMIN_WHATSAPP_PHONE, adminMsg);
  } catch (e) {
    console.warn('[WhatsApp Service] Falha ao enviar espelho para admin:', e.message);
  }
}

/**
 * Formata lista de itens para o corpo da mensagem
 */
function formatItemsList(items) {
  if (!Array.isArray(items) || items.length === 0) return '• Itens do pedido';
  return items.map(it => {
    const qty = it.quantity || 1;
    const name = it.name || it.product_name || it.product?.name || 'Perfume';
    const price = parseFloat(it.price || it.unit_wholesale || it.unit_price || 0);
    const sub = (price * qty).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const mode = (it.logistics_mode || it.modality || '').toLowerCase();
    const tag = mode.includes('econ') ? ' [15d]' : mode.includes('prog') ? ' [7d]' : ' [Expresso]';
    return `• *${qty}x* ${name}${tag} - ${sub}`;
  }).join('\n');
}

// =========================================================================
// GATILHOS E NOTIFICAÇÕES PRÉ-PRONTAS
// =========================================================================

export const whatsappService = {
  /**
   * 1. Boas-vindas ao novo cadastro (Cliente ou Revendedor)
   */
  async notifyWelcome(user) {
    if (!user) return;
    const name = user.name || 'Cliente';
    const isReseller = user.role === 'revendedor';
    const roleTitle = isReseller ? 'Revendedor VIP' : 'Cliente Especial';

    const clientMsg = `🌟 *BEM-VINDO(A) À SNACK STORE BH!* 🌟

Olá, *${name}*! Seja muito bem-vindo(a) à família Snack Store BH.

Seu cadastro como *${roleTitle}* foi concluído com sucesso! 🎉

${isReseller 
  ? `👑 *Seu Portal de Revenda Atacado está liberado!*
Acesse agora para montar seus pedidos com tabela exclusiva, múltiplos fretes (Expresso BH, 7 e 15 dias) e dropshipping neutro:
🔗 https://snackstorebh.com.br/minha-conta` 
  : `🛍️ *Aproveite nossas fragrâncias importadas e mini perfumes de 25ml!*
Fragrâncias de alta fixação com entrega rápida em BH e envio para todo o Brasil:
🔗 https://snackstorebh.com.br`}

💬 *Canais de Atendimento:*
Se precisar de qualquer suporte, cotação ou orientação, você pode nos chamar diretamente aqui neste WhatsApp!

Boas compras e ótimos negócios! ✨`;

    // 1. Envia para o cliente
    if (user.phone) {
      sendTextMessage(user.phone, clientMsg).catch(err => console.warn('Erro WhatsApp Welcome:', err.message));
    }

    // 2. Envia espelho para o Admin
    const adminDetails = `👤 *Novo Usuário Cadastrado:*
• *Nome:* ${name}
• *E-mail:* ${user.email || 'Não informado'}
• *Telefone:* ${user.phone || 'Sem telefone'}
• *Perfil / Role:* ${roleTitle} (${user.role || 'comprador'})
• *Status:* Ativo`;
    sendAdminNotification('NOVO USUÁRIO CADASTRADO 🎉', adminDetails).catch(err => console.warn('Erro WhatsApp Admin Welcome:', err.message));
  },

  /**
   * 2. Novo Pedido Criado / Confirmado
   */
  async notifyOrderCreated(order) {
    if (!order) return;
    const num = order.order_number || String(order.id);
    const name = order.customer_name || 'Cliente';
    const total = (parseFloat(order.total_amount) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const itemsList = formatItemsList(order.items || order.items_json);
    const carrier = order.shipping_carrier || 'Entrega Rápida';
    const address = order.customer_address || 'Endereço cadastrado';
    const isPix = (order.payment_method || '').toLowerCase().includes('pix');

    let clientMsg = `🛍️ *PEDIDO RECEBIDO COM SUCESSO!* 🛍️

Olá, *${name}*! Recebemos o seu pedido na *Snack Store BH*.

📋 *Número do Pedido:* #${num}

📦 *Itens Selecionados:*
${itemsList}

💰 *Total Geral:* *${total}*
🚚 *Forma de Envio:* ${carrier}
📍 *Endereço de Entrega:* ${address}`;

    if (order.pix_code) {
      clientMsg += `\n\n💳 *Código Pix Copia e Cola:*
\`\`\`${order.pix_code}\`\`\`
_(Abra o app do seu banco e selecione a opção Pix Copia e Cola para pagar)_`;
    }

    clientMsg += `\n\n⏱️ *Próximos Passos:*
Nossa equipe já recebeu sua comanda e em breve iniciaremos a separação das suas fragrâncias!`;

    // 1. Envia para o comprador/revendedor
    if (order.customer_phone) {
      sendTextMessage(order.customer_phone, clientMsg).catch(err => console.warn('Erro WhatsApp OrderCreated:', err.message));
    }

    // 2. Envia espelho detalhado para o Admin
    const adminDetails = `🛍️ *Novo Pedido Gerado no Sistema!*
• *Número:* #${num}
• *Cliente/Revendedor:* ${name}
• *WhatsApp:* ${order.customer_phone || 'Não informado'}
• *Valor Total:* ${total}
• *Forma de Pagamento:* ${order.payment_method || (isPix ? 'Pix' : 'Outro')}
• *Modo de Envio:* ${order.fulfillment_mode || 'single'} (${carrier})
• *Endereço:* ${address}

📦 *Itens:*
${itemsList}

${order.notes ? `📝 *Observações:* ${order.notes}` : ''}`;
    sendAdminNotification(`NOVO PEDIDO REGISTRADO #${num} 🚀`, adminDetails).catch(err => console.warn('Erro WhatsApp Admin OrderCreated:', err.message));
  },

  /**
   * 3. Pagamento Aprovado (Pix ou Cartão)
   */
  async notifyPaymentApproved(order) {
    if (!order) return;
    const num = order.order_number || String(order.id);
    const name = order.customer_name || 'Cliente';
    const total = (parseFloat(order.total_amount) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const clientMsg = `✅ *PAGAMENTO APROVADO!* ✅

Olá, *${name}*! Identificamos com sucesso o pagamento do seu pedido *#${num}* no valor de *${total}*!

Seu pedido foi liberado imediatamente e já está entrando na fila da nossa esteira de separação e expedição! 📦✨

Assim que as fragrâncias forem embaladas e despachadas, te enviaremos uma nova notificação por aqui. Muito obrigado pela confiança!`;

    if (order.customer_phone) {
      sendTextMessage(order.customer_phone, clientMsg).catch(err => console.warn('Erro WhatsApp PaymentApproved:', err.message));
    }

    const adminDetails = `💰 *Pagamento Aprovado:*
• *Pedido:* #${num}
• *Cliente:* ${name}
• *Valor Pago:* ${total}
• *Status:* Liberado para Separação`;
    sendAdminNotification(`PAGAMENTO APROVADO #${num} 💵`, adminDetails).catch(err => console.warn('Erro WhatsApp Admin PaymentApproved:', err.message));
  },

  /**
   * 4. Pedido em Separação
   */
  async notifySeparation(order) {
    if (!order) return;
    const num = order.order_number || String(order.id);
    const name = order.customer_name || 'Cliente';

    const clientMsg = `📦 *SEU PEDIDO ESTÁ EM SEPARAÇÃO!* 📦

Olá, *${name}*! Temos uma ótima atualização:

Seu pedido *#${num}* foi encaminhado para a nossa bancada de expedição e está sendo separado pela nossa equipe! 🧴

Cada fragrância está sendo conferida, protegida com plástico bolha e embalada com todo o cuidado para que chegue perfeita até você.

Logo mais você receberá a confirmação do despacho! 🚀`;

    if (order.customer_phone) {
      sendTextMessage(order.customer_phone, clientMsg).catch(err => console.warn('Erro WhatsApp Separation:', err.message));
    }

    const adminDetails = `📦 *Pedido em Separação na Bancada:*
• *Pedido:* #${num}
• *Cliente:* ${name}
• *Fase:* Embalagem e Separação em andamento`;
    sendAdminNotification(`EM SEPARAÇÃO #${num} 📦`, adminDetails).catch(err => console.warn('Erro WhatsApp Admin Separation:', err.message));
  },

  /**
   * 5. Pedido em Revisão
   */
  async notifyRevision(order) {
    if (!order) return;
    const num = order.order_number || String(order.id);
    const name = order.customer_name || 'Cliente';

    const clientMsg = `🔍 *PEDIDO EM REVISÃO DE EXPEDIÇÃO* 🔍

Olá, *${name}*! Seu pedido *#${num}* está passando pela nossa etapa de controle de qualidade e conferência de lote.

Estamos checando as notas olfativas, integridade dos lacres e rota de entrega para garantir excelência absoluta na sua experiência.

Qualquer detalhe entraremos em contato por aqui! ✨`;

    if (order.customer_phone) {
      sendTextMessage(order.customer_phone, clientMsg).catch(err => console.warn('Erro WhatsApp Revision:', err.message));
    }

    const adminDetails = `🔍 *Pedido em Revisão de Qualidade:*
• *Pedido:* #${num}
• *Cliente:* ${name}`;
    sendAdminNotification(`EM REVISÃO #${num} 🔍`, adminDetails).catch(err => console.warn('Erro WhatsApp Admin Revision:', err.message));
  },

  /**
   * 6. Saiu para Entrega / Em Trânsito
   */
  async notifyOutForDelivery(order, trackingCode = null) {
    if (!order) return;
    const num = order.order_number || String(order.id);
    const name = order.customer_name || 'Cliente';
    const carrier = order.shipping_carrier || 'Entrega Rápida';
    const tracking = trackingCode || order.tracking_code;

    let clientMsg = `🚚 *SEU PEDIDO SAIU PARA ENTREGA!* 🚚

Olá, *${name}*! Ótimas notícias: o seu pedido *#${num}* já foi despachado e está a caminho! 🎉

🚚 *Transportadora / Envio:* ${carrier}`;

    if (tracking) {
      clientMsg += `\n📍 *Código de Rastreamento:* \`\`\`${tracking}\`\`\`
Você pode acompanhar o rastreio diretamente pelos Correios / Transportadora.`;
    } else if (carrier.toLowerCase().includes('motoboy') || carrier.toLowerCase().includes('expresso')) {
      clientMsg += `\n🛵 *Entrega Local:* O motoboy expresso já está em rota em BH e região. Por favor, deixe alguém de sobreaviso no endereço indicado!`;
    }

    clientMsg += `\n\nPrepare-se para receber suas fragrâncias favoritas! ✨`;

    if (order.customer_phone) {
      sendTextMessage(order.customer_phone, clientMsg).catch(err => console.warn('Erro WhatsApp OutForDelivery:', err.message));
    }

    const adminDetails = `🚚 *Pedido Despachado / Em Rota:*
• *Pedido:* #${num}
• *Cliente:* ${name}
• *Transporte:* ${carrier}
${tracking ? `• *Rastreio:* ${tracking}` : ''}`;
    sendAdminNotification(`SAIU PARA ENTREGA #${num} 🚚`, adminDetails).catch(err => console.warn('Erro WhatsApp Admin OutForDelivery:', err.message));
  },

  /**
   * 7. Pedido Entregue com Sucesso
   */
  async notifyDelivered(order) {
    if (!order) return;
    const num = order.order_number || String(order.id);
    const name = order.customer_name || 'Cliente';

    const clientMsg = `🎉 *PEDIDO ENTREGUE COM SUCESSO!* 🎉

Olá, *${name}*! Consta em nosso sistema que o seu pedido *#${num}* foi entregue! 💎

Esperamos de coração que você se encante com cada perfume e arrase com a fixação e projeção das fragrâncias!

📸 *Dica Especial:* Quando abrir seu pacote, tire uma foto e marque a gente no Instagram: *@snackstorebh*. Adoramos repostar nossos clientes!

Caso precise de qualquer suporte pós-venda, é só responder esta mensagem. Muito obrigado pela preferência e até o próximo pedido! ✨`;

    if (order.customer_phone) {
      sendTextMessage(order.customer_phone, clientMsg).catch(err => console.warn('Erro WhatsApp Delivered:', err.message));
    }

    const adminDetails = `🎉 *Pedido Concluído e Entregue:*
• *Pedido:* #${num}
• *Cliente:* ${name}`;
    sendAdminNotification(`PEDIDO ENTREGUE #${num} ✅`, adminDetails).catch(err => console.warn('Erro WhatsApp Admin Delivered:', err.message));
  },

  /**
   * 8. Pedido Cancelado
   */
  async notifyCancelled(order, reason = null) {
    if (!order) return;
    const num = order.order_number || String(order.id);
    const name = order.customer_name || 'Cliente';

    const clientMsg = `⚠️ *ATUALIZAÇÃO DO PEDIDO #${num}* ⚠️

Olá, *${name}*. Informamos que o seu pedido *#${num}* foi cancelado em nosso sistema.

${reason ? `Motivo informado: ${reason}\n\n` : ''}Caso você não tenha solicitado este cancelamento ou queira ajuda para refazer seu pedido ou conferir a disponibilidade dos itens, por favor nos responda aqui para que nossa equipe te auxilie imediatamente.`;

    if (order.customer_phone) {
      sendTextMessage(order.customer_phone, clientMsg).catch(err => console.warn('Erro WhatsApp Cancelled:', err.message));
    }

    const adminDetails = `⚠️ *Pedido Cancelado:*
• *Pedido:* #${num}
• *Cliente:* ${name}
${reason ? `• *Motivo:* ${reason}` : ''}`;
    sendAdminNotification(`PEDIDO CANCELADO #${num} ⚠️`, adminDetails).catch(err => console.warn('Erro WhatsApp Admin Cancelled:', err.message));
  },

  /**
   * Despachante inteligente para quando qualquer status do pedido mudar
   */
  async handleOrderStatusChange(order, newStatus, extraData = {}) {
    if (!order || !newStatus) return;
    const s = String(newStatus).toLowerCase().trim();

    if (s === 'separacao' || s === 'embalagem') {
      return this.notifySeparation(order);
    }
    if (s === 'revisao' || s === 'em revisão') {
      return this.notifyRevision(order);
    }
    if (s === 'transito' || s === 'saiu para entrega' || s === 'enviado') {
      return this.notifyOutForDelivery(order, extraData.tracking_code);
    }
    if (s === 'entregue') {
      return this.notifyDelivered(order);
    }
    if (s === 'cancelado') {
      return this.notifyCancelled(order, extraData.reason || extraData.notes);
    }
    if (s === 'pago' || s === 'aprovado') {
      return this.notifyPaymentApproved(order);
    }
  },

  /**
   * Consulta o status da conexão da instância Evolution API
   */
  async getConnectionStatus() {
    const url = `${EVOLUTION_API_URL}/instance/connectionState/${EVOLUTION_INSTANCE_NAME}`;
    try {
      const resp = await fetch(url, {
        headers: { apikey: EVOLUTION_API_KEY },
        signal: AbortSignal.timeout(6000)
      });
      const data = await resp.json().catch(() => ({}));
      return {
        success: resp.ok,
        instance: EVOLUTION_INSTANCE_NAME,
        state: data?.instance?.state || 'unknown',
        data
      };
    } catch (e) {
      return {
        success: false,
        instance: EVOLUTION_INSTANCE_NAME,
        state: 'offline',
        error: e.message
      };
    }
  },

  /**
   * Utilitário para envio manual ou teste direto
   */
  sendTextMessage,
  sendAdminNotification,
  sanitizePhone,
  getPhoneAlternative
};

export default whatsappService;
