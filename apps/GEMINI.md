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
*   **HTTP Client:** Axios

**Key Scripts:**
*   `npm run dev`: Start development server (default port 5173)
*   `npm run build`: Build for production
*   `npm run lint`: Run ESLint

### 2. Customer Mobile App (`./customer-mobile`)
A mobile application for end-customers to browse produce, manage carts, and place orders.

*   **Framework:** React Native 0.81 + Expo 54
*   **Architecture:** New Architecture enabled (`newArchEnabled: true`)
*   **Routing:** Expo Router v6 (File-based routing in `app/`)
*   **Styling:** NativeWind v4 (Tailwind CSS for RN)
*   **Animations:** React Native Reanimated
*   **Storage:** Expo Secure Store
*   **Scheme:** `devnagri://`

**Key Scripts:**
*   `npm start`: Start Expo Metro Bundler
*   `npm run android`: Run on Android Emulator/Device
*   `npm run ios`: Run on iOS Simulator/Device

## 🛠 Configuration & Integration

### Environment Variables
Both apps rely on environment variables to connect to the backend API.
*   **Admin:** Uses `.env` (Vite standards: `VITE_API_URL`).
*   **Mobile:** Uses `.env.development` / `.env.production` (Expo standards: `EXPO_PUBLIC_API_URL`).

### Shared Patterns
*   **HTTP Client:** Both apps use `axios` instances configured with interceptors for JWT auth (handling access/refresh tokens).
*   **Styling:** Both utilize Tailwind CSS syntax (v4 for Web, NativeWind for Mobile) to maintain design consistency.

## 📂 Directory Map

```text
apps/
├── admin-portal/
│   ├── src/
│   │   ├── components/  # UI & Layout components
│   │   ├── context/     # AuthContext
│   │   ├── lib/         # API clients & utilities
│   │   └── pages/       # Route views
│   └── vite.config.js
│
└── customer-mobile/
    ├── app/             # Expo Router screens
    │   ├── (tabs)/      # Bottom tab navigation
    │   └── auth/        # Auth flow screens
    ├── src/
    │   ├── features/    # Feature-based logic
    │   └── lib/         # API & utilities
    └── app.json         # Expo Config
```
