import express from 'express';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { pool, isConnected, lastConnectionError, initDatabase } from './db.js';
import { perfumes } from '../src/perfumesData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || 'APP_USR-5036655496698585-091610-a7c9ac726f77bf2228c27724e723cf63-3401326592' });
const PORT = process.env.PORT || 3001;

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static assets
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(path.join(__dirname, '../dist')));

// Helper to calculate default logistics configuration when missing
export function getDefaultLogistics(price, stock) {
  const basePrice = parseFloat(price) || 69.90;
  const progPrice = Math.max(10, Math.round((basePrice * 0.88) * 10) / 10);
  const econPrice = Math.max(10, Math.round((basePrice * 0.78) * 10) / 10);

  return {
    expresso: {
      active: (stock !== undefined ? stock > 0 : true),
      price: basePrice,
      stock: parseInt(stock) || 0,
      lead_time: 'Entrega rápida em BH e Região',
      label: 'Expresso',
      badge: '⚡ EXPRESSO'
    },
    programado_7: {
      active: true,
      price: progPrice,
      stock: null,
      lead_time: 'Até 7 dias úteis',
      label: 'Programado',
      badge: '📦 PROGRAMADO'
    },
    economico_15: {
      active: true,
      price: econPrice,
      stock: null,
      lead_time: 'Até 15 dias úteis',
      label: 'Econômico',
      badge: '💰 ECONÔMICO'
    }
  };
}

// Helper to normalize product structure
function normalizeProduct(p) {
  const images = Array.isArray(p.images) && p.images.length > 0 
    ? p.images 
    : (p.image ? [p.image] : ['/perfumes/200.webp']);
  const mainImage = images[0] || p.image || '/perfumes/200.webp';
  
  let logisticsConfig = null;
  if (p.logistics_config) {
    if (typeof p.logistics_config === 'string') {
      try { logisticsConfig = JSON.parse(p.logistics_config); } catch (e) { logisticsConfig = null; }
    } else if (typeof p.logistics_config === 'object') {
      logisticsConfig = p.logistics_config;
    }
  }
  if (!logisticsConfig || !logisticsConfig.expresso) {
    logisticsConfig = getDefaultLogistics(p.price, p.stock);
  }

  return {
    id: p.id,
    code: p.code,
    name: p.name,
    brand: p.brand || 'Brand Collection',
    volume: p.volume || '25ml',
    price: parseFloat(p.price) || 0,
    cost_price: p.cost_price !== undefined ? parseFloat(p.cost_price) : Math.round((parseFloat(p.price) || 0) * 0.45 * 100) / 100,
    stock: parseInt(p.stock) || 0,
    min_stock: parseInt(p.min_stock) || 5,
    gender: p.gender || 'Unissex',
    image: mainImage,
    images: images,
    tags: Array.isArray(p.tags) ? p.tags : [],
    description: p.description || '',
    longDescription: p.long_description || p.longDescription || p.description || '',
    olfactoryFamily: p.olfactory_family || p.olfactoryFamily || '',
    inspiredBy: p.inspired_by || p.inspiredBy || '',
    notes: Array.isArray(p.notes) ? p.notes : [],
    slug: p.slug || (p.name ? p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : p.code),
    categorySlugs: Array.isArray(p.category_slugs) ? p.category_slugs : (Array.isArray(p.categorySlugs) ? p.categorySlugs : ['mini-perfumes-25ml']),
    is_active: p.is_active !== undefined ? p.is_active : true,
    logistics_config: logisticsConfig,
    logistics_updated_at: p.logistics_updated_at || p.updated_at || new Date().toISOString(),
    logistics_updated_by: p.logistics_updated_by || 'Sistema',
    created_at: p.created_at || new Date().toISOString()
  };
}

