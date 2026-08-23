// Content script for WhatsApp Web Catalog Importer
let isImportRunning = false;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const logToPopup = (text) => {
  console.log(`[Importer Log] ${text}`);
  chrome.runtime.sendMessage({ action: "IMPORT_LOG", text });
};

const sendProgress = (current, total, status) => {
  chrome.runtime.sendMessage({ action: "IMPORT_PROGRESS", current, total, status });
};

// Configura o valor em divs contenteditable de forma compatível com React/Lexical
function setContentEditableText(el, text) {
  if (!el) return false;
  el.focus();
  
  // Seleciona todo o conteúdo atual
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  
  // Deleta o conteúdo anterior e insere o novo texto simulando teclado
  document.execCommand('delete', false);
  document.execCommand('insertText', false, text);
  
  // Dispara eventos DOM para atualizar o estado do React
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.blur();
  return true;
}

// Solicita o download da imagem ao background.js para contornar restrições de CORS
async function fetchImageFromBackground(url) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "FETCH_IMAGE", url }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (response && response.success) {
        resolve(response);
      } else {
        reject(new Error(response ? response.error : "Erro de CORS no download em segundo plano"));
      }
    });
  });
}

// Download e upload da imagem do produto contornando restrições de CORS
async function uploadImage(fileInput, imageUrl, productName) {
  try {
    logToPopup(`📥 Solicitando download seguro da imagem...`);
    const imgData = await fetchImageFromBackground(imageUrl);
    
    // Decodifica a string Base64 de volta para bytes
    const binaryString = atob(imgData.base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const mimeType = imgData.contentType || 'image/webp';
    const extension = mimeType.split('/')[1] || 'webp';
    const fileName = `${productName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.${extension}`;
    
    // Criar o arquivo File a partir do Blob reconstruído
    const blob = new Blob([bytes], { type: mimeType });
    const file = new File([blob], fileName, { type: mimeType });
    
    // Transferir o arquivo para o input
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;
    
    // Disparar evento para o React detectar o upload
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  } catch (err) {
    console.error("Falha no upload da imagem:", err);
    logToPopup(`⚠️ Não foi possível carregar a imagem: ${err.message}`);
    return false;
  }
}

// Loop principal de importação
async function runImport(products, options) {
  isImportRunning = true;
  const total = products.length;

  for (let i = 0; i < total; i++) {
    if (!isImportRunning) {
      logToPopup("⏹️ Importação cancelada pelo usuário.");
      return;
    }

    const p = products[i];
    logToPopup(`-----------------------------------------`);
    logToPopup(`[${i + 1}/${total}] Processando: ${p.name}`);
    sendProgress(i + 1, total, `Importando: ${p.name}`);

    try {
      // 1. Procurar e clicar em "Adicionar item"
      const addItemRow = document.querySelector('[data-testid="add-item"]');
      if (!addItemRow) {
        throw new Error("Botão 'Adicionar item' não encontrado. Certifique-se de estar na tela do Catálogo.");
      }
      
      const addItemBtn = addItemRow.querySelector('button') || addItemRow;
      addItemBtn.click();
      await sleep(1200); // Aguarda abertura da gaveta/drawer

      if (!isImportRunning) return;

      // 2. Verificar se a gaveta abriu procurando o campo de Nome
      let nameInput = document.querySelector('[data-testid="product-edit-drawer-name-input"]');
      if (!nameInput) {
        logToPopup("⏳ Gaveta lenta para abrir. Aguardando mais um pouco...");
        await sleep(1500);
        nameInput = document.querySelector('[data-testid="product-edit-drawer-name-input"]');
      }
      if (!nameInput) {
        throw new Error("Gaveta de edição do produto não abriu no tempo esperado.");
      }

      // 3. Preencher o Nome do produto
      setContentEditableText(nameInput, p.name);
      await sleep(300);

      // 4. Preencher o Preço
      const priceInput = document.querySelector('[data-testid="product-edit-drawer-price-input"]');
      if (priceInput) {
        setContentEditableText(priceInput, String(p.price));
        await sleep(300);
      }

      // 5. Preencher a Descrição
      const descInput = document.querySelector('[data-testid="product-edit-drawer-description-input"]');
      if (descInput) {
        let desc = p.description || "";
        if (options.includeCode && p.code) {
          desc = `[Código: ${p.code}]\n${desc}`;
        }
        setContentEditableText(descInput, desc);
        await sleep(300);
      }

      // 6. Preencher o Link da Loja (opcional)
      if (options.includeLink && p.product_url) {
        const linkInput = document.querySelector('[data-testid="product-edit-drawer-link-input"]');
        if (linkInput) {
          setContentEditableText(linkInput, p.product_url);
          await sleep(300);
        }
      }

      // 7. Preencher o Código do item (opcional)
      if (options.includeCode && p.code) {
        const codeInput = document.querySelector('[data-testid="product-edit-drawer-retailer-id-input"]');
        if (codeInput) {
          setContentEditableText(codeInput, p.code);
          await sleep(300);
        }
      }

      // 8. Fazer o Upload da Imagem
      if (p.image_url) {
        const fileInput = document.querySelector('input[type="file"][accept*="image"]');
        if (fileInput) {
          logToPopup(`📤 Fazendo upload da imagem do site...`);
          const imgSuccess = await uploadImage(fileInput, p.image_url, p.name);
          if (imgSuccess) {
            logToPopup(`✅ Imagem anexada com sucesso.`);
            await sleep(2500); // Aguarda carregar e renderizar o preview da imagem
          }
        } else {
          logToPopup(`⚠️ Input de upload de imagem não localizado.`);
        }
      }

      if (!isImportRunning) return;

      // 9. Clicar em "Adicionar ao catálogo"
      const saveBtn = Array.from(document.querySelectorAll('button')).find(
        (btn) => btn.innerText?.includes('Adicionar ao catálogo') || btn.textContent?.includes('Adicionar ao catálogo')
      );
      
      if (!saveBtn) {
        throw new Error("Botão 'Adicionar ao catálogo' não encontrado na tela.");
      }

      // Verificar se o botão está habilitado (React/Lexical validou)
      let isEnabled = false;
      for (let attempt = 0; attempt < 12; attempt++) {
        const disabled = saveBtn.hasAttribute('disabled') || saveBtn.getAttribute('aria-disabled') === 'true';
        if (!disabled) {
          isEnabled = true;
          break;
        }
        await sleep(300);
      }

      if (!isEnabled) {
        logToPopup("⚠️ Botão de salvar permaneceu desabilitado (provável falta de imagem ou validação). Clicando mesmo assim...");
      }

      saveBtn.click();
      logToPopup("💾 Salvando item no catálogo...");
      await sleep(1500);

      // 10. Aguardar a gaveta fechar
      let isClosed = false;
      for (let attempt = 0; attempt < 20; attempt++) {
        const stillOpen = document.querySelector('[data-testid="product-edit-drawer-name-input"]');
        if (!stillOpen) {
          isClosed = true;
          break;
        }
        await sleep(300);
      }

      if (!isClosed) {
        logToPopup("⚠️ A gaveta de edição demorou para fechar. Aguardando estabilização...");
        await sleep(2000);
      } else {
        logToPopup("✅ Produto salvo com sucesso!");
      }

      await sleep(1000); // Intervalo de segurança antes do próximo item

    } catch (err) {
      logToPopup(`❌ Erro no produto ${p.name}: ${err.message}`);
      // Cancela para o usuário verificar se algo quebrou
      isImportRunning = false;
      chrome.runtime.sendMessage({ action: "IMPORT_ERROR", error: err.message });
      return;
    }
  }

  isImportRunning = false;
  chrome.runtime.sendMessage({ action: "IMPORT_COMPLETE" });
}

// Ouvir mensagens enviadas do Popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "START_IMPORT") {
    if (isImportRunning) {
      logToPopup("⚠️ Importação já está em andamento.");
      sendResponse({ status: "ALREADY_RUNNING" });
      return;
    }
    runImport(message.products, message.options);
    sendResponse({ status: "STARTED" });
  } else if (message.action === "STOP_IMPORT") {
    isImportRunning = false;
    sendResponse({ status: "STOPPED" });
  }
});

