const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const Database = require('./database/init');

let mainWindow;
let db;

function checkActiveSessions(callback) {
    db.get('SELECT COUNT(*) as count FROM sessions WHERE status = ?', ['active'], (err, row) => {
        if (err) {
            console.error('Error checking sessions:', err);
            callback(false);
        } else {
            callback(row.count > 0);
        }
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 700,
        icon: path.join(__dirname, '../../public/icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        title: 'حورس - نظام إدارة مساحات العمل',
    });

    const startUrl = isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../../build/index.html')}`;

    mainWindow.loadURL(startUrl);

    if (isDev) {
        // mainWindow.webContents.openDevTools();
    }

    mainWindow.on('close', (event) => {
        checkActiveSessions((hasActive) => {
            if (hasActive) {
                event.preventDefault();
                dialog.showMessageBox(mainWindow, {
                    type: 'warning',
                    buttons: ['حسناً'],
                    title: 'تحذير',
                    message: 'لا يمكن إغلاق البرنامج',
                    detail: 'يوجد جلسات نشطة. يرجى إنهاء جميع الجلسات أولاً.',
                });
            }
        });
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    db = Database.initialize();

    require('./ipc/customers')(ipcMain, db);
    require('./ipc/sessions')(ipcMain, db);
    require('./ipc/packages')(ipcMain, db);
    require('./ipc/beverages')(ipcMain, db);
    require('./ipc/transactions')(ipcMain, db);
    require('./ipc/settings')(ipcMain, db);

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (db) db.close();
        app.quit();
    }
});
