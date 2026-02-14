# Devnagri Farms - Admin Portal

## 🌍 Project Overview
The **Admin Portal** is the web-based command center for the Devnagri Farms platform. It enables administrators to manage the product catalog, define serviceable delivery areas using interactive maps, and oversee platform operations.

## 🛠 Tech Stack
*   **Core:** React 19, Vite 7
*   **Routing:** React Router DOM v7
*   **Styling:** Tailwind CSS v4, Headless UI
*   **Maps:** Leaflet, React Leaflet, Leaflet Draw
*   **State Management:** React Context API (Auth)
*   **HTTP Client:** Axios (with JWT interceptors)
*   **Notifications:** React Hot Toast

## 🚀 Building and Running

### Prerequisites
*   Node.js (LTS recommended)
*   Backend API running (default: `http://localhost:4000/api`)

### Scripts
| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the development server (with HMR) |
| `npm run build` | Build the application for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint for code quality checks |

## ⚙️ Configuration
The application is configured via environment variables. Create a `.env` file in the root directory:

```env
# URL of the backend API
VITE_API_BASE_URL=http://localhost:4000/api
```

*   **Config File:** `src/lib/config.js` loads these variables.

## 📂 Directory Structure
*   `src/components/`
    *   `layout/`: Core layout components (Sidebar, Header, MainLayout).
    *   `ui/`: Reusable UI elements (Button, Modal, Table, etc.).
    *   `PolygonMapEditor.jsx`: Specialized component for drawing delivery zones.
*   `src/context/`: Context providers (primarily `AuthContext`).
*   `src/lib/`:
    *   `api/`: Axios instance (`http.js`) and API endpoints (`requests.js`, `orders.js`).
    *   `auth.js`: Token management utilities.
*   `src/pages/`: Main application views/routes.
*   `src/routes/`: Route definitions (`protectedRoutes`).

## 📊 Feature Implementation Status
| Feature | Status | Details |
| :--- | :--- | :--- |
| **Authentication** | ✅ Complete | Login page, Token storage, Protected Routes. |
| **Catalog** | ✅ Complete | Product & Category CRUD, Variant Management. |
| **Serviceability** | ✅ Complete | Map-based Zone Editor (Leaflet). |
| **Orders** | ✅ Complete | Dashboard, List, Details, Status Update. |
| **Subscriptions** | ✅ Complete | Dashboard, Detail, Status Updates. |
| **Customers** | ❌ Missing | No customer list or details view. |

## 🤝 Development Conventions
- **Auth Flow:** The app uses a JWT-based auth flow with automatic refresh tokens handling in `src/lib/api/http.js`.
- **Error Handling:** Global error handling is implemented in the Axios interceptor, displaying toast notifications for errors.
- **Maps:** Serviceable areas are managed using Leaflet. Ensure map components are properly lazy-loaded or handled if SSR is ever introduced (though this is currently a SPA).
- **Styling:** Utility-first CSS with Tailwind v4. Use `@headlessui/react` for accessible interactive components (Dropdowns, Dialogs).
