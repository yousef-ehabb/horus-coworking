module.exports = (ipcMain, db) => {
    ipcMain.handle('beverages:getAll', () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM beverages ORDER BY name ASC', (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    });

    ipcMain.handle('beverages:create', (event, data) => {
        return new Promise((resolve, reject) => {
            db.run('INSERT INTO beverages (name, price, category) VALUES (?, ?, ?)',
                [data.name, data.price, data.category], function (err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, ...data });
                });
        });
    });

    ipcMain.handle('beverages:update', (event, id, data) => {
        return new Promise((resolve, reject) => {
            db.run(`
        UPDATE beverages 
        SET name = ?, price = ?, category = ?, is_available = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [data.name, data.price, data.category, data.isAvailable ? 1 : 0, id], (err) => {
                if (err) reject(err);
                else resolve({ id, ...data });
            });
        });
    });

    ipcMain.handle('beverages:delete', (event, id) => {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM beverages WHERE id = ?', [id], (err) => {
                if (err) reject(err);
                else resolve({ success: true });
            });
        });
    });
};
