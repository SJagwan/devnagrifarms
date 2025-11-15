import { useAuth } from "../../context/AuthContext";
import Dropdown, { DropdownItem } from "../ui/Dropdown";

export default function Header({ onToggleSidebar }) {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="ml-auto">
          <Dropdown
            align="right"
            trigger={
              <button className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  {getInitials(user?.name)}
                </div>
                <span className="font-medium text-gray-900">
                  {user?.name || "Admin User"}
                </span>
              </button>
            }
          >
            {({ close }) => (
              <>
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="text-sm text-gray-500 truncate">
                    {user.email}
                  </div>
                </div>
                <DropdownItem
                  onClick={() => {
                    close();
                    logout();
                  }}
                  variant="danger"
                >
                  🚪 Sign Out
                </DropdownItem>
              </>
            )}
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
