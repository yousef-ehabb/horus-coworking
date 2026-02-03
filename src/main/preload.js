const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Customers
    getCustomers: () => ipcRenderer.invoke('customers:getAll'),
    getCustomerByPhone: (phone) => ipcRenderer.invoke('customers:getByPhone', phone),
    createCustomer: (data) => ipcRenderer.invoke('customers:create', data),
    updateCustomer: (id, data) => ipcRenderer.invoke('customers:update', id, data),

    // Sessions
    getActiveSessions: () => ipcRenderer.invoke('sessions:getActive'),
    getSessionHistory: (filters) => ipcRenderer.invoke('sessions:getHistory', filters),
    createSession: (data) => ipcRenderer.invoke('sessions:create', data),
    updateSession: (id, data) => ipcRenderer.invoke('sessions:update', id, data),
    endSession: (id, data) => ipcRenderer.invoke('sessions:end', id, data),
    getSessionInvoice: (sessionId) => ipcRenderer.invoke('sessions:getInvoiceData', sessionId),
    addBeverageToSession: (sessionId, beverageId, quantity) =>
        ipcRenderer.invoke('sessions:addBeverage', sessionId, beverageId, quantity),

    // Packages
    getAvailablePackages: () => ipcRenderer.invoke('packages:getAvailable'),
    getCustomerPackages: (customerId) => ipcRenderer.invoke('packages:getCustomerPackages', customerId),
    getAllCustomerPackages: () => ipcRenderer.invoke('packages:getAllCustomerPackages'),
    createPackage: (data) => ipcRenderer.invoke('packages:create', data),
    updatePackage: (id, data) => ipcRenderer.invoke('packages:update', id, data),
    purchasePackage: (customerId, packageId, paymentMethod) =>
        ipcRenderer.invoke('packages:purchase', customerId, packageId, paymentMethod),

    // Beverages
    getBeverages: () => ipcRenderer.invoke('beverages:getAll'),
    createBeverage: (data) => ipcRenderer.invoke('beverages:create', data),
    updateBeverage: (id, data) => ipcRenderer.invoke('beverages:update', id, data),
    deleteBeverage: (id) => ipcRenderer.invoke('beverages:delete', id),

    // Transactions
    getTransactions: (filters) => ipcRenderer.invoke('transactions:getAll', filters),
    getDailyReport: (date) => ipcRenderer.invoke('transactions:dailyReport', date),
    getMonthlyReport: (month, year) => ipcRenderer.invoke('transactions:monthlyReport', month, year),

    // Settings
    getSettings: () => ipcRenderer.invoke('settings:getAll'),
    updateSetting: (key, value) => ipcRenderer.invoke('settings:update', key, value),
    factoryReset: (options) => ipcRenderer.invoke('settings:factoryReset', options),

    // Database
    backupDatabase: (path) => ipcRenderer.invoke('db:backup', path),
    restoreDatabase: (path) => ipcRenderer.invoke('db:restore', path),
});
