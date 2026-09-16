// Content script for WhatsApp Web Catalog Importer
let isImportRunning = false;
let isDeleteRunning = false;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const logToPopup = (text) => {
  console.log(`[Importer Log] ${text}`);
  chrome.runtime.sendMessage({ action: isDeleteRunning ? "DELETE_LOG" : "IMPORT_LOG", text });
};

const sendProgress = (current, total, status) => {
  chrome.runtime.sendMessage({ action: isDeleteRunning ? "DELETE_PROGRESS" : "IMPORT_PROGRESS", current, total, status });
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

// Download e upload das imagens do produto contornando restrições de CORS (suporta múltiplas imagens separadas por vírgula ou quebra de linha)
async function uploadImages(fileInput, imageUrlsString, productName) {
  try {
    if (!imageUrlsString) return false;
    
    // Divide por vírgula ou quebra de linha e limpa
    const urls = imageUrlsString.split(/[,\n]/).map(u => u.trim()).filter(u => u.length > 0 && u.startsWith("http"));
    if (urls.length === 0) {
      logToPopup("⚠️ Nenhuma URL de imagem válida encontrada.");
      return false;
    }
    
    logToPopup(`📥 Solicitando download seguro de ${urls.length} imagem(ns)...`);
    const dataTransfer = new DataTransfer();
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      try {
        logToPopup(`📥 Baixando imagem ${i + 1}/${urls.length}...`);
        const imgData = await fetchImageFromBackground(url);
        
        // Decodifica a string Base64 de volta para bytes
        const binaryString = atob(imgData.base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let j = 0; j < len; j++) {
          bytes[j] = binaryString.charCodeAt(j);
        }
        
        const mimeType = imgData.contentType || 'image/webp';
        const extension = mimeType.split('/')[1] || 'webp';
        const fileName = `${productName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${i + 1}.${extension}`;
        
        // Criar o arquivo File a partir do Blob reconstruído
        const blob = new Blob([bytes], { type: mimeType });
        const file = new File([blob], fileName, { type: mimeType });
        dataTransfer.items.add(file);
      } catch (err) {
        logToPopup(`⚠️ Falha ao baixar imagem ${i + 1} (${url}): ${err.message}`);
      }
    }
    
    if (dataTransfer.files.length === 0) {
      throw new Error("Nenhuma imagem pôde ser baixada com sucesso.");
    }
    
    fileInput.files = dataTransfer.files;
    
    // Disparar evento para o React detectar o upload
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  } catch (err) {
    console.error("Falha no upload das imagens:", err);
    logToPopup(`⚠️ Não foi possível carregar as imagens: ${err.message}`);
    return false;
  }
}

// Simula a digitação de texto caractere por caractere
async function simulateTyping(el, text) {
  if (!el) return;
  el.focus();
  let currentVal = "";
  
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
    'value'
  ).set;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    currentVal += char;
    nativeInputValueSetter.call(el, currentVal);
    
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    
    const keyCode = char.charCodeAt(0);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: char, keyCode: keyCode, bubbles: true }));
    el.dispatchEvent(new KeyboardEvent('keypress', { key: char, keyCode: keyCode, bubbles: true }));
    el.dispatchEvent(new KeyboardEvent('keyup', { key: char, keyCode: keyCode, bubbles: true }));
    
    await sleep(20);
  }
}

// Configura o valor em elementos de input/textarea normais (compatível com React)
function setInputValue(el, value) {
  if (!el) return false;
  if (el.tagName === 'INPUT' && el.type === 'file') {
    console.warn("setInputValue ignorado para input type file.");
    return false;
  }
  el.focus();
  el.select();
  
  // Utiliza o setter nativo para contornar o controle de estado do React
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
    'value'
  ).set;
  nativeInputValueSetter.call(el, value);
  
  // Dispara eventos DOM para atualizar o estado do React
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.blur();
  return true;
}

// Localiza um input/textarea na página com base no texto da label visível
function findFieldByLabel(labelText, tagName) {
  const labels = Array.from(document.querySelectorAll('span, div'));
  for (const labelElement of labels) {
    const text = labelElement.textContent.trim().toLowerCase();
    if (text === labelText.toLowerCase()) {
      // Tenta buscar no label wrapper mais próximo
      const labelWrapper = labelElement.closest('label');
      if (labelWrapper) {
        const input = labelWrapper.querySelector(tagName);
        if (input && !(tagName === 'input' && input.type === 'file')) return input;
      }
      // Tenta buscar nos filhos do elemento pai
      const parent = labelElement.parentElement;
      if (parent) {
        const input = parent.querySelector(tagName);
        if (input && !(tagName === 'input' && input.type === 'file')) return input;
      }
    }
  }
  return null;
}

