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
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='long_description') THEN
          ALTER TABLE products ADD COLUMN long_description TEXT;
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
