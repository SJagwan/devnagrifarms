# Customer Mobile App

This is the native mobile application for Devnagri Farms customers, built with **React Native** and **Expo**.

## 🏗 Tech Stack

- **Framework:** [Expo](https://expo.dev/) (Managed Workflow) - The easiest way to build React Native apps.
- **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/) - File-based routing (similar to Next.js).
- **Styling:** [NativeWind](https://www.nativewind.dev/) (v4) - Tailwind CSS for React Native.
- **Networking:** [Axios](https://axios-http.com/) - For API requests.
- **Storage:** [Expo Secure Store](https://docs.expo.dev/versions/latest/sdk/securestore/) - For securely storing tokens.

## 📂 Project Structure

Just like a house, every folder has a purpose:

### `app/` (The Application Logic & Navigation)

This is the heart of the app. The file structure **IS** the navigation structure.

- `_layout.js`: The foundation. It wraps every screen. Used for providers (Auth, Theme) and global layout logic.
- `index.js`: The entry door. Checks if the user is logged in and redirects them accordingly.
- `auth/`: Authentication screens (`login.js`, `verify.js`).
- `(tabs)/`: The main bottom tab navigation groups (Home, Shop, Profile). The `()` syntax means "group", it doesn't add to the URL path.

### `lib/` (The Utilities & Brain)

- `api/index.js`: **The Phone.** All communication with the backend happens here.
- `context/AuthContext.js`: **The Memory.** Remembers the logged-in user and handles login/logout logic.

### `components/` (The Furniture)

- `ui/`: Reusable UI elements like `Button.js`, `Input.js`.

## 🚀 Setup & Development

### 1. Environment Variables

You must configure the API URL based on where you are testing.
Edit `.env.development`:

```env
# For Android Emulator
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000/api

# For Physical Device (same Wi-Fi)
# EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:4000/api
```

### 2. Running the App

```bash
# Start the Metro Bundler (clearing cache is recommended)
npx expo start -c
```

- Press `a` for Android Emulator.
- Press `i` for iOS Simulator.
- Scan QR code with Expo Go app on a physical device.

## 🧠 Development Philosophy

1.  **Verify First:** We build the critical path first (Auth -> Location Check -> Home). If a user can't log in, nothing else matters.
2.  **Native Feel:** We use `NativeWind` to style standard React Native components quickly, ensuring it feels like a proper mobile app.
3.  **Secure by Default:** Authentication tokens are stored in Secure Store, and `user_type` is enforced on every request.
