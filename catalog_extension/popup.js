import { products as snackProducts } from './products.js';
import { products as perfumes25mlProducts } from './perfumes_25ml.js';
import { products as brandCollectionProducts } from './brand_collection_produtos.js';

let currentProductsList = snackProducts;
let selectedProducts = new Set();
let displayedProducts = [...currentProductsList];

// Carregar elementos
const listContainer = document.getElementById('products-list');
const searchInput = document.getElementById('search-input');
const selectAllBtn = document.getElementById('select-all');
const deselectAllBtn = document.getElementById('deselect-all');
const selectedCounter = document.getElementById('selected-counter');
const startBtn = document.getElementById('btn-start');
const stopBtn = document.getElementById('btn-stop');
const progressPanel = document.getElementById('progress-panel');
const progressPanelTitle = document.getElementById('progress-panel-title');
const progressText = document.getElementById('progress-text');
const progressBar = document.getElementById('progress-bar');
const logConsole = document.getElementById('log-console');

// Elementos de Exclusão do Catálogo
const btnDelete = document.getElementById('btn-delete');
const deleteModal = document.getElementById('delete-modal');
const btnCancelDelete = document.getElementById('btn-cancel-delete');
const btnConfirmDelete = document.getElementById('btn-confirm-delete');
const delSelectedCount = document.getElementById('del-selected-count');
const delLimitInput = document.getElementById('del-limit');

// Abas de plataforma
const btnModeWhatsapp = document.getElementById('btn-mode-whatsapp');
const btnModeFacebook = document.getElementById('btn-mode-facebook');
let currentMode = 'whatsapp';

function setMode(mode) {
  currentMode = mode;
  document.body.className = `mode-${mode}`;
  
  if (mode === 'whatsapp') {
    btnModeWhatsapp.classList.add('active');
    btnModeFacebook.classList.remove('active');
  } else {
    btnModeFacebook.classList.add('active');
    btnModeWhatsapp.classList.remove('active');
  }
  
  chrome.storage.local.set({ importMode: mode });
}

btnModeWhatsapp.addEventListener('click', () => setMode('whatsapp'));
btnModeFacebook.addEventListener('click', () => setMode('facebook'));

// Gerenciamento de Catálogos / Planilhas
const catalogSelect = document.getElementById('catalog-select');

function switchCatalog(catalogName) {
  if (catalogName === 'snack') {
    currentProductsList = snackProducts;
  } else if (catalogName === 'perfumes_25ml') {
    currentProductsList = perfumes25mlProducts;
  } else if (catalogName === 'brand_collection_produtos') {
    currentProductsList = brandCollectionProducts;
  }
  
  chrome.storage.local.set({ selectedCatalog: catalogName });
  selectedProducts.clear();
  
  // Refiltra os produtos
  const query = searchInput.value.toLowerCase().trim();
  displayedProducts = currentProductsList.filter(p => 
    p.name.toLowerCase().includes(query) || 
    p.code.toLowerCase().includes(query) ||
    (p.brand && p.brand.toLowerCase().includes(query))
  );
  
  renderList();
  updateCounter();
}

catalogSelect.addEventListener('change', (e) => {
  switchCatalog(e.target.value);
});

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
  if (delSelectedCount) {
    delSelectedCount.textContent = selectedProducts.size;
  }
}

// Filtro de Busca
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase().trim();
  displayedProducts = currentProductsList.filter(p => 
    p.name.toLowerCase().includes(query) || 
    p.code.toLowerCase().includes(query) ||
    (p.brand && p.brand.toLowerCase().includes(query))
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
  if (msg.action === "IMPORT_LOG" || msg.action === "DELETE_LOG") {
    appendLog(msg.text);
  } else if (msg.action === "IMPORT_PROGRESS" || msg.action === "DELETE_PROGRESS") {
    updateProgress(msg.current, msg.total, msg.status);
  } else if (msg.action === "IMPORT_COMPLETE") {
    appendLog("🎉 Importação concluída com sucesso!");
    stopBtn.textContent = "Concluir";
  } else if (msg.action === "DELETE_COMPLETE") {
    appendLog(`🎉 Exclusão concluída! Total apagados: ${msg.totalDeleted || 0}`);
    stopBtn.textContent = "Concluir";
  } else if (msg.action === "IMPORT_ERROR" || msg.action === "DELETE_ERROR") {
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
  if (!tab) {
    alert("Nenhuma aba ativa encontrada.");
    return;
  }

  if (currentMode === 'whatsapp') {
    if (!tab.url.includes("web.whatsapp.com")) {
      alert("Por favor, abra a aba do WhatsApp Web (web.whatsapp.com) e acesse a tela do catálogo antes de começar.");
      return;
    }
  } else if (currentMode === 'facebook') {
    if (!tab.url.includes("facebook.com/marketplace/create")) {
      alert("Por favor, abra a aba de criação de anúncio do Facebook Marketplace (facebook.com/marketplace/create/item) antes de começar.");
      return;
    }
  }

  // Mapear os produtos selecionados
  const productsToImport = currentProductsList.filter(p => selectedProducts.has(p.code));

  // Opções de campos
  const includeCode = document.getElementById('opt-include-code').checked;
  const includeLink = document.getElementById('opt-include-link').checked;

  // Mostrar painel de progresso
  progressPanel.style.display = 'flex';
  logConsole.textContent = '';
  progressBar.style.width = '0%';
  progressText.textContent = 'Iniciando...';
  stopBtn.textContent = 'Parar Importação';

  appendLog(`Iniciando importação de ${productsToImport.length} produtos no ${currentMode === 'whatsapp' ? 'WhatsApp' : 'Facebook'}...`);

  // Salvar no storage local antes de iniciar para persistência de reloads no Facebook
  await chrome.storage.local.set({
    importActive: true,
    importMode: currentMode,
    importProducts: productsToImport,
    importCurrentIndex: 0,
    importOptions: { includeCode, includeLink }
  });

  // Enviar comando de início para a aba
  chrome.tabs.sendMessage(tab.id, {
    action: "START_IMPORT",
    products: productsToImport,
    options: { includeCode, includeLink },
    mode: currentMode
  }, (response) => {
    // Se a extensão falhou a conectar (content script não carregado)
    if (chrome.runtime.lastError) {
      appendLog("❌ Erro: Não foi possível conectar ao site.");
      appendLog("Certifique-se de que a página está totalmente carregada.");
      stopBtn.textContent = "Fechar";
    }
  });
});

