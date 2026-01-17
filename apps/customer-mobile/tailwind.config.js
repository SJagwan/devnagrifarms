/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2E7D32", // Forest Green
          light: "#4CAF50",
          dark: "#1B5E20",
        },
        secondary: {
          DEFAULT: "#8BC34A", // Light Green
          light: "#DCEDC8",
        },
        earth: "#795548",
        cream: "#F9F9F9",
        gray: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#EEEEEE",
          800: "#424242",
          900: "#212121",
        },
      },
    },
  },
  plugins: [],
  presets: [require("nativewind/preset")],
};
