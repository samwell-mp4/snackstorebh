// API client with transparent resilience & local sync engine
import { perfumes as initialPerfumes } from '../perfumesData.js';

const STORAGE_KEYS = {
  PRODUCTS: 'snack_store_products',
  ORDERS: 'snack_store_orders',
  TRANSACTIONS: 'snack_store_transactions',
  USERS: 'snack_store_users',
  AUTH_USER: 'snack_store_auth_user',
  TOKEN: 'snack_store_token'
};

// Seed initial data if not present in localStorage
function initLocalStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    // augment initial perfumes with cost_price and stock
    const seeded = initialPerfumes.map(p => ({
      ...p,
      cost_price: p.cost_price || Math.round(p.price * 0.45 * 100) / 100,
      stock: typeof p.stock === 'number' ? p.stock : 10,
      min_stock: p.min_stock || 5,
      is_active: p.is_active !== undefined ? p.is_active : true
    }));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(seeded));
  }

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const defaultUsers = [
      { id: 1, name: 'Administrador Snack Store', email: 'admin@snackstorebh.com.br', role: 'admin', phone: '553175650503', status: 'ativo', created_at: new Date().toISOString() },
      { id: 2, name: 'Gerente de Operações', email: 'gerente@snackstorebh.com.br', role: 'gerente', phone: '553175650503', status: 'ativo', created_at: new Date().toISOString() },
      { id: 3, name: 'Lucas Comprador', email: 'cliente@snackstorebh.com.br', role: 'comprador', phone: '5531988776655', status: 'ativo', created_at: new Date().toISOString() }
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
      },
      {
        id: 3,
        order_number: 'SNK-9023',
        customer_id: null,
        customer_name: 'Felipe Santos',
        customer_email: 'felipe.s@outlook.com',
        customer_phone: '5531987654321',
        customer_address: 'Rua Sergipe, 850 - Savassi, BH',
        items: [
          { code: 'A004', name: 'Perfume Lattafa Khamrah 25ml', price: 89.90, cost_price: 42.00, quantity: 1, volume: '25ml' }
        ],
        total_amount: 89.90,
        cost_amount: 42.00,
        status: 'pendente',
        payment_method: 'Pix',
        notes: 'Aguardando comprovante Pix via WhatsApp',
        created_at: new Date(Date.now() - 1800000).toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(defaultOrders));
  }

  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    const defaultTx = [
      { id: 1, type: 'receita', category: 'Venda de Pedido', amount: 239.70, description: 'Pedido SNK-9021', payment_method: 'Pix', created_at: new Date(Date.now() - 3600000 * 5).toISOString() },
      { id: 2, type: 'receita', category: 'Venda de Pedido', amount: 79.90, description: 'Pedido SNK-9022', payment_method: 'Cartão de Crédito', created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
      { id: 3, type: 'receita', category: 'Venda de Pedido', amount: 89.90, description: 'Pedido SNK-9023', payment_method: 'Pix', created_at: new Date(Date.now() - 1800000).toISOString() },
      { id: 4, type: 'despesa', category: 'Embalagens & Envio', amount: 55.00, description: 'Caixas rígidas e fitas personalizadas', payment_method: 'Pix', created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: 5, type: 'despesa', category: 'Tráfego & Anúncios', amount: 120.00, description: 'Campanha Meta Ads BH', payment_method: 'Cartão de Crédito', created_at: new Date(Date.now() - 86400000 * 2).toISOString() }
    ];
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(defaultTx));
  }
}

