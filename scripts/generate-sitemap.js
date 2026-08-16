import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cities = [
  { name: 'São Paulo', uf: 'SP', slug: 'sao-paulo' },
  { name: 'Guarulhos', uf: 'SP', slug: 'guarulhos' },
  { name: 'Campinas', uf: 'SP', slug: 'campinas' },
  { name: 'São Bernardo do Campo', uf: 'SP', slug: 'sao-bernardo-do-campo' },
  { name: 'Santo André', uf: 'SP', slug: 'santo-andre' },
  { name: 'Osasco', uf: 'SP', slug: 'osasco' },
  { name: 'São José dos Campos', uf: 'SP', slug: 'sao-jose-dos-campos' },
  { name: 'Ribeirão Preto', uf: 'SP', slug: 'ribeirao-preto' },
  { name: 'Sorocaba', uf: 'SP', slug: 'sorocaba' },
  { name: 'Mauá', uf: 'SP', slug: 'maua' },
  { name: 'Santos', uf: 'SP', slug: 'santos' },
  { name: 'Diadema', uf: 'SP', slug: 'diadema' },
  { name: 'Jundiaí', uf: 'SP', slug: 'jundiai' },
  { name: 'Mogi das Cruzes', uf: 'SP', slug: 'mogi-das-cruzes' },
  { name: 'Piracicaba', uf: 'SP', slug: 'piracicaba' },
  { name: 'Carapicuíba', uf: 'SP', slug: 'carapicuiba' },
  { name: 'Bauru', uf: 'SP', slug: 'bauru' },
  { name: 'Itaquaquecetuba', uf: 'SP', slug: 'itaquaquecetuba' },
  { name: 'São Vicente', uf: 'SP', slug: 'sao-vicente' },
  { name: 'Franca', uf: 'SP', slug: 'franca' },
  { name: 'Taubaté', uf: 'SP', slug: 'taubate' },
  { name: 'Limeira', uf: 'SP', slug: 'limeira' },
  { name: 'Suzano', uf: 'SP', slug: 'suzano' },
  { name: 'São Carlos', uf: 'SP', slug: 'sao-carlos' },
  { name: 'Indaiatuba', uf: 'SP', slug: 'indaiatuba' },
  { name: 'Cotia', uf: 'SP', slug: 'cotia' },
  { name: 'Americana', uf: 'SP', slug: 'americana' },
  { name: 'Barueri', uf: 'SP', slug: 'barueri' },
  { name: 'Marília', uf: 'SP', slug: 'marilia' },
  { name: 'Presidente Prudente', uf: 'SP', slug: 'presidente-prudente' },
  { name: 'Araçatuba', uf: 'SP', slug: 'aracatuba' },
  { name: 'Araraquara', uf: 'SP', slug: 'araraquara' },
  { name: 'Belo Horizonte', uf: 'MG', slug: 'belo-horizonte' },
  { name: 'Uberlândia', uf: 'MG', slug: 'uberlandia' },
  { name: 'Contagem', uf: 'MG', slug: 'contagem' },
  { name: 'Juiz de Fora', uf: 'MG', slug: 'juiz-de-fora' },
  { name: 'Betim', uf: 'MG', slug: 'betim' },
  { name: 'Montes Claros', uf: 'MG', slug: 'montes-claros' },
  { name: 'Uberaba', uf: 'MG', slug: 'uberaba' },
  { name: 'Governador Valadares', uf: 'MG', slug: 'governador-valadares' },
  { name: 'Ipatinga', uf: 'MG', slug: 'ipatinga' },
  { name: 'Sete Lagoas', uf: 'MG', slug: 'sete-lagoas' },
  { name: 'Divinópolis', uf: 'MG', slug: 'divinopolis' },
  { name: 'Ribeirão das Neves', uf: 'MG', slug: 'ribeirao-das-neves' },
  { name: 'Santa Luzia', uf: 'MG', slug: 'santa-luzia' },
  { name: 'Pouso Alegre', uf: 'MG', slug: 'pouso-alegre' },
  { name: 'Poços de Caldas', uf: 'MG', slug: 'pocos-de-caldas' },
  { name: 'Rio de Janeiro', uf: 'RJ', slug: 'rio-de-janeiro' },
  { name: 'São Gonçalo', uf: 'RJ', slug: 'sao-goncalo' },
  { name: 'Duque de Caxias', uf: 'RJ', slug: 'duque-de-caxias' },
  { name: 'Nova Iguaçu', uf: 'RJ', slug: 'nova-iguacu' },
  { name: 'Niterói', uf: 'RJ', slug: 'niteroi' },
  { name: 'Belford Roxo', uf: 'RJ', slug: 'belford-roxo' },
  { name: 'Campos dos Goytacazes', uf: 'RJ', slug: 'campos-dos-goytacazes' },
  { name: 'São João de Meriti', uf: 'RJ', slug: 'sao-joao-de-meriti' },
  { name: 'Petrópolis', uf: 'RJ', slug: 'petropolis' },
  { name: 'Volta Redonda', uf: 'RJ', slug: 'volta-redonda' },
  { name: 'Macaé', uf: 'RJ', slug: 'macae' },
  { name: 'Cabo Frio', uf: 'RJ', slug: 'cabo-frio' },
  { name: 'Curitiba', uf: 'PR', slug: 'curitiba' },
  { name: 'Londrina', uf: 'PR', slug: 'londrina' },
  { name: 'Maringá', uf: 'PR', slug: 'maringa' },
  { name: 'Ponta Grossa', uf: 'PR', slug: 'ponta-grossa' },
  { name: 'Cascavel', uf: 'PR', slug: 'cascavel' },
  { name: 'São José dos Pinhais', uf: 'PR', slug: 'sao-jose-dos-pinhais' },
  { name: 'Foz do Iguaçu', uf: 'PR', slug: 'foz-do-iguacu' },
  { name: 'Porto Alegre', uf: 'RS', slug: 'porto-alegre' },
  { name: 'Caxias do Sul', uf: 'RS', slug: 'caxias-do-sul' },
  { name: 'Canoas', uf: 'RS', slug: 'canoas' },
  { name: 'Pelotas', uf: 'RS', slug: 'pelotas' },
  { name: 'Santa Maria', uf: 'RS', slug: 'santa-maria' },
  { name: 'Gravataí', uf: 'RS', slug: 'gravatai' },
  { name: 'Joinville', uf: 'SC', slug: 'joinville' },
  { name: 'Florianópolis', uf: 'SC', slug: 'florianopolis' },
  { name: 'Blumenau', uf: 'SC', slug: 'blumenau' },
  { name: 'São José', uf: 'SC', slug: 'sao-jose' },
  { name: 'Chapecó', uf: 'SC', slug: 'chapeco' },
  { name: 'Itajaí', uf: 'SC', slug: 'itajai' },
  { name: 'Serra', uf: 'ES', slug: 'serra' },
  { name: 'Vila Velha', uf: 'ES', slug: 'vila-velha' },
  { name: 'Cariacica', uf: 'ES', slug: 'cariacica' },
  { name: 'Vitória', uf: 'ES', slug: 'vitoria' },
  { name: 'Brasília', uf: 'DF', slug: 'brasilia' },
  { name: 'Goiânia', uf: 'GO', slug: 'goiania' },
  { name: 'Aparecida de Goiânia', uf: 'GO', slug: 'aparecida-de-goiania' },
  { name: 'Anápolis', uf: 'GO', slug: 'anapolis' },
  { name: 'Campo Grande', uf: 'MS', slug: 'campo-grande' },
  { name: 'Cuiabá', uf: 'MT', slug: 'cuiaba' },
  { name: 'Salvador', uf: 'BA', slug: 'salvador' },
  { name: 'Feira de Santana', uf: 'BA', slug: 'feira-de-sentana' },
  { name: 'Vitória da Conquista', uf: 'BA', slug: 'vitoria-da-conquista' },
  { name: 'Fortaleza', uf: 'CE', slug: 'fortaleza' },
  { name: 'Recife', uf: 'PE', slug: 'recife' },
  { name: 'Jaboatão dos Guararapes', uf: 'PE', slug: 'jaboatao-dos-guararapes' },
  { name: 'Olinda', uf: 'PE', slug: 'olinda' },
  { name: 'Caruaru', uf: 'PE', slug: 'caruaru' },
  { name: 'Natal', uf: 'RN', slug: 'natal' },
  { name: 'João Pessoa', uf: 'PB', slug: 'joao-pessoa' },
  { name: 'Maceió', uf: 'AL', slug: 'maceio' },
  { name: 'Aracaju', uf: 'SE', slug: 'aracaju' },
  { name: 'Teresina', uf: 'PI', slug: 'teresina' },
  { name: 'São Luís', uf: 'MA', slug: 'sao-luis' },
  { name: 'Manaus', uf: 'AM', slug: 'manaus' },
  { name: 'Belém', uf: 'PA', slug: 'belem' },
  { name: 'Ananindeua', uf: 'PA', slug: 'ananindeua' },
  { name: 'Porto Velho', uf: 'RO', slug: 'porto-velho' },
  { name: 'Macapá', uf: 'AP', slug: 'macapa' },
  { name: 'Rio Branco', uf: 'AC', slug: 'rio-branco' },
  { name: 'Boa Vista', uf: 'RR', slug: 'boa-vista' },
  { name: 'Palmas', uf: 'TO', slug: 'palmas' }
];

