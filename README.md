# 🦅 Horus - Coworking Space Management System

Desktop application for managing coworking spaces using React and Electron.

## ✨ Features

- 🚀 **Quick Start**: Simply enter a phone number to start a session.
- ⏱️ **Real-time Tracking**: Live display of elapsed time and estimated cost.
- 📦 **Package Management**: Flexible package system with automatic hour deduction.
- 💰 **Integrated Accounting**: Detailed daily and monthly reports.
- 👥 **Customer Management**: Comprehensive database for customers and subscriptions.
- 🍵 **Beverage Tracking**: Easily add beverages to active sessions.
- 🔒 **Data Protection**: Prevents accidental closure while sessions are active.
- 🌍 **RTL Support**: Full support for Arabic language and RTL layout.

## 🛠️ Tech Stack

- **React 18** - User Interface
- **Electron** - Desktop Application
- **Redux Toolkit** - State Management
- **Material-UI v5** - Component Library (RTL Support)
- **SQLite** - Database
- **Day.js** - Date Manipulation
- **jsPDF** - PDF Report Generation

## 📦 Installation & Setup

### Requirements
- Node.js (v16 or higher)
- npm or yarn

### Steps

1. **Install Dependencies**
```bash
git clone https://github.com/yousef-ehabb/horus-coworking.git
cd horus-coworking
npm install
```

2. **Run Application (Development)**
```bash
npm start
```

3. **Build Windows Installer (Production)**
```bash
# First time: Convert icon
npm run icon:convert

# Build installer
npm run build:installer
```

Output: `dist/Horus-Coworking-Setup-1.0.0.exe`

📖 **For detailed distribution guide, see [DEPLOY.md](./DEPLOY.md)**

## 📥 Download & Distribution

### For End Users

**Download the latest release:**
- Windows 10/11 (64-bit): `Horus-Coworking-Setup-1.0.0.exe` (~150MB)

**Installation:**
1. Download the installer
2. Run the EXE file (you may see "Unknown Publisher" warning - click "More info" → "Run anyway")
3. Choose installation directory
4. Complete installation and launch from desktop shortcut

**System Requirements:**
- Windows 10 or 11 (64-bit)
- 4GB RAM minimum (8GB recommended)
- 300MB disk space


## 📱 Main Pages

### 🏠 Dashboard
- Quick session start form
- View active sessions
- Daily statistics
- **Clear Alerts** for customers (Active Package / No Package)

### 👥 Customer Management
- Add and edit customers
- View active packages for each customer
- Usage statistics

### ⏰ Session Management
- Monitor active sessions
- History of completed sessions
- Add beverages to sessions
- End sessions with cost calculation

### 📦 Package Management
- Create and edit packages
- View customer subscriptions
- Track remaining hours

### 🍵 Beverage Management
- Add and edit beverages
- Set prices

### 💰 Accounts & Reports
- Comprehensive daily report
- Financial transaction logs
- Breakdown by payment methods

### ⚙️ Settings
- Set hourly rates (Students/Employees)
- Space information

## 🗄️ Database

The database consists of 8 main tables:
- `customers` - Client information
- `sessions` - Session data
- `packages` - Available packages
- `customer_packages` - Client subscriptions
- `beverages` - Drink menu
- `session_beverages` - Drink orders per session
- `transactions` - Financial records
- `settings` - App configuration

## 🔐 Security

- Prevents app closure while sessions are active
- Precise time calculation (per minute)
- Secure storage in a local SQLite database

## 📝 Contribution

This project was developed specifically for managing coworking spaces.

## 📄 License

All rights reserved © 2026

---

**Developed with ❤️**
