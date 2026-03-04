# Devnagri Farms - Project Overview

## 🌍 Project Summary

Devnagri Farms is a comprehensive platform managing farm produce sales and distribution. The system is structured as a monorepo containing a centralized backend API, a web-based admin portal for management, and a mobile application for customers.

## 🏗 Architecture & Tech Stack

The project is organized into three main components:

### 1. Backend (`/backend`)

- **Core:** Node.js with Express.js
- **Database:** MySQL with Sequelize ORM
- **Authentication:** JWT (JSON Web Tokens) with Refresh Token rotation
- **Storage:** AWS S3 integration
- **Architecture Pattern:** Controller-Service-Repository (Layered Architecture)
- **Key Dependencies:** `express`, `sequelize`, `mysql2`, `jsonwebtoken`, `bcrypt`, `@aws-sdk/client-s3`, `razorpay`

### 2. Admin Portal (`/apps/admin-portal`)

- **Platform:** Web Application
- **Core:** React.js (v19) via Vite
- **Styling:** Tailwind CSS (v4) with Headless UI
- **Maps:** Leaflet & React Leaflet
- **Routing:** React Router DOM (v7)

### 3. Customer Mobile App (`/apps/customer-mobile`)

- **Platform:** iOS & Android
- **Core:** React Native with Expo (Managed Workflow)
- **Routing:** Expo Router (File-based routing)
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **State Management:** Context API (`AuthContext`)
- **Storage:** Expo Secure Store

---

## 📊 Current Project Status

### ✅ Backend (API)

- **Auth:** Complete (JWT, Refresh Tokens).
- **Catalog:** Complete (Categories, Products, Variants).
- **Serviceable Areas:** Complete (CRUD, Geo-checks).
- **Storage:** Complete (S3 Presigned URLs).
- **Orders:** ✅ Complete (Placement logic with HSN/GST snapshots).
- **Addresses:** ✅ Complete (CRUD).
- **Subscriptions:** ✅ Complete (Logic, Vacation Mode, Skip/Unskip, HSN/GST snapshots).
- **Payments/Wallet:** ✅ Core Engine Complete (Ledger system, Razorpay integration, Webhooks).
- **🚧 Missing:**
  - **Invoicing:** PDF generation logic.

### ✅ Admin Portal (Web)

- **Auth:** Login flow integrated.
- **Catalog Management:** Full CRUD for Products & Categories.
- **Serviceability:** Interactive Map Editor for delivery zones.
- **Order Management:** ✅ Complete (Dashboard, Detail, Status Updates, Profile links).
- **Subscription Management:** ✅ Complete (Dashboard, Detail, Status Updates).
- **Customer Management:** ✅ Complete (List, Full Profile Detail, Block/Activate with confirmation).
- **🚧 Missing:**
  - **Finance Dashboard:** UI for wallet transactions and manual adjustments.

### ✅ Customer App (Mobile)

- **Auth:** Login/OTP flow.
- **Browsing:** Home, Product Listing, Product Details.
- **Serviceability:** Location check logic.
- **Cart:** ✅ Complete (Context, Persistence).
- **Checkout:** ✅ Complete (Address selection, Order placement).
- **Order History:** ✅ Complete (List with Pull-to-Refresh, Detailed Status Tracker, Success screen integration).
- **🚧 Missing:**
  - **Wallet UI:** Passbook and Add Funds screens.
  - **Payments:** Frontend Razorpay SDK integration.

---

## 🚀 Getting Started (Financial Setup)

**Note:** The database schema has been hardened for GST compliance. If you are updating from an older version, please reset your database:
```bash
cd backend
npm run db:migrate:undo:all
npm run db:migrate
npm run db:seed
```

---

## 📂 Directory Structure Details

### `/backend`

- `src/controllers/`: Handles incoming HTTP requests and responses.
- `src/services/`: Contains business logic (Order, Subscription, Wallet, Payment).
- `src/repositories/`: Handles direct database interactions.
- `src/models/`: Sequelize models (now including HSN/GST snapshots).

### `/apps/customer-mobile`

- `app/`: File-based routing (Expo Router).
- `src/features/`: Feature-specific logic (auth, cart, products, orders, subscriptions).

### `/apps/admin-portal`

- `src/pages/`: Main view components (Dashboard, Orders, Customers, etc.).
- `src/lib/api/`: Centralized API clients (`adminAPI`, `authAPI`).

## 🤝 Development Conventions

- **Monorepo:** Maintain separation of concerns between apps and backend.
- **Financial Integrity:** Never update `wallet_balance` directly; always use `WalletService` to ensure a `WalletTransaction` (ledger) is created.
- **Legal Compliance:** Always snapshot HSN and GST rates during order/subscription creation.

---

## 🧠 AI Agent Persona & Engineering Standards

Act as a senior software engineer and backend architect with 15+ years of experience building production-grade systems. All generated or reviewed code must adhere to the following strict production-level engineering standards:

### Coding Standards
- Use clean, readable, and maintainable code following SOLID principles and clean architecture patterns.
- Ensure clear separation of concerns (controllers, services, repositories, models).
- Avoid tight coupling and unnecessary complexity; use consistent naming conventions and clear abstractions.
- Write modular and reusable components.

### Reliability and Safety
- Ensure implementations are safe for production environments (idempotency, concurrency, retry safety).
- Handle edge cases, avoid race conditions, and prevent unsafe state mutations.
- Ensure operations modifying critical data are atomic and consistent.

### Error Handling
- Implement structured error handling; avoid silent failures.
- Provide meaningful error messages for debugging/monitoring and use centralized error handling.

### Data Integrity
- Ensure strong data consistency and avoid partial updates that may corrupt state.
- Validate inputs thoroughly and follow best practices for databases and external systems.

### Security
- Never expose sensitive data; validate and sanitize inputs.
- Protect endpoints against unauthorized access and follow secrets management best practices.

### Scalability
- Write code that scales horizontally; avoid single-instance execution designs.
- Prevent duplicate processing during retries or parallel execution.

### Observability
- Add meaningful logging for critical actions to make systems debuggable and traceable.
- Ensure logs help diagnose failures in production.

### Code Quality
- Prefer clarity over cleverness; eliminate obvious inefficiencies without premature optimization.
- Ensure the code is easy to extend and maintain.