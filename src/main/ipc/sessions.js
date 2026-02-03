const { roundToInteger, calculateTotal, calculateHoursCost } = require('../utils/mathHelpers');

module.exports = (ipcMain, db) => {
    ipcMain.handle('sessions:getActive', () => {
        return new Promise((resolve, reject) => {
            db.all(`
        SELECT s.* FROM sessions s
        WHERE s.status = 'active'
        ORDER BY s.start_time DESC
      `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    });

    ipcMain.handle('sessions:getHistory', (event, filters = {}) => {
        return new Promise((resolve, reject) => {
            let query = `
        SELECT s.* FROM sessions s
        WHERE s.status = 'paid'
      `;
            const params = [];

            if (filters.startDate) {
                query += ' AND DATE(s.start_time) >= ?';
                params.push(filters.startDate);
            }
            if (filters.endDate) {
                query += ' AND DATE(s.start_time) <= ?';
                params.push(filters.endDate);
            }
            if (filters.customerType) {
                query += ' AND s.customer_type = ?';
                params.push(filters.customerType);
            }

            query += ' ORDER BY s.start_time DESC LIMIT 500';

            db.all(query, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    });


    ipcMain.handle('sessions:create', (event, data) => {
        return new Promise((resolve, reject) => {
            const hourlyRate = data.customerType === 'student' ? 20 : 30;

            db.run(`
        INSERT INTO sessions (
          customer_id, customer_name, customer_phone, customer_type,
          start_time, status, hourly_rate
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [data.customerId, data.customerName, data.customerPhone, data.customerType,
            data.startTime, 'active', hourlyRate], function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, ...data, hourlyRate });
            });
        });
    });

    ipcMain.handle('sessions:addBeverage', (event, sessionId, beverageId, quantity) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM beverages WHERE id = ?', [beverageId], (err, beverage) => {
                if (err) {
                    reject(err);
                    return;
                }

                const totalPrice = calculateTotal(beverage.price, quantity);

                db.run(`
          INSERT INTO session_beverages (
            session_id, beverage_id, beverage_name, quantity, unit_price, total_price
          ) VALUES (?, ?, ?, ?, ?, ?)
        `, [sessionId, beverageId, beverage.name, quantity, beverage.price, totalPrice], (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    db.run(`
            UPDATE sessions 
            SET beverages_cost = beverages_cost + ?
            WHERE id = ?
          `, [totalPrice, sessionId], (err) => {
                        if (err) reject(err);
                        else resolve({ success: true });
                    });
                });
            });
        });
    });

    ipcMain.handle('sessions:end', (event, id, data) => {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                db.get('SELECT * FROM sessions WHERE id = ?', [id], (err, session) => {
                    if (err) {
                        db.run('ROLLBACK');
                        reject(err);
                        return;
                    }

                    const startTime = new Date(session.start_time);
                    const endTime = new Date(data.endTime);
                    const hours = (endTime - startTime) / 3600000;
                    let hoursCost = 0;
                    let fromPackage = false;
                    let packageId = null;

                    db.get(`
            SELECT cp.*, p.name 
            FROM customer_packages cp
            JOIN packages p ON cp.package_id = p.id
            WHERE cp.customer_id = ? AND cp.status = 'active'
            ORDER BY cp.purchase_date ASC
            LIMIT 1
          `, [session.customer_id], (err, activePackage) => {
                        if (!err && activePackage && hours <= activePackage.remaining_hours) {
                            fromPackage = true;
                            packageId = activePackage.id;

                            const newRemaining = activePackage.remaining_hours - hours;
                            const newStatus = newRemaining <= 0 ? 'consumed' : 'active';

                            db.run(`
                UPDATE customer_packages 
                SET remaining_hours = ?, status = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
              `, [newRemaining, newStatus, activePackage.id]);
                        } else {
                            hoursCost = calculateHoursCost(hours, session.hourly_rate);
                        }

                        const totalCost = roundToInteger(hoursCost + session.beverages_cost);

                        db.run(`
              UPDATE sessions 
              SET end_time = ?, total_hours = ?, hours_cost = ?, total_cost = ?,
                  payment_method = ?, status = 'paid', from_package = ?, package_id = ?,
                  notes = ?, updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `, [data.endTime, hours, hoursCost, totalCost, data.paymentMethod,
                        fromPackage ? 1 : 0, packageId, data.notes || '', id]);

                        db.run(`
              UPDATE customers 
              SET total_hours_used = total_hours_used + ?, total_amount_paid = total_amount_paid + ?
              WHERE id = ?
            `, [hours, totalCost, session.customer_id]);

                        if (totalCost > 0) {
                            db.run(`
                INSERT INTO transactions (
                  type, customer_id, customer_name, amount, payment_method, description, session_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
              `, ['session', session.customer_id, session.customer_name, totalCost,
                                data.paymentMethod, 'إيراد جلسة', id]);
                        }

                        db.run('COMMIT', (err) => {
                            if (err) reject(err);
                            else resolve({ success: true, hours, totalCost, fromPackage });
                        });
                    });
                });
            });
        });
    });

    ipcMain.handle('sessions:getInvoiceData', (event, sessionId) => {
        return new Promise((resolve, reject) => {
            // Get session details
            db.get('SELECT * FROM sessions WHERE id = ?', [sessionId], (err, session) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (!session) {
                    reject(new Error('Session not found'));
                    return;
                }

                // Get beverages for this session
                db.all(`
          SELECT * FROM session_beverages 
          WHERE session_id = ? 
          ORDER BY created_at
        `, [sessionId], (err, beverages) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    // Get settings for business info
                    db.all('SELECT * FROM settings', [], (err, settings) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        const settingsObj = {};
                        settings.forEach(s => {
                            settingsObj[s.setting_key] = s.setting_value;
                        });

                        resolve({
                            session,
                            beverages: beverages || [],
                            settings: settingsObj
                        });
                    });
                });
            });
        });
    });
};