// Cria e injeta a barra lateral flutuante no WhatsApp Web
function injectSidebar() {
  if (document.getElementById('snack-catalog-sidebar-container')) return;

  const container = document.createElement('div');
  container.id = 'snack-catalog-sidebar-container';
  container.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 420px;
    height: 100vh;
    z-index: 999999;
    display: flex;
    align-items: center;
    transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    transform: translateX(0);
  `;

  // Botão de Recolher/Expandir (Handle)
  const handle = document.createElement('button');
  handle.id = 'snack-sidebar-handle';
  handle.innerText = '▶'; // Seta padrão indicando recolhimento
  handle.style.cssText = `
    width: 32px;
    height: 48px;
    background-color: #1E4018;
    border: 2px solid #c4a15a;
    border-right: none;
    border-radius: 8px 0 0 8px;
    color: #F6F2E9;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: -4px 2px 10px rgba(0,0,0,0.15);
    outline: none;
    margin-left: -32px;
    position: absolute;
    left: 0;
    transition: background-color 0.2s;
  `;
  handle.onmouseenter = () => handle.style.backgroundColor = '#153011';
  handle.onmouseleave = () => handle.style.backgroundColor = '#1E4018';

  // Iframe que renderiza a popup.html
  const iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL('popup.html');
  iframe.style.cssText = `
    width: 420px;
    height: 100%;
    border: none;
    box-shadow: -5px 0 25px rgba(0,0,0,0.15);
    background-color: #F6F2E9;
  `;

  let isCollapsed = false;
  handle.addEventListener('click', () => {
    isCollapsed = !isCollapsed;
    if (isCollapsed) {
      container.style.transform = 'translateX(420px)';
      handle.innerText = '◀'; // Aponta para a esquerda (clique para abrir)
    } else {
      container.style.transform = 'translateX(0)';
      handle.innerText = '▶'; // Aponta para a direita (clique para recolher)
    }
  });

  container.appendChild(handle);
  container.appendChild(iframe);
  document.body.appendChild(container);
  console.log("Snack Store Sidebar injetada com sucesso!");
}

// Inicializa a injeção assim que possível
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  injectSidebar();
} else {
  window.addEventListener('DOMContentLoaded', injectSidebar);
}
// Polling de segurança para garantir a injeção caso o DOM mude inicialmente
setTimeout(injectSidebar, 3000);