// Ensure local seed on load
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
  async login(email, password) {
    const remote = await fetchSafe('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (remote && remote.success) {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(remote.user));
      localStorage.setItem(STORAGE_KEYS.TOKEN, remote.token);
      return remote;
    }

    // Local fallback login
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.TOKEN, 'local_jwt_' + user.id);
      return { success: true, user, token: 'local_jwt_' + user.id };
    }
    return { success: false, message: 'Usuário não encontrado. Use um dos atalhos de demonstração abaixo.' };
  },

  async register(data) {
    const remote = await fetchSafe('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (remote && remote.success) {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(remote.user));
      localStorage.setItem(STORAGE_KEYS.TOKEN, remote.token);
      return remote;
    }

    // Local fallback register
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, message: 'E-mail já cadastrado.' };
    }
    const newUser = {
      id: users.length + 1,
      name: data.name,
      email: data.email,
      role: data.role || 'comprador',
      phone: data.phone || '',
      status: 'ativo',
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(newUser));
    localStorage.setItem(STORAGE_KEYS.TOKEN, 'local_jwt_' + newUser.id);
    return { success: true, user: newUser, token: 'local_jwt_' + newUser.id };
  },

  getCurrentUser() {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  // Users (RBAC)
  async getUsers() {
    const remote = await fetchSafe('/api/users');
    if (remote && Array.isArray(remote)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(remote));
      return remote;
    }
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  },

  async updateUserRole(id, role) {
    const remote = await fetchSafe(`/api/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const updated = users.map(u => u.id === id ? { ...u, role } : u);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));

    // Update session if editing self
    const current = this.getCurrentUser();
    if (current && current.id === id) {
      current.role = role;
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(current));
    }
    return remote || updated.find(u => u.id === id);
  },

  async updateUserStatus(id, status) {
    const remote = await fetchSafe(`/api/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const updated = users.map(u => u.id === id ? { ...u, status } : u);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
    return remote || updated.find(u => u.id === id);
  },

  // Products
  getProducts() {
    const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return initialPerfumes;
      }
    }
    return initialPerfumes;
  },

  saveProducts(products) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return products;
  },

  addProduct(newProduct) {
    const products = this.getProducts();
    const code = newProduct.code || 'SKU-' + Math.floor(1000 + Math.random() * 9000);
    const slug = newProduct.slug || newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const product = {
      ...newProduct,
      code,
      slug,
      price: parseFloat(newProduct.price) || 0,
      cost_price: parseFloat(newProduct.cost_price) || 0,
      stock: parseInt(newProduct.stock) || 0,
      min_stock: parseInt(newProduct.min_stock) || 5,
      is_active: newProduct.is_active !== undefined ? newProduct.is_active : true,
      image: newProduct.image || '/perfumes/200.webp',
      categorySlugs: newProduct.categorySlugs || ['mini-perfumes-25ml']
    };
    const updated = [product, ...products];
    this.saveProducts(updated);
    return product;
  },

  updateProduct(code, data) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.code === code);
    if (index !== -1) {
      products[index] = {
        ...products[index],
        ...data,
        price: data.price !== undefined ? parseFloat(data.price) : products[index].price,
        cost_price: data.cost_price !== undefined ? parseFloat(data.cost_price) : products[index].cost_price,
        stock: data.stock !== undefined ? parseInt(data.stock) : products[index].stock
      };
      this.saveProducts(products);
      return products[index];
    }
    return null;
  },

  deleteProduct(code) {
    const products = this.getProducts().filter(p => p.code !== code);
    this.saveProducts(products);
    return true;
  },

  adjustStock(code, delta) {
    const products = this.getProducts();
    const item = products.find(p => p.code === code);
    if (item) {
      item.stock = Math.max(0, (item.stock || 0) + delta);
      this.saveProducts(products);
      return item.stock;
    }
    return null;
  },

  // Orders
  async getOrders() {
    const remote = await fetchSafe('/api/orders');
    if (remote && Array.isArray(remote)) {
      return remote;
    }
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
  },

  async createOrder(orderData) {
    const remote = await fetchSafe('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
    if (remote) return remote;

    // Local fallback
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

    // Register income
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

    // Decrement stock for ordered items
    if (orderData.items && Array.isArray(orderData.items)) {
      orderData.items.forEach(item => {
        if (item.code && item.quantity) {
          this.adjustStock(item.code, -item.quantity);
        }
      });
    }

    return newOrder;
  },

  async updateOrderStatus(id, status) {
    await fetchSafe(`/api/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    const updated = orders.map(o => o.id === id ? { ...o, status } : o);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
    return updated.find(o => o.id === id);
  },

  // Finance
  async getFinanceSummary() {
    const remote = await fetchSafe('/api/finance/summary');
    if (remote) return remote;

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
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
  },

  async addTransaction(data) {
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
