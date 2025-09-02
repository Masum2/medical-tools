import React from "react";
import { NavLink } from "react-router-dom";
import {
  BiSolidDashboard,

  BiChevronRight,
} from "react-icons/bi";
import { useAuth } from "../../context/auth";
import toast from "react-hot-toast";
const UserMenu = () => {
  const [auth, setAuth] = useAuth();
    const handleLogout = () => {
    setAuth({
      ...auth,
      user: null,
      token: "",
    });
    localStorage.removeItem("auth");
    toast.success("Logout Successfully");
  };

    const menuItemStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 15px",
    marginBottom: "10px",
    borderRadius: "8px",
    fontWeight: 500,
    textDecoration: "none",
    color: "#fff",
    background: "#0d1b2a",
    transition: "all 0.2s ease",
  };

  const hoverAndActiveColor = {
    background: "#1b263b",
    color: "#20c997",
  };
  const handleHover = (e) => (e.currentTarget.style.background = "#1b263b");
  const handleLeave = (e, isOpen) =>
    (e.currentTarget.style.background = isOpen ? "#0d1b2a" : "#0d1b2a");
  const parentMenuStyle = (isOpen) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 15px",
    marginBottom: "10px",
    borderRadius: "8px",
    fontWeight: 500,
    cursor: "pointer",
    color: "#fff",
    background: "#0d1b2a",
    borderLeft: isOpen ? "4px solid #20c997" : "4px solid transparent",
    transition: "all 0.2s ease",
  });

  return (
  <div
      style={{
        height: "100vh",
        background: "#001219",
        width: "260px",
        padding: "15px 10px",
        position: "sticky",
        top: 0,
        overflowY: "auto",
      }}
    >
        <NavLink
              to="/dashboard/user"
              end
              style={({ isActive }) => ({
                ...menuItemStyle,
                ...(isActive ? hoverAndActiveColor : {}),
              })}
              onMouseEnter={handleHover}
              onMouseLeave={(e) => handleLeave(e, false)}
            >
              <span style={{ display: "flex", alignItems: "center" }}>
                <BiSolidDashboard size={20} className="me-2" /> Dashboard
              </span>
              <BiChevronRight size={20} />
            </NavLink>
          <NavLink
            to="/dashboard/user/profile"
            className="list-group-item list-group-item-action"
              style={({ isActive }) => ({
          ...menuItemStyle,
          ...(isActive ? hoverAndActiveColor : {}),
        })}
        onMouseEnter={handleHover}
        onMouseLeave={(e) => handleLeave(e, false)}
          >
            Profile
          </NavLink>
          <NavLink
            to="/dashboard/user/orders"
            className="list-group-item list-group-item-action"
                   
              style={({ isActive }) => ({
          ...menuItemStyle,
          ...(isActive ? hoverAndActiveColor : {}),
        })}
        onMouseEnter={handleHover}
        onMouseLeave={(e) => handleLeave(e, false)}
          >
            Orders
          </NavLink>
                  <NavLink
                   onClick={handleLogout}
            to="/login"
            className="list-group-item list-group-item-action"
                   
              style={({ isActive }) => ({
          ...menuItemStyle,
          ...(isActive ? hoverAndActiveColor : {}),
        })}
        onMouseEnter={handleHover}
        onMouseLeave={(e) => handleLeave(e, false)}
          >
            Logout
          </NavLink>
        </div>
    
  );
};

export default UserMenu;