// In-memory / cache fallback in case postgres is offline or connecting
let memoryStore = {
  products: [...perfumes.map(normalizeProduct)],
  categories: [
    { id: 1, name: 'Todos os Perfumes', slug: 'mini-perfumes-25ml', description: 'Coleção completa de miniaturas de perfumes importados 25ml' },
    { id: 2, name: 'Brand Collection', slug: 'brand-collection', description: 'Fragrâncias de alta fixação inspiradas nos perfumes mais famosos do mundo' },
    { id: 3, name: 'Arabic Collection', slug: 'perfumes-arabes', description: 'Perfumes árabes originais Lattafa, Armaf, Afnan e mais' },
    { id: 4, name: 'Femininos', slug: 'perfumes-femininos', description: 'Mini perfumes importados para mulheres elegantes e marcantes' },
    { id: 5, name: 'Masculinos', slug: 'perfumes-masculinos', description: 'Miniaturas masculinas com notas marcantes e imponentes' },
    { id: 6, name: 'Unissex', slug: 'mini-perfumes-unissex', description: 'Fragrâncias compartilháveis sofisticadas' },
    { id: 7, name: 'Para Presente', slug: 'mini-perfumes-para-presente', description: 'Opções ideais de perfumes para presentear' },
    { id: 8, name: 'Em BH', slug: 'mini-perfumes-em-bh', description: 'Miniaturas com pronta entrega e frete rápido em BH' }
  ],
  tags: [
    { id: 1, name: 'Mais Vendido', slug: 'mais-vendido' },
    { id: 2, name: 'Lançamento', slug: 'lancamento' },
    { id: 3, name: 'Novidade', slug: 'novidade' },
    { id: 4, name: 'Fixação 12h', slug: 'fixacao-12h' },
    { id: 5, name: 'Importado Original', slug: 'importado-original' },
    { id: 6, name: 'Promoção', slug: 'promocao' },
    { id: 7, name: 'Pronta Entrega', slug: 'pronta-entrega' },
    { id: 8, name: 'Exclusivo', slug: 'exclusivo' }
  ],
  users: [
    { id: 1, name: 'Administrador Snack Store', username: 'admin', email: 'admin@snackstorebh.com.br', password_hash: 'Samuca824655!', role: 'admin', phone: '553175650503', status: 'ativo', created_at: new Date().toISOString() },
    { id: 2, name: 'Gerente de Operações', username: 'gerente', email: 'gerente@snackstorebh.com.br', password_hash: 'gerente123', role: 'gerente', phone: '553175650503', status: 'ativo', created_at: new Date().toISOString() },
    { id: 3, name: 'Lucas Comprador', username: 'cliente', email: 'cliente@snackstorebh.com.br', password_hash: 'cliente123', role: 'comprador', phone: '5531988776655', status: 'ativo', created_at: new Date().toISOString() }
  ],
  recipients: [
    {
      id: 1,
      owner_user_id: 1,
      name: 'Maria Silva Oliveira',
      phone: '5531998877665',
      zipcode: '30130-100',
      street: 'Avenida Afonso Pena',
      number: '1500',
      complement: 'Apt 402',
      district: 'Centro',
      city: 'Belo Horizonte',
      state: 'MG',
      reference: 'Portaria 24 horas',
      created_at: new Date().toISOString()
    }
  ],
  shipments: [
    {
      id: 1,
      shipment_number: 'SHP-9021-01',
      order_id: 1,
      customer_id: 3,
      recipient_id: 1,
      recipient_name: 'Lucas Comprador',
      recipient_phone: '5531988776655',
      recipient_address: 'Rua da Bahia, 1200 - Lourdes, Belo Horizonte - MG',
      logistics_mode: 'EXPRESSO',
      status: 'separacao',
      estimated_delivery: 'Entrega rápida em BH e Região',
      tracking_code: null,
      neutral_packing: false,
      notes: 'Entregar até 18h no condomínio.',
      items_json: [
        { code: 'A001', name: 'Perfume Lattafa Asad 25ml', price: 79.90, quantity: 2, volume: '25ml', logistics_mode: 'EXPRESSO' },
        { code: 'A002', name: 'Perfume Lattafa Yara 25ml', price: 79.90, quantity: 1, volume: '25ml', logistics_mode: 'EXPRESSO' }
      ],
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  logistics_settings: {
    logistics_modes_enabled: true,
    multi_recipient_shipping_enabled: true,
    expresso: { enabled: true, label: 'Expresso', lead_time: 'Entrega rápida em BH e Região', badge: '⚡ EXPRESSO' },
    programado_7: { enabled: true, label: 'Programado', lead_time: 'Até 7 dias úteis', badge: '📦 PROGRAMADO' },
    economico_15: { enabled: true, label: 'Econômico', lead_time: 'Até 15 dias úteis', badge: '💰 ECONÔMICO' },
    multi_recipient_min_units: 5,
    max_recipients_5_9: 2,
    max_recipients_10_19: 4,
    max_recipients_20_plus: 8,
    neutral_packing_allowed: true
  },
  orders: [
    {
      id: 1,
      order_number: 'SNK-9021',
      customer_id: 3,
      customer_name: 'Lucas Comprador',
      customer_email: 'cliente@snackstorebh.com.br',
      customer_phone: '5531988776655',
      customer_address: 'Rua da Bahia, 1200 - Lourdes, Belo Horizonte - MG',
      items_json: [
        { code: 'A001', name: 'Perfume Lattafa Asad 25ml', price: 79.90, cost_price: 38.00, quantity: 2, volume: '25ml', logistics_mode: 'EXPRESSO' },
        { code: 'A002', name: 'Perfume Lattafa Yara 25ml', price: 79.90, cost_price: 38.00, quantity: 1, volume: '25ml', logistics_mode: 'EXPRESSO' }
      ],
      total_amount: 239.70,
      cost_amount: 114.00,
      status: 'pago',
      payment_method: 'Pix',
      notes: 'Entregar até 18h no condomínio.',
      fulfillment_mode: 'single',
      recipient_count: 1,
      neutral_packing: false,
      created_at: new Date(Date.now() - 3600000 * 4).toISOString()
    }
  ],
  transactions: [
    { id: 1, type: 'receita', category: 'Venda de Pedido', amount: 239.70, description: 'Pedido SNK-9021', payment_method: 'Pix', created_at: new Date(Date.now() - 3600000 * 4).toISOString() }
  ]
};

// Seed initial products into PostgreSQL if connected
async function seedProductsIfEmpty() {
  if (!isConnected) return;
  try {
    const res = await pool.query('SELECT count(*) FROM products');
    if (parseInt(res.rows[0].count, 10) === 0) {
      console.log('📦 Semeando catálogo inicial de fragrâncias no PostgreSQL...');
      for (const p of perfumes) {
        const norm = normalizeProduct(p);
        await pool.query(`
          INSERT INTO products (code, name, brand, volume, price, cost_price, stock, min_stock, gender, image, images, tags, description, long_description, olfactory_family, inspired_by, notes, slug, category_slugs, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
          ON CONFLICT (code) DO NOTHING
        `, [
          norm.code, norm.name, norm.brand, norm.volume, norm.price, norm.cost_price, norm.stock, norm.min_stock,
          norm.gender, norm.image, norm.images, norm.tags, norm.description, norm.longDescription,
          norm.olfactoryFamily, norm.inspiredBy, norm.notes, norm.slug, norm.categorySlugs, norm.is_active
        ]);
      }
      console.log('✨ 158 perfumes semeados com sucesso no PostgreSQL!');
    }
  } catch (err) {
    console.warn('⚠️ Erro ao semear produtos no PG:', err.message);
  }
}

// Initialize DB and seed
initDatabase().then(() => {
  seedProductsIfEmpty();
});

// Health and DB status
app.get('/api/status/db', async (req, res) => {
  try {
    if (isConnected) {
      const result = await pool.query('SELECT NOW() as now, current_database() as db, version() as ver');
      return res.json({
        connected: true,
        database: result.rows[0].db,
        serverTime: result.rows[0].now,
        host: 'var_hub_storegress:5432',
        url: 'postgres://storegress:***@var_hub_storegress:5432/storegress?sslmode=disable',
        mode: 'PostgreSQL Direct'
      });
    } else {
      return res.json({
        connected: false,
        host: 'var_hub_storegress:5432',
        url: 'postgres://storegress:***@var_hub_storegress:5432/storegress?sslmode=disable',
        error: lastConnectionError || 'PostgreSQL host var_hub_storegress acessível internamente na rede do servidor Docker.',
        mode: 'Híbrido Resiliente (Sincronizado)'
      });
    }
  } catch (err) {
    return res.json({
      connected: false,
      error: err.message,
      mode: 'Híbrido Resiliente (Sincronizado)'
    });
  }
});

// ==========================================
// PRODUCTS API (FULL CRUD & SYNC)
// ==========================================

// Get all products
app.get('/api/products', async (req, res) => {
  if (isConnected) {
    try {
      const result = await pool.query('SELECT * FROM products ORDER BY id DESC');
      if (result.rows && result.rows.length > 0) {
        const products = result.rows.map(normalizeProduct);
        memoryStore.products = products; // sync cache
        return res.json(products);
      }
    } catch (e) {
      console.warn('DB error on get products, using memoryStore:', e.message);
    }
  }
  return res.json(memoryStore.products);
});

// Get product by slug or code
app.get('/api/products/:identifier', async (req, res) => {
  const { identifier } = req.params;
  if (isConnected) {
    try {
      const result = await pool.query('SELECT * FROM products WHERE code = $1 OR slug = $1 LIMIT 1', [identifier]);
      if (result.rows.length > 0) {
        return res.json(normalizeProduct(result.rows[0]));
      }
    } catch (e) {
      console.warn('DB error on get product identifier:', e.message);
    }
  }

  const found = memoryStore.products.find(p => p.code === identifier || p.slug === identifier);
  if (found) return res.json(found);
  return res.status(404).json({ error: 'Produto não encontrado' });
});

// Create new product
app.post('/api/products', async (req, res) => {
  const raw = req.body;
  if (!raw.name) {
    return res.status(400).json({ error: 'Nome do produto é obrigatório.' });
  }

  const code = raw.code || 'SKU-' + Math.floor(1000 + Math.random() * 9000);
  const slug = raw.slug || raw.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const images = Array.isArray(raw.images) && raw.images.length > 0 ? raw.images : (raw.image ? [raw.image] : ['/perfumes/200.webp']);
  const mainImage = images[0] || raw.image || '/perfumes/200.webp';
  const tags = Array.isArray(raw.tags) ? raw.tags : [];
  const categorySlugs = Array.isArray(raw.categorySlugs) ? raw.categorySlugs : ['mini-perfumes-25ml'];

  const norm = normalizeProduct({
    ...raw,
    code,
    slug,
    image: mainImage,
    images,
    tags,
    category_slugs: categorySlugs
  });

  if (isConnected) {
    try {
      const insert = await pool.query(`
        INSERT INTO products (code, name, brand, volume, price, cost_price, stock, min_stock, gender, image, images, tags, description, long_description, olfactory_family, inspired_by, notes, slug, category_slugs, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        RETURNING *
      `, [
        norm.code, norm.name, norm.brand, norm.volume, norm.price, norm.cost_price, norm.stock, norm.min_stock,
        norm.gender, norm.image, norm.images, norm.tags, norm.description, norm.longDescription,
        norm.olfactoryFamily, norm.inspiredBy, norm.notes, norm.slug, norm.categorySlugs, norm.is_active
      ]);
      const created = normalizeProduct(insert.rows[0]);
      memoryStore.products.unshift(created);
      return res.status(201).json(created);
    } catch (e) {
      console.warn('DB error inserting product, saving to memoryStore:', e.message);
    }
  }

  norm.id = Date.now();
  memoryStore.products.unshift(norm);
  return res.status(201).json(norm);
});

// Update product
app.put('/api/products/:code', async (req, res) => {
  const { code } = req.params;
  const raw = req.body;
  const images = Array.isArray(raw.images) && raw.images.length > 0 ? raw.images : (raw.image ? [raw.image] : undefined);
  const mainImage = images ? images[0] : raw.image;

  if (isConnected) {
    try {
      const update = await pool.query(`
        UPDATE products 
        SET name = COALESCE($1, name),
            brand = COALESCE($2, brand),
            volume = COALESCE($3, volume),
            price = COALESCE($4, price),
            cost_price = COALESCE($5, cost_price),
            stock = COALESCE($6, stock),
            min_stock = COALESCE($7, min_stock),
            gender = COALESCE($8, gender),
            image = COALESCE($9, image),
            images = COALESCE($10, images),
            tags = COALESCE($11, tags),
            description = COALESCE($12, description),
            long_description = COALESCE($13, long_description),
            olfactory_family = COALESCE($14, olfactory_family),
            inspired_by = COALESCE($15, inspired_by),
            category_slugs = COALESCE($16, category_slugs),
            is_active = COALESCE($17, is_active),
            updated_at = CURRENT_TIMESTAMP
        WHERE code = $18
        RETURNING *
      `, [
        raw.name ?? null, raw.brand ?? null, raw.volume ?? null,
        raw.price !== undefined ? raw.price : null,
        raw.cost_price !== undefined ? raw.cost_price : null,
        raw.stock !== undefined ? raw.stock : null,
        raw.min_stock !== undefined ? raw.min_stock : null,
        raw.gender ?? null, mainImage ?? null, images ?? null, raw.tags ?? null, raw.description ?? null, raw.longDescription ?? null,
        raw.olfactoryFamily ?? null, raw.inspiredBy ?? null, raw.categorySlugs ?? null,
        raw.is_active !== undefined ? raw.is_active : null, code
      ]);
      if (update.rows.length > 0) {
        const updated = normalizeProduct(update.rows[0]);
        const idx = memoryStore.products.findIndex(p => p.code === code);
        if (idx !== -1) memoryStore.products[idx] = updated;
        return res.json(updated);
      }
    } catch (e) {
      console.warn('DB error updating product, updating memoryStore:', e.message);
    }
  }

  const idx = memoryStore.products.findIndex(p => p.code === code);
  if (idx !== -1) {
    memoryStore.products[idx] = normalizeProduct({
      ...memoryStore.products[idx],
      ...raw,
      images: images || memoryStore.products[idx].images,
      image: mainImage || memoryStore.products[idx].image
    });
    return res.json(memoryStore.products[idx]);
  }
  return res.status(404).json({ error: 'Produto não encontrado' });
});

// Set exact stock
app.put('/api/products/:code/stock', async (req, res) => {
  const { code } = req.params;
  const { stock } = req.body;
  const stockNum = Math.max(0, parseInt(stock, 10) || 0);

  if (isConnected) {
    try {
      const update = await pool.query(`
        UPDATE products 
        SET stock = $1, updated_at = CURRENT_TIMESTAMP
        WHERE code = $2
        RETURNING *
      `, [stockNum, code]);
      if (update.rows.length > 0) {
        const updated = normalizeProduct(update.rows[0]);
        const idx = memoryStore.products.findIndex(p => p.code === code);
        if (idx !== -1) memoryStore.products[idx] = updated;
        return res.json({ code, stock: updated.stock });
      }
    } catch (e) {
      console.warn('DB error setting stock:', e.message);
    }
  }

  const p = memoryStore.products.find(item => item.code === code);
  if (p) {
    p.stock = stockNum;
    return res.json({ code, stock: p.stock });
  }
  return res.status(404).json({ error: 'Produto não encontrado' });
});

// Adjust stock
app.patch('/api/products/:code/stock', async (req, res) => {
  const { code } = req.params;
  const { delta } = req.body;
  const deltaNum = parseInt(delta) || 0;

  if (isConnected) {
    try {
      const update = await pool.query(`
        UPDATE products 
        SET stock = GREATEST(0, stock + $1), updated_at = CURRENT_TIMESTAMP
        WHERE code = $2
        RETURNING *
      `, [deltaNum, code]);
      if (update.rows.length > 0) {
        const updated = normalizeProduct(update.rows[0]);
        const idx = memoryStore.products.findIndex(p => p.code === code);
        if (idx !== -1) memoryStore.products[idx] = updated;
        return res.json({ code, stock: updated.stock });
      }
    } catch (e) {
      console.warn('DB error adjusting stock:', e.message);
    }
  }

  const p = memoryStore.products.find(item => item.code === code);
  if (p) {
    p.stock = Math.max(0, (p.stock || 0) + deltaNum);
    return res.json({ code, stock: p.stock });
  }
  return res.status(404).json({ error: 'Produto não encontrado' });
});

// Batch operations (bulk update / bulk delete)
app.post('/api/products/batch', async (req, res) => {
  const { codes, updates, action } = req.body;
  if (!Array.isArray(codes) || codes.length === 0) {
    return res.status(400).json({ error: 'Array de códigos é obrigatório.' });
  }

  if (action === 'delete') {
    if (isConnected) {
      try {
        await pool.query('DELETE FROM products WHERE code = ANY($1)', [codes]);
      } catch (e) {
        console.warn('DB error batch delete:', e.message);
      }
    }
    const set = new Set(codes);
    memoryStore.products = memoryStore.products.filter(p => !set.has(p.code));
    return res.json({ success: true, count: codes.length });
  }

  if (isConnected && updates) {
    try {
      if (updates.stock !== undefined) {
        await pool.query('UPDATE products SET stock = $1, updated_at = CURRENT_TIMESTAMP WHERE code = ANY($2)', [Math.max(0, parseInt(updates.stock, 10) || 0), codes]);
      }
      if (updates.stockDelta !== undefined) {
        await pool.query('UPDATE products SET stock = GREATEST(0, stock + $1), updated_at = CURRENT_TIMESTAMP WHERE code = ANY($2)', [parseInt(updates.stockDelta, 10), codes]);
      }
      if (updates.price !== undefined) {
        await pool.query('UPDATE products SET price = $1, updated_at = CURRENT_TIMESTAMP WHERE code = ANY($2)', [parseFloat(updates.price) || 0, codes]);
      }
      if (updates.is_active !== undefined) {
        await pool.query('UPDATE products SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE code = ANY($2)', [Boolean(updates.is_active), codes]);
      }
    } catch (e) {
      console.warn('DB error batch update:', e.message);
    }
  }

  const codesSet = new Set(codes);
  memoryStore.products = memoryStore.products.map(p => {
    if (!codesSet.has(p.code)) return p;
    const copy = { ...p };
    if (updates.stock !== undefined) {
      copy.stock = Math.max(0, parseInt(updates.stock, 10) || 0);
    }
    if (updates.stockDelta !== undefined) {
      copy.stock = Math.max(0, (copy.stock || 0) + parseInt(updates.stockDelta, 10));
    }
    if (updates.price !== undefined) {
      copy.price = parseFloat(updates.price) || 0;
    }
    if (updates.pricePercent !== undefined) {
      copy.price = Math.round(copy.price * (1 + parseFloat(updates.pricePercent) / 100) * 100) / 100;
    }
    if (updates.is_active !== undefined) {
      copy.is_active = Boolean(updates.is_active);
    }
    if (updates.addTag && typeof updates.addTag === 'string') {
      copy.tags = Array.from(new Set([...(copy.tags || []), updates.addTag]));
    }
    if (updates.removeTag && typeof updates.removeTag === 'string') {
      copy.tags = (copy.tags || []).filter(t => t !== updates.removeTag);
    }
    return copy;
  });

  return res.json({ success: true, count: codes.length, products: memoryStore.products });
});

// Delete product
app.delete('/api/products/:code', async (req, res) => {
  const { code } = req.params;
  if (isConnected) {
    try {
      await pool.query('DELETE FROM products WHERE code = $1', [code]);
    } catch (e) {
      console.warn('DB error deleting product:', e.message);
    }
  }
  memoryStore.products = memoryStore.products.filter(p => p.code !== code);
  return res.json({ success: true, code });
});

// ==========================================
// LOGISTICS, AVAILABILITY & SHIPMENTS API
// ==========================================

// Update single product logistics
app.put('/api/products/:code/logistics', async (req, res) => {
  const { code } = req.params;
  const { logistics_config, updated_by } = req.body;
  if (!logistics_config) {
    return res.status(400).json({ error: 'Configuração logística é obrigatória.' });
  }

  const updatedBy = updated_by || 'Administrador';
  const now = new Date().toISOString();

  // If expresso stock or price are provided, keep product root in sync
  const expressoStock = logistics_config.expresso?.stock;
  const expressoPrice = logistics_config.expresso?.price;

  if (isConnected) {
    try {
      const update = await pool.query(`
        UPDATE products 
        SET logistics_config = $1,
            stock = COALESCE($2, stock),
            price = COALESCE($3, price),
            logistics_updated_at = CURRENT_TIMESTAMP,
            logistics_updated_by = $4,
            updated_at = CURRENT_TIMESTAMP
        WHERE code = $5
        RETURNING *
      `, [
        JSON.stringify(logistics_config),
        expressoStock !== undefined && expressoStock !== null ? parseInt(expressoStock, 10) : null,
        expressoPrice !== undefined && expressoPrice !== null ? parseFloat(expressoPrice) : null,
        updatedBy,
        code
      ]);
      if (update.rows.length > 0) {
        const updated = normalizeProduct(update.rows[0]);
        const idx = memoryStore.products.findIndex(p => p.code === code);
        if (idx !== -1) memoryStore.products[idx] = updated;
        return res.json(updated);
      }
    } catch (e) {
      console.warn('DB error updating product logistics:', e.message);
    }
  }

  const idx = memoryStore.products.findIndex(p => p.code === code);
  if (idx !== -1) {
    memoryStore.products[idx].logistics_config = logistics_config;
    if (expressoStock !== undefined && expressoStock !== null) {
      memoryStore.products[idx].stock = parseInt(expressoStock, 10) || 0;
    }
    if (expressoPrice !== undefined && expressoPrice !== null) {
      memoryStore.products[idx].price = parseFloat(expressoPrice) || 0;
    }
    memoryStore.products[idx].logistics_updated_at = now;
    memoryStore.products[idx].logistics_updated_by = updatedBy;
    return res.json(memoryStore.products[idx]);
  }
  return res.status(404).json({ error: 'Produto não encontrado.' });
});

// Batch logistics operations
app.post('/api/products/logistics/batch', async (req, res) => {
  const { codes, action, value, updated_by } = req.body;
  if (!Array.isArray(codes) || codes.length === 0) {
    return res.status(400).json({ error: 'Array de códigos é obrigatório.' });
  }
  const updatedBy = updated_by || 'Administrador';
  const now = new Date().toISOString();

  const codesSet = new Set(codes);
  const updatedProducts = [];

  for (let p of memoryStore.products) {
    if (!codesSet.has(p.code)) continue;

    const logConf = { ...p.logistics_config };
    if (!logConf.expresso) {
      Object.assign(logConf, getDefaultLogistics(p.price, p.stock));
    }

    if (action === 'enable_expresso') {
      logConf.expresso = { ...logConf.expresso, active: true };
    } else if (action === 'disable_expresso') {
      logConf.expresso = { ...logConf.expresso, active: false };
    } else if (action === 'enable_programado') {
      logConf.programado_7 = { ...logConf.programado_7, active: true };
    } else if (action === 'disable_programado') {
      logConf.programado_7 = { ...logConf.programado_7, active: false };
    } else if (action === 'enable_economico') {
      logConf.economico_15 = { ...logConf.economico_15, active: true };
    } else if (action === 'disable_economico') {
      logConf.economico_15 = { ...logConf.economico_15, active: false };
    } else if (action === 'adjust_price_percent' && value && value.modality) {
      const mod = value.modality;
      const pct = parseFloat(value.percent) || 0;
      if (logConf[mod]) {
        const curPrice = parseFloat(logConf[mod].price) || p.price;
        const newPrice = Math.round(curPrice * (1 + pct / 100) * 100) / 100;
        logConf[mod] = { ...logConf[mod], price: newPrice };
        if (mod === 'expresso') p.price = newPrice;
      }
    } else if (action === 'set_stock' && value !== undefined) {
      const stockVal = Math.max(0, parseInt(value, 10) || 0);
      if (logConf.expresso) {
        logConf.expresso = { ...logConf.expresso, stock: stockVal };
      }
      p.stock = stockVal;
    } else if (action === 'adjust_stock' && value !== undefined) {
      const delta = parseInt(value, 10) || 0;
      const curStock = logConf.expresso?.stock !== undefined ? logConf.expresso.stock : p.stock;
      const newStock = Math.max(0, curStock + delta);
      if (logConf.expresso) {
        logConf.expresso = { ...logConf.expresso, stock: newStock };
      }
      p.stock = newStock;
    }

    p.logistics_config = logConf;
    p.logistics_updated_at = now;
    p.logistics_updated_by = updatedBy;

    if (isConnected) {
      try {
        await pool.query(`
          UPDATE products 
          SET logistics_config = $1,
              stock = $2,
              price = $3,
              logistics_updated_at = CURRENT_TIMESTAMP,
              logistics_updated_by = $4,
              updated_at = CURRENT_TIMESTAMP
          WHERE code = $5
        `, [JSON.stringify(logConf), p.stock, p.price, updatedBy, p.code]);
      } catch (e) {
        console.warn('DB error in batch update for', p.code, e.message);
      }
    }

    updatedProducts.push(p);
  }

  return res.json({ success: true, count: updatedProducts.length, products: updatedProducts });
});

// Logistics operational indicators dashboard
app.get('/api/logistics/dashboard', async (req, res) => {
  let products = memoryStore.products;
  if (isConnected) {
    try {
      const resDb = await pool.query('SELECT * FROM products ORDER BY id DESC');
      if (resDb.rows && resDb.rows.length > 0) {
        products = resDb.rows.map(normalizeProduct);
      }
    } catch (e) {
      console.warn('DB error on logistics dashboard:', e.message);
    }
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  let expressoCount = 0;
  let programadoCount = 0;
  let economicoCount = 0;
  let noneAvailableCount = 0;
  let lowExpressoStockCount = 0;
  let unreviewedTodayCount = 0;

  for (const p of products) {
    const l = p.logistics_config || {};
    const expOn = l.expresso?.active === true;
    const progOn = l.programado_7?.active === true;
    const econOn = l.economico_15?.active === true;

    if (expOn) expressoCount++;
    if (progOn) programadoCount++;
    if (econOn) economicoCount++;
    if (!expOn && !progOn && !econOn) noneAvailableCount++;

    const expStock = l.expresso?.stock !== undefined ? l.expresso.stock : p.stock;
    if (expOn && (expStock || 0) <= (p.min_stock || 5)) {
      lowExpressoStockCount++;
    }

    const lastUp = (p.logistics_updated_at || '').slice(0, 10);
    if (lastUp !== todayStr) {
      unreviewedTodayCount++;
    }
  }

  return res.json({
    total_skus: products.length,
    expresso_active: expressoCount,
    programado_active: programadoCount,
    economico_active: economicoCount,
    no_availability: noneAvailableCount,
    low_expresso_stock: lowExpressoStockCount,
    unreviewed_today: unreviewedTodayCount
  });
});

// Logistics global settings
app.get('/api/logistics/settings', async (req, res) => {
  if (isConnected) {
    try {
      const result = await pool.query("SELECT value FROM store_settings WHERE key = 'logistics_settings' LIMIT 1");
      if (result.rows.length > 0 && result.rows[0].value) {
        return res.json(typeof result.rows[0].value === 'string' ? JSON.parse(result.rows[0].value) : result.rows[0].value);
      }
    } catch (e) {
      console.warn('DB error on get logistics settings:', e.message);
    }
  }
  return res.json(memoryStore.logistics_settings);
});

app.put('/api/logistics/settings', async (req, res) => {
  const settings = req.body;
  if (isConnected) {
    try {
      await pool.query(`
        INSERT INTO store_settings (key, value, updated_at)
        VALUES ('logistics_settings', $1, CURRENT_TIMESTAMP)
        ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = CURRENT_TIMESTAMP
      `, [JSON.stringify(settings)]);
      return res.json(settings);
    } catch (e) {
      console.warn('DB error updating logistics settings:', e.message);
    }
  }
  memoryStore.logistics_settings = settings;
  return res.json(settings);
});

// Recipients API (Isolated per reseller/user)
app.get('/api/recipients', async (req, res) => {
  const userId = req.query.user_id ? parseInt(req.query.user_id, 10) : null;
  if (isConnected) {
    try {
      let query = 'SELECT * FROM recipients';
      const params = [];
      if (userId) {
        query += ' WHERE owner_user_id = $1';
        params.push(userId);
      }
      query += ' ORDER BY created_at DESC';
      const result = await pool.query(query, params);
      return res.json(result.rows);
    } catch (e) {
      console.warn('DB error on get recipients:', e.message);
    }
  }
  const filtered = userId 
    ? memoryStore.recipients.filter(r => r.owner_user_id === userId)
    : memoryStore.recipients;
  return res.json(filtered);
});

app.post('/api/recipients', async (req, res) => {
  const data = req.body;
  if (!data.name || !data.city || !data.state) {
    return res.status(400).json({ error: 'Nome, cidade e estado são obrigatórios.' });
  }

  if (isConnected) {
    try {
      const insert = await pool.query(`
        INSERT INTO recipients (owner_user_id, name, phone, zipcode, street, number, complement, district, city, state, reference)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [
        data.owner_user_id || null, data.name, data.phone || '', data.zipcode || '',
        data.street || '', data.number || '', data.complement || '', data.district || '',
        data.city, data.state, data.reference || ''
      ]);
      const created = insert.rows[0];
      memoryStore.recipients.unshift(created);
      return res.status(201).json(created);
    } catch (e) {
      console.warn('DB error inserting recipient:', e.message);
    }
  }

  const newRec = {
    id: memoryStore.recipients.length + 1,
    owner_user_id: data.owner_user_id || null,
    name: data.name,
    phone: data.phone || '',
    zipcode: data.zipcode || '',
    street: data.street || '',
    number: data.number || '',
    complement: data.complement || '',
    district: data.district || '',
    city: data.city,
    state: data.state,
    reference: data.reference || '',
    created_at: new Date().toISOString()
  };
  memoryStore.recipients.unshift(newRec);
  return res.status(201).json(newRec);
});

app.delete('/api/recipients/:id', async (req, res) => {
  const { id } = req.params;
  const numId = parseInt(id, 10);
  if (isConnected) {
    try {
      await pool.query('DELETE FROM recipients WHERE id = $1', [numId]);
    } catch (e) {
      console.warn('DB error deleting recipient:', e.message);
    }
  }
  memoryStore.recipients = memoryStore.recipients.filter(r => r.id !== numId);
  return res.json({ success: true, id: numId });
});

// Shipments API (Operational fulfillment)
app.get('/api/shipments', async (req, res) => {
  const { status, logistics_mode, order_id, customer_id, today } = req.query;
  if (isConnected) {
    try {
      let query = 'SELECT * FROM shipments WHERE 1=1';
      const params = [];
      if (status && status !== 'ALL') {
        params.push(status);
        query += ` AND status = $${params.length}`;
      }
      if (logistics_mode && logistics_mode !== 'ALL') {
        params.push(logistics_mode);
        query += ` AND logistics_mode = $${params.length}`;
      }
      if (order_id) {
        params.push(parseInt(order_id, 10));
        query += ` AND order_id = $${params.length}`;
      }
      if (customer_id) {
        params.push(parseInt(customer_id, 10));
        query += ` AND customer_id = $${params.length}`;
      }
      if (today === 'true') {
        query += " AND created_at >= CURRENT_DATE";
      }
      query += ' ORDER BY created_at DESC';
      const result = await pool.query(query, params);
      return res.json(result.rows);
    } catch (e) {
      console.warn('DB error on get shipments:', e.message);
    }
  }

  let list = memoryStore.shipments;
  if (status && status !== 'ALL') list = list.filter(s => s.status === status);
  if (logistics_mode && logistics_mode !== 'ALL') list = list.filter(s => s.logistics_mode === logistics_mode);
  if (order_id) list = list.filter(s => s.order_id === parseInt(order_id, 10));
  if (customer_id) list = list.filter(s => s.customer_id === parseInt(customer_id, 10));
  if (today === 'true') {
    const todayStr = new Date().toISOString().slice(0, 10);
    list = list.filter(s => (s.created_at || '').slice(0, 10) === todayStr);
  }
  return res.json(list);
});

app.put('/api/shipments/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const numId = parseInt(id, 10);

  if (isConnected) {
    try {
      const update = await pool.query(`
        UPDATE shipments 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `, [status, numId]);
      if (update.rows.length > 0) return res.json(update.rows[0]);
    } catch (e) {
      console.warn('DB error updating shipment status:', e.message);
    }
  }

  const ship = memoryStore.shipments.find(s => s.id === numId);
  if (ship) {
    ship.status = status;
    ship.updated_at = new Date().toISOString();
    return res.json(ship);
  }
  return res.status(404).json({ error: 'Remessa não encontrada.' });
});

app.put('/api/shipments/:id/tracking', async (req, res) => {
  const { id } = req.params;
  const { tracking_code } = req.body;
  const numId = parseInt(id, 10);

  if (isConnected) {
    try {
      const update = await pool.query(`
        UPDATE shipments 
        SET tracking_code = $1, status = CASE WHEN status IN ('separacao', 'embalagem', 'pronto_envio') THEN 'enviado' ELSE status END, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `, [tracking_code, numId]);
      if (update.rows.length > 0) return res.json(update.rows[0]);
    } catch (e) {
      console.warn('DB error updating shipment tracking:', e.message);
    }
  }

  const ship = memoryStore.shipments.find(s => s.id === numId);
  if (ship) {
    ship.tracking_code = tracking_code;
    if (['separacao', 'embalagem', 'pronto_envio'].includes(ship.status)) {
      ship.status = 'enviado';
    }
    ship.updated_at = new Date().toISOString();
    return res.json(ship);
  }
  return res.status(404).json({ error: 'Remessa não encontrada.' });
});

// ==========================================
// BULK IMAGES UPLOAD API
// ==========================================

app.post('/api/upload', async (req, res) => {
  try {
    const { images } = req.body; // Array of base64 data URLs or objects { name, data }
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
    }

    const uploadedUrls = [];

    for (let i = 0; i < images.length; i++) {
      const item = images[i];
      let base64Data = '';
      let ext = 'webp';

      if (typeof item === 'string') {
        const match = item.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (match) {
          ext = match[1] === 'jpeg' ? 'jpg' : match[1];
          base64Data = match[2];
        } else if (item.startsWith('http://') || item.startsWith('https://') || item.startsWith('/')) {
          uploadedUrls.push(item);
          continue;
        } else {
          base64Data = item;
        }
      } else if (item && item.data) {
        const match = item.data.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (match) {
          ext = match[1] === 'jpeg' ? 'jpg' : match[1];
          base64Data = match[2];
        } else {
          base64Data = item.data;
        }
      }

      if (base64Data) {
        const buffer = Buffer.from(base64Data, 'base64');
        const filename = `perfume-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, buffer);
        uploadedUrls.push(`/uploads/${filename}`);
      }
    }

    return res.json({ urls: uploadedUrls });
  } catch (err) {
    console.error('Upload Error:', err);
    return res.status(500).json({ error: 'Erro ao fazer upload das imagens: ' + err.message });
  }
});

// ==========================================
// CATEGORIES & TAGS API
// ==========================================

app.get('/api/categories', async (req, res) => {
  if (isConnected) {
    try {
      const result = await pool.query('SELECT * FROM categories ORDER BY id ASC');
      if (result.rows && result.rows.length > 0) {
        return res.json(result.rows);
      }
    } catch (e) {
      console.warn('DB error on categories, using memory:', e.message);
    }
  }
  return res.json(memoryStore.categories);
});

app.post('/api/categories', async (req, res) => {
  const { name, slug, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome da categoria é obrigatório.' });

  const categorySlug = slug || name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  if (isConnected) {
    try {
      const insert = await pool.query(
        'INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) ON CONFLICT (slug) DO UPDATE SET name = $1 RETURNING *',
        [name, categorySlug, description || '']
      );
      const cat = insert.rows[0];
      const idx = memoryStore.categories.findIndex(c => c.slug === categorySlug);
      if (idx !== -1) memoryStore.categories[idx] = cat;
      else memoryStore.categories.push(cat);
      return res.status(201).json(cat);
    } catch (e) {
      console.warn('DB error inserting category:', e.message);
    }
  }

  const newCat = { id: Date.now(), name, slug: categorySlug, description: description || '' };
  memoryStore.categories.push(newCat);
  return res.status(201).json(newCat);
});

app.delete('/api/categories/:slug', async (req, res) => {
  const { slug } = req.params;
  if (isConnected) {
    try {
      await pool.query('DELETE FROM categories WHERE slug = $1', [slug]);
    } catch (e) {
      console.warn('DB error deleting category:', e.message);
    }
  }
  memoryStore.categories = memoryStore.categories.filter(c => c.slug !== slug);
  return res.json({ success: true, slug });
});

// Tags
app.get('/api/tags', async (req, res) => {
  if (isConnected) {
    try {
      const result = await pool.query('SELECT * FROM tags ORDER BY id ASC');
      if (result.rows && result.rows.length > 0) {
        return res.json(result.rows);
      }
    } catch (e) {
      console.warn('DB error on tags, using memory:', e.message);
    }
  }
  return res.json(memoryStore.tags);
});

app.post('/api/tags', async (req, res) => {
  const { name, slug } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome da tag é obrigatório.' });

  const tagSlug = slug || name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  if (isConnected) {
    try {
      const insert = await pool.query(
        'INSERT INTO tags (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO UPDATE SET name = $1 RETURNING *',
        [name, tagSlug]
      );
      const tag = insert.rows[0];
      const idx = memoryStore.tags.findIndex(t => t.slug === tagSlug);
      if (idx !== -1) memoryStore.tags[idx] = tag;
      else memoryStore.tags.push(tag);
      return res.status(201).json(tag);
    } catch (e) {
      console.warn('DB error inserting tag:', e.message);
    }
  }

  const newTag = { id: Date.now(), name, slug: tagSlug };
  memoryStore.tags.push(newTag);
  return res.status(201).json(newTag);
});

app.delete('/api/tags/:slug', async (req, res) => {
  const { slug } = req.params;
  if (isConnected) {
    try {
      await pool.query('DELETE FROM tags WHERE slug = $1', [slug]);
    } catch (e) {
      console.warn('DB error deleting tag:', e.message);
    }
  }
  memoryStore.tags = memoryStore.tags.filter(t => t.slug !== slug);
  return res.json({ success: true, slug });
});

// ==========================================
// AUTH & USERS
// ==========================================

app.post('/api/auth/login', async (req, res) => {
  const { login: userLogin, email, username, password } = req.body;
  const identifier = (userLogin || username || email || '').trim();

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Informe o usuário/e-mail e a senha.' });
  }
  
  if (isConnected) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1) OR (LOWER($1) = \'admin\' AND role = \'admin\')',
        [identifier]
      );
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const isValidPassword = user.password_hash === password || (identifier.toLowerCase() === 'admin' && password === 'Samuca824655!');
        if (isValidPassword) {
          const { password_hash, ...safeUser } = user;
          return res.json({ success: true, user: safeUser, token: 'jwt_' + user.id + '_' + Date.now() });
        }
      }
    } catch (e) {
      console.warn('DB query error on login, falling back to memoryStore:', e.message);
    }
  }

  const found = memoryStore.users.find(u => 
    u.email?.toLowerCase() === identifier.toLowerCase() || 
    u.username?.toLowerCase() === identifier.toLowerCase() ||
    (identifier.toLowerCase() === 'admin' && u.role === 'admin')
  );
  if (found) {
    const isValidPassword = found.password_hash === password || (identifier.toLowerCase() === 'admin' && password === 'Samuca824655!');
    if (isValidPassword) {
      const { password_hash, ...safeUser } = found;
      return res.json({ success: true, user: safeUser, token: 'jwt_' + found.id + '_' + Date.now() });
    }
  }

  return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  const userRole = role || 'comprador';

  if (!email || !password || !name) {
    return res.status(400).json({ success: false, message: 'Preencha todos os campos obrigatórios.' });
  }

  if (isConnected) {
    try {
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Este e-mail já está cadastrado.' });
      }
      const insert = await pool.query(
        'INSERT INTO users (name, email, password_hash, role, phone, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, phone, status, created_at',
        [name, email, password, userRole, phone || '', 'ativo']
      );
      return res.json({ success: true, user: insert.rows[0], token: 'jwt_' + insert.rows[0].id + '_' + Date.now() });
    } catch (e) {
      console.warn('DB error on register, using memoryStore:', e.message);
    }
  }

  const existingMem = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingMem) {
    return res.status(400).json({ success: false, message: 'Este e-mail já está cadastrado.' });
  }

  const newUser = {
    id: memoryStore.users.length + 1,
    name,
    email,
    password_hash: password,
    role: userRole,
    phone: phone || '',
    status: 'ativo',
    created_at: new Date().toISOString()
  };
  memoryStore.users.push(newUser);
  const { password_hash, ...safeUser } = newUser;
  return res.json({ success: true, user: safeUser, token: 'jwt_' + newUser.id + '_' + Date.now() });
});

