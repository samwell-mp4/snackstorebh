import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, '../dist');
const SITEMAP_PATH = path.join(__dirname, '../public/sitemap.xml');

console.log("🔍 Iniciando SEO QA Automatizado...");

if (!fs.existsSync(SITEMAP_PATH)) {
  console.error("❌ Erro: sitemap.xml não encontrado em public/sitemap.xml. Por favor, gere o sitemap primeiro.");
  process.exit(1);
}

// 1. Extrair todas as URLs do sitemap.xml
const sitemapXml = fs.readFileSync(SITEMAP_PATH, 'utf8');
const urlRegex = /<loc>(https:\/\/snackstorebh\.com\.br\/[^<]*)<\/loc>/g;
const urls = [];
let match;
while ((match = urlRegex.exec(sitemapXml)) !== null) {
  urls.push(match[1]);
}

console.log(`📌 Encontradas ${urls.length} URLs no sitemap.xml.`);

let errorsCount = 0;
let warningsCount = 0;
const reports = [];

// Helper para rodar regex simples
const getTagContent = (regex, html) => {
  const m = regex.exec(html);
  return m ? m[1] : null;
};

// Helper para obter múltiplos matches
const getAllTagContents = (regex, html) => {
  const matches = [];
  let m;
  const rx = new RegExp(regex); // reset regex state
  while ((m = rx.exec(html)) !== null) {
    matches.push(m[1]);
  }
  return matches;
};

// 2. Validar cada URL prerenderizada
urls.forEach(url => {
  const relativePath = url.replace('https://snackstorebh.com.br', '');
  const cleanPath = relativePath.replace(/^\/|\/$/g, '');
  let filePath = path.join(DIST_DIR, cleanPath, 'index.html');
  if (cleanPath === '') {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const report = {
    url,
    path: relativePath,
    exists: false,
    errors: [],
    warnings: []
  };

  if (!fs.existsSync(filePath)) {
    report.errors.push(`Arquivo físico não encontrado em: ${filePath}`);
    errorsCount++;
    reports.push(report);
    return;
  }

  report.exists = true;
  const html = fs.readFileSync(filePath, 'utf8');

  // Title validation
  const title = getTagContent(/<title>(.*?)<\/title>/i, html);
  if (!title) {
    report.errors.push("Tag <title> ausente.");
    errorsCount++;
  } else if (title.length < 20) {
    report.warnings.push(`Título muito curto: "${title}" (${title.length} chars)`);
    warningsCount++;
  }

  // Meta Description validation
  const desc = getTagContent(/<meta\s+name="description"\s+content="(.*?)"\s*\/?>/i, html) || 
               getTagContent(/<meta\s+content="(.*?)"\s+name="description"\s*\/?>/i, html);
  if (!desc) {
    report.errors.push("Meta Description ausente.");
    errorsCount++;
  } else if (desc.length < 50) {
    report.warnings.push(`Meta Description muito curta: "${desc}" (${desc.length} chars)`);
    warningsCount++;
  }

  // Canonical Link validation
  const canonical = getTagContent(/<link\s+rel="canonical"\s+href="(.*?)"\s*\/?>/i, html);
  if (!canonical) {
    report.errors.push("Link Canonical ausente.");
    errorsCount++;
  } else {
    // Normalizar ambas URLs para comparação de canonical
    const normCanonical = canonical.replace(/\/$/, '');
    const normTargetUrl = url.replace(/\/$/, '');
    if (normCanonical !== normTargetUrl) {
      report.errors.push(`Canonical incorreto. Esperado: "${url}", Encontrado: "${canonical}"`);
      errorsCount++;
    }
  }

  // H1 validation
  const h1s = getAllTagContents(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, html).map(h => h.replace(/<[^>]*>/g, '').trim());
  if (h1s.length === 0) {
    report.warnings.push("Tag <h1> ausente.");
    warningsCount++;
  } else if (h1s.length > 1) {
    report.warnings.push(`Múltiplas tags <h1> encontradas (${h1s.length}): ${h1s.map(h => `"${h}"`).join(', ')}`);
    warningsCount++;
  }

  // JSON-LD validation
  const schemas = getAllTagContents(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi, html);
  schemas.forEach((schemaStr, idx) => {
    try {
      JSON.parse(schemaStr.trim());
    } catch (e) {
      report.errors.push(`Schema JSON-LD #${idx + 1} inválido: ${e.message}`);
      errorsCount++;
    }
  });

  // Open Graph validation
  const ogTitle = getTagContent(/<meta\s+property="og:title"\s+content="(.*?)"\s*\/?>/i, html);
  const ogDesc = getTagContent(/<meta\s+property="og:description"\s+content="(.*?)"\s*\/?>/i, html);
  const ogUrl = getTagContent(/<meta\s+property="og:url"\s+content="(.*?)"\s*\/?>/i, html);
  
  if (!ogTitle || !ogDesc || !ogUrl) {
    report.warnings.push("Tags Open Graph incompletas (og:title, og:description ou og:url ausentes).");
    warningsCount++;
  }

  // Images and ALT tags checking
  const imgTags = getAllTagContents(/(<img[^>]*>)/gi, html);
  let missingAlt = 0;
  imgTags.forEach(tag => {
    const hasAlt = /alt=/i.test(tag);
    if (!hasAlt) {
      missingAlt++;
    }
  });
  if (missingAlt > 0) {
    report.warnings.push(`${missingAlt} imagens com tag ALT ausente.`);
    warningsCount++;
  }

  reports.push(report);
});

// 3. Imprimir relatório formatado
console.log("\n=================== RELATÓRIO SEO QA ===================");

const failedReports = reports.filter(r => r.errors.length > 0 || r.warnings.length > 0);
if (failedReports.length === 0) {
  console.log("✅ 100% de Sucesso! Todas as páginas estão em conformidade com o SEO QA.");
} else {
  failedReports.slice(0, 15).forEach(r => {
    console.log(`\nURL: ${r.url}`);
    r.errors.forEach(e => console.log(`  ❌ ERRO: ${e}`));
    r.warnings.forEach(w => console.log(`  ⚠️ AVISO: ${w}`));
  });
  
  if (failedReports.length > 15) {
    console.log(`\n... e mais ${failedReports.length - 15} páginas com avisos/erros.`);
  }
}

console.log("\n===================== ESTATÍSTICAS =====================");
console.log(`Total de URLs verificadas: ${urls.length}`);
console.log(`Erros Críticos (Bloqueiam Build): ${errorsCount}`);
console.log(`Avisos de SEO (Não-bloqueantes): ${warningsCount}`);
console.log("========================================================\n");

if (errorsCount > 0) {
  console.error("❌ O build falhou devido a erros críticos de SEO!");
  process.exit(1);
} else {
  console.log("✅ SEO QA aprovado sem erros críticos.");
  process.exit(0);
}
