// API client with transparent resilience & local sync engine
import { perfumes as initialPerfumes } from '../perfumesData.js';

const STORAGE_KEYS = {
  PRODUCTS: 'snack_store_products',
  CATEGORIES: 'snack_store_categories',
  TAGS: 'snack_store_tags',
  ORDERS: 'snack_store_orders',
  TRANSACTIONS: 'snack_store_transactions',
  USERS: 'snack_store_users',
  AUTH_USER: 'snack_store_auth_user',
  TOKEN: 'snack_store_token'
};

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Todos os Perfumes', slug: 'mini-perfumes-25ml', description: 'Coleção completa de miniaturas de perfumes importados 25ml' },
  { id: 2, name: 'Brand Collection', slug: 'brand-collection', description: 'Fragrâncias inspiradas nos perfumes mais famosos do mundo' },
  { id: 3, name: 'Arabic Collection', slug: 'perfumes-arabes', description: 'Perfumes árabes originais Lattafa, Armaf, Afnan e mais' },
  { id: 4, name: 'Femininos', slug: 'perfumes-femininos', description: 'Mini perfumes importados para mulheres elegantes' },
  { id: 5, name: 'Masculinos', slug: 'perfumes-masculinos', description: 'Miniaturas masculinas com notas marcantes' },
  { id: 6, name: 'Unissex', slug: 'mini-perfumes-unissex', description: 'Fragrâncias compartilháveis sofisticadas' },
  { id: 7, name: 'Para Presente', slug: 'mini-perfumes-para-presente', description: 'Opções ideais de perfumes para presentear' },
  { id: 8, name: 'Em BH', slug: 'mini-perfumes-em-bh', description: 'Miniaturas com pronta entrega e frete rápido em BH' }
];

const DEFAULT_TAGS = [
  { id: 1, name: 'Mais Vendido', slug: 'mais-vendido' },
  { id: 2, name: 'Lançamento', slug: 'lancamento' },
  { id: 3, name: 'Novidade', slug: 'novidade' },
  { id: 4, name: 'Fixação 12h', slug: 'fixacao-12h' },
  { id: 5, name: 'Importado Original', slug: 'importado-original' },
  { id: 6, name: 'Promoção', slug: 'promocao' },
  { id: 7, name: 'Pronta Entrega', slug: 'pronta-entrega' },
  { id: 8, name: 'Exclusivo', slug: 'exclusivo' }
];

// Seed initial data if not present in localStorage
function initLocalStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    const seeded = initialPerfumes.map(p => ({
      ...p,
      cost_price: p.cost_price || Math.round(p.price * 0.45 * 100) / 100,
      stock: typeof p.stock === 'number' ? p.stock : 10,
      min_stock: p.min_stock || 5,
      is_active: p.is_active !== undefined ? p.is_active : true,
      images: Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image ? [p.image] : ['/perfumes/200.webp']),
      tags: Array.isArray(p.tags) ? p.tags : []
    }));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(seeded));
  }

  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
  }

  if (!localStorage.getItem(STORAGE_KEYS.TAGS)) {
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(DEFAULT_TAGS));
  }

  const defaultAdmin = { id: 1, name: 'Administrador Snack Store', username: 'admin', email: 'admin@snackstorebh.com.br', password: 'Samuca824655!', role: 'admin', phone: '553175650503', status: 'ativo', created_at: new Date().toISOString() };
  const currentUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  const adminIndex = currentUsers.findIndex(u => u.role === 'admin' || u.username === 'admin' || u.email === 'admin@snackstorebh.com.br');
  if (adminIndex !== -1) {
    currentUsers[adminIndex] = { ...currentUsers[adminIndex], username: 'admin', password: 'Samuca824655!' };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(currentUsers));
  } else {
    const defaultUsers = [
      defaultAdmin,
      { id: 2, name: 'Gerente de Operações', username: 'gerente', email: 'gerente@snackstorebh.com.br', password: 'gerente123', role: 'gerente', phone: '553175650503', status: 'ativo', created_at: new Date().toISOString() },
      { id: 3, name: 'Lucas Comprador', username: 'cliente', email: 'cliente@snackstorebh.com.br', password: 'cliente123', role: 'comprador', phone: '5531988776655', status: 'ativo', created_at: new Date().toISOString() }
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    const defaultOrders = [
      {
        id: 1,
        order_number: 'SNK-9021',
        customer_id: 3,
        customer_name: 'Lucas Comprador',
        customer_email: 'cliente@snackstorebh.com.br',
        customer_phone: '5531988776655',
        customer_address: 'Rua da Bahia, 1200 - Lourdes, Belo Horizonte - MG',
        items: [
          { code: 'A001', name: 'Perfume Lattafa Asad 25ml', price: 79.90, cost_price: 38.00, quantity: 2, volume: '25ml' },
          { code: 'A002', name: 'Perfume Lattafa Yara 25ml', price: 79.90, cost_price: 38.00, quantity: 1, volume: '25ml' }
        ],
        total_amount: 239.70,
        cost_amount: 114.00,
        status: 'pago',
        payment_method: 'Pix',
        notes: 'Entregar na portaria até as 18h.',
        created_at: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: 2,
        order_number: 'SNK-9022',
        customer_id: null,
        customer_name: 'Mariana Silva',
        customer_email: 'mariana.silva@gmail.com',
        customer_phone: '5531991223344',
        customer_address: 'Av. Afonso Pena, 3000 - Funcionários, BH',
        items: [
          { code: 'A003', name: 'Perfume Lattafa Yara Tous Laranja 25ml', price: 79.90, cost_price: 38.00, quantity: 1, volume: '25ml' }
        ],
        total_amount: 79.90,
        cost_amount: 38.00,
        status: 'separacao',
        payment_method: 'Cartão de Crédito',
        notes: 'Presente de aniversário',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(defaultOrders));
  }

  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    const defaultTx = [
      { id: 1, type: 'receita', category: 'Venda de Pedido', amount: 239.70, description: 'Pedido SNK-9021', payment_method: 'Pix', created_at: new Date(Date.now() - 3600000 * 5).toISOString() },
      { id: 2, type: 'receita', category: 'Venda de Pedido', amount: 79.90, description: 'Pedido SNK-9022', payment_method: 'Cartão de Crédito', created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
      { id: 3, type: 'despesa', category: 'Embalagens & Envio', amount: 55.00, description: 'Caixas rígidas e fitas personalizadas', payment_method: 'Pix', created_at: new Date(Date.now() - 86400000).toISOString() }
    ];
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(defaultTx));
  }
}