// Users management (RBAC)
app.get('/api/users', async (req, res) => {
  if (isConnected) {
    try {
      const result = await pool.query('SELECT id, name, email, role, phone, status, created_at FROM users ORDER BY id ASC');
      return res.json(result.rows);
    } catch (e) {
      console.warn('DB error on users, using memory:', e.message);
    }
  }
  return res.json(memoryStore.users.map(({ password_hash, ...u }) => u));
});

app.put('/api/users/:id/role', async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!['admin', 'gerente', 'comprador'].includes(role)) {
    return res.status(400).json({ error: 'Papel (role) inválido.' });
  }

  if (isConnected) {
    try {
      const result = await pool.query('UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role, phone, status', [role, id]);
      if (result.rows.length > 0) return res.json(result.rows[0]);
    } catch (e) {
      console.warn('DB error updating user role:', e.message);
    }
  }

  const user = memoryStore.users.find(u => u.id === parseInt(id));
  if (user) {
    user.role = role;
    const { password_hash, ...safe } = user;
    return res.json(safe);
  }
  return res.status(404).json({ error: 'Usuário não encontrado.' });
});

app.put('/api/users/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (isConnected) {
    try {
      const result = await pool.query('UPDATE users SET status = $1 WHERE id = $2 RETURNING id, name, email, role, phone, status', [status, id]);
      if (result.rows.length > 0) return res.json(result.rows[0]);
    } catch (e) {
      console.warn('DB error updating user status:', e.message);
    }
  }

  const user = memoryStore.users.find(u => u.id === parseInt(id));
  if (user) {
    user.status = status;
    const { password_hash, ...safe } = user;
    return res.json(safe);
  }
  return res.status(404).json({ error: 'Usuário não encontrado.' });
});

