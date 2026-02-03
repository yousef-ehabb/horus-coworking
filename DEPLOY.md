# Deployment Guide - Horus Coworking

## 📦 Building Windows Installer

This guide covers creating a professional Windows installer for the Horus Coworking Space Management System.

---

## Prerequisites

- **Node.js 18+** installed
- **Windows 10/11** (for building Windows installer)
- All dependencies installed (`npm install`)

---

## Build Process

### 1. Install Dependencies

```powershell
npm install
```

This will automatically run `electron-builder install-app-deps` via the postinstall script.

### 2. Convert Icon (First Time Only)

Convert the PNG icon to ICO format for Windows:

```powershell
npm run icon:convert
```

**Expected output:**
```
✅ Created build-resources directory
✅ Icon converted successfully!
   Output: d:\genius\horus-coworking\build-resources\icon.ico
   Sizes included: 256x256, 128x128, 64x64, 48x48, 32x32, 16x16
```

### 3. Build Production App

```powershell
npm run build:installer
```

This will:
1. Build the React app (`npm run build`)
2. Package with Electron Builder
3. Create NSIS installer

**Build time:** ~2-5 minutes (depending on system)

---

## Output Location

The installer will be created in the `dist` folder:

```
dist/
└── Horus-Coworking-Setup-1.0.0.exe    (~100-150MB)
```

---

## Installer Features

✅ **Single-user installation** (no admin rights required)  
✅ **Custom install directory** (user selects location)  
✅ **Desktop shortcut** with Horus icon  
✅ **Start Menu entry** 
✅ **Data persistence** (database saved in `%APPDATA%\horus-coworking\`)  
✅ **Uninstall protection** (user data preserved on uninstall)

---

## Testing the Installer

### Pre-Distribution Checklist

- [ ] Test installer on clean Windows machine
- [ ] Verify no admin prompt appears
- [ ] Verify custom install path option works
- [ ] Verify desktop shortcut creation
- [ ] Test app launches without errors
- [ ] Create test customer and session
- [ ] Close app, uninstall
- [ ] Reinstall to same directory
- [ ] Verify customer data still exists

### Test Scenarios

#### Scenario 1: Fresh Install
1. Download installer EXE
2. Run installer (should NOT request admin)
3. Choose custom install location (e.g., `D:\Apps\Horus`)
4. Complete installation
5. Launch from desktop shortcut
6. Verify app opens and database initializes

#### Scenario 2: Data Persistence
1. Install app
2. Create customers and sessions
3. Close app
4. Uninstall app
5. Reinstall to SAME directory
6. Verify all data persists

#### Scenario 3: Clean Uninstall
1. Install app
2. Uninstall app
3. Check that `%APPDATA%\horus-coworking\` still exists (data preserved)
4. Manually delete folder if complete removal desired

---

## Distribution

### File Distribution

**What to distribute:**
```
Horus-Coworking-Setup-1.0.0.exe
```

**Distribution methods:**
- USB drive
- File sharing services (Google Drive, Dropbox)
- Direct download links
- Internal network share

### File Verification

Calculate checksum for integrity verification:

```powershell
# SHA256 checksum
Get-FileHash "dist\Horus-Coworking-Setup-1.0.0.exe" -Algorithm SHA256
```

Provide this checksum to users to verify downloaded file integrity.

---

## User Installation Guide

Share this with end users:

### Installation Steps

1. **Download** `Horus-Coworking-Setup-1.0.0.exe`
2. **Run** the installer
   - Windows may show "Unknown Publisher" warning
   - Click **"More info" → "Run anyway"** (safe, just not code-signed)
3. **Choose** installation directory (default: `C:\Users\[Username]\AppData\Local\Programs\horus-coworking`)
4. **Wait** for installation (~30 seconds)
5. **Launch** via desktop shortcut

### System Requirements

- **OS:** Windows 10 or Windows 11 (64-bit)
- **RAM:** 4GB minimum (8GB recommended)
- **Disk Space:** 300MB for app + database
- **Display:** 1200x700 minimum resolution

---

## Database Location

User data is stored in:
```
%APPDATA%\horus-coworking\horus.db
```

**Full path example:**
```
C:\Users\YourName\AppData\Roaming\horus-coworking\horus.db
```

### Data Backup

Users should backup this file regularly:

```powershell
# Backup command
Copy-Item "$env:APPDATA\horus-coworking\horus.db" -Destination "D:\Backups\horus-backup-$(Get-Date -Format 'yyyy-MM-dd').db"
```

---

## Troubleshooting

### Build Errors

#### Error: `child_process` or `EXIT CODE 1` (silent failure)
**Cause:** Corrupted node_modules or cache issues.
**Solution:**
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install`
3. Clear electron-builder cache:
   ```powershell
   Remove-Item -Recurse -Force "$env:LOCALAPPDATA\electron-builder\Cache"
   ```
4. Try building again

#### Error: "Cannot find icon.ico"
**Solution:** Run `npm run icon:convert` first

#### Error: "electron-builder not found"
**Solution:** 
```powershell
npm install --save-dev electron-builder
```

#### Error: "sharp install failed"
**Solution:** Rebuild native dependencies
```powershell
npm rebuild sharp --force
```

### Installation Errors

#### "Windows protected your PC" warning
**Cause:** App is not code-signed (normal for free distribution)  
**Solution:** Click "More info" → "Run anyway"

#### App doesn't start
**Solution:** 
1. Check Windows Event Viewer for errors
2. Verify Node.js compatibility
3. Try running installer as different user

---

## Advanced Configuration

### Custom Installer Name

Edit `package.json`:

```json
"build": {
  "win": {
    "artifactName": "YourCustomName-Setup-${version}.${ext}"
  }
}
```

### Change App Name

Edit `package.json`:

```json
"build": {
  "productName": "Your Custom App Name"
}
```

---

## Security Notes

### ⚠️ Code Signing

This installer is **NOT code-signed**. For production distribution:

1. **Obtain code signing certificate** ($300-500/year)
   - DigiCert
   - Sectigo
   - GlobalSign

2. **Add certificate to build config:**

```json
"win": {
  "certificateFile": "path/to/certificate.pfx",
  "certificatePassword": "your-password"
}
```

### ✅ Security Best Practices

- Distribute via HTTPS only
- Provide SHA256 checksums
- Use official channels (no third-party hosting)
- Scan with antivirus before distribution

---

## Version Updates

To release a new version:

1. Update version in `package.json`:
   ```json
   "version": "1.1.0"
   ```

2. Document changes in `CHANGELOG.md`

3. Rebuild installer:
   ```powershell
   npm run build:installer
   ```

4. Distribute new installer (auto-update not configured)

---

## Build Log Example

Successful build output:

```
> horus-coworking@1.0.0 build:installer
> npm run build && electron-builder build --win --x64 --publish never

✔ Webpack compiled successfully
✔ Electron Builder packaging
  • building        target=nsis arch=x64
  • writing         Horus-Coworking-Setup-1.0.0.exe
  • build complete  dist/Horus-Coworking-Setup-1.0.0.exe (142.3 MB)
```

---

## Support

For build/deployment issues:
- Check Electron Builder docs: https://www.electron.build
- Review logs in `dist/builder-debug.yml`
- Verify Node.js version compatibility

---

**Last Updated:** February 2026  
**Author:** Yousef Ehab
