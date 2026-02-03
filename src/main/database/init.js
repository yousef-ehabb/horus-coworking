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
      category TEXT,
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
          ('باقة 5 ساعات - طلاب', 5, 90, 'student'),
          ('باقة 10 ساعات - طلاب', 10, 150, 'student'),
          ('باقة 30 ساعة - طلاب', 30, 390, 'student'),
          ('باقة 50 ساعة - طلاب', 50, 500, 'student'),
          ('باقة 5 ساعات - موظفين', 5, 140, 'employee'),
          ('باقة 10 ساعات - موظفين', 10, 250, 'employee'),
          ('باقة 30 ساعة - موظفين', 30, 690, 'employee'),
          ('باقة 50 ساعة - موظفين', 50, 1000, 'employee');

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

      // Insert Beverages separately to handle category
      const beverages = [
        // Iced Coffee — قهوة مثلجة
        ['آيس أمريكانو', 55, 'قهوة مثلجة'],
        ['آيس لاتيه', 80, 'قهوة مثلجة'],
        ['سبانيش لاتيه', 100, 'قهوة مثلجة'],
        ['آيس موكا', 110, 'قهوة مثلجة'],

        // Hot Drinks — المشروبات الساخنة
        ['شاي', 25, 'المشروبات الساخنة'],
        ['شاي نعناع', 25, 'المشروبات الساخنة'],
        ['شاي أخضر', 30, 'المشروبات الساخنة'],
        ['شاي نكهات', 30, 'المشروبات الساخنة'],
        ['ينسون', 30, 'المشروبات الساخنة'],
        ['سحلب', 65, 'المشروبات الساخنة'],
        ['هوت شوكليت', 65, 'المشروبات الساخنة'],
        ['قهوة تركي', 35, 'المشروبات الساخنة'],
        ['نسكافيه', 40, 'المشروبات الساخنة'],
        ['هوت سيدر', 45, 'المشروبات الساخنة'],

        // Aswan Drinks — مشروبات أسوانية
        ['كركديه', 50, 'مشروبات أسوانية'],
        ['تمر هندي', 50, 'مشروبات أسوانية'],
        ['دوم', 50, 'مشروبات أسوانية'],

        // Canned Drinks — مشروبات معلبة
        ['كانز', 30, 'مشروبات معلبة'],
        ['ريدبول', 80, 'مشروبات معلبة'],
        ['مياه صغيرة', 10, 'مشروبات معلبة'],
        ['مياه كبيرة', 15, 'مشروبات معلبة'],

        // Specials — حورس
        ['حورس بلو لاتيه', 70, 'حورس'],
        ['حورس باور', 65, 'حورس'],
        ['حورس برو كوفي', 45, 'حورس'],

        // Italian Coffee — القهوة الإيطالية
        ['اسبريسو', 45, 'القهوة الإيطالية'],
        ['اسبريسو دبل', 60, 'القهوة الإيطالية'],
        ['كابتشينو', 65, 'القهوة الإيطالية'],
        ['لاتيه', 70, 'القهوة الإيطالية'],

        // Fresh Juice — عصائر فريش
        ['ليمون نعناع', 45, 'عصائر فريش'],
        ['مانجو', 75, 'عصائر فريش'],
        ['فراولة', 70, 'عصائر فريش'],

        // Add-ons — الإضافات
        ['حليب', 12, 'الإضافات'],
        ['حليب مكثف', 20, 'الإضافات'],
        ['صوص شوكولاتة', 20, 'الإضافات'],
        ['نكهة شوكولاتة', 20, 'الإضافات'],
        ['نكهة كراميل', 20, 'الإضافات'],
        ['نكهة فراولة', 20, 'الإضافات'],
        ['نكهة نعناع', 20, 'الإضافات']
      ];

      const stmt = db.prepare('INSERT INTO beverages (name, price, category) VALUES (?, ?, ?)');
      beverages.forEach(bev => stmt.run(bev));
      stmt.finalize();
    }
  });
}

module.exports = { initialize };