// Ações de Apagar Catálogo
if (btnDelete) {
  btnDelete.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url.includes("web.whatsapp.com")) {
      alert("Por favor, abra a aba do WhatsApp Web (web.whatsapp.com) e acesse a tela do catálogo antes de apagar.");
      return;
    }

    if (delSelectedCount) {
      delSelectedCount.textContent = selectedProducts.size;
    }

    // Se nenhum estiver selecionado, marca 'all'
    if (selectedProducts.size === 0) {
      const radioAll = document.querySelector('input[name="del-mode"][value="all"]');
      if (radioAll) radioAll.checked = true;
    }

    deleteModal.style.display = 'flex';
  });
}

if (btnCancelDelete) {
  btnCancelDelete.addEventListener('click', () => {
    deleteModal.style.display = 'none';
  });
}

if (btnConfirmDelete) {
  btnConfirmDelete.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url.includes("web.whatsapp.com")) {
      alert("Por favor, acerte a aba do WhatsApp Web com o catálogo aberto.");
      deleteModal.style.display = 'none';
      return;
    }

    const mode = document.querySelector('input[name="del-mode"]:checked')?.value || 'all';
    const limit = delLimitInput.value ? parseInt(delLimitInput.value) : null;

    if (mode === 'selected' && selectedProducts.size === 0) {
      alert("Nenhum produto marcado na lista. Selecione produtos ou escolha 'Apagar TUDO do catálogo'.");
      return;
    }

    const productsToDelete = currentProductsList.filter(p => selectedProducts.has(p.code));

    deleteModal.style.display = 'none';

    // Configura painel de progresso para exclusão
    if (progressPanelTitle) {
      progressPanelTitle.textContent = "Apagando Itens do Catálogo...";
    }
    progressPanel.style.display = 'flex';
    logConsole.textContent = '';
    progressBar.style.width = '0%';
    progressText.textContent = 'Iniciando exclusão...';
    stopBtn.textContent = 'Parar Exclusão';

    appendLog(`Iniciando exclusão (${mode === 'all' ? 'TUDO' : productsToDelete.length + ' selecionados'}) no WhatsApp Web...`);

    chrome.tabs.sendMessage(tab.id, {
      action: "START_DELETE",
      options: {
        mode,
        products: productsToDelete,
        limit
      }
    }, (response) => {
      if (chrome.runtime.lastError) {
        appendLog("❌ Erro: Não foi possível conectar ao WhatsApp Web.");
        appendLog("Certifique-se de que a página está aberta e o catálogo visível.");
        stopBtn.textContent = "Fechar";
      }
    });
  });
}

// Parar importação ou exclusão
stopBtn.addEventListener('click', async () => {
  if (stopBtn.textContent === "Fechar" || stopBtn.textContent === "Concluir") {
    progressPanel.style.display = 'none';
    return;
  }

  // Limpar estado no storage
  await chrome.storage.local.set({
    importActive: false,
    importProducts: [],
    importCurrentIndex: 0
  });

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    chrome.tabs.sendMessage(tab.id, { action: "STOP_IMPORT" });
    chrome.tabs.sendMessage(tab.id, { action: "STOP_DELETE" });
  }
  appendLog("⏹️ Operação interrompida pelo usuário.");
  stopBtn.textContent = "Fechar";
});

// Renderizar inicial
renderList();
updateCounter();
appendLog("Selecione os produtos e clique em 'Iniciar Importação'.");

// Carregar estado persistido ao abrir o popup
chrome.storage.local.get(['importMode', 'importActive', 'importProducts', 'importCurrentIndex', 'selectedCatalog'], (data) => {
  if (data.selectedCatalog) {
    catalogSelect.value = data.selectedCatalog;
    switchCatalog(data.selectedCatalog);
  }
  if (data.importMode) {
    setMode(data.importMode);
  }
  if (data.importActive) {
    // Restaurar visualização de progresso
    progressPanel.style.display = 'flex';
    stopBtn.textContent = 'Parar Importação';
    const current = (data.importCurrentIndex || 0) + 1;
    const total = data.importProducts ? data.importProducts.length : 0;
    updateProgress(current, total, "Importando");
    appendLog("Restaurando estado de importação ativo...");
  }
});
