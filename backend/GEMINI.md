# Devnagri Farms - Backend

## 🌍 Project Overview
This is the backend service for the Devnagri Farms platform. It provides a RESTful API to support both the Admin Portal and the Customer Mobile App. The system handles authentication, product catalog management, order processing, and inventory control.

## 🛠 Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js (v5)
- **Database:** MySQL
- **ORM:** Sequelize
- **Authentication:** JWT (Access + Refresh Tokens)
- **Storage:** AWS S3
- **Validation:** Joi
- **Logging:** Winston & Morgan

## 📂 Project Structure
```
backend/
├── src/
│   ├── config/         # Configuration (DB, Logger)
│   ├── controllers/    # Request handlers
│   ├── middlewares/    # Custom middlewares (Auth, Error handling)
│   ├── migrations/     # Database schema changes
│   ├── models/         # Sequelize definitions
│   ├── repositories/   # Data access layer
│   ├── routes/         # Route definitions
│   ├── seeders/        # Initial data population
│   ├── services/       # Business logic
│   ├── utils/          # Helper functions
│   └── app.js          # Express app setup
├── server.js           # Entry point
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL Server

### Installation
1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Setup:**
    Create a `.env` file in the root directory (based on `.env.example` if available) with the following variables:
    ```env
    PORT=4000
    NODE_ENV=development

    # Database
    DB_HOST=localhost
    DB_USER=root
    DB_PASS=your_password
    DB_NAME=devnagri_farms

    # JWT Secrets
    ACCESS_TOKEN_SECRET=your_access_secret
    REFRESH_TOKEN_SECRET=your_refresh_secret

    # AWS S3 (If applicable)
    AWS_ACCESS_KEY_ID=...
    AWS_SECRET_ACCESS_KEY=...
    AWS_REGION=...
    AWS_BUCKET_NAME=...
    ```

3.  **Database Setup:**
    ```bash
    # Run migrations
    npm run db:migrate

    # Seed initial data (Admin user, Demo catalog)
    npm run db:seed
    ```

4.  **Start Server:**
    ```bash
    # Development (with Nodemon)
    npm run dev

    # Production
    npm start
    ```

## 📜 Key Scripts
- `npm run dev`: Starts the server in development mode.
- `npm start`: Starts the server in production mode.
- `npm run db:migrate`: Applies pending database migrations.
- `npm run db:seed`: Seeds the database with initial data.
- `npm run db:migrate:undo:all`: Reverts all migrations (Use with caution).

## 🏛 Architecture
The project follows a **Controller-Service-Repository** pattern to ensure separation of concerns:
1.  **Routes:** Define endpoints and map them to controllers.
2.  **Controllers:** Handle HTTP requests, validation, and response formatting.
3.  **Services:** Contain business logic and coordinate between repositories.
4.  **Repositories:** Handle direct database interactions using Sequelize.

## 📡 API Overview
The API is prefixed with `/api` and organized into modules:
- `/api/auth`: Authentication endpoints (Login, Register, Refresh Token).
- `/api/admin`: Administrative actions (Product management, User management).
- `/api/customer`: Customer-facing actions (Browsing products, Orders).
- `/api/public`: Publicly accessible data (if any).
- `/api/health`: Health check endpoint.

## 📊 Current API Status
| Module | Status | Notes |
| :--- | :--- | :--- |
| **Auth** | ✅ Complete | Login, Register, Refresh Token, Role-based Middleware. |
| **Catalog** | ✅ Complete | Categories, Products, Variants (CRUD + List). |
| **Serviceability** | ✅ Complete | Polygon-based area management & point-in-polygon checks. |
| **Storage** | ✅ Complete | AWS S3 Presigned URL generation. |
| **Orders** | ✅ Complete | Order placement logic with inventory checks implemented. |
| **Addresses** | ✅ Complete | Address CRUD for customers. |
| **Subscriptions** | ❌ Missing | Models exist, but no logic implemented. |
| **Payments** | ❌ Missing | Models exist, but no gateway integration. |
| **User Management** | ⚠️ Partial | Basic profile fetching. No update or admin list views. |

## 🤝 Development Conventions
- **Naming:** CamelCase for variables/functions, PascalCase for classes/models.
- **Async Handling:** Use `asyncHandler` wrapper for controllers to catch errors automatically.
- **Error Handling:** Throw `AppError` instances for controlled operational errors.
- **Validation:** Validate all inputs using `Joi` schemas in the controller layer.
