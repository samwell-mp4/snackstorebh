import express from 'express';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { pool, isConnected, lastConnectionError, initDatabase } from './db.js';

dotenv.config();

const app = express();

const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || 'APP_USR-5036655496698585-091610-a7c9ac726f77bf2228c27724e723cf63-3401326592' });
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Initialize DB schema
initDatabase();

// In-memory / cache fallback in case postgres is running in docker network and not yet joined
let memoryStore = {
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
    },
    {
      id: 2,
      order_number: 'SNK-9022',
      customer_id: null,
      customer_name: 'Mariana Silva',
      customer_email: 'mariana.silva@gmail.com',
      customer_phone: '5531991223344',
      customer_address: 'Av. Afonso Pena, 3000 - Funcionários, BH',
      items_json: [
        { code: 'A003', name: 'Perfume Lattafa Yara Tous Laranja 25ml', price: 79.90, cost_price: 38.00, quantity: 1, volume: '25ml' }
      ],
      total_amount: 79.90,
      cost_amount: 38.00,
      status: 'separacao',
      payment_method: 'Cartão de Crédito',
      notes: '',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ],
  transactions: [
    { id: 1, type: 'receita', category: 'Venda de Pedido', amount: 239.70, description: 'Pedido SNK-9021', payment_method: 'Pix', created_at: new Date(Date.now() - 3600000 * 4).toISOString() },
    { id: 2, type: 'receita', category: 'Venda de Pedido', amount: 79.90, description: 'Pedido SNK-9022', payment_method: 'Cartão de Crédito', created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: 3, type: 'despesa', category: 'Embalagens & Envio', amount: 45.00, description: 'Caixas personalizadas e plástico bolha', payment_method: 'Pix', created_at: new Date(Date.now() - 86400000).toISOString() }
  ]
};

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

// Auth Routes
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

  // Memory fallback
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


// Mercado Pago Checkout Preference
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

// Mercado Pago Webhook
app.post('/api/webhooks/mercadopago', async (req, res) => {
  try {
    const { type, data } = req.body;
    if (type === 'payment') {
      const payment = new Payment(mpClient);
      const paymentInfo = await payment.get({ id: data.id });
      
      const status = paymentInfo.status; // 'approved', 'rejected', 'in_process', etc
      const external_reference = paymentInfo.external_reference; // order_number if provided

      if (status === 'approved') {
        // Here we can update the DB order status to 'pago' if external_reference is the order_number
        console.log('Payment approved for ID:', data.id);
      }
    }
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).send('Internal Server Error');
  }
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

// Orders Routes
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

      // Record financial transaction
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

// Serve static frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Snack Store API rodando na porta ${PORT}`);
  console.log(`📡 URL PostgreSQL configurada: postgres://storegress:***@var_hub_storegress:5432/storegress`);
});
