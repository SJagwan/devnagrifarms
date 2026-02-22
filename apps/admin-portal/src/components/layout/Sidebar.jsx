import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { icon: "📊", label: "Dashboard", path: "/" },
  { icon: "📦", label: "Orders", path: "/orders" },
  { icon: "🔄", label: "Subscriptions", path: "/subscriptions" },
  { icon: "👥", label: "Customers", path: "/customers" },
  { icon: "📂", label: "Categories", path: "/categories" },
  { icon: "🛒", label: "Products", path: "/products" },
  { icon: "📍", label: "Serviceable Areas", path: "/serviceable-areas" },
];

export default function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-primary-800 text-white transition-all duration-300 z-50 ${
        isOpen ? "w-64" : "w-20 -translate-x-full lg:translate-x-0"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-primary-700">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌾</span>
          {isOpen && <span className="font-bold text-lg">DevnagriFarms</span>}
        </div>
      </div>

      {/* Menu Items */}
      <nav className="mt-6">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
              location.pathname === item.path
                ? "bg-primary-600 border-l-4 border-secondary-500"
                : "hover:bg-primary-700"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {isOpen && <span className="font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Desktop Toggle Button - Hidden on mobile */}
      <button
        onClick={toggleSidebar}
        className="hidden lg:block absolute -right-3 top-20 bg-primary-600 rounded-full p-1.5 shadow-lg hover:bg-primary-500 transition-colors z-50 cursor-pointer"
      >
        <span className="text-white text-xs">{isOpen ? "◀" : "▶"}</span>
      </button>
    </aside>
  );
}