// Localiza e clica em uma opção de dropdown visível com base no texto (com retentativa e busca pelo nó mais profundo)
async function selectDropdownOption(optionText, timeout = 3000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    // 1. Procura primeiro nas opções formais do menu/dropdown
    let options = Array.from(document.querySelectorAll('[role="option"], [role="menuitem"]'));
    let target = options.find(el => {
      const text = el.textContent.trim().toLowerCase();
      if (text === optionText.toLowerCase() || text.includes(optionText.toLowerCase())) {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }
      return false;
    });
    
    // 2. Se não encontrar, busca o nó visível mais profundo contendo o texto
    if (!target) {
      target = findDeepestMatch(optionText);
    }
    
    if (target) {
      logToPopup(`🖱️ Clicando na opção: "${target.textContent.trim()}"`);
      target.click();
      
      // Clique adicional no pai clicável mais próximo por segurança (React propagation)
      const parentButton = target.closest('[role="button"]') || target.closest('li') || target.closest('[role="option"]');
      if (parentButton && parentButton !== target) {
        parentButton.click();
      }
      return true;
    }
    await sleep(200);
  }
  return false;
}

function findDeepestMatch(text) {
  const elements = Array.from(document.querySelectorAll('span, div, li, a, p'));
  const matches = elements.filter(el => {
    const elText = el.textContent.trim().toLowerCase();
    if (elText === text.toLowerCase() || elText.includes(text.toLowerCase())) {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }
    return false;
  });

  if (matches.length === 0) return null;

  // Ordena por profundidade (mais profundo primeiro)
  matches.sort((a, b) => {
    let aDepth = 0, bDepth = 0;
    let tempA = a, tempB = b;
    while (tempA.parentElement) { aDepth++; tempA = tempA.parentElement; }
    while (tempB.parentElement) { bDepth++; tempB = tempB.parentElement; }
    return bDepth - aDepth;
  });

  return matches[0];
}

// Aguarda até que um seletor retorne um elemento válido
async function waitForElement(selectorFunction, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const el = selectorFunction();
    if (el) return el;
    await sleep(200);
  }
  return null;
}

