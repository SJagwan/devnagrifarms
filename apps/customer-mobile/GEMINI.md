# Devnagri Farms - Customer Mobile App

## 📱 Project Overview
This is the **customer-facing mobile application** for Devnagri Farms. It allows end-users to browse farm produce, manage their cart, and place orders.

*   **Type:** Native Mobile Application (iOS & Android)
*   **Framework:** [React Native](https://reactnative.dev/) (v0.81) via [Expo](https://expo.dev/) (v54)
*   **Architecture:** Feature-based folder structure with Expo Router file-based navigation.

## 🛠 Tech Stack

*   **Core:** React Native + Expo (Managed Workflow)
*   **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/) (v6) - File-based routing located in `app/`.
*   **Styling:** [NativeWind](https://www.nativewind.dev/) (v4) - Tailwind CSS implementation for React Native.
*   **State Management:** React Context API (`AuthContext`).
*   **Networking:** Axios (Centralized instance with JWT interceptors).
*   **Storage:** `expo-secure-store` for sensitive data (tokens), local state for cart (in-progress).
*   **Environment:** Uses `.env` files with `EXPO_PUBLIC_` prefix.

## 🚀 Building & Running

### Prerequisites
*   Node.js (LTS)
*   **Expo Go** app installed on your physical device OR Android Studio/Xcode for emulators.

### Commands
| Command | Description |
| :--- | :--- |
| `npm start` | Starts the Metro Bundler (interactive CLI). |
| `npm run android` | Opens the app in an Android Emulator. |
| `npm run ios` | Opens the app in an iOS Simulator. |
| `npm start -- -c` | Starts Metro with cache cleared (useful for NativeWind issues). |

### Environment Setup
Create/Edit `.env.development`:
```env
# Localhost for Android Emulator is 10.0.2.2
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000/api

# For Physical Device, use your LAN IP
# EXPO_PUBLIC_API_URL=http://192.168.1.X:4000/api
```

## 📂 Directory Structure

### `app/` (Navigation)
Follows Expo Router conventions.
*   `_layout.js`: Root layout (Providers: Auth, SafeArea, Toast).
*   `(tabs)/`: Tab-based navigation group (Home, Cart, Profile).
*   `auth/`: Authentication stack (Login, Verify OTP).
*   `product/`: Product details routes.

### `src/` (Logic)
*   `features/`: **Vertical Slices**. Each feature (e.g., `auth`, `cart`, `products`) contains its own:
    *   `screens/`: Screen components.
    *   `components/`: Feature-specific UI.
    *   `hooks/`: Logic hooks.
*   `lib/`: Core utilities.
    *   `apiClient.js`: **Critical**. Axios instance with Request/Response interceptors for JWT injection and Refresh Token logic.
*   `context/`: Global providers (AuthContext).

## 🤝 Development Conventions

*   **Routing:** STRICTLY use Expo Router (`router.push`, `Link`). Do not use React Navigation directly.
*   **Styling:** Use Tailwind classes (`className="..."`). Only use `StyleSheet` for complex animations or non-standard needs.
*   **API:** Import the `api` instance from `@lib/apiClient`. Do not make raw `axios` calls.
*   **Auth:** `AuthContext` handles the "is logged in" state. The `apiClient` handles the actual token storage and refreshing transparently.
*   **Path Aliases:** configured in `babel.config.js` (e.g., `@lib` -> `./src/lib`).

## 🔑 Key Files
*   `src/lib/apiClient.js`: Handles all HTTP communication, token rotation, and logging.
*   `app/_layout.js`: Entry point, sets up `AuthContext` and SafeArea.
*   `src/context/AuthContext.js`: Manages user session state.
*   `tailwind.config.js` & `global.css`: Styling configuration.
