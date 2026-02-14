# Devnagri Farms - Project Overview

## 🌍 Project Summary
Devnagri Farms is a comprehensive platform managing farm produce sales and distribution. The system is structured as a monorepo containing a centralized backend API, a web-based admin portal for management, and a mobile application for customers.

## 🏗 Architecture & Tech Stack

The project is organized into three main components:

### 1. Backend (`/backend`)
*   **Core:** Node.js with Express.js
*   **Database:** MySQL with Sequelize ORM
*   **Authentication:** JWT (JSON Web Tokens) with Refresh Token rotation
*   **Storage:** AWS S3 integration
*   **Architecture Pattern:** Controller-Service-Repository (Layered Architecture)
*   **Key Dependencies:** `express`, `sequelize`, `mysql2`, `jsonwebtoken`, `bcrypt`, `@aws-sdk/client-s3`

### 2. Admin Portal (`/apps/admin-portal`)
*   **Platform:** Web Application
*   **Core:** React.js (v19) via Vite
*   **Styling:** Tailwind CSS (v4) with Headless UI
*   **Maps:** Leaflet & React Leaflet (likely for tracking or delivery zones)
*   **Routing:** React Router DOM (v7)

### 3. Customer Mobile App (`/apps/customer-mobile`)
*   **Platform:** iOS & Android
*   **Core:** React Native with Expo (Managed Workflow)
*   **Routing:** Expo Router (File-based routing)
*   **Styling:** NativeWind (Tailwind CSS for React Native)
*   **State Management:** Context API (`AuthContext`)
*   **Storage:** Expo Secure Store

---

## 📊 Current Project Status

### ✅ Backend (API)
*   **Auth:** Complete (JWT, Refresh Tokens).
*   **Catalog:** Complete (Categories, Products, Variants).
*   **Serviceable Areas:** Complete (CRUD, Geo-checks).
*   **Storage:** Complete (S3 Presigned URLs).
*   **Orders:** ✅ Complete (Placement logic, Inventory checks).
*   **Addresses:** ✅ Complete (CRUD).
*   **Subscriptions:** ⚠️ Partial (Logic implemented, Payment integration pending).
*   **🚧 Missing:**
    *   **Payments/Wallet:** Models exist, but no gateway integration.
    *   **Customer Profile:** Basic placeholder only.

### ✅ Admin Portal (Web)
*   **Auth:** Login flow integrated.
*   **Catalog Management:** Full CRUD for Products & Categories.
*   **Serviceability:** Interactive Map Editor for delivery zones.
*   **Order Management:** ✅ Complete (Dashboard, Detail, Status Updates).
*   **Subscription Management:** ✅ Complete (Dashboard, Detail, Status Updates).
*   **🚧 Missing:**
    *   **Customer Management:** List & User details.

### ✅ Customer App (Mobile)
*   **Auth:** Login/OTP flow.
*   **Browsing:** Home, Product Listing, Product Details.
*   **Serviceability:** Location check logic.
*   **Cart:** ✅ Complete (Context, Persistence).
*   **Checkout:** ✅ Complete (Address selection, Order placement).
*   **Orders:** ⚠️ Partial (Order Success screen only, History pending).
*   **🚧 Missing:**
    *   **Payments:** No Payment Gateway integration.

---

## 🚀 Getting Started

### Backend Setup
The backend serves as the API for both the admin portal and mobile app.

1.  **Navigate to directory:**
    ```bash
    cd backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Database Configuration:**
    *   Ensure MySQL is running.
    *   Configure database connection in `.env` (refer to `config/config.js` or generic environment variables).
    *   Run migrations and seeds:
        ```bash
        npm run db:migrate
        npm run db:seed
        ```
4.  **Start the Server:**
    ```bash
    npm run dev  # Starts with Nodemon
    # or
    npm start    # Production start
    ```

### Admin Portal Setup
1.  **Navigate to directory:**
    ```bash
    cd apps/admin-portal
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start Development Server:**
    ```bash
    npm run dev
    ```
    *   Runs on the default Vite port (usually http://localhost:5173).

### Customer Mobile App Setup
1.  **Navigate to directory:**
    ```bash
    cd apps/customer-mobile
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Configuration:**
    *   Check `.env.development`.
    *   Set `EXPO_PUBLIC_API_URL` to your backend URL (e.g., `http://10.0.2.2:4000/api` for Android Emulator or your LAN IP for physical devices).
4.  **Start Application:**
    ```bash
    npx expo start -c
    ```
    *   Press `a` for Android Emulator.
    *   Press `i` for iOS Simulator.

---

## 📂 Directory Structure Details

### `/backend`
*   `src/controllers/`: Handles incoming HTTP requests and responses.
*   `src/services/`: Contains business logic.
*   `src/repositories/`: Handles direct database interactions.
*   `src/models/`: Sequelize models defining database schema.
*   `src/routes/`: API route definitions.
*   `src/migrations/`: Database schema changes history.
*   `src/seeders/`: Initial data population.

### `/apps/customer-mobile`
*   `app/`: File-based routing (Expo Router).
    *   `_layout.js`: Global providers and layout wrappers.
    *   `(tabs)/`: Main navigation groups (Home, Cart, Profile).
*   `src/features/`: Feature-specific logic and components.
*   `src/lib/`: Utilities, API clients, and constants.

### `/apps/admin-portal`
*   `src/pages/`: Main view components.
*   `src/components/`: Reusable UI components.
*   `src/lib/`: API clients (`api/`), configuration, and utilities.

## 🤝 Development Conventions

*   **Monorepo:** Maintain separation of concerns between apps and backend.
*   **Backend Logic:** Keep controllers thin; delegate business logic to services.
*   **Mobile Styling:** Use NativeWind classes for consistent styling similar to the web frontend.
*   **Mobile Navigation:** strictly adhere to Expo Router's file-based navigation conventions.
*   **Environment:** Always ensure your `.env` files are correctly set up for the specific environment (local/dev/prod) you are working in.
