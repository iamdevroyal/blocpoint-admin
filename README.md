# BlocPoint Admin Portal

**BlocPoint Admin** is a high-performance, user-first administrative console designed for managing a next-generation remittance and financial services platform. Built with a premium "Glassmorphism" aesthetic and optimized for transaction velocity and operational efficiency.

## 🚀 Vision

To provide financial operators with a single, high-fidelity lens into Africa's remittance ecosystem, enabling instant settlements, robust compliance, and seamless liquidity management.

## 🛠 Tech Stack

- **Frontend Framework**: [Vue 3](https://vuejs.org/) (Composition API)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Components**: [Headless UI](https://headlessui.com/)
- **Charts**: [ApexCharts](https://apexcharts.com/)
- **Icons**: [Lucide Vue Next](https://lucide.dev/)
- **API Client**: [Axios](https://axios-http.com/)

## ✨ Key Features

### 📊 Dashboard & Analytics
- Real-time transaction velocity monitoring.
- Liquidity distribution heatmaps.
- Revenue and volume performance tracking.

### 👤 Agent Management
- Multi-tier agent profiles and approval workflows.
- Performance monitoring and commission management.

### 💸 Financial Infrastructure
- **Wallets**: Real-time balance tracking and settlement vaults.
- **Treasury**: Global liquidity management and FX monitoring.
- **Ledger**: Double-entry accounting for financial integrity.
- **Reconciliation**: Automated matching and discrepancy resolution.

### 💎 Digital Assets
- **Gift Cards**: Inventory management and redemption tracking.
- **Stablecoins**: Yellow Card integration for seamless crypto-fiat ramps.

### 🛡 Security & Compliance
- **Compliance**: KYC/AML workflow management.
- **Risk Alerts**: Real-time fraud detection and AML triggers.
- **Audit Logs**: Comprehensive event logging for all administrative actions.

## 📂 Project Structure

```text
blocpoint-admin/
├── src/
│   ├── api/            # Axios instance and interceptors
│   ├── assets/         # Global styles and static assets
│   ├── components/     # Reusable UI components (BaseButton, Card, etc.)
│   ├── layouts/        # Page layouts (AdminLayout, AuthLayout)
│   ├── router/         # Vue Router configuration
│   ├── stores/         # Pinia state stores
│   ├── views/          # Page components (Dashboard, Agents, etc.)
│   └── main.ts         # Application entry point
├── public/             # Static public assets
└── package.json        # Dependencies and scripts
```

## 🛠 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

## 🔒 Security Requirements
- **Authentication**: JWT-based (Laravel Sanctum).
- **Session**: Idempotency enforced on all write operations.
- **Access**: RBAC (Role-Based Access Control).

---

© 2026 BlocPoint Inc. High-Performance Financial Infrastructure.
