# Devnagri Farms - Applications Context

## 🌍 Context
This directory contains the client-side applications for the Devnagri Farms platform. It is part of a monorepo that also includes a Node.js/MySQL backend (located in `../backend`).

## 📱 Applications

### 1. Admin Portal (`./admin-portal`)
A web-based dashboard for farm management, product cataloging, and order processing.

*   **Framework:** React 19 + Vite 7
*   **Styling:** Tailwind CSS v4 + Headless UI
*   **Routing:** React Router DOM v7
*   **Maps:** Leaflet & React Leaflet (for Serviceable Areas)
*   **State/Feedback:** React Hot Toast for notifications
*   **Status:** ✅ Production Ready UI for Orders, Customers, Subscriptions, and Finance.

### 2. Customer Mobile App (`./customer-mobile`)
A mobile application for end-customers to browse produce, manage carts, and place orders.

*   **Framework:** React Native 0.81 + Expo 54
*   **Routing:** Expo Router v6 (File-based routing in `app/`)
*   **Styling:** NativeWind v4 (Tailwind CSS for RN)
*   **Storage:** Expo Secure Store
*   **Status:** ✅ Feature-complete for Auth, Browsing, Orders, Addresses, and Wallet.

## 🛠 Shared Engineering Patterns

### 1. Networking & Security
- **HTTP Client:** Both apps use `axios` instances with central interceptors for JWT lifecycle management (Access + Refresh tokens).
- **Environment:** Strict separation of environment variables via `.env` files (Vite/Expo prefixes).

### 2. UI/UX Standards
- **Consistency:** Both utilize Tailwind CSS syntax to maintain design language.
- **Resilience:** All data-heavy views include loaders (`ActivityIndicator`/`Spinner`) and refresh mechanisms.
- **Safety:** Destructive actions are always gated behind confirmation dialogs.

## 📂 Directory Map

```text
apps/
├── admin-portal/
│   ├── src/
│   │   ├── components/  # UI & Layout components
│   │   ├── context/     # AuthContext
│   │   ├── lib/         # API clients & utilities
│   │   └── pages/       # Route views
│
└── customer-mobile/
    ├── app/             # Expo Router route wrappers (Strictly minimal)
    ├── src/
    │   ├── features/    # Feature-based logic, UI, and state
    │   └── lib/         # Shared API & position services
```
