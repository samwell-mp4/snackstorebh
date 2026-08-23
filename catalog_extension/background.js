// Background script to fetch images and bypass CORS in Manifest V3
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "FETCH_IMAGE") {
    fetch(request.url)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }
        const contentType = response.headers.get("content-type") || "image/webp";
        const arrayBuffer = await response.arrayBuffer();
        
        // Conversão de ArrayBuffer para Base64 de forma segura contra estouro de pilha
        const bytes = new Uint8Array(arrayBuffer);
        let binary = "";
        const chunkSize = 8192;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.subarray(i, i + chunkSize);
          binary += String.fromCharCode.apply(null, chunk);
        }
        const base64 = btoa(binary);
        
        sendResponse({ success: true, base64, contentType });
      })
      .catch((err) => {
        console.error("Falha no download da imagem:", err);
        sendResponse({ success: false, error: err.message });
      });
    return true; // Mantém o canal de mensagens aberto para resposta assíncrona
  }
});
