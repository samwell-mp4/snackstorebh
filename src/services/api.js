// API client with transparent resilience & local sync engine
import { perfumes as initialPerfumes } from '../perfumesData.js';

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

const STORAGE_KEYS = {
  PRODUCTS: 'snack_store_products',
  CATEGORIES: 'snack_store_categories',
  TAGS: 'snack_store_tags',
  ORDERS: 'snack_store_orders',
  TRANSACTIONS: 'snack_store_transactions',
  USERS: 'snack_store_users',
  AUTH_USER: 'snack_store_auth_user',
  TOKEN: 'snack_store_token',
  RECIPIENTS: 'snack_store_recipients',
  SHIPMENTS: 'snack_store_shipments',
  LOGISTICS_SETTINGS: 'snack_store_logistics_settings'
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
    // Ensure revendedor exists in currentUsers
    if (!currentUsers.some(u => u.role === 'revendedor')) {
      currentUsers.push({
        id: Math.max(...currentUsers.map(u => u.id || 0)) + 1,
        name: 'Camila Revendedora VIP',
        username: 'revendedor',
        email: 'revendedor@snackstorebh.com.br',
        password: 'revenda123',
        role: 'revendedor',
        phone: '5531998765432',
        status: 'ativo',
        created_at: new Date().toISOString()
      });
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(currentUsers));
  } else {
    const defaultUsers = [
      defaultAdmin,
      { id: 2, name: 'Gerente de Operações', username: 'gerente', email: 'gerente@snackstorebh.com.br', password: 'gerente123', role: 'gerente', phone: '553175650503', status: 'ativo', created_at: new Date().toISOString() },
      { id: 3, name: 'Lucas Comprador', username: 'cliente', email: 'cliente@snackstorebh.com.br', password: 'cliente123', role: 'comprador', phone: '5531988776655', status: 'ativo', created_at: new Date().toISOString() },
      { id: 4, name: 'Camila Revendedora VIP', username: 'revendedor', email: 'revendedor@snackstorebh.com.br', password: 'revenda123', role: 'revendedor', phone: '5531998765432', status: 'ativo', created_at: new Date().toISOString() }
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

  if (!localStorage.getItem(STORAGE_KEYS.LOGISTICS_SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.LOGISTICS_SETTINGS, JSON.stringify({
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
    }));
  }

  if (!localStorage.getItem(STORAGE_KEYS.RECIPIENTS)) {
    localStorage.setItem(STORAGE_KEYS.RECIPIENTS, JSON.stringify([
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
    ]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.SHIPMENTS)) {
    localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify([
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
        notes: 'Entregar na portaria até as 18h.',
        items_json: [
          { code: 'A001', name: 'Perfume Lattafa Asad 25ml', price: 79.90, quantity: 2, volume: '25ml', logistics_mode: 'EXPRESSO' },
          { code: 'A002', name: 'Perfume Lattafa Yara 25ml', price: 79.90, quantity: 1, volume: '25ml', logistics_mode: 'EXPRESSO' }
        ],
        created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
        updated_at: new Date().toISOString()
      }
    ]));
  }

  // Ensure stored products have logistics_config
  try {
    const rawProds = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    let changed = false;
    const enriched = rawProds.map(p => {
      if (!p.logistics_config) {
        changed = true;
        return {
          ...p,
          logistics_config: getDefaultLogistics(p.price, p.stock),
          logistics_updated_at: p.logistics_updated_at || new Date().toISOString(),
          logistics_updated_by: p.logistics_updated_by || 'Sistema'
        };
      }
      return p;
    });
    if (changed) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(enriched));
    }
  } catch (e) {}
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

  async createUser(data) {
    const remote = await fetchSafe('/api/users', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (remote && remote.success) {
      if (typeof window !== 'undefined') {
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
        if (!users.some(u => u.id === remote.user.id)) {
          users.push({ ...remote.user, password: data.password });
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        }
      }
      return remote;
    }

    if (typeof window !== 'undefined') {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
        return { success: false, message: 'E-mail já cadastrado.' };
      }
      const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id || 0)) + 1 : 1,
        name: data.name,
        email: data.email,
        username: data.username || data.email.split('@')[0],
        password: data.password,
        phone: data.phone || '',
        role: data.role || 'comprador',
        status: data.status || 'ativo',
        created_at: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      const { password: _, ...safeUser } = newUser;
      return { success: true, user: safeUser };
    }

    return { success: false, message: 'Falha ao cadastrar usuário.' };
  },

  async deleteUser(id) {
    const remote = await fetchSafe(`/api/users/${id}`, {
      method: 'DELETE'
    });
    if (typeof window !== 'undefined') {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const filtered = users.filter(u => u.id !== id);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
    }
    return remote || { success: true };
  },

  async resetUserPassword(id, password) {
    const remote = await fetchSafe(`/api/users/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ password })
    });
    if (typeof window !== 'undefined') {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const updated = users.map(u => u.id === id ? { ...u, password } : u);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
    }
    return remote || { success: true };
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

  async setProductStock(code, exactStock) {
    const stockNum = Math.max(0, parseInt(exactStock, 10) || 0);
    const remote = await fetchSafe(`/api/products/${code}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ stock: stockNum })
    });

    if (typeof window !== 'undefined') {
      const current = this.getStoredProducts();
      const item = current.find(p => p.code === code);
      if (item) {
        item.stock = remote?.stock !== undefined ? remote.stock : stockNum;
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(current));
        return item.stock;
      }
    }
    return remote?.stock !== undefined ? remote.stock : stockNum;
  },

  async bulkUpdateProducts(codes, updates) {
    const remote = await fetchSafe('/api/products/batch', {
      method: 'POST',
      body: JSON.stringify({ codes, updates })
    });

    if (typeof window !== 'undefined') {
      const current = this.getStoredProducts();
      const codesSet = new Set(codes);
      const updated = current.map(p => {
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
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
      return updated;
    }
    return remote;
  },

  async bulkDeleteProducts(codes) {
    await fetchSafe('/api/products/batch', {
      method: 'POST',
      body: JSON.stringify({ codes, action: 'delete' })
    });

    if (typeof window !== 'undefined') {
      const current = this.getStoredProducts();
      const codesSet = new Set(codes);
      const updated = current.filter(p => !codesSet.has(p.code));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
      return updated;
    }
    return true;
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
      const cost = parseFloat(orderData.cost_amount || (orderData.items ? orderData.items.reduce((acc, it) => acc + ((it.cost_price || it.price * 0.45) * (it.quantity || 1)), 0) : 0));
      const fulfillmentMode = orderData.fulfillment_mode || 'single';
      const recipientCount = parseInt(orderData.recipient_count, 10) || 1;
      const neutralPacking = orderData.neutral_packing === true;

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
        fulfillment_mode: fulfillmentMode,
        recipient_count: recipientCount,
        neutral_packing: neutralPacking,
        created_at: new Date().toISOString()
      };
      orders.unshift(newOrder);
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

      // Generate shipments in localStorage if provided or fallback
      const shipments = JSON.parse(localStorage.getItem(STORAGE_KEYS.SHIPMENTS) || '[]');
      if (Array.isArray(orderData.shipments) && orderData.shipments.length > 0) {
        orderData.shipments.forEach((shp, idx) => {
          shipments.unshift({
            id: shipments.length + 1,
            shipment_number: `${newOrder.order_number}-S${idx + 1}`,
            order_id: newOrder.id,
            customer_id: newOrder.customer_id,
            recipient_id: shp.recipient_id || null,
            recipient_name: shp.recipient_name || newOrder.customer_name,
            recipient_phone: shp.recipient_phone || newOrder.customer_phone,
            recipient_address: shp.recipient_address || newOrder.customer_address,
            logistics_mode: shp.logistics_mode || 'expresso',
            status: 'separacao',
            estimated_delivery: shp.estimated_delivery || (shp.logistics_mode === 'programado_7' ? 'Até 7 dias úteis' : shp.logistics_mode === 'economico_15' ? 'Até 15 dias úteis' : '1 a 2 dias úteis'),
            tracking_code: null,
            neutral_packing: neutralPacking,
            notes: shp.notes || '',
            items_json: shp.items || newOrder.items,
            created_at: new Date().toISOString()
          });
        });
      } else {
        shipments.unshift({
          id: shipments.length + 1,
          shipment_number: `${newOrder.order_number}-S1`,
          order_id: newOrder.id,
          customer_id: newOrder.customer_id,
          recipient_name: newOrder.customer_name,
          recipient_phone: newOrder.customer_phone,
          recipient_address: newOrder.customer_address,
          logistics_mode: 'expresso',
          status: 'separacao',
          estimated_delivery: '1 a 2 dias úteis',
          tracking_code: null,
          neutral_packing: neutralPacking,
          items_json: newOrder.items,
          created_at: new Date().toISOString()
        });
      }
      localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(shipments));

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
  },

  // Logistics & Availability Management
  async updateProductLogistics(code, logistics_config, updated_by = 'Admin') {
    const remote = await fetchSafe(`/api/products/${code}/logistics`, {
      method: 'PUT',
      body: JSON.stringify({ logistics_config, updated_by })
    });
    if (typeof window !== 'undefined') {
      const prods = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
      const updated = prods.map(p => {
        if (p.code === code) {
          const expStock = logistics_config.expresso?.stock;
          const expPrice = logistics_config.expresso?.price;
          return {
            ...p,
            logistics_config,
            stock: expStock !== undefined && expStock !== null ? parseInt(expStock, 10) : p.stock,
            price: expPrice !== undefined && expPrice !== null ? parseFloat(expPrice) : p.price,
            logistics_updated_at: new Date().toISOString(),
            logistics_updated_by: updated_by
          };
        }
        return p;
      });
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
      return remote || updated.find(p => p.code === code);
    }
    return remote;
  },

  async bulkUpdateLogistics(codes, action, value, updated_by = 'Admin') {
    const remote = await fetchSafe('/api/products/logistics/batch', {
      method: 'POST',
      body: JSON.stringify({ codes, action, value, updated_by })
    });
    if (typeof window !== 'undefined') {
      const prods = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
      const set = new Set(codes);
      const now = new Date().toISOString();
      const updated = prods.map(p => {
        if (!set.has(p.code)) return p;
        const logConf = { ...(p.logistics_config || getDefaultLogistics(p.price, p.stock)) };
        if (action === 'enable_expresso') logConf.expresso = { ...logConf.expresso, active: true };
        else if (action === 'disable_expresso') logConf.expresso = { ...logConf.expresso, active: false };
        else if (action === 'enable_programado') logConf.programado_7 = { ...logConf.programado_7, active: true };
        else if (action === 'disable_programado') logConf.programado_7 = { ...logConf.programado_7, active: false };
        else if (action === 'enable_economico') logConf.economico_15 = { ...logConf.economico_15, active: true };
        else if (action === 'disable_economico') logConf.economico_15 = { ...logConf.economico_15, active: false };
        else if (action === 'adjust_price_percent' && value && value.modality) {
          const mod = value.modality;
          const pct = parseFloat(value.percent) || 0;
          if (logConf[mod]) {
            const curP = parseFloat(logConf[mod].price) || p.price;
            logConf[mod].price = Math.round(curP * (1 + pct / 100) * 100) / 100;
            if (mod === 'expresso') p.price = logConf[mod].price;
          }
        } else if (action === 'set_stock' && value !== undefined) {
          const s = Math.max(0, parseInt(value, 10) || 0);
          if (logConf.expresso) logConf.expresso.stock = s;
          p.stock = s;
        } else if (action === 'adjust_stock' && value !== undefined) {
          const delta = parseInt(value, 10) || 0;
          const cur = logConf.expresso?.stock !== undefined ? logConf.expresso.stock : p.stock;
          const s = Math.max(0, cur + delta);
          if (logConf.expresso) logConf.expresso.stock = s;
          p.stock = s;
        }
        return {
          ...p,
          logistics_config: logConf,
          logistics_updated_at: now,
          logistics_updated_by: updated_by
        };
      });
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
      return remote?.products || updated;
    }
    return remote?.products || [];
  },

  async getLogisticsDashboard() {
    const remote = await fetchSafe('/api/logistics/dashboard');
    if (remote) return remote;

    if (typeof window === 'undefined') return {};
    const prods = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    const todayStr = new Date().toISOString().slice(0, 10);
    let expressoCount = 0;
    let programadoCount = 0;
    let economicoCount = 0;
    let noneAvailableCount = 0;
    let lowExpressoStockCount = 0;
    let unreviewedTodayCount = 0;

    for (const p of prods) {
      const l = p.logistics_config || getDefaultLogistics(p.price, p.stock);
      const expOn = l.expresso?.active === true;
      const progOn = l.programado_7?.active === true;
      const econOn = l.economico_15?.active === true;

      if (expOn) expressoCount++;
      if (progOn) programadoCount++;
      if (econOn) economicoCount++;
      if (!expOn && !progOn && !econOn) noneAvailableCount++;

      const expStock = l.expresso?.stock !== undefined ? l.expresso.stock : p.stock;
      if (expOn && (expStock || 0) <= (p.min_stock || 5)) lowExpressoStockCount++;

      const lastUp = (p.logistics_updated_at || '').slice(0, 10);
      if (lastUp !== todayStr) unreviewedTodayCount++;
    }

    return {
      total_skus: prods.length,
      expresso_active: expressoCount,
      programado_active: programadoCount,
      economico_active: economicoCount,
      no_availability: noneAvailableCount,
      low_expresso_stock: lowExpressoStockCount,
      unreviewed_today: unreviewedTodayCount
    };
  },

  async getLogisticsSettings() {
    const remote = await fetchSafe('/api/logistics/settings');
    if (remote) return remote;
    if (typeof window === 'undefined') return {};
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGISTICS_SETTINGS) || '{}');
  },

  async updateLogisticsSettings(settings) {
    await fetchSafe('/api/logistics/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.LOGISTICS_SETTINGS, JSON.stringify(settings));
    }
    return settings;
  },

  // Recipients API
  async getRecipients(userId = null) {
    const url = userId ? `/api/recipients?user_id=${userId}` : '/api/recipients';
    const remote = await fetchSafe(url);
    if (remote && Array.isArray(remote)) return remote;
    if (typeof window === 'undefined') return [];
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECIPIENTS) || '[]');
    return userId ? list.filter(r => r.owner_user_id === userId) : list;
  },

  async saveRecipient(data) {
    const remote = await fetchSafe('/api/recipients', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (typeof window !== 'undefined') {
      const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECIPIENTS) || '[]');
      const newRec = remote || {
        id: list.length + 1,
        ...data,
        created_at: new Date().toISOString()
      };
      list.unshift(newRec);
      localStorage.setItem(STORAGE_KEYS.RECIPIENTS, JSON.stringify(list));
      return newRec;
    }
    return remote;
  },

  async deleteRecipient(id) {
    await fetchSafe(`/api/recipients/${id}`, { method: 'DELETE' });
    if (typeof window !== 'undefined') {
      const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECIPIENTS) || '[]');
      const filtered = list.filter(r => r.id !== id);
      localStorage.setItem(STORAGE_KEYS.RECIPIENTS, JSON.stringify(filtered));
    }
    return { success: true };
  },

  // Shipments API
  async getShipments(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const remote = await fetchSafe(`/api/shipments?${query}`);
    if (remote && Array.isArray(remote)) return remote;
    if (typeof window === 'undefined') return [];
    let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.SHIPMENTS) || '[]');
    if (filters.status && filters.status !== 'ALL') list = list.filter(s => s.status === filters.status);
    if (filters.logistics_mode && filters.logistics_mode !== 'ALL') list = list.filter(s => s.logistics_mode === filters.logistics_mode);
    if (filters.order_id) list = list.filter(s => s.order_id === parseInt(filters.order_id, 10));
    if (filters.customer_id) list = list.filter(s => s.customer_id === parseInt(filters.customer_id, 10));
    if (filters.today === 'true') {
      const todayStr = new Date().toISOString().slice(0, 10);
      list = list.filter(s => (s.created_at || '').slice(0, 10) === todayStr);
    }
    return list;
  },

  async updateShipmentStatus(id, status) {
    const remote = await fetchSafe(`/api/shipments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    if (typeof window !== 'undefined') {
      const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.SHIPMENTS) || '[]');
      const updated = list.map(s => s.id === id ? { ...s, status, updated_at: new Date().toISOString() } : s);
      localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(updated));
      return remote || updated.find(s => s.id === id);
    }
    return remote;
  },

  async updateShipmentTracking(id, tracking_code) {
    const remote = await fetchSafe(`/api/shipments/${id}/tracking`, {
      method: 'PUT',
      body: JSON.stringify({ tracking_code })
    });
    if (typeof window !== 'undefined') {
      const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.SHIPMENTS) || '[]');
      const updated = list.map(s => s.id === id ? {
        ...s,
        tracking_code,
        status: ['separacao', 'embalagem', 'pronto_envio'].includes(s.status) ? 'enviado' : s.status,
        updated_at: new Date().toISOString()
      } : s);
      localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(updated));
      return remote || updated.find(s => s.id === id);
    }
    return remote;
  }
};
