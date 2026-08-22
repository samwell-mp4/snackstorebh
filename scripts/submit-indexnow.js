import { perfumes } from '../src/perfumesData.js';
import { seoPages } from '../src/seoPagesData.js';
import { blogPosts } from '../src/blogData.js';

const SITE_URL = "https://snackstorebh.com.br";
const API_KEY = "snackstorebhkey2026";
const KEY_LOCATION = `${SITE_URL}/${API_KEY}.txt`;

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

const urls = [
  `${SITE_URL}/`,
  ...categories.map(slug => `${SITE_URL}/${slug}/`),
  ...otherStaticPages.map(slug => `${SITE_URL}/${slug}/`),
  ...seoPages.map(page => `${SITE_URL}/${page.slug}/`),
  ...perfumes.map(p => `${SITE_URL}/produto/${p.slug}/`),
  ...blogPosts.map(post => `${SITE_URL}/blog/${post.slug}/`)
];

async function submitToIndexNow() {
  console.log(`Enviando ${urls.length} URLs para o IndexNow...`);
  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({
      host: new URL(SITE_URL).host,
      key: API_KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls
    })
  });

  const text = await response.text();
  console.log("Status IndexNow:", response.status);
  console.log("Resposta IndexNow:", text);

  if (![200, 202].includes(response.status)) {
    throw new Error(`IndexNow falhou: HTTP ${response.status}`);
  }
  console.log("IndexNow finalizado com sucesso!");
}

submitToIndexNow().catch((error) => {
  console.error("Erro no IndexNow:", error);
  process.exit(1);
});
