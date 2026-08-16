import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { cities } from '../src/citiesData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const credentialsPath = path.join(__dirname, '../credentials.json');

const SITE_URL = "https://snackstorebh.com.br";

const manualSlugs = [
  'loja-de-perfumes-importados-bh',
  'miniaturas-de-perfumes-25ml',
  'perfumes-arabes-importados',
  'perfumes-masculinos-amadeirados-marcantes',
  'perfumes-femininos-doces-e-gourmands'
];

const categories = [
  'mini-perfumes-importados',
  'mini-perfumes-femininos',
  'mini-perfumes-masculinos',
  'mini-perfumes-unissex',
  'brand-collection',
  'arabic-collection',
  'mini-perfumes-para-presente',
  'mini-perfumes-em-bh'
];

const productSlugs = [
  'lattafa-asad-25ml',
  'lattafa-yara-25ml',
  'lattafa-yara-tous-laranja-25ml',
  'lattafa-yara-moi-branco-25ml',
  'lattafa-khamrah-25ml',
  'lattafa-fakhar-rose-25ml',
  'lattafa-fakhar-black-25ml',
  'lattafa-fakhar-gold-25ml',
  'lattafa-amethyst-25ml',
  'lattafa-oud-for-glory-25ml',
  'lattafa-sublime-25ml',
  'lattafa-honor-25ml',
  'lattafa-emeer-25ml',
  'lattafa-emaan-25ml',
  'lattafa-musamam-white-25ml',
  'lattafa-spectre-ghost-25ml',
  'lattafa-amber-royal-25ml',
  'lattafa-amber-rouge-25ml',
  'armaf-club-de-nuit-intense-25ml',
  'afnan-9pm-25ml',
  'lattafa-nebras-25ml',
  'lattafa-yara-candy-25ml',
  'lattafa-sakeena-25ml'
];

const urls = [
  SITE_URL,
  ...categories.map(slug => `${SITE_URL}/${slug}`),
  ...manualSlugs.map(slug => `${SITE_URL}/${slug}`),
  ...cities.filter(c => c.slug !== 'belo-horizonte').flatMap(city => [
    `${SITE_URL}/miniaturas-de-perfumes-importados-em-${city.slug}-${city.uf.toLowerCase()}`,
    `${SITE_URL}/perfumes-arabes-importados-em-${city.slug}-${city.uf.toLowerCase()}`
  ]),
  ...productSlugs.map(slug => `${SITE_URL}/produto/${slug}`)
];

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
  console.log('Autenticado com sucesso! Enviando URLs para a Google Indexing API...');

  const targetUrls = urls.slice(0, 180); 

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
        console.log(`[${i + 1}/${targetUrls.length}] Enviado Google: ${url}`);
      } else {
        console.error(`❌ Erro ao enviar ${url}:`, data.error ? data.error.message : response.statusText);
      }
    } catch (e) {
      console.error(`❌ Falha de rede para ${url}:`, e.message);
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('Envio para o Google finalizado!');
}

submitToGoogle().catch(err => {
  console.error('Erro crítico no Google Indexing:', err);
});
