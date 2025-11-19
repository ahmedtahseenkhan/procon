import { useState, useRef, useEffect } from "react";
import avatarImg from "../../assets/icons/avatar.png"; // dummy avatar
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
function UserDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { logout } = useAuthContext();
  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative ml-8" ref={dropdownRef}>
      {/* Avatar */}
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center focus:outline-none"
      >
        <img
          src={avatarImg}
          alt="User Avatar"
          className="w-full h-full object-cover"
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-[180px] bg-white border border-[rgba(0,0,51,0.06)] rounded-lg shadow-[0_12px_32px_-16px_rgba(0,0,51,0.05)] p-2 flex flex-col">
          <button
            onClick={() => {
              navigate("/preferences");
              setOpen(false);
            }}
            className="w-full text-[14px] font-normal text-gray-800 px-3 py-2 rounded hover:bg-blue-600 hover:text-white text-left"
          >
            Preferences
          </button>
          <button
            onClick={() => {
              logout();
              setOpen(false);
            }}
            className="w-full text-[14px] font-normal text-gray-800 px-3 py-2 rounded hover:bg-blue-600 hover:text-white text-left"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default UserDropdown;