// Loop principal de importação para o Facebook Marketplace
async function runFacebookImport(products, index, options) {
  if (!isImportRunning) return;
  const total = products.length;
  const p = products[index];
  
  logToPopup(`-----------------------------------------`);
  logToPopup(`[Facebook ${index + 1}/${total}] Processando: ${p.name}`);
  sendProgress(index + 1, total, `Importando: ${p.name}`);
  
  try {
    // Aguarda o formulário carregar verificando o campo de Título
    const titleInput = await waitForElement(() => findFieldByLabel("Título", "input"), 15000);
    if (!titleInput) {
      throw new Error("Formulário de criação do Facebook não carregou a tempo.");
    }
    if (!isImportRunning) return;
    
    // 1. Preencher Título
    setInputValue(titleInput, p.name);
    logToPopup("✅ Título preenchido.");
    await sleep(500);
    if (!isImportRunning) return;
    
    // 2. Preencher Preço (default 79)
    const priceInput = findFieldByLabel("Preço", "input");
    if (priceInput) {
      setInputValue(priceInput, String(p.price || 79));
      logToPopup("✅ Preço preenchido.");
      await sleep(500);
    }
    if (!isImportRunning) return;
    
    // 3. Categoria: Saúde e beleza / Health & beauty
    const categoryLabel = Array.from(document.querySelectorAll('label')).find(el => 
      el.textContent.includes('Categoria') || 
      el.textContent.includes('Category')
    );
    if (categoryLabel) {
      // Localiza o elemento interno onde fica o texto da seleção atual
      const selectionEl = categoryLabel.querySelector('.xjyslct') || categoryLabel;
      const selectionTextLower = selectionEl.textContent.toLowerCase();
      const isAlreadySelected = selectionTextLower.includes("saúde e beleza") || selectionTextLower.includes("health & beauty");
      
      if (!isAlreadySelected) {
        // Tenta clicar no wrapper ou no botão interno combobox (classe xjyslct)
        const clickTarget = categoryLabel.querySelector('.xjyslct') || categoryLabel;
        clickTarget.click();
        await sleep(1000);
        
        let clicked = await selectDropdownOption("Saúde e beleza");
        if (!clicked) clicked = await selectDropdownOption("Saúde e Beleza");
        if (!clicked) clicked = await selectDropdownOption("Health & beauty");
        if (!clicked) clicked = await selectDropdownOption("Health & Beauty");
        
        if (clicked) {
          logToPopup("✅ Categoria 'Saúde e beleza' selecionada.");
        } else {
          logToPopup("⚠️ Opção 'Saúde e beleza' / 'Health & Beauty' não encontrada no dropdown.");
        }
      } else {
        logToPopup("✅ Categoria 'Saúde e beleza' já selecionada.");
      }
      await sleep(800);
    }
    if (!isImportRunning) return;
    
    // 4. Estado/Condição: Novo
    const stateLabel = Array.from(document.querySelectorAll('label')).find(el => 
      el.textContent.includes('Condição') || 
      el.textContent.includes('Estado') || 
      el.textContent.includes('Condition')
    );
    if (stateLabel) {
      const clickTarget = stateLabel.querySelector('.xjyslct') || stateLabel;
      clickTarget.click();
      await sleep(1000);
      let clicked = await selectDropdownOption("Novo");
      if (!clicked) {
        clicked = await selectDropdownOption("New");
      }
      if (clicked) {
        logToPopup("✅ Estado/Condição 'Novo' selecionado.");
      } else {
        logToPopup("⚠️ Opção 'Novo'/'New' não encontrada no dropdown de Estado.");
      }
      await sleep(800);
    }
    if (!isImportRunning) return;
    
    // 5. Género
    const genderInput = findFieldByLabel("Género", "input") || findFieldByLabel("Gênero", "input") || findFieldByLabel("Genero", "input");
    let genderVal = "Unissex";
    if (p.name.toLowerCase().includes("masculino")) {
      genderVal = "Masculino";
    } else if (p.name.toLowerCase().includes("feminino")) {
      genderVal = "Feminino";
    }
    if (genderInput) {
      setInputValue(genderInput, genderVal);
      logToPopup(`✅ Gênero '${genderVal}' preenchido.`);
      await sleep(500);
    }
    if (!isImportRunning) return;
    
    // 6. Descrição
    const descTextarea = findFieldByLabel("Descrição", "textarea");
    if (descTextarea) {
      let descVal = p.description || "";
      descVal += `\n\n📦 **ENVIO RÁPIDO**\n🚚 Produto com garantia e entrega expressa em Belo Horizonte\n🔒 Compra segura\n📦 Produto bem embalado para envio`;
      setInputValue(descTextarea, descVal);
      logToPopup("✅ Descrição preenchida.");
      await sleep(500);
    }
    if (!isImportRunning) return;
    
    // 7. Preferências de encontro (Marcar todos os checkboxes: Encontro Público, Retirada, Entrega)
    const checkboxes = Array.from(document.querySelectorAll('[role="checkbox"]'));
    for (const cb of checkboxes) {
      const text = cb.textContent || "";
      if (text.includes("Encontro público") || 
          text.includes("Recolha") || 
          text.includes("Retirada") || 
          text.includes("Entrega") || 
          text.includes("Pickup") || 
          text.includes("Delivery") ||
          text.includes("Meetup")) {
        const isChecked = cb.getAttribute('aria-checked') === 'true';
        if (!isChecked) {
          cb.click();
          await sleep(450);
        }
      }
    }
    logToPopup("✅ Preferências de encontro marcadas.");
    if (!isImportRunning) return;
    
    // 8. Tags de produtos (Inserção uma a uma simulando teclado para o React detectar e registrar)
    const tagsTextarea = findFieldByLabel("Identificações de produtos", "textarea") || 
                         findFieldByLabel("Etiquetas de produto", "textarea") ||
                         findFieldByLabel("Product tags", "textarea");
    if (tagsTextarea) {
      const tagsList = [
        "perfume", "perfumes", "colonia", "fragrancia", "importado", "perfume importado",
        "decant", "mini perfume", "contratipo", "cheiroso", "fixacao", "essencia",
        "beleza", "cosmeticos", "presente", "promocao", "desconto", "bh", "belo horizonte"
      ];
      if (genderVal === "Masculino") {
        tagsList.push("perfume masculino");
      } else if (genderVal === "Feminino") {
        tagsList.push("perfume feminino");
      } else {
        tagsList.push("unissex");
      }
      
      logToPopup("✅ Preenchendo tags de produtos uma a uma...");
      tagsTextarea.focus();
      for (const tag of tagsList) {
        if (!isImportRunning) return;
        
        // Simula digitação da tag letra por letra
        await simulateTyping(tagsTextarea, tag);
        await sleep(150);
        
        // Adiciona a vírgula ao final e dispara eventos de input
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
        nativeInputValueSetter.call(tagsTextarea, tagsTextarea.value + ",");
        tagsTextarea.dispatchEvent(new Event('input', { bubbles: true }));
        tagsTextarea.dispatchEvent(new Event('change', { bubbles: true }));
        await sleep(100);
        
        // Dispara evento de pressionamento da vírgula
        const keydownComma = new KeyboardEvent('keydown', { key: ',', code: 'Comma', keyCode: 188, which: 188, bubbles: true });
        tagsTextarea.dispatchEvent(keydownComma);
        
        const keypressComma = new KeyboardEvent('keypress', { key: ',', code: 'Comma', keyCode: 188, which: 188, bubbles: true });
        tagsTextarea.dispatchEvent(keypressComma);
        
        const keyupComma = new KeyboardEvent('keyup', { key: ',', code: 'Comma', keyCode: 188, which: 188, bubbles: true });
        tagsTextarea.dispatchEvent(keyupComma);

        // Dispara Enter por segurança para confirmar a tag
        const keydownEnter = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true });
        tagsTextarea.dispatchEvent(keydownEnter);
        
        await sleep(350); // Aguarda o Facebook registrar o chip
      }
      tagsTextarea.blur();
      logToPopup("✅ Tags de produtos preenchidas.");
      await sleep(500);
    }
    if (!isImportRunning) return;
    
    // 9. Upload de Imagem
    if (p.image_url) {
      const fileInput = document.querySelector('input[type="file"][accept*="image"]');
      if (fileInput) {
        logToPopup(`📤 Carregando imagem(ns) no Facebook...`);
        const imgSuccess = await uploadImages(fileInput, p.image_url, p.name);
        if (imgSuccess) {
          logToPopup(`✅ Imagem(ns) anexada(s) com sucesso.`);
          await sleep(4000); // Aguarda renderizar o preview da imagem
        }
      }
    }
    if (!isImportRunning) return;
    
    // 10. Clicar em "Seguinte" / "Avançar" / "Continuar"
    const nextBtn = Array.from(document.querySelectorAll('div[role="button"], button')).find(
      el => {
        const text = el.textContent.trim().toLowerCase();
        return text === 'seguinte' || text === 'avançar' || text === 'avancar' || text === 'continuar' || text === 'next';
      }
    );
    if (nextBtn) {
      logToPopup("➡️ Avançando...");
      nextBtn.click();
      await sleep(4000); // Aguarda transição
      
      if (!isImportRunning) return;
      
      // 11. Clicar em "Publicar" / "Publish"
      const publishBtn = Array.from(document.querySelectorAll('div[role="button"], button')).find(
        el => {
          const text = el.textContent.trim().toLowerCase();
          return text === 'publicar' || text === 'publish' || text === 'enviar';
        }
      );
      if (publishBtn) {
        logToPopup("🚀 Clicando em 'Publicar'...");
        publishBtn.click();
        logToPopup("💾 Salvando anúncio no Facebook Marketplace...");
        await sleep(7000); // Aguarda a publicação processar
        
        if (!isImportRunning) return;
        
        // Atualiza índice na fila persistida
        const nextIndex = index + 1;
        await chrome.storage.local.set({ importCurrentIndex: nextIndex });
        
        if (nextIndex < total) {
          logToPopup("🔄 Redirecionando para criar o próximo anúncio...");
          window.location.href = "https://www.facebook.com/marketplace/create/item";
        } else {
          logToPopup("🎉 Todos os produtos foram importados com sucesso!");
          await chrome.storage.local.set({ importActive: false });
          chrome.runtime.sendMessage({ action: "IMPORT_COMPLETE" });
        }
      } else {
        throw new Error("Botão 'Publicar' não encontrado.");
      }
    } else {
      throw new Error("Botão 'Seguinte' não encontrado.");
    }
    
  } catch (err) {
    logToPopup(`❌ Erro no Facebook (Produto ${p.name}): ${err.message}`);
    isImportRunning = false;
    await chrome.storage.local.set({ importActive: false });
    chrome.runtime.sendMessage({ action: "IMPORT_ERROR", error: err.message });
  }
}

