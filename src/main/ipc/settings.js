module.exports = (ipcMain, db) => {
    ipcMain.handle('settings:getAll', () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM settings', (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }

                const settings = {};
                (rows || []).forEach(row => {
                    settings[row.setting_key] = row.setting_value;
                });

                resolve(settings);
            });
        });
    });

    ipcMain.handle('settings:update', (event, key, value) => {
        return new Promise((resolve, reject) => {
            db.run(`
        INSERT OR REPLACE INTO settings (setting_key, setting_value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `, [key, value], (err) => {
                if (err) reject(err);
                else resolve({ success: true });
            });
        });
    });
};
