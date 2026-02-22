# Devnagri Farms - Customer Mobile App

## 📱 Project Overview
Native mobile application for Devnagri Farms customers, built with React Native and Expo.

## 🛠 Tech Stack
- **Framework:** Expo 54 (SDK Managed)
- **Routing:** Expo Router v6 (File-based)
- **Styling:** NativeWind v4 (Tailwind for RN)
- **Networking:** Axios with central JWT interceptors

## 📊 Feature Implementation Status

| Feature | Status | Details |
| :--- | :--- | :--- |
| **Authentication** | ✅ Complete | Login, OTP Verification, Auto-login. |
| **Browsing** | ✅ Complete | Home Feed (Mock), Categories, Product Details. |
| **Cart** | ✅ Complete | Context-based with Persistence. |
| **Checkout** | ✅ Complete | Address selection and transactional order placement. |
| **Order History** | ✅ Complete | List with Pull-to-Refresh, Detailed Status visualization, and "View Order" from Success screen. |
| **Subscriptions** | ✅ Complete | Details, Calendar (Skip/Restore), Vacation Mode. |
| **Wallet UI** | 🚧 Missing | Passbook and Top-up screens. |

## 🤝 Development Conventions

- **Routing:** STRICTLY use Expo Router (`router.push`, `Link`). 
- **Folder Structure:** Files in `app/` should ONLY be route wrappers. All UI/Logic belongs in `src/features/`.
- **User Trust:** Always include Pull-to-Refresh on data-heavy screens (Orders, Subscriptions) to build trust in data freshness.
- **Success Flow:** Always provide a clear path from "Success" screens back to data details (e.g., "View Order" button).

## ⚠️ Critical: NativeWind v4 Interactive Bug
**NEVER use dynamic/conditional `className` on interactive components (`Pressable`, `TouchableOpacity`).** Use static `className` for layout + `style` prop for dynamic values to prevent React Navigation context crashes.
