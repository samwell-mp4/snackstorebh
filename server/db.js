import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || 'postgres://storegress:Samuca03146555!@var_hub_storegress:5432/storegress?sslmode=disable';

export const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 4000,
  idleTimeoutMillis: 10000,
  max: 10
});

export let isConnected = false;
export let lastConnectionError = null;

// Test connection and initialize schema
export async function initDatabase() {
  try {
    const client = await pool.connect();
    isConnected = true;
    lastConnectionError = null;
    console.log('✅ Conectado com sucesso ao PostgreSQL (storegress)!');

    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'comprador',
        phone VARCHAR(50),
        status VARCHAR(20) DEFAULT 'ativo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Add username column if table already exists without it
      DO \$\$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='username') THEN
          ALTER TABLE users ADD COLUMN username VARCHAR(100) UNIQUE;
        END IF;
      END \$\$;

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        brand VARCHAR(100) NOT NULL,
        volume VARCHAR(50) DEFAULT '25ml',
        price NUMERIC(10, 2) NOT NULL,
        cost_price NUMERIC(10, 2) DEFAULT 0.00,
        stock INTEGER DEFAULT 0,
        min_stock INTEGER DEFAULT 5,
        gender VARCHAR(50) DEFAULT 'Unissex',
        image TEXT,
        images TEXT[],
        tags TEXT[],
        description TEXT,
        long_description TEXT,
        olfactory_family VARCHAR(100),
        inspired_by VARCHAR(255),
        notes TEXT[],
        slug VARCHAR(255) UNIQUE,
        category_slugs TEXT[],
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Add columns to products if table already exists without them
      DO \$\$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='images') THEN
          ALTER TABLE products ADD COLUMN images TEXT[];
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='tags') THEN
          ALTER TABLE products ADD COLUMN tags TEXT[];
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='wholesale_price') THEN
          ALTER TABLE products ADD COLUMN wholesale_price NUMERIC(10, 2);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='long_description') THEN
          ALTER TABLE products ADD COLUMN long_description TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='logistics_config') THEN
          ALTER TABLE products ADD COLUMN logistics_config JSONB;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='logistics_updated_at') THEN
          ALTER TABLE products ADD COLUMN logistics_updated_at TIMESTAMP;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='logistics_updated_by') THEN
          ALTER TABLE products ADD COLUMN logistics_updated_by VARCHAR(100);
        END IF;
      END \$\$;

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        customer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255),
        customer_phone VARCHAR(50),
        customer_address TEXT,
        items_json JSONB NOT NULL,
        total_amount NUMERIC(10, 2) NOT NULL,
        cost_amount NUMERIC(10, 2) DEFAULT 0.00,
        status VARCHAR(50) DEFAULT 'pendente',
        payment_method VARCHAR(50) DEFAULT 'WhatsApp / Pix',
        notes TEXT,
        fulfillment_mode VARCHAR(50) DEFAULT 'single',
        recipient_count INTEGER DEFAULT 1,
        neutral_packing BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Add fulfillment columns to orders if table already exists without them
      DO \$\$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='fulfillment_mode') THEN
          ALTER TABLE orders ADD COLUMN fulfillment_mode VARCHAR(50) DEFAULT 'single';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='recipient_count') THEN
          ALTER TABLE orders ADD COLUMN recipient_count INTEGER DEFAULT 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='neutral_packing') THEN
          ALTER TABLE orders ADD COLUMN neutral_packing BOOLEAN DEFAULT false;
        END IF;
      END \$\$;

      CREATE TABLE IF NOT EXISTS recipients (
        id SERIAL PRIMARY KEY,
        owner_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        zipcode VARCHAR(20),
        street VARCHAR(255),
        number VARCHAR(50),
        complement VARCHAR(100),
        district VARCHAR(100),
        city VARCHAR(100) NOT NULL,
        state VARCHAR(50) NOT NULL,
        reference TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS shipments (
        id SERIAL PRIMARY KEY,
        shipment_number VARCHAR(50) UNIQUE NOT NULL,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        customer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        recipient_id INTEGER REFERENCES recipients(id) ON DELETE SET NULL,
        recipient_name VARCHAR(255) NOT NULL,
        recipient_phone VARCHAR(50),
        recipient_address TEXT NOT NULL,
        logistics_mode VARCHAR(50) NOT NULL, -- 'EXPRESSO', 'PROGRAMADO_7', 'ECONOMICO_15'
        status VARCHAR(50) DEFAULT 'pendente', -- 'pendente', 'aguardando_estoque', 'separacao', 'embalagem', 'pronto_envio', 'enviado', 'em_transito', 'entregue', 'cancelado'
        estimated_delivery VARCHAR(100),
        tracking_code VARCHAR(100),
        neutral_packing BOOLEAN DEFAULT false,
        notes TEXT,
        items_json JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS financial_transactions (
        id SERIAL PRIMARY KEY,
        type VARCHAR(20) NOT NULL, -- 'receita' ou 'despesa'
        category VARCHAR(100) NOT NULL,
        amount NUMERIC(10, 2) NOT NULL,
        description TEXT,
        payment_method VARCHAR(50),
        reference_order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS store_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed default logistics settings if empty
    const settingsCheck = await client.query("SELECT * FROM store_settings WHERE key = 'logistics_settings'");
    if (settingsCheck.rows.length === 0) {
      const defaultLogisticsSettings = {
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
      };
      await client.query(
        "INSERT INTO store_settings (key, value) VALUES ('logistics_settings', $1)",
        [JSON.stringify(defaultLogisticsSettings)]
      );
      console.log('✨ Configurações logísticas padrão salvas no PostgreSQL.');
    }

    // Seed default categories if empty
    const catCheck = await client.query('SELECT count(*) FROM categories');
    if (parseInt(catCheck.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO categories (name, slug, description) VALUES
          ('Todos os Perfumes', 'mini-perfumes-25ml', 'Coleção completa de miniaturas de perfumes importados 25ml'),
          ('Brand Collection', 'brand-collection', 'Fragrâncias de alta fixação inspiradas nos perfumes mais famosos do mundo'),
          ('Arabic Collection', 'perfumes-arabes', 'Perfumes árabes originais Lattafa, Armaf, Afnan e mais'),
          ('Femininos', 'perfumes-femininos', 'Mini perfumes importados para mulheres elegantes e marcantes'),
          ('Masculinos', 'perfumes-masculinos', 'Miniaturas masculinas com notas marcantes e imponentes'),
          ('Unissex', 'mini-perfumes-unissex', 'Fragrâncias compartilháveis sofisticadas'),
          ('Para Presente', 'mini-perfumes-para-presente', 'Opções ideais de perfumes para presentear');
      `);
      console.log('✨ Categorias padrão criadas no PostgreSQL.');
    }

    // Seed default tags if empty
    const tagCheck = await client.query('SELECT count(*) FROM tags');
    if (parseInt(tagCheck.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO tags (name, slug) VALUES
          ('Mais Vendido', 'mais-vendido'),
          ('Lançamento', 'lancamento'),
          ('Novidade', 'novidade'),
          ('Fixação 12h', 'fixacao-12h'),
          ('Importado Original', 'importado-original'),
          ('Promoção', 'promocao'),
          ('Pronta Entrega', 'pronta-entrega'),
          ('Exclusivo', 'exclusivo');
      `);
      console.log('✨ Tags padrão criadas no PostgreSQL.');
    }

    // Check if default admin exists or update credentials
    const adminCheck = await client.query("SELECT * FROM users WHERE username = 'admin' OR email = 'admin@snackstorebh.com.br'");
    if (adminCheck.rows.length === 0) {
      await client.query(`
        INSERT INTO users (name, username, email, password_hash, role, phone, status)
        VALUES 
          ('Administrador Snack Store', 'admin', 'admin@snackstorebh.com.br', 'Samuca824655!', 'admin', '553175650503', 'ativo');
      `);
      console.log('✨ Usuário admin criado no PostgreSQL com sucesso.');
    } else {
      await client.query(`
        UPDATE users 
        SET username = 'admin', password_hash = 'Samuca824655!', role = 'admin', status = 'ativo'
        WHERE username = 'admin' OR email = 'admin@snackstorebh.com.br';
      `);
      console.log('✨ Credenciais do admin atualizadas no PostgreSQL (login: admin).');
    }

    client.release();
    return { success: true };
  } catch (err) {
    isConnected = false;
    lastConnectionError = err.message;
    console.warn('⚠️ Nota PostgreSQL (var_hub_storegress):', err.message);
    console.warn('ℹ️ Servidor continuará operando com fallback híbrido resiliente.');
    return { success: false, error: err.message };
  }
}

export default pool;
