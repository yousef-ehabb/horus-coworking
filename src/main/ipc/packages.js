module.exports = (ipcMain, db) => {
    ipcMain.handle('packages:getAvailable', () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM packages WHERE is_active = 1 ORDER BY total_hours ASC', (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    });

    ipcMain.handle('packages:getAllCustomerPackages', () => {
        return new Promise((resolve, reject) => {
            db.all(`
        SELECT cp.*, c.name as customer_name, c.phone as customer_phone, p.name as package_name
        FROM customer_packages cp
        JOIN customers c ON cp.customer_id = c.id
        JOIN packages p ON cp.package_id = p.id
        WHERE cp.status = 'active'
        ORDER BY cp.purchase_date DESC
      `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    });

    ipcMain.handle('packages:create', (event, data) => {
        return new Promise((resolve, reject) => {
            db.run(`
        INSERT INTO packages (name, total_hours, price, customer_type) 
        VALUES (?, ?, ?, ?)
      `, [data.name, data.totalHours, data.price, data.customerType || 'student'], function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, ...data });
            });
        });
    });

    ipcMain.handle('packages:update', (event, id, data) => {
        return new Promise((resolve, reject) => {
            db.run(`
        UPDATE packages 
        SET name = ?, total_hours = ?, price = ?, customer_type = ?, is_active = ?
        WHERE id = ?
      `, [data.name, data.totalHours, data.price, data.customerType, data.isActive ? 1 : 0, id], (err) => {
                if (err) reject(err);
                else resolve({ id, ...data });
            });
        });
    });

    ipcMain.handle('packages:purchase', (event, customerId, packageId, paymentMethod) => {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                db.get('SELECT * FROM packages WHERE id = ?', [packageId], (err, pkg) => {
                    if (err) {
                        db.run('ROLLBACK');
                        reject(err);
                        return;
                    }

                    db.get('SELECT * FROM customers WHERE id = ?', [customerId], (err, customer) => {
                        if (err) {
                            db.run('ROLLBACK');
                            reject(err);
                            return;
                        }

                        db.run(`
              INSERT INTO customer_packages (
                customer_id, package_id, total_hours, remaining_hours, price_paid
              ) VALUES (?, ?, ?, ?, ?)
            `, [customerId, packageId, pkg.total_hours, pkg.total_hours, pkg.price], function (err) {
                            if (err) {
                                db.run('ROLLBACK');
                                reject(err);
                                return;
                            }

                            const cpId = this.lastID;

                            db.run(`
                INSERT INTO transactions (
                  type, customer_id, customer_name, amount, payment_method, description, package_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
              `, ['package', customerId, customer.name, pkg.price, paymentMethod,
                                `شراء ${pkg.name}`, cpId]);

                            db.run(`
                UPDATE customers 
                SET total_amount_paid = total_amount_paid + ?
                WHERE id = ?
              `, [pkg.price, customerId]);

                            db.run('COMMIT', (err) => {
                                if (err) reject(err);
                                else resolve({ success: true, id: cpId });
                            });
                        });
                    });
                });
            });
        });
    });
};