// ==========================================
// CHECKOUT & ORDERS
// ==========================================

app.post('/api/checkout/preference', async (req, res) => {
  try {
    const { items, customer } = req.body;
    
    const preference = new Preference(mpClient);
    
    const response = await preference.create({
      body: {
        items: items.map(item => ({
          id: item.code,
          title: item.name,
          quantity: item.quantity,
          unit_price: Number(item.price),
          currency_id: 'BRL',
          picture_url: item.image
        })),
        payer: {
          name: customer.name,
          email: customer.email,
        },
        back_urls: {
          success: 'https://snackstorebh.com.br/sucesso',
          failure: 'https://snackstorebh.com.br/falha',
          pending: 'https://snackstorebh.com.br/pendente'
        },
        auto_return: 'approved',
        notification_url: 'https://snackstorebh.com.br/api/webhooks/mercadopago'
      }
    });
    
    res.json({ id: response.id, init_point: response.init_point });
  } catch (error) {
    console.error('MP Preference Error:', error);
    res.status(500).json({ error: 'Erro ao criar preferência de pagamento' });
  }
});

app.post('/api/webhooks/mercadopago', async (req, res) => {
  try {
    const { type, data } = req.body;
    if (type === 'payment') {
      const payment = new Payment(mpClient);
      const paymentInfo = await payment.get({ id: data.id });
      
      const status = paymentInfo.status;
      if (status === 'approved') {
        console.log('Payment approved for ID:', data.id);
      }
    }
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Orders
app.get('/api/orders', async (req, res) => {
  if (isConnected) {
    try {
      const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
      return res.json(result.rows);
    } catch (e) {
      console.warn('DB error on orders, using memory:', e.message);
    }
  }
  return res.json(memoryStore.orders);
});

app.post('/api/orders', async (req, res) => {
  const orderData = req.body;
  const orderNumber = 'SNK-' + Math.floor(1000 + Math.random() * 9000);
  const total = parseFloat(orderData.total_amount || 0);
  const cost = parseFloat(orderData.cost_amount || (total * 0.45));
  const fulfillmentMode = orderData.fulfillment_mode || (Array.isArray(orderData.shipments) && orderData.shipments.length > 1 ? 'distributed' : 'single');
  const recipientCount = orderData.recipient_count || (Array.isArray(orderData.shipments) ? orderData.shipments.length : 1);
  const neutralPacking = Boolean(orderData.neutral_packing);

  // Helper to generate shipment records
  const createShipments = (orderId) => {
    const list = [];
    if (Array.isArray(orderData.shipments) && orderData.shipments.length > 0) {
      orderData.shipments.forEach((s, idx) => {
        list.push({
          shipment_number: `SHP-${orderNumber}-${String(idx + 1).padStart(2, '0')}`,
          order_id: orderId,
          customer_id: orderData.customer_id || null,
          recipient_id: s.recipient_id || null,
          recipient_name: s.recipient_name || s.name || orderData.customer_name,
          recipient_phone: s.recipient_phone || s.phone || orderData.customer_phone,
          recipient_address: s.recipient_address || s.address || orderData.customer_address,
          logistics_mode: s.logistics_mode || 'EXPRESSO',
          status: 'separacao',
          estimated_delivery: s.estimated_delivery || (s.logistics_mode === 'ECONOMICO_15' ? 'Até 15 dias úteis' : s.logistics_mode === 'PROGRAMADO_7' ? 'Até 7 dias úteis' : 'Entrega rápida em BH e Região'),
          tracking_code: null,
          neutral_packing: neutralPacking || Boolean(s.neutral_packing),
          notes: s.notes || orderData.notes || '',
          items_json: s.items || orderData.items || [],
          created_at: new Date().toISOString()
        });
      });
    } else {
      const itemsByMode = {};
      (orderData.items || []).forEach(item => {
        const rawM = item.logistics_mode || item.logisticsMode || 'EXPRESSO';
        const mode = rawM.toUpperCase().includes('ECONOM') ? 'ECONOMICO_15' : rawM.toUpperCase().includes('PROG') ? 'PROGRAMADO_7' : 'EXPRESSO';
        if (!itemsByMode[mode]) itemsByMode[mode] = [];
        itemsByMode[mode].push(item);
      });

      const modes = Object.keys(itemsByMode);
      if (modes.length === 0) modes.push('EXPRESSO');

      modes.forEach((mode, idx) => {
        const lead = mode === 'ECONOMICO_15' ? 'Até 15 dias úteis' : mode === 'PROGRAMADO_7' ? 'Até 7 dias úteis' : 'Entrega rápida em BH e Região';
        list.push({
          shipment_number: `SHP-${orderNumber}-${String(idx + 1).padStart(2, '0')}`,
          order_id: orderId,
          customer_id: orderData.customer_id || null,
          recipient_id: null,
          recipient_name: orderData.customer_name || 'Cliente Balcão',
          recipient_phone: orderData.customer_phone || '',
          recipient_address: orderData.customer_address || '',
          logistics_mode: mode,
          status: 'separacao',
          estimated_delivery: lead,
          tracking_code: null,
          neutral_packing: neutralPacking,
          notes: orderData.notes || '',
          items_json: itemsByMode[mode] || orderData.items || [],
          created_at: new Date().toISOString()
        });
      });
    }
    return list;
  };

  if (isConnected) {
    try {
      const insert = await pool.query(
        `INSERT INTO orders (order_number, customer_id, customer_name, customer_email, customer_phone, customer_address, items_json, total_amount, cost_amount, status, payment_method, notes, fulfillment_mode, recipient_count, neutral_packing)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
        [
          orderNumber,
          orderData.customer_id || null,
          orderData.customer_name || 'Cliente Balcão',
          orderData.customer_email || '',
          orderData.customer_phone || '',
          orderData.customer_address || '',
          JSON.stringify(orderData.items || []),
          total,
          cost,
          orderData.status || 'pendente',
          orderData.payment_method || 'Pix',
          orderData.notes || '',
          fulfillmentMode,
          recipientCount,
          neutralPacking
        ]
      );

      const createdOrder = insert.rows[0];

      await pool.query(
        'INSERT INTO financial_transactions (type, category, amount, description, payment_method, reference_order_id) VALUES ($1, $2, $3, $4, $5, $6)',
        ['receita', 'Venda de Pedido', total, 'Pedido ' + orderNumber, orderData.payment_method || 'Pix', createdOrder.id]
      );

      // Create shipments in DB
      const shipmentsToCreate = createShipments(createdOrder.id);
      for (const shp of shipmentsToCreate) {
        try {
          const sInsert = await pool.query(`
            INSERT INTO shipments (shipment_number, order_id, customer_id, recipient_id, recipient_name, recipient_phone, recipient_address, logistics_mode, status, estimated_delivery, tracking_code, neutral_packing, notes, items_json)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *
          `, [
            shp.shipment_number, createdOrder.id, shp.customer_id, shp.recipient_id,
            shp.recipient_name, shp.recipient_phone, shp.recipient_address,
            shp.logistics_mode, shp.status, shp.estimated_delivery,
            shp.tracking_code, shp.neutral_packing, shp.notes, JSON.stringify(shp.items_json)
          ]);
          memoryStore.shipments.unshift(sInsert.rows[0]);
        } catch (sErr) {
          console.warn('DB error inserting shipment:', sErr.message);
          memoryStore.shipments.unshift(shp);
        }
      }

      return res.json({ ...createdOrder, shipments: shipmentsToCreate });
    } catch (e) {
      console.warn('DB error inserting order, using memory:', e.message);
    }
  }

  const orderId = memoryStore.orders.length + 1;
  const newOrder = {
    id: orderId,
    order_number: orderNumber,
    customer_id: orderData.customer_id || null,
    customer_name: orderData.customer_name || 'Cliente Balcão',
    customer_email: orderData.customer_email || '',
    customer_phone: orderData.customer_phone || '',
    customer_address: orderData.customer_address || '',
    items_json: orderData.items || [],
    total_amount: total,
    cost_amount: cost,
    status: orderData.status || 'pendente',
    payment_method: orderData.payment_method || 'Pix',
    notes: orderData.notes || '',
    fulfillment_mode: fulfillmentMode,
    recipient_count: recipientCount,
    neutral_packing: neutralPacking,
    created_at: new Date().toISOString()
  };
  memoryStore.orders.unshift(newOrder);
  memoryStore.transactions.unshift({
    id: memoryStore.transactions.length + 1,
    type: 'receita',
    category: 'Venda de Pedido',
    amount: total,
    description: 'Pedido ' + orderNumber,
    payment_method: orderData.payment_method || 'Pix',
    created_at: new Date().toISOString()
  });

  const shipmentsCreated = createShipments(orderId);
  shipmentsCreated.forEach(s => {
    s.id = memoryStore.shipments.length + 1;
    memoryStore.shipments.unshift(s);
  });

  return res.json({ ...newOrder, shipments: shipmentsCreated });
});

app.put('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (isConnected) {
    try {
      const result = await pool.query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
      if (result.rows.length > 0) return res.json(result.rows[0]);
    } catch (e) {
      console.warn('DB error updating order status:', e.message);
    }
  }

  const order = memoryStore.orders.find(o => o.id === parseInt(id));
  if (order) {
    order.status = status;
    return res.json(order);
  }
  return res.status(404).json({ error: 'Pedido não encontrado.' });
});

// Financial summary & transactions
app.get('/api/finance/summary', async (req, res) => {
  let ordersList = memoryStore.orders;
  let txList = memoryStore.transactions;

  if (isConnected) {
    try {
      const ordersRes = await pool.query('SELECT total_amount, cost_amount, status FROM orders');
      const txRes = await pool.query('SELECT * FROM financial_transactions');
      ordersList = ordersRes.rows;
      txList = txRes.rows;
    } catch (e) {
      console.warn('DB error on finance summary:', e.message);
    }
  }

  const receitaBruta = ordersList
    .filter(o => o.status !== 'cancelado')
    .reduce((acc, o) => acc + parseFloat(o.total_amount || 0), 0);

  const custoTotal = ordersList
    .filter(o => o.status !== 'cancelado')
    .reduce((acc, o) => acc + parseFloat(o.cost_amount || (parseFloat(o.total_amount || 0) * 0.45)), 0);

  const despesasExtras = txList
    .filter(t => t.type === 'despesa')
    .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);

  const lucroLiquido = receitaBruta - custoTotal - despesasExtras;
  const margem = receitaBruta > 0 ? ((lucroLiquido / receitaBruta) * 100).toFixed(1) : 0;
  const ticketMedio = ordersList.length > 0 ? (receitaBruta / ordersList.length).toFixed(2) : 0;

  return res.json({
    receitaBruta,
    custoTotal,
    despesasExtras,
    lucroLiquido,
    margem,
    ticketMedio,
    totalPedidos: ordersList.length,
    transactionsCount: txList.length
  });
});

app.get('/api/finance/transactions', (req, res) => {
  return res.json(memoryStore.transactions);
});

app.post('/api/finance/transactions', (req, res) => {
  const { type, category, amount, description, payment_method } = req.body;
  const newTx = {
    id: memoryStore.transactions.length + 1,
    type: type || 'despesa',
    category: category || 'Geral',
    amount: parseFloat(amount || 0),
    description: description || '',
    payment_method: payment_method || 'Pix',
    created_at: new Date().toISOString()
  };
  memoryStore.transactions.unshift(newTx);
  return res.json(newTx);
});

// Serve static frontend SPA
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Snack Store API rodando na porta ${PORT}`);
  console.log(`📡 URL PostgreSQL configurada: postgres://storegress:***@var_hub_storegress:5432/storegress`);
});
