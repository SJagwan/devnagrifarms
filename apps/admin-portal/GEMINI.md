# Devnagri Farms - Admin Portal

## 🌍 Project Overview
Web-based management dashboard for Devnagri Farms operations, built with React and Vite.

## 🛠 Tech Stack
*   **Core:** React 19, Vite 7
*   **Styling:** Tailwind CSS v4, Headless UI
*   **Routing:** React Router DOM v7
*   **Maps:** Leaflet (Serviceable Area editor)
*   **Notifications:** React Hot Toast

## 📊 Feature Implementation Status

| Feature | Status | Details |
| :--- | :--- | :--- |
| **Authentication** | ✅ Complete | Secure login with automatic token refresh. |
| **Catalog** | ✅ Complete | CRUD for Products & Categories with HSN/Tax config. |
| **Order Mgmt** | ✅ Complete | List, Details, Status Updates, and Customer Profile links. |
| **Subscription Mgmt** | ✅ Complete | List, Details, and Status management. |
| **Customer Mgmt** | ✅ Complete | Searchable list, detailed profiles (stats, orders, subs, addresses), and Block/Activate toggle. |
| **Finance Dashboard**| 🚧 Missing | UI for Wallet ledger and manual adjustments. |

## 🤝 Development Conventions
- **Confirmation:** Always use `ConfirmDialog` for destructive or sensitive actions (like blocking a user).
- **Navigation:** Maintain tight interlinking between orders, subscriptions, and customer profiles.
- **Robustness:** Use fallbacks for dates (`createdAt` vs `created_at`) to handle backend database mappings gracefully.
