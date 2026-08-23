import { products } from './products.js';

let selectedProducts = new Set();
let displayedProducts = [...products];

// Carregar elementos
const listContainer = document.getElementById('products-list');
const searchInput = document.getElementById('search-input');
const selectAllBtn = document.getElementById('select-all');
const deselectAllBtn = document.getElementById('deselect-all');
const selectedCounter = document.getElementById('selected-counter');
const startBtn = document.getElementById('btn-start');
const stopBtn = document.getElementById('btn-stop');
const progressPanel = document.getElementById('progress-panel');
const progressText = document.getElementById('progress-text');
const progressBar = document.getElementById('progress-bar');
const logConsole = document.getElementById('log-console');

// Inicializar lista
function renderList() {
  listContainer.innerHTML = '';
  if (displayedProducts.length === 0) {
    listContainer.innerHTML = '<div style="text-align: center; color: #999; padding: 20px; font-size: 13px;">Nenhum produto encontrado</div>';
    return;
  }

  displayedProducts.forEach(p => {
    const row = document.createElement('div');
    row.className = 'product-row';
    
    const isChecked = selectedProducts.has(p.code);
    
    row.innerHTML = `
      <input type="checkbox" id="chk-${p.code}" ${isChecked ? 'checked' : ''}>
      <img src="${p.image_url}" class="product-img" alt="${p.name}">
      <div class="product-details">
        <h4 class="product-name">${p.name}</h4>
        <p class="product-meta">Cód: ${p.code} • R$ ${p.price.toFixed(2)}</p>
      </div>
    `;

    // Clique na linha marca/desmarca
    row.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT') {
        const chk = row.querySelector('input');
        chk.checked = !chk.checked;
        toggleSelection(p.code, chk.checked);
      } else {
        toggleSelection(p.code, e.target.checked);
      }
    });

    listContainer.appendChild(row);
  });
}

function toggleSelection(code, isChecked) {
  if (isChecked) {
    selectedProducts.add(code);
  } else {
    selectedProducts.delete(code);
  }
  updateCounter();
}

function updateCounter() {
  selectedCounter.textContent = `${selectedProducts.size} selecionados`;
}

// Filtro de Busca
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase().trim();
  displayedProducts = products.filter(p => 
    p.name.toLowerCase().includes(query) || 
    p.code.toLowerCase().includes(query) ||
    p.brand.toLowerCase().includes(query)
  );
  renderList();
});

// Ações rápidas de seleção
selectAllBtn.addEventListener('click', () => {
  displayedProducts.forEach(p => selectedProducts.add(p.code));
  renderList();
  updateCounter();
});

deselectAllBtn.addEventListener('click', () => {
  selectedProducts.clear();
  renderList();
  updateCounter();
});

// Ações do painel de logs
function appendLog(text) {
  const date = new Date().toLocaleTimeString();
  logConsole.textContent += `[${date}] ${text}\n`;
  logConsole.scrollTop = logConsole.scrollHeight;
}

function updateProgress(current, total, status) {
  const percent = Math.round((current / total) * 100);
  progressBar.style.width = `${percent}%`;
  progressText.textContent = `${status} (${current}/${total})`;
}

// Ouvir logs enviados do Content Script
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "IMPORT_LOG") {
    appendLog(msg.text);
  } else if (msg.action === "IMPORT_PROGRESS") {
    updateProgress(msg.current, msg.total, msg.status);
  } else if (msg.action === "IMPORT_COMPLETE") {
    appendLog("🎉 Importação concluída com sucesso!");
    stopBtn.textContent = "Concluir";
  } else if (msg.action === "IMPORT_ERROR") {
    appendLog(`❌ Erro crítico: ${msg.error}`);
    stopBtn.textContent = "Fechar";
  }
});

// Iniciar importação
startBtn.addEventListener('click', async () => {
  if (selectedProducts.size === 0) {
    alert("Selecione pelo menos um produto para importar.");
    return;
  }

  // Obter aba ativa
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url.includes("web.whatsapp.com")) {
    alert("Por favor, abra a aba do WhatsApp Web (web.whatsapp.com) e acesse a tela do catálogo antes de começar.");
    return;
  }

  // Mapear os produtos selecionados
  const productsToImport = products.filter(p => selectedProducts.has(p.code));

  // Opções de campos
  const includeCode = document.getElementById('opt-include-code').checked;
  const includeLink = document.getElementById('opt-include-link').checked;

  // Mostrar painel de progresso
  progressPanel.style.display = 'flex';
  logConsole.textContent = '';
  progressBar.style.width = '0%';
  progressText.textContent = 'Iniciando...';
  stopBtn.textContent = 'Parar Importação';

  appendLog(`Iniciando importação de ${productsToImport.length} produtos...`);

  // Enviar comando de início para a aba
  chrome.tabs.sendMessage(tab.id, {
    action: "START_IMPORT",
    products: productsToImport,
    options: { includeCode, includeLink }
  }, (response) => {
    // Se a extensão falhou a conectar (content script não carregado)
    if (chrome.runtime.lastError) {
      appendLog("❌ Erro: Não foi possível conectar ao WhatsApp Web.");
      appendLog("Certifique-se de que a página está totalmente carregada e na tela de edição do catálogo.");
      stopBtn.textContent = "Fechar";
    }
  });
});

// Parar importação
stopBtn.addEventListener('click', async () => {
  if (stopBtn.textContent === "Fechar" || stopBtn.textContent === "Concluir") {
    progressPanel.style.display = 'none';
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    chrome.tabs.sendMessage(tab.id, { action: "STOP_IMPORT" });
  }
  appendLog("⏹️ Importação interrompida pelo usuário.");
  stopBtn.textContent = "Fechar";
});

// Renderizar inicial
renderList();
updateCounter();
appendLog("Selecione os produtos e clique em 'Iniciar Importação'.");
