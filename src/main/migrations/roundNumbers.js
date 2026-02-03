const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app } = require('electron');

/**
 * سكريبت لتنظيف وتقريب جميع الأرقام العشرية في قاعدة البيانات
 * لجعلها أرقام صحيحة فقط
 */

function roundAllNumbers() {
    return new Promise((resolve, reject) => {
        const dbPath = path.join(app.getPath('userData'), 'horus.db');
        const db = new sqlite3.Database(dbPath);

        db.serialize(() => {
            console.log('بدء تنظيف قاعدة البيانات...');

            // تنظيف جدول sessions
            db.run(`
                UPDATE sessions 
                SET 
                    total_hours = ROUND(total_hours),
                    hourly_rate = ROUND(hourly_rate),
                    hours_cost = ROUND(hours_cost),
                    beverages_cost = ROUND(beverages_cost),
                    total_cost = ROUND(total_cost)
                WHERE status = 'paid'
            `, (err) => {
                if (err) {
                    console.error('خطأ في تنظيف جدول sessions:', err);
                } else {
                    console.log('✓ تم تنظيف جدول sessions');
                }
            });

            // تنظيف جدول transactions
            db.run(`
                UPDATE transactions 
                SET amount = ROUND(amount)
            `, (err) => {
                if (err) {
                    console.error('خطأ في تنظيف جدول transactions:', err);
                } else {
                    console.log('✓ تم تنظيف جدول transactions');
                }
            });

            // تنظيف جدول customers
            db.run(`
                UPDATE customers 
                SET 
                    total_hours_used = ROUND(total_hours_used),
                    total_amount_paid = ROUND(total_amount_paid)
            `, (err) => {
                if (err) {
                    console.error('خطأ في تنظيف جدول customers:', err);
                } else {
                    console.log('✓ تم تنظيف جدول customers');
                }
            });

            // تنظيف جدول packages
            db.run(`
                UPDATE packages 
                SET price = ROUND(price)
            `, (err) => {
                if (err) {
                    console.error('خطأ في تنظيف جدول packages:', err);
                } else {
                    console.log('✓ تم تنظيف جدول packages');
                }
            });

            // تنظيف جدول customer_packages
            db.run(`
                UPDATE customer_packages 
                SET 
                    remaining_hours = ROUND(remaining_hours),
                    price_paid = ROUND(price_paid)
            `, (err) => {
                if (err) {
                    console.error('خطأ في تنظيف جدول customer_packages:', err);
                } else {
                    console.log('✓ تم تنظيف جدول customer_packages');
                }
            });

            // تنظيف جدول beverages
            db.run(`
                UPDATE beverages 
                SET price = ROUND(price)
            `, (err) => {
                if (err) {
                    console.error('خطأ في تنظيف جدول beverages:', err);
                } else {
                    console.log('✓ تم تنظيف جدول beverages');
                }
            });

            // تنظيف جدول session_beverages
            db.run(`
                UPDATE session_beverages 
                SET 
                    unit_price = ROUND(unit_price),
                    total_price = ROUND(total_price)
            `, (err) => {
                if (err) {
                    console.error('خطأ في تنظيف جدول session_beverages:', err);
                    reject(err);
                } else {
                    console.log('✓ تم تنظيف جدول session_beverages');
                    console.log('\n✅ تم تنظيف قاعدة البيانات بنجاح!');
                    db.close();
                    resolve();
                }
            });
        });
    });
}

module.exports = { roundAllNumbers };
