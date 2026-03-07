# Devnagri Farms - Backend

## 🌍 Project Overview

Centralized RESTful API for Devnagri Farms, handling authentication, catalog, transactional orders, subscriptions, and a secure financial ledger.

## 🛠 Tech Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js (v5)
- **Database:** MySQL with Sequelize ORM
- **Payments:** Razorpay Node SDK
- **Storage:** AWS S3 (Presigned URLs)
- **Validation:** Joi

## 📂 Project Structure

```
backend/
├── src/
│   ├── config/         # DB, Logger, Razorpay
│   ├── controllers/    # auth, order, sub, user, wallet, payment
│   ├── migrations/     # Hardened for GST compliance (HSN/GST splits)
│   ├── models/         # User, Order, OrderItem, Sub, SubItem, Payment, WalletTransaction
│   ├── repositories/   # Data access layer
│   ├── services/       # Core business logic (fintech-grade ledger)
│   └── utils/          # AppError, token helpers
```

## 📊 Current API Status

| Module | Status | Notes |
| :--- | :--- | :--- |
| **Auth** | ✅ Complete | JWT with Refresh Token rotation. |
| **Catalog** | ✅ Complete | Products, Categories, Variants with HSN mapping. |
| **Orders** | ✅ Complete | Transactional logic with **Immutable Address Snapshots** and HSN/GST snapshotting. |
| **Subscriptions** | ✅ Complete | Daily/Weekly/Alternate schedules with vacation mode and race-condition safe cron engine. |
| **Wallet** | ✅ Complete | Ledger-based engine. Balance syncs with immutable transactions. |
| **Payments** | ✅ Complete | Razorpay order intent & idempotent webhook handling. |
| **User Mgmt** | ✅ Complete | Admin CRUD, Profile fetching, Block/Activate logic. |
| **Addresses** | ✅ Complete | CRUD with MySQL spatial serviceability checks and fixed user unique constraints. |
| **Invoicing** | 🚧 Planned | PDF generation for GST-compliant invoices. |

## 🛡️ Engineering Standards

### 1. Financial Integrity & Compliance
- **HSN/GST Snapshots:** Every `OrderItem` and `SubscriptionItem` captures tax rates and HSN codes at the moment of creation to ensure historical invoice accuracy.
- **Atomic Ledger:** `WalletService` ensures that a user's `wallet_balance` is never updated without a corresponding `WalletTransaction` record inside a SQL transaction.
- **Idempotent Webhooks:** Webhook processing uses `gateway_order_id` as a unique lock to prevent duplicate wallet crediting.

### 2. Concurrency & Reliability
- **Row-Level Locking:** Use `SELECT FOR UPDATE` when reading inventory or wallet balances that will be modified within the same transaction.
- **Layered Architecture:** Strict separation between `Controllers` (transport), `Services` (business logic), and `Repositories` (data access).
- **Graceful Error Handling:** Centralized `errorHandler` middleware using `AppError` class for consistent API responses.

## 📜 Database Management

Reset and Seed (Required for HSN/GST changes):
```bash
npm run db:migrate:undo:all
npm run db:migrate
npm run db:seed
```
