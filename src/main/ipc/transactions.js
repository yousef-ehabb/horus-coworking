module.exports = (ipcMain, db) => {
    ipcMain.handle('transactions:getAll', (event, filters = {}) => {
        return new Promise((resolve, reject) => {
            let query = 'SELECT * FROM transactions WHERE 1=1 ';
            const params = [];

            if (filters.startDate) {
                query += 'AND DATE(transaction_date) >= ? ';
                params.push(filters.startDate);
            }
            if (filters.endDate) {
                query += 'AND DATE(transaction_date) <= ? ';
                params.push(filters.endDate);
            }
            if (filters.type) {
                query += 'AND type = ? ';
                params.push(filters.type);
            }

            query += 'ORDER BY transaction_date DESC LIMIT 500';

            db.all(query, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    });

    ipcMain.handle('transactions:dailyReport', (event, date) => {
        return new Promise((resolve, reject) => {
            const targetDate = date || new Date().toISOString().split('T')[0];

            db.get(`
        SELECT COALESCE(SUM(amount), 0) as total FROM transactions
        WHERE DATE(transaction_date) = ?
      `, [targetDate], (err, revenue) => {
                if (err) {
                    reject(err);
                    return;
                }

                db.get(`
          SELECT COUNT(*) as count FROM sessions
          WHERE DATE(start_time) = ? AND status = 'paid'
        `, [targetDate], (err, sessions) => {
                    db.get(`
            SELECT COUNT(*) as count FROM transactions
            WHERE DATE(transaction_date) = ? AND type = 'package'
          `, [targetDate], (err, packages) => {
                        db.get(`
              SELECT COUNT(*) as count FROM customers
              WHERE DATE(registration_date) = ?
            `, [targetDate], (err, customers) => {
                            db.all(`
                SELECT payment_method, SUM(amount) as total FROM transactions
                WHERE DATE(transaction_date) = ?
                GROUP BY payment_method
              `, [targetDate], (err, paymentMethods) => {
                                resolve({
                                    date: targetDate,
                                    totalRevenue: revenue.total,
                                    sessionsCount: sessions.count,
                                    packagesSold: packages.count,
                                    newCustomers: customers.count,
                                    paymentMethods: paymentMethods || [],
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};
