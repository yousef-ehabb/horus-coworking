# Changelog

All notable changes to the Horus Coworking Space Management System will be documented in this file.

## [1.1.0] - 2026-02-03
### Added
- Enhanced Windows Installer with Setup Wizard (Next > Next).
- Support for selecting custom installation directory.
- Optional desktop shortcut creation.

## [1.0.0] - 2026-02-03

### Added
- 🎉 **Initial Release**: Professional Windows installer
- 🖼️ **Desktop Icon**: Golden Horus logo for desktop shortcut
- 📦 **NSIS Installer**: Full installation wizard with custom directory selection
- 💾 **Data Persistence**: Database stored in `%APPDATA%\horus-coworking\` survives reinstalls
- 🚀 **Single-User Install**: No administrator rights required
- 📋 **Start Menu Integration**: App appears in Windows Start Menu
- 🔄 **Complete Feature Set**:
  - Quick session management with real-time tracking
  - Customer database with package support
  - Beverage tracking and billing
  - Comprehensive accounting and reports
  - RTL Arabic interface support
  - PDF export for daily reports
  
### Technical Details
- **Installer Size**: ~150MB
- **Platform**: Windows 10/11 (64-bit)
- **Tech Stack**: Electron + React 18 + Material-UI + SQLite
- **Database Location**: `%APPDATA%\horus-coworking\horus.db`

### Distribution
- Created professional Windows installer with custom branding
- Added deployment documentation (DEPLOY.md)
- Icon conversion pipeline for multi-size ICO generation
- Automated build scripts for distribution

---

## Future Releases

### Planned Features
- Auto-update functionality
- Database backup/restore UI
- Multi-language support (English)
- Cloud sync (optional)
- Mobile companion app

---

**Version Format**: [Major].[Minor].[Patch]
- **Major**: Breaking changes or complete redesign
- **Minor**: New features, backwards compatible
- **Patch**: Bug fixes and small improvements
