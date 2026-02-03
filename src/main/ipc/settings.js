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

    ipcMain.handle('settings:factoryReset', (event, options) => {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                const errors = [];

                try {
                    // Delete customers
                    if (options.customers) {
                        db.run('DELETE FROM customers', (err) => {
                            if (err) errors.push('customers: ' + err.message);
                        });
                    }

                    // Delete sessions and related data
                    if (options.sessions) {
                        db.run('DELETE FROM session_beverages', (err) => {
                            if (err) errors.push('session_beverages: ' + err.message);
                        });
                        db.run('DELETE FROM sessions', (err) => {
                            if (err) errors.push('sessions: ' + err.message);
                        });
                    }

                    // Delete transactions
                    if (options.transactions) {
                        db.run('DELETE FROM transactions', (err) => {
                            if (err) errors.push('transactions: ' + err.message);
                        });
                    }

                    // Delete customer packages
                    if (options.customerPackages) {
                        db.run('DELETE FROM customer_packages', (err) => {
                            if (err) errors.push('customer_packages: ' + err.message);
                        });
                    }

                    // Delete packages
                    if (options.packages) {
                        db.run('DELETE FROM packages', (err) => {
                            if (err) errors.push('packages: ' + err.message);
                        });
                    }

                    // Delete beverages
                    if (options.beverages) {
                        db.run('DELETE FROM beverages', (err) => {
                            if (err) errors.push('beverages: ' + err.message);
                        });
                    }

                    // Reset settings to defaults
                    if (options.settings) {
                        db.run('DELETE FROM settings', (err) => {
                            if (err) {
                                errors.push('settings: ' + err.message);
                            } else {
                                // Insert default settings
                                const defaults = `
                                    INSERT INTO settings (setting_key, setting_value) VALUES 
                                      ('student_hourly_rate', '20'),
                                      ('employee_hourly_rate', '30'),
                                      ('space_name', 'حورس مساحة عمل'),
                                      ('space_address', ''),
                                      ('space_phone', ''),
                                      ('currency', 'EGP');
                                `;
                                db.exec(defaults, (err) => {
                                    if (err) errors.push('settings_defaults: ' + err.message);
                                });
                            }
                        });
                    }

                    // Return result
                    if (errors.length > 0) {
                        reject(new Error(errors.join(', ')));
                    } else {
                        resolve({ success: true, message: 'تم إعادة الضبط بنجاح' });
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });
    });
};
