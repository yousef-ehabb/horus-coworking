const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app } = require('electron');

const DB_PATH = path.join(app.getPath('userData'), 'horus.db');

function initialize() {
  const db = new sqlite3.Database(DB_PATH);

  createTables(db);
  insertDefaultData(db);

  console.log('✅ Database initialized at:', DB_PATH);
  return db;
}

function createTables(db) {
  const schema = `
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      total_hours_used REAL DEFAULT 0,
      total_amount_paid REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_type TEXT NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME,
      total_hours REAL,
      hourly_rate REAL,
      hours_cost REAL,
      beverages_cost REAL DEFAULT 0,
      total_cost REAL,
      payment_method TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      from_package BOOLEAN DEFAULT 0,
      package_id INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      total_hours INTEGER NOT NULL,
      price REAL NOT NULL,
      customer_type TEXT DEFAULT 'student',
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS customer_packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      package_id INTEGER NOT NULL,
      total_hours REAL NOT NULL,
      remaining_hours REAL NOT NULL,
      price_paid REAL NOT NULL,
      purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT NOT NULL DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS beverages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      is_available BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS session_beverages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      beverage_id INTEGER NOT NULL,
      beverage_name TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      type TEXT NOT NULL,
      customer_id INTEGER,
      customer_name TEXT,
      amount REAL NOT NULL,
      payment_method TEXT,
      description TEXT,
      session_id INTEGER,
      package_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setting_key TEXT UNIQUE NOT NULL,
      setting_value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
    CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
    CREATE INDEX IF NOT EXISTS idx_sessions_customer ON sessions(customer_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
  `;

  db.exec(schema);
}

function insertDefaultData(db) {
  db.get('SELECT COUNT(*) as count FROM packages', (err, row) => {
    if (!err && row.count === 0) {
      const inserts = `
        INSERT INTO packages (name, total_hours, price, customer_type) VALUES 
          ('باقة 5 ساعات', 5, 90, 'student'),
          ('باقة 10 ساعات', 10, 150, 'student'),
          ('باقة 30 ساعة', 30, 390, 'student'),
          ('باقة 50 ساعة', 50, 500, 'student');

        INSERT INTO beverages (name, price) VALUES 
          ('قهوة', 15),
          ('نسكافيه', 10),
          ('شاي', 5),
          ('عصير', 20),
          ('مياه', 5),
          ('مشروب غازي', 10);

        INSERT INTO settings (setting_key, setting_value) VALUES 
          ('student_hourly_rate', '20'),
          ('employee_hourly_rate', '30'),
          ('space_name', 'حورس مساحة عمل'),
          ('space_address', ''),
          ('space_phone', ''),
          ('currency', 'EGP');
      `;

      db.exec(inserts, (err) => {
        if (!err) console.log('✅ Default data inserted');
      });
    }
  });
}

module.exports = { initialize };
