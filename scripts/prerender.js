import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { perfumes } from '../src/perfumesData.js';
import { seoPages } from '../src/seoPagesData.js';
import { cities } from '../src/citiesData.js';
import { blogPosts } from '../src/blogData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = "https://snackstorebh.com.br";
const DIST_DIR = path.join(__dirname, '../dist');

// Read the index.html template from dist folder
const templatePath = path.join(DIST_DIR, 'index.html');
if (!fs.existsSync(templatePath)) {
  console.log("Error: dist/index.html template not found. Please run vite build first.");
  process.exit(1);
}
const templateHTML = fs.readFileSync(templatePath, 'utf8');

// Helper to escape HTML values
const escapeHTML = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Helper to inject meta tags into the template
const injectMeta = (html, meta) => {
  let result = html;
  
  // Replace Title tag
  result = result.replace(/<title>.*?<\/title>/i, `<title>${escapeHTML(meta.title)}</title>`);
  
  // Replace Meta Description tag
  if (result.match(/<meta\s+name="description"\s+content=".*?"\s*\/?>/i)) {
    result = result.replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/i, `<meta name="description" content="${escapeHTML(meta.description)}" />`);
  } else {
    result = result.replace('</head>', `<meta name="description" content="${escapeHTML(meta.description)}" />\n</head>`);
  }

  // Replace Canonical Link
  const canonicalUrl = meta.url.startsWith('http') ? meta.url : `${SITE_URL}${meta.url}`;
  if (result.match(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i)) {
    result = result.replace(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
  } else {
    result = result.replace('</head>', `<link rel="canonical" href="${canonicalUrl}" />\n</head>`);
  }

  // Replace Open Graph Tags
  result = result.replace(/<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i, `<meta property="og:title" content="${escapeHTML(meta.title)}" />`);
  result = result.replace(/<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i, `<meta property="og:description" content="${escapeHTML(meta.description)}" />`);
  result = result.replace(/<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i, `<meta property="og:url" content="${canonicalUrl}" />`);

  // Replace Twitter Card Tags
  result = result.replace(/<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:title" content="${escapeHTML(meta.title)}" />`);
  result = result.replace(/<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:description" content="${escapeHTML(meta.description)}" />`);

  // Replace existing JSON-LD script if found, or inject it
  const jsonLdScript = `<script type="application/ld+json">\n${JSON.stringify(meta.schema, null, 2)}\n</script>`;
  
  // Remove preexisting fallback json-ld schema
  result = result.replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/i, jsonLdScript);

  return result;
};

// Helper to write static index.html file for a route
const writePrerenderedFile = (routePath, meta) => {
  // Normalize the route path to avoid duplicate slashes
  const cleanPath = routePath.replace(/^\/|\/$/g, '');
  const dirPath = path.join(DIST_DIR, cleanPath);
  
  if (cleanPath !== '') {
    fs.mkdirSync(dirPath, { recursive: true });
    const outputFilePath = path.join(dirPath, 'index.html');
    const finalHTML = injectMeta(templateHTML, meta);
    fs.writeFileSync(outputFilePath, finalHTML, 'utf8');
  } else {
    // Home page: overwrite main index.html
    const finalHTML = injectMeta(templateHTML, meta);
    fs.writeFileSync(path.join(DIST_DIR, 'index.html'), finalHTML, 'utf8');
  }
};

// 1. Generate Metadata for Home Page
const homeMeta = {
  title: "Mini Perfumes Importados 25ml | Miniaturas de Perfumes - Snack Store BH",
  description: "Compre mini perfumes importados de 25ml, femininos e masculinos, com diversas fragrâncias. Miniaturas de perfumes em BH e envio para todo o Brasil.",
  url: "/",
  schema: {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "Snack Store – Miniaturas 25 ml",
    "description": "Miniaturas de perfumes importados 25 ml, preço fixo R$ 79,90, entrega rápida em Belo Horizonte.",
    "url": SITE_URL,
    "logo": `${SITE_URL}/favicon.jpg`,
    "image": `${SITE_URL}/favicon.jpg`,
    "sameAs": [
      "https://www.instagram.com/snackstorebh",
      "https://wa.me/5531975650503"
    ]
  }
};
writePrerenderedFile('/', homeMeta);
console.log("Prerendered Home Page");

// 2. Generate Categories Pages Metadata
const categories = [
  { slug: 'mini-perfumes-25ml', title: 'Mini Perfumes Importados de 25ml - Miniaturas Original | Snack Store', desc: 'Compre mini perfumes importados 25ml originais e árabes. Variedade de fragrâncias de luxo no tamanho compacto ideal.' },
  { slug: 'brand-collection', title: 'Miniaturas Brand Collection 25ml Original | Snack Store', desc: 'Descubra a coleção de perfumes importados Brand Collection em 25ml. Alta fixação, preço justo e entrega expressa.' },
  { slug: 'perfumes-arabes', title: 'Perfumes Árabes Importados em Miniaturas | Lattafa, Armaf, Afnan', desc: 'Compre os melhores perfumes árabes em miniatura 25ml com fixação nuclear. Compre Lattafa Yara, Asad e mais.' },
  { slug: 'perfumes-femininos', title: 'Miniaturas de Perfumes Femininos Importados 25ml | Snack Store', desc: 'Encontre fragrâncias femininas importadas marcantes e delicadas em frascos de 25ml. O kit perfeito para você.' },
  { slug: 'perfumes-masculinos', title: 'Miniaturas de Perfumes Masculinos Importados 25ml | Snack Store', desc: 'Confira as melhores miniaturas de perfumes importados masculinos de 25ml. Amadeirados, frescos e marcantes.' }
];

categories.forEach(cat => {
  const meta = {
    title: cat.title,
    description: cat.desc,
    url: `/${cat.slug}/`,
    schema: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": cat.title,
      "description": cat.desc,
      "url": `${SITE_URL}/${cat.slug}/`
    }
  };
  writePrerenderedFile(`/${cat.slug}`, meta);
  console.log(`Prerendered Category Page: /${cat.slug}/`);
});

