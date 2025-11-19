import { Link, useLocation } from "react-router-dom";
import logoMark from "../../assets/logos/logo-mark.svg";
import dashboardIcon from "../../assets/icons/dashboard.png";
import alertsIcon from "../../assets/icons/alerts.png";
import machineIcon from "../../assets/icons/machine.png";
import reportsIcon from "../../assets/icons/reports.png";
import userIcon from "../../assets/icons/user.png";

interface SidebarProps {
  userInfo?: {
    username?: string;
    role_name?: string;
  };
  onLogout: () => void;
  isOpen?: boolean;
}

function Sidebar({ userInfo, onLogout, isOpen = false }: SidebarProps) {
  const location = useLocation();

  const allNavItems = [
    {
      path: "/dashboard",
      icon: <img src={dashboardIcon} alt="" className="w-5 h-5" aria-hidden />,
      label: "Dashboard",
      roles: ["Admin", "Manager", "Admin Tech", "Tech"],
    },
    {
      path: "/alerts",
      icon: <img src={alertsIcon} alt="" className="w-5 h-5" aria-hidden />,
      label: "Alerts Management",
      roles: ["Admin", "Manager", "Admin Tech", "Tech"],
    },
    {
      path: "/reports",
      icon: <img src={reportsIcon} alt="" className="w-5 h-5" aria-hidden />,
      label: "Financial Reports",
      roles: ["Admin", "Manager", "Admin Tech"],
    },
    {
      path: "/devices",
      icon: <img src={machineIcon} alt="" className="w-5 h-5" aria-hidden />,
      label: "Machine Management",
      roles: ["Admin", "Manager", "Admin Tech", "Tech"],
    },
    {
      path: "/users",
      icon: <img src={userIcon} alt="" className="w-5 h-5" aria-hidden />,
      label: "User Management",
      roles: ["Admin"],
    },
  ];

  // Filter navigation items based on user role
  const navItems = allNavItems.filter((item) =>
    item.roles.includes(userInfo?.role_name || "")
  );

  return (
    <nav
      className={`z-30 bg-white border-r border-gray-200 h-full flex flex-col
    fixed md:static inset-y-0 left-0 py-8 px-5 sidebar-smooth
    ${
      isOpen
        ? "translate-x-0 md:w-[270px]"
        : "-translate-x-full md:translate-x-0 md:w-[104px]"
    }
  `}
    >
      {/* Logo */}

      <div className="flex items-center justify-center mb-4">
        <img src={logoMark} alt="Procon logo" className="w-[56px] h-[56px]" />
        {isOpen && (
          <span
            className={`ml-3 font-bold text-[18px] text-[rgba(60,177,121,1)] font-['DM_Sans']
      sidebar-fade inline-block whitespace-nowrap
      ${
        isOpen
          ? "opacity-100 translate-x-0"
          : "opacity-0 -translate-x-3 pointer-events-none"
      }
    `}
          >
            Procon Gaming
          </span>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-3 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center rounded-[12px] border border-transparent px-[20px] py-[16px] gap-[5px] transition-colors
                ${
                  isActive
                    ? "bg-[rgba(249,252,250,1)] border-[0.5px] border-[rgba(231,244,238,1)] text-[rgba(17,17,17,1)]"
                    : "text-[rgba(113,113,130,1)] hover:text-[rgba(17,17,17,1)]"
                }
            ${isOpen ? "justify-start space-x-3" : "justify-center"}
          `}
                title={item.label}
              >
                {item.icon}
                {isOpen && (
                  <span
                    className={`text-sm font-medium sidebar-fade inline-block
                      ${
                        isOpen
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 -translate-x-2 pointer-events-none"
                      }
                    `}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* User Info & Logout */}
      {/* <div className="p-3 border-t border-gray-200">
        <div
          className={`flex ${
            isOpen
              ? "flex-row items-center justify-between"
              : "flex-col items-center"
          } space-y-0`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-semibold text-sm">
                {userInfo?.username?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            {isOpen && (
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {userInfo?.username || "User"}
                </div>
                <div className="text-xs text-gray-500">
                  {userInfo?.role_name || "Role"}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Logout"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </div> */}
    </nav>
  );
}

export default Sidebar;