initLocalStorage();

// Helper to fetch with fallback
async function fetchSafe(url, options = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export const apiService = {
  // DB status check
  async getDbStatus() {
    const remote = await fetchSafe('/api/status/db');
    if (remote) return remote;
    return {
      connected: false,
      host: 'var_hub_storegress:5432',
      url: 'postgres://storegress:***@var_hub_storegress:5432/storegress?sslmode=disable',
      database: 'storegress',
      mode: 'Híbrido Sincronizado (Local / Docker Host)'
    };
  },

  // Auth
  async login(identifier, password) {
    const remote = await fetchSafe('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login: identifier, password })
    });

    if (remote && remote.success) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(remote.user));
        localStorage.setItem(STORAGE_KEYS.TOKEN, remote.token);
      }
      return remote;
    }

    if (typeof window !== 'undefined') {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const found = users.find(u => 
        (u.email?.toLowerCase() === identifier.toLowerCase() || u.username?.toLowerCase() === identifier.toLowerCase()) && 
        u.password === password
      );

      if (found) {
        const { password: _, ...safeUser } = found;
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(safeUser));
        localStorage.setItem(STORAGE_KEYS.TOKEN, 'local_jwt_' + safeUser.id);
        return { success: true, user: safeUser, token: 'local_jwt_' + safeUser.id };
      }
    }

    throw new Error(remote?.message || 'Usuário ou senha incorretos.');
  },

  async register(data) {
    const remote = await fetchSafe('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (remote && remote.success) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(remote.user));
        localStorage.setItem(STORAGE_KEYS.TOKEN, remote.token);
      }
      return remote;
    }

    if (typeof window !== 'undefined') {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
        throw new Error('E-mail já cadastrado.');
      }
      const newUser = {
        id: users.length + 1,
        name: data.name,
        email: data.email,
        username: data.username || data.email.split('@')[0],
        password: data.password,
        phone: data.phone || '',
        role: data.role || 'comprador',
        status: 'ativo',
        created_at: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      const { password: _, ...safeUser } = newUser;
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(safeUser));
      localStorage.setItem(STORAGE_KEYS.TOKEN, 'local_jwt_' + safeUser.id);
      return { success: true, user: safeUser, token: 'local_jwt_' + safeUser.id };
    }

    throw new Error('Falha ao cadastrar usuário.');
  },

  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    return raw ? JSON.parse(raw) : null;
  },

  logout() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  // Users management
  async getUsers() {
    const remote = await fetchSafe('/api/users');
    if (remote && Array.isArray(remote)) {
      return remote;
    }
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  },

  async updateUserRole(id, role) {
    const remote = await fetchSafe(`/api/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
    if (typeof window !== 'undefined') {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const updated = users.map(u => u.id === id ? { ...u, role } : u);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));

      const current = this.getCurrentUser();
      if (current && current.id === id) {
        current.role = role;
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(current));
      }
    }
    return remote;
  },

  async updateUserStatus(id, status) {
    const remote = await fetchSafe(`/api/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    if (typeof window !== 'undefined') {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const updated = users.map(u => u.id === id ? { ...u, status } : u);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
    }
    return remote;
  },

  // ==========================================
  // PRODUCTS (FULL SYNC WITH BACKEND & STORAGE)
  // ==========================================

  getStoredProducts() {
    if (typeof window === 'undefined') return initialPerfumes;
    const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        return initialPerfumes;
      }
    }
    return initialPerfumes;
  },

  async getProducts() {
    // Try remote server first
    const remote = await fetchSafe('/api/products');
    if (remote && Array.isArray(remote) && remote.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(remote));
      }
      return remote;
    }
    return this.getStoredProducts();
  },

  async addProduct(newProduct) {
    // Save to server
    const remote = await fetchSafe('/api/products', {
      method: 'POST',
      body: JSON.stringify(newProduct)
    });

    const created = remote || {
      ...newProduct,
      id: Date.now(),
      code: newProduct.code || 'SKU-' + Math.floor(1000 + Math.random() * 9000),
      slug: newProduct.slug || (newProduct.name ? newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'perfume'),
      price: parseFloat(newProduct.price) || 0,
      cost_price: parseFloat(newProduct.cost_price) || 0,
      stock: parseInt(newProduct.stock) || 0,
      min_stock: parseInt(newProduct.min_stock) || 5,
      is_active: newProduct.is_active !== undefined ? newProduct.is_active : true,
      image: newProduct.image || (newProduct.images && newProduct.images[0]) || '/perfumes/200.webp',
      images: Array.isArray(newProduct.images) && newProduct.images.length > 0 ? newProduct.images : [newProduct.image || '/perfumes/200.webp'],
      tags: Array.isArray(newProduct.tags) ? newProduct.tags : [],
      categorySlugs: newProduct.categorySlugs || ['mini-perfumes-25ml']
    };

    if (typeof window !== 'undefined') {
      const current = this.getStoredProducts();
      const updated = [created, ...current.filter(p => p.code !== created.code)];
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    }

    return created;
  },

  async updateProduct(code, data) {
    const remote = await fetchSafe(`/api/products/${code}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });

    if (typeof window !== 'undefined') {
      const current = this.getStoredProducts();
      const index = current.findIndex(p => p.code === code);
      if (index !== -1) {
        current[index] = {
          ...current[index],
          ...data,
          ...(remote || {}),
          price: data.price !== undefined ? parseFloat(data.price) : current[index].price,
          cost_price: data.cost_price !== undefined ? parseFloat(data.cost_price) : current[index].cost_price,
          stock: data.stock !== undefined ? parseInt(data.stock) : current[index].stock
        };
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(current));
        return current[index];
      }
    }
    return remote;
  },

  async deleteProduct(code) {
    await fetchSafe(`/api/products/${code}`, { method: 'DELETE' });
    if (typeof window !== 'undefined') {
      const current = this.getStoredProducts().filter(p => p.code !== code);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(current));
    }
    return true;
  },

  async adjustStock(code, delta) {
    const remote = await fetchSafe(`/api/products/${code}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ delta })
    });

    if (typeof window !== 'undefined') {
      const current = this.getStoredProducts();
      const item = current.find(p => p.code === code);
      if (item) {
        item.stock = remote ? remote.stock : Math.max(0, (item.stock || 0) + delta);
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(current));
        return item.stock;
      }
    }
    return remote?.stock || null;
  },

  // ==========================================
  // BULK UPLOAD IMAGES
  // ==========================================

  async uploadImages(base64Images) {
    const res = await fetchSafe('/api/upload', {
      method: 'POST',
      body: JSON.stringify({ images: base64Images })
    });
    if (res && res.urls) return res.urls;
    // Fallback: return base64 data directly if server upload failed
    return base64Images;
  },

  // ==========================================
  // CATEGORIES & TAGS
  // ==========================================

  async getCategories() {
    const remote = await fetchSafe('/api/categories');
    if (remote && Array.isArray(remote) && remote.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(remote));
      }
      return remote;
    }
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || JSON.stringify(DEFAULT_CATEGORIES));
    }
    return DEFAULT_CATEGORIES;
  },

  async addCategory(data) {
    const remote = await fetchSafe('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    const created = remote || {
      id: Date.now(),
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: data.description || ''
    };
    if (typeof window !== 'undefined') {
      const cats = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
      const updated = [...cats.filter(c => c.slug !== created.slug), created];
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    }
    return created;
  },

  async deleteCategory(slug) {
    await fetchSafe(`/api/categories/${slug}`, { method: 'DELETE' });
    if (typeof window !== 'undefined') {
      const cats = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats.filter(c => c.slug !== slug)));
    }
    return true;
  },

  async getTags() {
    const remote = await fetchSafe('/api/tags');
    if (remote && Array.isArray(remote) && remote.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(remote));
      }
      return remote;
    }
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.TAGS) || JSON.stringify(DEFAULT_TAGS));
    }
    return DEFAULT_TAGS;
  },

  async addTag(data) {
    const remote = await fetchSafe('/api/tags', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    const created = remote || {
      id: Date.now(),
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    };
    if (typeof window !== 'undefined') {
      const tags = JSON.parse(localStorage.getItem(STORAGE_KEYS.TAGS) || '[]');
      const updated = [...tags.filter(t => t.slug !== created.slug), created];
      localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(updated));
    }
    return created;
  },

  async deleteTag(slug) {
    await fetchSafe(`/api/tags/${slug}`, { method: 'DELETE' });
    if (typeof window !== 'undefined') {
      const tags = JSON.parse(localStorage.getItem(STORAGE_KEYS.TAGS) || '[]');
      localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags.filter(t => t.slug !== slug)));
    }
    return true;
  },

  // ==========================================
  // ORDERS & FINANCE
  // ==========================================

  async getOrders() {
    const remote = await fetchSafe('/api/orders');
    if (remote && Array.isArray(remote)) {
      return remote;
    }
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
  },

  async createOrder(orderData) {
    const remote = await fetchSafe('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
    if (remote) return remote;

    if (typeof window !== 'undefined') {
      const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
      const total = parseFloat(orderData.total_amount || 0);
      const cost = parseFloat(orderData.cost_amount || (total * 0.45));
      const newOrder = {
        id: orders.length + 1,
        order_number: 'SNK-' + Math.floor(1000 + Math.random() * 9000),
        customer_id: orderData.customer_id || null,
        customer_name: orderData.customer_name || 'Cliente Balcão',
        customer_email: orderData.customer_email || '',
        customer_phone: orderData.customer_phone || '',
        customer_address: orderData.customer_address || '',
        items: orderData.items || [],
        total_amount: total,
        cost_amount: cost,
        status: orderData.status || 'pendente',
        payment_method: orderData.payment_method || 'Pix',
        notes: orderData.notes || '',
        created_at: new Date().toISOString()
      };
      orders.unshift(newOrder);
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

      const tx = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
      tx.unshift({
        id: tx.length + 1,
        type: 'receita',
        category: 'Venda de Pedido',
        amount: total,
        description: 'Pedido ' + newOrder.order_number,
        payment_method: orderData.payment_method || 'Pix',
        created_at: new Date().toISOString()
      });
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(tx));

      if (orderData.items && Array.isArray(orderData.items)) {
        orderData.items.forEach(item => {
          if (item.code && item.quantity) {
            this.adjustStock(item.code, -item.quantity);
          }
        });
      }

      return newOrder;
    }
    return null;
  },

  async updateOrderStatus(id, status) {
    await fetchSafe(`/api/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    if (typeof window !== 'undefined') {
      const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
      const updated = orders.map(o => o.id === id ? { ...o, status } : o);
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
      return updated.find(o => o.id === id);
    }
    return null;
  },

  async getFinanceSummary() {
    const remote = await fetchSafe('/api/finance/summary');
    if (remote) return remote;

    if (typeof window === 'undefined') return {};
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    const tx = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');

    const receitaBruta = orders
      .filter(o => o.status !== 'cancelado')
      .reduce((acc, o) => acc + (parseFloat(o.total_amount) || 0), 0);

    const custoTotal = orders
      .filter(o => o.status !== 'cancelado')
      .reduce((acc, o) => acc + (parseFloat(o.cost_amount) || (parseFloat(o.total_amount) * 0.45)), 0);

    const despesasExtras = tx
      .filter(t => t.type === 'despesa')
      .reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);

    const lucroLiquido = receitaBruta - custoTotal - despesasExtras;
    const margem = receitaBruta > 0 ? ((lucroLiquido / receitaBruta) * 100).toFixed(1) : 0;
    const ticketMedio = orders.length > 0 ? (receitaBruta / orders.length).toFixed(2) : 0;

    return {
      receitaBruta,
      custoTotal,
      despesasExtras,
      lucroLiquido,
      margem,
      ticketMedio,
      totalPedidos: orders.length,
      transactionsCount: tx.length
    };
  },

  async getTransactions() {
    const remote = await fetchSafe('/api/finance/transactions');
    if (remote && Array.isArray(remote)) return remote;
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
  },

  async addTransaction(data) {
    if (typeof window === 'undefined') return null;
    const tx = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    const newTx = {
      id: tx.length + 1,
      type: data.type || 'despesa',
      category: data.category || 'Geral',
      amount: parseFloat(data.amount || 0),
      description: data.description || '',
      payment_method: data.payment_method || 'Pix',
      created_at: new Date().toISOString()
    };
    tx.unshift(newTx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(tx));
    return newTx;
  }
};
