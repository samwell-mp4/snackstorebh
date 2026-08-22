import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { perfumes } from '../src/perfumesData.js';
import { seoPages } from '../src/seoPagesData.js';
import { blogPosts } from '../src/blogData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const credentialsPath = path.join(__dirname, '../credentials.json');
const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
const logPath = path.join(__dirname, 'submitted-urls.json');

const SITE_URL = "https://snackstorebh.com.br";

const categories = [
  'mini-perfumes-25ml',
  'perfumes-femininos',
  'perfumes-masculinos',
  'perfumes-arabes',
  'brand-collection',
  'mini-perfumes-unissex',
  'mini-perfumes-para-presente',
  'mini-perfumes-em-bh'
];

const otherStaticPages = [
  'cidades',
  'politica-de-privacidade',
  'trocas-e-devolucoes',
  'termos-de-servico',
  'perguntas-frequentes',
  'brand-collection/catalogo',
  'brand-collection/equivalencias',
  'atacado-revenda-perfumes',
  'blog/perfumes'
];

// Fallback lists if sitemap.xml is not present
const prioritySeoPages = seoPages.filter(p => !p.slug.includes('-em-'));
const citySeoPages = seoPages.filter(p => p.slug.includes('-em-'));

const fallbackUrls = [
  `${SITE_URL}/`,
  ...categories.map(slug => `${SITE_URL}/${slug}/`),
  ...otherStaticPages.map(slug => `${SITE_URL}/${slug}/`),
  ...prioritySeoPages.map(p => `${SITE_URL}/${p.slug}/`),
  ...perfumes.map(p => `${SITE_URL}/produto/${p.slug}/`),
  ...blogPosts.map(post => `${SITE_URL}/blog/${post.slug}/`),
  ...citySeoPages.map(p => `${SITE_URL}/${p.slug}/`)
];

// Priority helper to sort sitemap URLs
const getUrlPriority = (url) => {
  if (url === SITE_URL || url === `${SITE_URL}/`) return 1;
  
  const isCategory = categories.some(cat => url.endsWith(`/${cat}`) || url.endsWith(`/${cat}/`));
  if (isCategory) return 2;
  
  const isStatic = otherStaticPages.some(page => url.endsWith(`/${page}`) || url.endsWith(`/${page}/`));
  if (isStatic) return 3;
  
  const isCity = url.includes('-em-');
  const isProduct = url.includes('/produto/');
  
  if (!isCity && !isProduct) return 4; // Custom Brand Collection / SEO pages
  if (isProduct) return 5; // Direct products
  return 6; // City landing pages (lowest priority)
};

// 1. Load URLs from sitemap.xml or use fallback
let urls = [];
if (fs.existsSync(sitemapPath)) {
  try {
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    const urlRegex = /<loc>(https?:\/\/[^\s<]+)<\/loc>/g;
    let match;
    while ((match = urlRegex.exec(sitemapContent)) !== null) {
      urls.push(match[1]);
    }
    console.log(`Carregadas ${urls.length} URLs do sitemap.xml.`);
  } catch (err) {
    console.error('Erro ao ler sitemap.xml, usando lista fallback:', err.message);
    urls = fallbackUrls;
  }
} else {
  console.log('Sitemap.xml não encontrado. Usando lista fallback.');
  urls = fallbackUrls;
}

// 2. Sort URLs by priority
urls.sort((a, b) => getUrlPriority(a) - getUrlPriority(b));

// 3. Load previously submitted URLs log
let submittedUrls = [];
if (fs.existsSync(logPath)) {
  try {
    submittedUrls = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    console.log(`Carregadas ${submittedUrls.length} URLs já submetidas do log.`);
  } catch (err) {
    console.error('Erro ao ler submitted-urls.json, iniciando novo log:', err.message);
  }
}

// 4. Filter out already submitted URLs
let unsubmittedUrls = urls.filter(url => !submittedUrls.includes(url));
console.log(`Progresso de Indexação: ${submittedUrls.length}/${urls.length} submetidas. Restantes: ${unsubmittedUrls.length}`);

if (unsubmittedUrls.length === 0) {
  console.log('🎉 Todas as URLs do sitemap já foram indexadas! Reiniciando o ciclo de log para reindexação.');
  submittedUrls = [];
  unsubmittedUrls = urls;
  fs.writeFileSync(logPath, JSON.stringify(submittedUrls, null, 2), 'utf8');
}

// 5. Select the next batch (quota limit is 200, using 180 as a safe batch size)
const targetUrls = unsubmittedUrls.slice(0, 180);
console.log(`Lote selecionado para envio hoje: ${targetUrls.length} URLs.`);

async function getAccessToken(credentials) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Claim = Buffer.from(JSON.stringify(claim)).toString('base64url');
  const signatureInput = `${base64Header}.${base64Claim}`;

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signatureInput);
  const signature = sign.sign(credentials.private_key, 'base64url');

  const jwt = `${signatureInput}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(`Erro OAuth Google: ${data.error_description || data.error}`);
  }
  return data.access_token;
}

async function submitToGoogle() {
  if (targetUrls.length === 0) {
    console.log('Nenhuma URL para enviar hoje.');
    return;
  }

  if (!fs.existsSync(credentialsPath)) {
    console.warn('\n⚠️ [Aviso Google Indexing API] Arquivo credentials.json não encontrado na raiz do projeto.');
    console.log('Para ativar a indexação instantânea do Google:');
    console.log('1. Crie uma conta de serviço no Google Cloud Console.');
    console.log('2. Baixe a chave JSON e salve como "credentials.json" na pasta raiz do seu projeto.');
    console.log('3. Adicione o e-mail da conta de serviço como PROPRIETÁRIO no Google Search Console.');
    console.log('4. Rode "npm run google-index" para enviar as URLs.\n');
    return;
  }

  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  console.log('Autenticando com o Google API...');
  const accessToken = await getAccessToken(credentials);
  console.log('Autenticado com sucesso! Enviando lote de URLs para a Google Indexing API...');

  let successCount = 0;

  for (let i = 0; i < targetUrls.length; i++) {
    const url = targetUrls[i];
    try {
      const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          url: url,
          type: 'URL_UPDATED'
        })
      });
      const data = await response.json();
      if (response.status === 200) {
        successCount++;
        console.log(`[${i + 1}/${targetUrls.length}] Enviado Google: ${url}`);
        
        // Log URL as submitted immediately to prevent loss if script is aborted
        submittedUrls.push(url);
        fs.writeFileSync(logPath, JSON.stringify(submittedUrls, null, 2), 'utf8');
      } else {
        console.error(`❌ Erro ao enviar ${url}:`, data.error ? data.error.message : response.statusText);
      }
    } catch (e) {
      console.error(`❌ Falha de rede para ${url}:`, e.message);
    }
    await new Promise(resolve => setTimeout(resolve, 100)); // Google rate limit pause
  }

  console.log(`\nEnvio finalizado! ${successCount} URLs enviadas com sucesso nesta rodada.`);
  console.log(`Progresso acumulado de indexação: ${submittedUrls.length}/${urls.length} URLs registradas.`);
}

submitToGoogle().catch(err => {
  console.error('Erro crítico no Google Indexing:', err);
});
