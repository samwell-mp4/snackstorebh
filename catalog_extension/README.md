# Snack Store - Importador de Catálogo para WhatsApp Web

Esta é uma extensão para Google Chrome projetada para automatizar o preenchimento e upload de produtos da Snack Store diretamente para a interface de Catálogo do WhatsApp Web.

## 🚀 Como Instalar no Google Chrome

1. Abra o Google Chrome.
2. Acesse a página de extensões digitando `chrome://extensions/` na barra de endereço.
3. No canto superior direito, ative a chave **"Modo do desenvolvedor"**.
4. No canto superior esquerdo, clique no botão **"Carregar sem compactação"** (Load unpacked).
5. Selecione a pasta deste projeto localizada em:
   `c:\Users\Usuario\Snack Store\catalog_extension`
6. A extensão "Snack Store - Importador de Catálogo" aparecerá na sua lista de extensões ativas.

---

## 🛠️ Como Utilizar a Extensão

1. Acesse o **WhatsApp Web** (`https://web.whatsapp.com/`) no seu navegador e certifique-se de estar conectado com sua conta WhatsApp Business.
2. Vá nas configurações de perfil comercial e abra o **Gerenciador de Catálogo** (onde você visualiza a lista de produtos cadastrados e o botão `+ Adicionar item`).
3. Clique no ícone de quebra-cabeça do Chrome (Extensões) e clique em **"Snack Store - Importador de Catálogo"** para abrir o popup.
4. No popup:
   - **Busque e selecione** os produtos que deseja importar utilizando a caixa de busca ou as caixas de marcação (ou use "Marcar Todos" para importar o catálogo completo).
   - Configure as opções na parte inferior (se deseja incluir o código do produto e o link oficial do e-commerce nos campos correspondentes).
   - Clique no botão verde **"Iniciar Importação"**.
5. O painel de progresso se abrirá e você poderá ver a extensão:
   - Clicar automaticamente em *Adicionar item*.
   - Baixar a imagem original do e-commerce Snack Store e fazer o upload direto no formulário.
   - Preencher o Nome, Preço, Descrição, Link e Código do Produto.
   - Salvar o item e passar automaticamente para o próximo da lista!
6. Você pode pausar ou parar o processo a qualquer momento clicando em **"Parar Importação"**.

---

## 💡 Dicas de Sucesso
* **Não feche o popup ou a aba** do WhatsApp Web enquanto a importação estiver em andamento.
* Como o WhatsApp Web faz validações internas de formulário e rede para processar o upload da imagem, configuramos intervalos de segurança de 1 a 3 segundos entre as etapas. Deixe a automação rodar sozinha para evitar conflitos de clique.
