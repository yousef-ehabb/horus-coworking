module.exports = (ipcMain, db) => {
    ipcMain.handle('customers:getAll', (event) => {
        return new Promise((resolve, reject) => {
            db.all(`
        SELECT c.*, 
               cp.id as active_package_id,
               cp.remaining_hours,
               p.name as package_name
        FROM customers c
        LEFT JOIN customer_packages cp ON c.id = cp.customer_id AND cp.status = 'active'
        LEFT JOIN packages p ON cp.package_id = p.id
        ORDER BY c.created_at DESC
      `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    });

    ipcMain.handle('customers:getByPhone', (event, phone) => {
        return new Promise((resolve, reject) => {
            db.get(`
        SELECT c.*, 
               cp.id as active_package_id,
               cp.remaining_hours,
               cp.total_hours as package_total_hours,
               p.name as package_name
        FROM customers c
        LEFT JOIN customer_packages cp ON c.id = cp.customer_id AND cp.status = 'active'
        LEFT JOIN packages p ON cp.package_id = p.id
        WHERE c.phone = ?
      `, [phone], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    });

    ipcMain.handle('customers:create', (event, data) => {
        return new Promise((resolve, reject) => {
            db.run(`
        INSERT INTO customers (name, phone, type) 
        VALUES (?, ?, ?)
      `, [data.name, data.phone, data.type], function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, ...data });
            });
        });
    });

    ipcMain.handle('customers:update', (event, id, data) => {
        return new Promise((resolve, reject) => {
            db.run(`
        UPDATE customers 
        SET name = ?, phone = ?, type = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [data.name, data.phone, data.type, id], (err) => {
                if (err) reject(err);
                else resolve({ id, ...data });
            });
        });
    });
};