// Verifica se há importação ativa do Facebook salva no storage
let isResumeChecked = false;
async function checkAndResumeFacebookImport() {
  if (isResumeChecked) return;
  if (!window.location.href.includes("facebook.com/marketplace/create")) {
    return;
  }
  isResumeChecked = true;
  
  const data = await new Promise((resolve) => {
    chrome.storage.local.get(['importActive', 'importMode', 'importProducts', 'importCurrentIndex', 'importOptions'], resolve);
  });
  
  if (data && data.importActive && data.importMode === 'facebook') {
    isImportRunning = true;
    const index = data.importCurrentIndex || 0;
    const products = data.importProducts || [];
    const options = data.importOptions || {};
    
    if (index < products.length) {
      logToPopup(`🔄 Retomando importação do Facebook no item ${index + 1}/${products.length}...`);
      runFacebookImport(products, index, options);
    } else {
      logToPopup("🎉 Todos os produtos foram importados!");
      await chrome.storage.local.set({ importActive: false });
      chrome.runtime.sendMessage({ action: "IMPORT_COMPLETE" });
    }
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
          logToPopup(`📤 Fazendo upload da(s) imagem(ns) do site...`);
          const imgSuccess = await uploadImages(fileInput, p.image_url, p.name);
          if (imgSuccess) {
            logToPopup(`✅ Imagem(ns) anexada(s) com sucesso.`);
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

// ==========================================
// FUNÇÕES DE EXCLUSÃO DO CATÁLOGO (WHATSAPP)
// ==========================================

// Simula um clique real do usuário disparando toda a cadeia de eventos de Pointer e Mouse com coordenadas
function simulateRealClick(el) {
  if (!el) return false;
  try {
    el.scrollIntoView({ block: 'center', behavior: 'instant' });
  } catch (e) {}

  const rect = el.getBoundingClientRect();
  const x = Math.round(rect.left + rect.width / 2);
  const y = Math.round(rect.top + rect.height / 2);

  const eventOpts = {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: x,
    clientY: y,
    screenX: x,
    screenY: y,
    pageX: x,
    pageY: y
  };

  try {
    el.focus();
  } catch (e) {}

  // 1. pointerdown & mousedown
  try {
    el.dispatchEvent(new PointerEvent('pointerdown', {
      ...eventOpts,
      button: 0,
      buttons: 1,
      pointerId: 1,
      pointerType: 'mouse',
      isPrimary: true
    }));
  } catch (e) {}

  el.dispatchEvent(new MouseEvent('mousedown', {
    ...eventOpts,
    button: 0,
    buttons: 1,
    detail: 1
  }));

  // 2. pointerup & mouseup
  try {
    el.dispatchEvent(new PointerEvent('pointerup', {
      ...eventOpts,
      button: 0,
      buttons: 0,
      pointerId: 1,
      pointerType: 'mouse',
      isPrimary: true
    }));
  } catch (e) {}

  el.dispatchEvent(new MouseEvent('mouseup', {
    ...eventOpts,
    button: 0,
    buttons: 0,
    detail: 1
  }));

  // 3. click nativo e dispatch
  el.dispatchEvent(new MouseEvent('click', {
    ...eventOpts,
    button: 0,
    buttons: 0,
    detail: 1
  }));

  try {
    el.click();
  } catch (e) {}

  return true;
}

// Localiza os cards de produtos no painel do catálogo do WhatsApp
function getCatalogProductCards() {
  const cards = [];

  // 1. Procura elementos de texto contendo 'R$' no painel esquerdo (left < 500)
  const allSpansAndDivs = Array.from(document.querySelectorAll('span, div, p'));
  const priceElements = allSpansAndDivs.filter(el => {
    const text = el.textContent ? el.textContent.trim() : '';
    if (!text.includes('R$')) return false;
    const rect = el.getBoundingClientRect();
    return rect.left < 500 && rect.width > 0 && rect.height > 0 && el.children.length === 0;
  });

  for (const priceEl of priceElements) {
    let row = priceEl.parentElement;
    let foundRow = null;
    while (row && row !== document.body) {
      const r = row.getBoundingClientRect();
      const txt = row.textContent || '';
      // Altura padrão de linha de item de catálogo do WhatsApp (~60px a 140px)
      if (r.height >= 45 && r.height <= 160 && r.width >= 150 && r.left < 500) {
        if (!txt.includes('Adicionar item') && !txt.includes('Adicionar coleção') && !txt.includes('Adicionar colecção')) {
          foundRow = row;
        }
      }
      row = row.parentElement;
    }

    if (foundRow && !cards.includes(foundRow)) {
      if (!cards.some(existing => existing.contains(foundRow) || foundRow.contains(existing))) {
        cards.push(foundRow);
      }
    }
  }

  // 2. Fallback: buscar imagens de produtos abaixo do cabeçalho
  if (cards.length === 0) {
    const images = Array.from(document.querySelectorAll('img')).filter(img => {
      const rect = img.getBoundingClientRect();
      return rect.left < 500 && rect.top > 100 && rect.width >= 30 && rect.height >= 30;
    });

    for (const img of images) {
      let row = img.parentElement;
      while (row && row !== document.body) {
        const r = row.getBoundingClientRect();
        const txt = row.textContent || '';
        if (r.height >= 45 && r.height <= 160 && r.width >= 150 && r.left < 500) {
          if (!txt.includes('Adicionar item') && !txt.includes('Adicionar coleção')) {
            if (!cards.includes(row) && !cards.some(existing => existing.contains(row) || row.contains(existing))) {
              cards.push(row);
            }
            break;
          }
        }
        row = row.parentElement;
      }
    }
  }

  return cards;
}

// Verifica se o painel de detalhes ou edição do produto está aberto
function isProductDetailsOrEditOpen() {
  if (findEditButton()) return true;
  if (findDeleteItemButton()) return true;
  if (document.querySelector('[data-testid="product-edit-drawer-name-input"]')) return true;

  // Procura por textos de "Editar item" ou botão "Editar" no painel central/direito
  const elements = Array.from(document.querySelectorAll('span, button, h1, h2, h3, div'));
  return elements.some(el => {
    const rect = el.getBoundingClientRect();
    if (rect.left > 280 && rect.width > 0 && rect.height > 0) {
      const txt = (el.textContent || '').trim().toLowerCase();
      return txt === 'editar' || txt === 'editar item' || txt === 'apagar item';
    }
    return false;
  });
}

// Abre o card do produto tentando cliques em múltiplos pontos estratégicos
async function openCatalogProductCard(cardEl) {
  if (!cardEl) return false;

  cardEl.scrollIntoView({ block: 'center', behavior: 'instant' });
  await sleep(250);

  // Alvo 1: document.elementFromPoint na posição central da linha
  const rect = cardEl.getBoundingClientRect();
  const pointX = rect.left + Math.min(rect.width / 2, 100);
  const pointY = rect.top + rect.height / 2;
  const hitEl = document.elementFromPoint(pointX, pointY);

  // Alvo 2: Imagem do card
  const img = cardEl.querySelector('img');

  // Alvo 3: Elemento de texto do título
  const titleEl = Array.from(cardEl.querySelectorAll('span, div, p')).find(el => {
    const t = (el.textContent || '').trim();
    return t.length > 5 && !t.includes('R$') && !t.includes('Código:') && el.children.length === 0;
  });

  // Alvo 4: Qualquer elemento com role button ou gridcell
  const roleEl = cardEl.querySelector('[role="button"], [role="gridcell"], [tabindex="0"], a') || cardEl.closest('[role="button"]');

  // Alvo 5: O próprio card
  const targets = [hitEl, titleEl, img, roleEl, cardEl].filter(Boolean);

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    simulateRealClick(target);
    await sleep(800);

    if (isProductDetailsOrEditOpen()) {
      return true;
    }
  }

  return false;
}

// Localiza o botão/span com o texto "Editar" no painel de detalhes do produto
function findEditButton() {
  const elements = Array.from(document.querySelectorAll('span, button, div[role="button"], div, a'));
  for (const el of elements) {
    const text = el.textContent ? el.textContent.trim().toLowerCase() : '';
    if (text === 'editar' || text === 'edit') {
      const rect = el.getBoundingClientRect();
      // Deve estar na metade direita ou central da tela
      if (rect.left > 250 && rect.width > 0 && rect.height > 0) {
        return el;
      }
    }
  }
  return null;
}

// Clica no botão "Editar" e aguarda a abertura da tela de edição
async function clickEditButton() {
  const editBtn = findEditButton();
  if (!editBtn) return false;

  logToPopup("🖱️ Clicando em 'Editar'...");
  simulateRealClick(editBtn);

  const parentBtn = editBtn.closest('button') || editBtn.closest('[role="button"]');
  if (parentBtn && parentBtn !== editBtn) {
    simulateRealClick(parentBtn);
  }

  // Aguarda a gaveta de edição carregar
  for (let i = 0; i < 15; i++) {
    await sleep(300);
    scrollDrawerToBottom();
    if (findDeleteItemButton() || document.querySelector('[data-testid="product-edit-drawer-name-input"]')) {
      return true;
    }
  }

  return false;
}

// Rola a gaveta/painel de edição até o fim para revelar "Apagar item"
function scrollDrawerToBottom() {
  const drawerInputs = document.querySelectorAll('[data-testid*="product-edit-drawer"], [data-testid*="drawer"]');
  for (const inp of drawerInputs) {
    let parent = inp.parentElement;
    while (parent && parent !== document.body) {
      if (parent.scrollHeight > parent.clientHeight && parent.clientHeight > 200) {
        parent.scrollTop = parent.scrollHeight;
      }
      parent = parent.parentElement;
    }
  }

  const drawers = document.querySelectorAll('div[tabindex="-1"], div[style*="overflow"]');
  for (const d of drawers) {
    const rect = d.getBoundingClientRect();
    if (rect.left > 200 && rect.width > 250 && d.scrollHeight > d.clientHeight) {
      d.scrollTop = d.scrollHeight;
    }
  }
}

// Localiza o botão "Apagar item"
function findDeleteItemButton() {
  const candidates = Array.from(document.querySelectorAll('button, div[role="button"], span, div'));
  for (const el of candidates) {
    const text = el.textContent ? el.textContent.trim().toLowerCase() : '';
    if (text === 'apagar item' || text === 'delete item' || text === 'excluir item') {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return el.closest('button') || el.closest('[role="button"]') || el;
      }
    }
  }
  return null;
}

// Clica em "Apagar item" acionando tanto os spans internos quanto a coordenada exata
async function clickDeleteItemButton() {
  scrollDrawerToBottom();
  await sleep(400);

  let deleteBtn = findDeleteItemButton();
  if (!deleteBtn) {
    scrollDrawerToBottom();
    await sleep(600);
    deleteBtn = findDeleteItemButton();
  }

  if (!deleteBtn) return false;

  deleteBtn.scrollIntoView({ block: 'center', behavior: 'instant' });
  await sleep(200);

  const rect = deleteBtn.getBoundingClientRect();
  const cx = Math.round(rect.left + rect.width / 2);
  const cy = Math.round(rect.top + rect.height / 2);
  const hitEl = document.elementFromPoint(cx, cy);

  // Procura o elemento de texto mais interno com "Apagar item"
  const innerSpan = Array.from(deleteBtn.querySelectorAll('span, div')).find(el => {
    return el.textContent && el.textContent.trim().toLowerCase() === 'apagar item' && el.children.length === 0;
  });

  const targets = [innerSpan, hitEl, deleteBtn].filter(Boolean);
  for (const t of targets) {
    simulateRealClick(t);
  }

  try { deleteBtn.click(); } catch (e) {}
  if (innerSpan) {
    try { innerSpan.click(); } catch (e) {}
  }

  return true;
}

// Localiza o botão "OK" do modal de confirmação de exclusão
function findConfirmDeleteOkButton() {
  const modals = Array.from(document.querySelectorAll('[role="dialog"], [role="group"], [data-animate-modal-popup="true"], div'));
  for (const modal of modals) {
    const text = modal.textContent || '';
    if ((text.includes('Apagar item') || text.includes('apagado do seu catálogo') || text.includes('Cancelar')) && text.includes('OK')) {
      const buttons = Array.from(modal.querySelectorAll('button, div[role="button"]'));
      const okBtn = buttons.find(b => {
        const bText = b.textContent ? b.textContent.trim().toUpperCase() : '';
        return bText === 'OK';
      });
      if (okBtn) return okBtn;
    }
  }

  const allButtons = Array.from(document.querySelectorAll('button, div[role="button"]'));
  const okBtnWithCancelSibling = allButtons.find(b => {
    if (b.textContent && b.textContent.trim().toUpperCase() === 'OK') {
      const parent = b.parentElement;
      return parent && (parent.textContent.includes('Cancelar') || parent.textContent.includes('Cancel'));
    }
    return false;
  });
  if (okBtnWithCancelSibling) return okBtnWithCancelSibling;

  return allButtons.find(b => {
    if (b.textContent && b.textContent.trim().toUpperCase() === 'OK') {
      const rect = b.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }
    return false;
  });
}

// Confirma a exclusão clicando no botão OK do modal com clique profundo
async function confirmDeleteOkModal() {
  logToPopup("⚠️ Aguardando modal de confirmação...");
  let okBtn = await waitForElement(() => findConfirmDeleteOkButton(), 5000);
  if (!okBtn) return false;

  logToPopup("✅ Confirmando exclusão (clicando em OK)...");

  okBtn.scrollIntoView({ block: 'center', behavior: 'instant' });
  await sleep(150);

  const rect = okBtn.getBoundingClientRect();
  const cx = Math.round(rect.left + rect.width / 2);
  const cy = Math.round(rect.top + rect.height / 2);
  const hitEl = document.elementFromPoint(cx, cy);

  const innerOkSpan = Array.from(okBtn.querySelectorAll('span, div')).find(el => {
    return el.textContent && el.textContent.trim().toUpperCase() === 'OK' && el.children.length === 0;
  });

  const targets = [innerOkSpan, hitEl, okBtn].filter(Boolean);
  for (const t of targets) {
    simulateRealClick(t);
  }

  try { okBtn.click(); } catch (e) {}
  if (innerOkSpan) {
    try { innerOkSpan.click(); } catch (e) {}
  }

  for (let i = 0; i < 25; i++) {
    await sleep(200);
    if (!findConfirmDeleteOkButton()) break;
  }

  return true;
}

// Loop principal de exclusão de itens do catálogo
async function runDeleteCatalog(options = {}) {
  isDeleteRunning = true;
  const mode = options.mode || 'all';
  const targetProducts = options.products || [];
  const limit = options.limit ? parseInt(options.limit) : Infinity;

  logToPopup("🚀 Iniciando exclusão de itens do catálogo...");
  sendProgress(0, limit === Infinity ? (targetProducts.length || 1) : limit, "Iniciando exclusão...");

  let deletedCount = 0;

  while (isDeleteRunning) {
    if (deletedCount >= limit) {
      logToPopup(`🏁 Limite solicitado de ${limit} exclusão(ões) atingido.`);
      break;
    }

    // 1. Obter cards atuais do catálogo
    let cards = getCatalogProductCards();

    if (cards.length === 0) {
      logToPopup("⏳ Aguardando lista de itens do catálogo carregar...");
      await sleep(1500);
      cards = getCatalogProductCards();
    }

    if (cards.length === 0) {
      logToPopup("✨ Nenhum item restante encontrado no catálogo. Catálogo limpo!");
      break;
    }

    // Determina qual item apagar
    let targetCard = null;
    let targetName = "";

    if (mode === 'selected' && targetProducts.length > 0) {
      if (deletedCount >= targetProducts.length) {
        logToPopup("🎉 Todos os produtos selecionados foram processados!");
        break;
      }
      const currentTargetProduct = targetProducts[deletedCount];
      targetName = currentTargetProduct.name || currentTargetProduct.code || "";

      targetCard = cards.find(el => {
        const text = (el.textContent || '').toLowerCase();
        return text.includes(targetName.toLowerCase()) || 
               (currentTargetProduct.code && text.includes(currentTargetProduct.code.toLowerCase()));
      });

      if (!targetCard) {
        logToPopup(`🔍 Rolando para tentar localizar "${targetName}"...`);
        const container = cards[0]?.parentElement;
        if (container) container.scrollTop += 300;
        await sleep(1000);
        cards = getCatalogProductCards();
        targetCard = cards.find(el => {
          const text = (el.textContent || '').toLowerCase();
          return text.includes(targetName.toLowerCase());
        });
      }

      if (!targetCard) {
        logToPopup(`⏭️ Produto "${targetName}" não encontrado no catálogo. Pulando.`);
        deletedCount++;
        continue;
      }
    } else {
      // Modo 'all': sempre apaga o primeiro card da lista
      targetCard = cards[0];
      const rawText = targetCard.textContent.trim().split('\n')[0];
      targetName = rawText.length > 40 ? rawText.substring(0, 40) + '...' : rawText;
    }

    const currentTotal = mode === 'selected' ? targetProducts.length : (limit !== Infinity ? limit : deletedCount + cards.length);
    logToPopup(`-----------------------------------------`);
    logToPopup(`[🗑️ Exclusão ${deletedCount + 1}] Selecionando: ${targetName}`);
    sendProgress(deletedCount + 1, currentTotal, `Apagando: ${targetName}`);

    try {
      // 2. Abrir o item clicando nele com simulação real
      const opened = await openCatalogProductCard(targetCard);
      if (!opened) {
        throw new Error("Não foi possível abrir os detalhes do produto ao clicar no card.");
      }

      if (!isDeleteRunning) break;

      // 3. Se ainda não estiver em 'Editar item', clica em 'Editar'
      scrollDrawerToBottom();
      await sleep(400);

      let deleteBtn = findDeleteItemButton();
      if (!deleteBtn) {
        const editClicked = await clickEditButton();
        if (!editClicked) {
          throw new Error("Botão 'Editar' não abriu a tela de edição a tempo.");
        }
      }

      if (!isDeleteRunning) break;

      // 4. Clicar em "Apagar item" com retentativa até abrir o modal de confirmação
      let modalOpened = false;
      for (let attempt = 0; attempt < 4; attempt++) {
        logToPopup(`🗑️ Clicando em 'Apagar item' (tentativa ${attempt + 1}/4)...`);
        await clickDeleteItemButton();

        // Aguarda até 1.5s verificando se o popup de confirmação abriu
        for (let w = 0; w < 6; w++) {
          await sleep(250);
          if (findConfirmDeleteOkButton()) {
            modalOpened = true;
            break;
          }
        }
        if (modalOpened) break;
      }

      if (!modalOpened) {
        throw new Error("Modal de confirmação não abriu após clicar em 'Apagar item'.");
      }

      if (!isDeleteRunning) break;

      // 5. Confirmar com "OK" no modal
      const confirmed = await confirmDeleteOkModal();
      if (!confirmed) {
        throw new Error("Não foi possível confirmar a exclusão no modal de confirmação.");
      }

      // 6. Aguarda WhatsApp atualizar e remover o item
      await sleep(2000);

      // Se a tela ainda estiver com gaveta aberta, clica em voltar
      const backBtn = document.querySelector('[data-testid="back"], header button, div[role="button"][aria-label="Voltar"]');
      if (document.querySelector('[data-testid="product-edit-drawer-name-input"]') && backBtn) {
        simulateRealClick(backBtn);
        await sleep(1000);
      }

      deletedCount++;
      logToPopup(`🎉 [${deletedCount}] "${targetName}" apagado com sucesso!`);
      sendProgress(deletedCount, currentTotal, `Apagados: ${deletedCount}`);

      // Intervalo de segurança antes do próximo item
      await sleep(1200);

    } catch (err) {
      logToPopup(`❌ Erro no item "${targetName}": ${err.message}`);
      
      const cancelBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Cancelar');
      if (cancelBtn) simulateRealClick(cancelBtn);
      await sleep(1000);

      isDeleteRunning = false;
      chrome.runtime.sendMessage({ action: "DELETE_ERROR", error: err.message });
      return;
    }
  }

  isDeleteRunning = false;
  logToPopup(`-----------------------------------------`);
  logToPopup(`🏁 Exclusão finalizada! Total de produtos apagados: ${deletedCount}`);
  chrome.runtime.sendMessage({ action: "DELETE_COMPLETE", totalDeleted: deletedCount });
}

// Ouvir mensagens enviadas do Popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "START_IMPORT") {
    if (isImportRunning || isDeleteRunning) {
      logToPopup("⚠️ Uma operação já está em andamento.");
      sendResponse({ status: "ALREADY_RUNNING" });
      return;
    }
    if (message.mode === 'facebook') {
      isImportRunning = true;
      runFacebookImport(message.products, 0, message.options);
    } else {
      runImport(message.products, message.options);
    }
    sendResponse({ status: "STARTED" });
  } else if (message.action === "STOP_IMPORT") {
    isImportRunning = false;
    chrome.storage.local.set({ importActive: false });
    sendResponse({ status: "STOPPED" });
  } else if (message.action === "START_DELETE") {
    if (isImportRunning || isDeleteRunning) {
      logToPopup("⚠️ Uma operação já está em andamento.");
      sendResponse({ status: "ALREADY_RUNNING" });
      return;
    }
    runDeleteCatalog(message.options);
    sendResponse({ status: "STARTED" });
  } else if (message.action === "STOP_DELETE") {
    isDeleteRunning = false;
    logToPopup("⏹️ Exclusão interrompida pelo usuário.");
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
  checkAndResumeFacebookImport();
} else {
  window.addEventListener('DOMContentLoaded', () => {
    injectSidebar();
    checkAndResumeFacebookImport();
  });
}
// Polling de segurança para garantir a injeção caso o DOM mude inicialmente
setTimeout(() => {
  injectSidebar();
  checkAndResumeFacebookImport();
}, 3000);
