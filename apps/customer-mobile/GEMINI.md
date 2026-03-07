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
| **Authentication** | ✅ Complete | Login, OTP Verification, Auto-login with optimized inputs. |
| **Browsing** | ✅ Complete | Home Feed, Categories, Product Details. |
| **Cart** | ✅ Complete | Context-based with Persistence. |
| **Checkout** | ✅ Complete | Address selection and transactional order placement. |
| **Order History** | ✅ Complete | List with Pull-to-Refresh, Detailed Status visualization, and fixed imports. |
| **Subscriptions** | ✅ Complete | consolidated `/subscriptions` routes, Details, Calendar (Skip/Restore), Vacation Mode. |
| **Wallet UI** | ✅ Complete | Passbook and Add Funds via Razorpay integration. |
| **Addresses** | ✅ Complete | Redesigned list UI with "Default" indicators and "Open Settings" support. |

## 🤝 Development Conventions & Standards

### 1. Routing & Structure
- **Stucture:** STRICTLY use Expo Router (`router.push`, `Link`). 
- **Folder Convention:** Files in `app/` should ONLY be route wrappers. All UI/Logic belongs in `src/features/`.
- **Nesting:** Prefer pluralized top-level routes for collections (e.g., `/subscriptions` instead of `/subscription`).

### 2. UI/UX Consistency
- **User Trust:** Always include `Pull-to-Refresh` on data-heavy screens (Orders, Subscriptions) to build trust in data freshness.
- **Success Flow:** Always provide a clear path from "Success" screens back to data details (e.g., "View Order" button).
- **Keyboard Safety:** Use `KeyboardAvoidingView` with platform-specific offsets and behaviors to prevent overlapping inputs.
- **Permission UX:** When permissions are denied, always provide an "Open Settings" option to the user.

### 3. NativeWind v4 Interactive Bug
- **⚠️ Critical:** **NEVER use dynamic/conditional `className` on interactive components (`Pressable`, `TouchableOpacity`).** Use static `className` for layout + `style` prop for dynamic values to prevent React Navigation context crashes.
