import { cities } from '../src/citiesData.js';

const SITE_URL = "https://snackstorebh.com.br";
const API_KEY = "snackstorebhkey2026";
const KEY_LOCATION = `${SITE_URL}/${API_KEY}.txt`;

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