const manualSlugs = [
  'loja-de-perfumes-importados-bh',
  'miniaturas-de-perfumes-25ml',
  'perfumes-arabes-importados',
  'perfumes-masculinos-amadeirados-marcantes',
  'perfumes-femininos-doces-e-gourmands',
  'cidades',
  'politica-de-privacidade',
  'trocas-e-devolucoes',
  'termos-de-servico',
  'perguntas-frequentes'
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

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://snackstorebh.com.br/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
`;

categories.forEach(slug => {
  xml += `  <url>
    <loc>https://snackstorebh.com.br/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
});

manualSlugs.forEach(slug => {
  xml += `  <url>
    <loc>https://snackstorebh.com.br/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>\n`;
});

cities.forEach(city => {
  if (city.slug === 'belo-horizonte') return;
  const slug1 = `miniaturas-de-perfumes-importados-em-${city.slug}-${city.uf.toLowerCase()}`;
  const slug2 = `perfumes-arabes-importados-em-${city.slug}-${city.uf.toLowerCase()}`;
  xml += `  <url>
    <loc>https://snackstorebh.com.br/${slug1}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n
  <url>
    <loc>https://snackstorebh.com.br/${slug2}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
});

productSlugs.forEach(slug => {
  xml += `  <url>
    <loc>https://snackstorebh.com.br/produto/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
});

xml += `</urlset>`;

fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), xml, 'utf8');
console.log('Sitemap generated successfully with ' + (1 + categories.length + manualSlugs.length + (cities.length - 1) * 2 + productSlugs.length) + ' URLs!');
