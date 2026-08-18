import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const credentialsPath = path.join(__dirname, '../credentials.json');

const SITE_URL = "https://snackstorebh.com.br";

const newSlugs = [
  'onde-comprar-miniaturas-de-perfumes-importados-originais',
  'onde-comprar-miniatura-de-perfume-importado-original',
  'onde-comprar-miniaturas-de-perfumes-importados-femininos',
  'onde-comprar-miniaturas-de-perfumes-importados',
  'como-comprar-miniaturas-de-perfumes-importados',
  'onde-comprar-miniaturas-de-perfumes',
  'onde-comprar-miniatura-de-perfumes-importados',
  'onde-comprar-miniaturas-de-perfumes-em-paris',
  'onde-comprar-miniaturas-de-perfumes-em-portugal',
  'onde-comprar-miniaturas-de-perfume-importado-no-paraguai'
];

const targetUrls = newSlugs.map(slug => `${SITE_URL}/${slug}`);

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
    console.warn('\n⚠️ [Aviso Google Indexing API] Arquivo credentials.json não encontrado.');
    return;
  }

  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  console.log('Autenticando com o Google API...');
  const accessToken = await getAccessToken(credentials);
  console.log('Autenticado com sucesso! Enviando apenas as novas URLs para a Google Indexing API...');

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
    await new Promise(resolve => setTimeout(resolve, 100)); // Rate limit pause
  }

  console.log('Envio para o Google finalizado!');
}

submitToGoogle().catch(err => {
  console.error('Erro crítico no Google Indexing:', err);
});
