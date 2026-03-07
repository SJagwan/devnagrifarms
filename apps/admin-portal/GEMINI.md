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
| **Finance Dashboard**| ✅ Complete | UI for Wallet ledger and system-wide transaction monitoring. |

## 🤝 Development Conventions & Standards

### 1. Robust UI/UX
- **Confirmation Flow:** Always use `ConfirmDialog` for destructive or sensitive actions (like blocking a user or deleting a zone).
- **Feedback:** Provide immediate visual feedback via `Toaster` notifications for all API interactions.
- **Scrollable Modals:** Use the enhanced `Modal` component which supports scrollable content to prevent clipping on small viewports.

### 2. Data Handling
- **Interlinking:** Maintain tight interlinking between orders, subscriptions, and customer profiles for operational efficiency.
- **Date Resilience:** Use fallbacks for dates (`createdAt` vs `created_at`) to handle backend database mappings gracefully.
- **Map Integrity:** When using maps in modals, always call `invalidateSize()` after a short delay to ensure correct tile rendering.

### 3. Navigation
- Use React Router DOM `useNavigate` and `Link` for internal routing.
- Keep route structure flat where possible to simplify breadcrumbs and state management.
