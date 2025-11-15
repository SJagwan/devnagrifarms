import { useState, useRef, useEffect } from "react";

export default function Dropdown({ trigger, children, align = "right" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const alignmentClasses = {
    left: "left-0",
    right: "right-0",
    center: "left-1/2 -translate-x-1/2",
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute ${alignmentClasses[align]} mt-2 min-w-[12rem] bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1`}
        >
          {typeof children === "function"
            ? children({ close: () => setIsOpen(false) })
            : children}
        </div>
      )}
    </div>
  );
}

// Dropdown Item Component
export function DropdownItem({ children, onClick, variant = "default" }) {
  const variantClasses = {
    default: "text-gray-700 hover:bg-gray-50",
    danger: "text-red-600 hover:bg-red-50",
    primary: "text-primary-600 hover:bg-primary-50",
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 text-sm ${variantClasses[variant]} flex items-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {children}
    </button>
  );
}

// Dropdown Divider
export function DropdownDivider() {
  return <div className="h-px bg-gray-200 my-1" />;
}

// Dropdown Header
export function DropdownHeader({ children }) {
  return (
    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
      {children}
    </div>
  );
}
