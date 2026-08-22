import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { perfumes } from '../src/perfumesData.js';
import { seoPages } from '../src/seoPagesData.js';
import { blogPosts } from '../src/blogData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const productSlugs = perfumes.map(p => p.slug);
const blogSlugs = blogPosts.map(p => p.slug);

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
`;

categories.forEach(slug => {
  xml += `  <url>
    <loc>${SITE_URL}/${slug}/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
});

otherStaticPages.forEach(slug => {
  xml += `  <url>
    <loc>${SITE_URL}/${slug}/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
});

seoPages.forEach(page => {
  xml += `  <url>
    <loc>${SITE_URL}/${page.slug}/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>\n`;
});

productSlugs.forEach(slug => {
  xml += `  <url>
    <loc>${SITE_URL}/produto/${slug}/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
});

blogSlugs.forEach(slug => {
  xml += `  <url>
    <loc>${SITE_URL}/blog/${slug}/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
});

xml += `</urlset>`;

fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), xml, 'utf8');
const totalUrls = 1 + categories.length + otherStaticPages.length + seoPages.length + productSlugs.length + blogSlugs.length;
console.log('Sitemap generated successfully with ' + totalUrls + ' URLs!');
