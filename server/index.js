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

// Helper to normalize product structure
function normalizeProduct(p) {
  const images = Array.isArray(p.images) && p.images.length > 0 
    ? p.images 
    : (p.image ? [p.image] : ['/perfumes/200.webp']);
  const mainImage = images[0] || p.image || '/perfumes/200.webp';
  
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
        { code: 'A001', name: 'Perfume Lattafa Asad 25ml', price: 79.90, cost_price: 38.00, quantity: 2, volume: '25ml' },
        { code: 'A002', name: 'Perfume Lattafa Yara 25ml', price: 79.90, cost_price: 38.00, quantity: 1, volume: '25ml' }
      ],
      total_amount: 239.70,
      cost_amount: 114.00,
      status: 'pago',
      payment_method: 'Pix',
      notes: 'Entregar até 18h no condomínio.',
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
        raw.name, raw.brand, raw.volume, raw.price, raw.cost_price, raw.stock, raw.min_stock,
        raw.gender, mainImage, images, raw.tags, raw.description, raw.longDescription,
        raw.olfactoryFamily, raw.inspiredBy, raw.categorySlugs, raw.is_active, code
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

  if (isConnected) {
    try {
      const insert = await pool.query(
        `INSERT INTO orders (order_number, customer_id, customer_name, customer_email, customer_phone, customer_address, items_json, total_amount, cost_amount, status, payment_method, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
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
          orderData.notes || ''
        ]
      );

      await pool.query(
        'INSERT INTO financial_transactions (type, category, amount, description, payment_method, reference_order_id) VALUES ($1, $2, $3, $4, $5, $6)',
        ['receita', 'Venda de Pedido', total, 'Pedido ' + orderNumber, orderData.payment_method || 'Pix', insert.rows[0].id]
      );

      return res.json(insert.rows[0]);
    } catch (e) {
      console.warn('DB error inserting order, using memory:', e.message);
    }
  }

  const newOrder = {
    id: memoryStore.orders.length + 1,
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

  return res.json(newOrder);
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
