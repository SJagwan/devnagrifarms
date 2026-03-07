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

- **Auth:** Complete (JWT, Refresh Tokens, Timing-safe Webhook validation).
- **Catalog:** Complete (Categories, Products, Variants with HSN/GST mapping).
- **Serviceable Areas:** Complete (CRUD, Geo-checks with MySQL Spatial functions).
- **Storage:** Complete (S3 Presigned URLs).
- **Orders:** ✅ Hardened (Immutable address snapshots, HSN/GST snapshots, DB-level composite unique idempotency).
- **Addresses:** ✅ Complete (CRUD, fixed unique constraint bug allowing multiple addresses per user).
- **Subscriptions:** ✅ Hardened (Daily/Weekly/Alternate logic, Vacation Mode, Skip/Unskip, Race-condition safe processing engine).
- **Payments/Wallet:** ✅ Hardened Ledger (Explicit credit/debit directions, JSON metadata for traceability, Razorpay integration).
- **🚧 Missing:**
  - **Invoicing:** PDF generation logic.

### ✅ Admin Portal (Web)

- **Auth:** Login flow integrated.
- **Catalog Management:** Full CRUD for Products & Categories.
- **Serviceability:** Interactive Map Editor for delivery zones with `invalidateSize` fix for modals.
- **Order Management:** ✅ Complete (Dashboard, Detail, Status Updates, Profile links).
- **Subscription Management:** ✅ Complete (Dashboard, Detail, Status Updates).
- **Customer Management:** ✅ Complete (List, Full Profile Detail, Block/Activate with confirmation).
- **Finance Dashboard:** ✅ Complete (System-wide ledger, user passbook links).

### ✅ Customer App (Mobile)

- **Auth:** Login/OTP flow with improved input handling (no auto-correct on sensitive fields).
- **Browsing:** Home, Product Listing, Product Details.
- **Serviceability:** Location check logic with "Open Settings" support for denied permissions.
- **Cart:** ✅ Complete (Context, Persistence).
- **Checkout:** ✅ Complete (Address selection, Order placement).
- **Order History:** ✅ Hardened (Redesigned UI, fixed imports, proper status tracking).
- **Address Management:** ✅ Hardened (Redesigned list with "Default" indicators, fixed creation/edit flow).
- **Wallet UI:** ✅ Complete (Passbook, Add Funds via Razorpay integration).
- **Subscriptions:** ✅ Consolidated (Production-ready plural routing `/subscriptions`, flattened account routes).

---

## 🤝 Development Conventions & Standards

### Monorepo & Clean Architecture
- **Separation of Concerns:** Keep business logic in `services`, data access in `repositories`, and transport logic in `controllers`.
- **Naming:** Use pluralized resources for collections (`/subscriptions`, `/orders`).
- **File Structure:** In mobile, `app/` is strictly for route wrappers; `src/features/` contains all UI and logic.

### Database & Financial Standards
- **Immutability:** Never link orders to mutable user data. Always **snapshot** addresses and tax rates at $T=0$.
- **Financial Integrity:** `wallet_balance` must only be updated via `WalletService` to guarantee an atomic `WalletTransaction` entry.
- **Concurrency:** Use `SELECT FOR UPDATE` (row-level locking) for inventory and wallet operations to prevent race conditions.
- **MySQL Compatibility:** Avoid partial indexes (unsupported). Use manual code checks or composite unique constraints for logic like "one order per sub per day".

### UI/UX Standards
- **Feedback:** Use `ActivityIndicator` for loading and `RefreshControl` for data lists.
- **Safety:** Always use `ConfirmDialog` for destructive actions.
- **Keyboard Handling:** Use `KeyboardAvoidingView` with platform-specific behaviors (padding for iOS, undefined for Android) to prevent overlap.
- **NativeWind Warning:** Avoid dynamic `className` on interactive components (`Pressable`); use the `style` prop for dynamic colors/opacity.

---

## 🧠 AI Agent Persona

Act as a senior software engineer and backend architect with 15+ years of experience building production-grade systems. All generated or reviewed code must adhere to strict production-level engineering standards: SOLID principles, structured error handling, and horizontal scalability.