// 3. Static Pages Metadata
const staticPages = [
  { slug: 'cidades', title: 'Nossas Lojas e Cidades Atendidas | Snack Store BH', desc: 'Veja a Snack Store na sua região. Enviamos miniaturas de perfumes importados e perfumes árabes para mais de 100 cidades.' },
  { slug: 'politica-de-privacidade', title: 'Política de Privacidade | Snack Store BH', desc: 'Confira a nossa política de privacidade e saiba como protegemos seus dados pessoais na Snack Store.' },
  { slug: 'trocas-e-devolucoes', title: 'Política de Trocas e Devoluções | Snack Store BH', desc: 'Saiba como funciona a política de trocas e devoluções simplificada da Snack Store BH.' },
  { slug: 'termos-de-servico', title: 'Termos de Serviço | Snack Store BH', desc: 'Leia os termos de serviço aplicáveis ao navegar e comprar na loja Snack Store BH.' },
  { slug: 'perguntas-frequentes', title: 'Perguntas Frequentes (FAQ) | Snack Store BH', desc: 'Tire suas principais dúvidas sobre miniaturas de perfumes, fixação, entrega rápida em BH e prazos de postagem.' },
  
  // Novas Páginas de Rota da Planilha
  { slug: 'brand-collection/catalogo', title: 'Catálogo Brand Collection 25ml | Snack Store BH', desc: 'Confira o catálogo completo de perfumes Brand Collection em miniaturas de 25ml. Baixe o PDF oficial e veja as fragrâncias disponíveis.' },
  { slug: 'brand-collection/equivalencias', title: 'Tabela de Equivalências Brand Collection | Snack Store BH', desc: 'Veja a tabela de equivalências dos perfumes Brand Collection. Encontre qual número corresponde à sua fragrância importada favorita.' },
  { slug: 'atacado-revenda-perfumes', title: 'Distribuidora de Miniaturas de Perfumes no Atacado | Snack Store BH', desc: 'Seja um revendedor de mini perfumes importados de 25ml. Brand Collection e árabes no atacado com pedido mínimo baixo e margens de mais de 100% de lucro.' },
  { slug: 'blog/perfumes', title: 'Blog da Snack Store | Dicas e Guias de Perfumes Importados', desc: 'Fique por dentro das últimas tendências em perfumaria de luxo. Leia nossos guias sobre perfumes Brand Collection, árabes, dicas de fixação e mais.' }
];

staticPages.forEach(p => {
  const meta = {
    title: p.title,
    description: p.desc,
    url: `/${p.slug}/`,
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": p.title,
      "description": p.desc,
      "url": `${SITE_URL}/${p.slug}/`
    }
  };
  writePrerenderedFile(`/${p.slug}`, meta);
  console.log(`Prerendered Static Page: /${p.slug}/`);
});

// 4. Prerender SEO Pages (from seoPagesData)
seoPages.forEach(page => {
  const meta = {
    title: page.title,
    description: page.description,
    url: `/${page.slug}/`,
    schema: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": page.title,
      "description": page.description,
      "url": `${SITE_URL}/${page.slug}/`
    }
  };
  
  // Inject FAQ schema if exists
  if (page.faqs && page.faqs.length > 0) {
    meta.schema = [
      meta.schema,
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": page.faqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      }
    ];
  }
  
  writePrerenderedFile(`/${page.slug}`, meta);
});
console.log(`Prerendered ${seoPages.length} SEO Landing Pages.`);

// 5. Prerender Product Pages (from perfumesData)
perfumes.forEach(p => {
  const meta = {
    title: `${p.name} 25ml - Mini Perfume Importado | Snack Store`,
    description: `Compre o mini perfume ${p.name} de 25ml. Preço fixo de R$ 79,90, alta fixação e entrega expressa no mesmo dia em BH. Aproveite!`,
    url: `/produto/${p.slug}/`,
    schema: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": p.name,
      "image": `${SITE_URL}${p.image}`,
      "description": p.description,
      "sku": p.code,
      "brand": {
        "@type": "Brand",
        "name": p.brand || "Importado"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "bestRating": "5",
        "worstRating": "1",
        "reviewCount": "18"
      },
      "offers": {
        "@type": "Offer",
        "url": `${SITE_URL}/produto/${p.slug}/`,
        "priceCurrency": "BRL",
        "price": p.price || 79.90,
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition"
      }
    }
  };
  
  writePrerenderedFile(`/produto/${p.slug}`, meta);
});
console.log(`Prerendered ${perfumes.length} Product Pages.`);

// 6. Prerender Blog Articles
blogPosts.forEach(post => {
  const meta = {
    title: `${post.title} | Blog Snack Store`,
    description: post.description,
    url: `/blog/${post.slug}/`,
    schema: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.description,
      "datePublished": post.publishDate,
      "author": {
        "@type": "Person",
        "name": post.author
      }
    }
  };
  writePrerenderedFile(`/blog/${post.slug}`, meta);
});
console.log(`Prerendered ${blogPosts.length} Blog Articles.`);

console.log("All routes successfully prerendered as static HTML files in /dist!");
