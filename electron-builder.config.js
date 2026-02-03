module.exports = {
    appId: 'com.horus.coworking',
    productName: 'Horus Coworking',
    directories: {
        output: 'dist',
        buildResources: 'build-resources'
    },
    files: [
        'build/**/*',
        'src/main/**/*',
        'node_modules/**/*',
        'package.json'
    ],
    extraMetadata: {
        main: 'src/main/main.js'  // Prevent react-cra from overriding
    },
    win: {
        target: 'nsis',
        icon: 'assets/icon.png'
    },
    nsis: {
        oneClick: false,
        allowToChangeInstallationDirectory: true,
        perMachine: false,
        createDesktopShortcut: true,
        createStartMenuShortcut: true
    }
};
