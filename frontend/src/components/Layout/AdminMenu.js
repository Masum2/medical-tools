import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BiSolidDashboard,
  BiPackage,
  BiCart,
  BiUser,
  BiChevronDown,
  BiChevronRight,
} from "react-icons/bi";
import { useAuth } from "../../context/auth";
import toast from "react-hot-toast";

const AdminMenu = () => {
  const [openMenu, setOpenMenu] = useState(null);
   const location = useLocation();
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

  useEffect(() => {
    if (location.pathname.includes("/dashboard/admin/create-") || 
        location.pathname.includes("/dashboard/admin/products")) {
      setOpenMenu("products");
    } else if (location.pathname.includes("/dashboard/admin/orders") || 
               location.pathname.includes("/dashboard/admin/reviews")) {
      setOpenMenu("orders");
    } else if (location.pathname.includes("/dashboard/admin/users")) {
      setOpenMenu(null);
    } else if (location.pathname.includes("/dashboard/admin/settings")) {
      setOpenMenu("account");
    }
  }, [location.pathname]);
  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
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

  const submenuContainer = (isOpen) => ({
    maxHeight: isOpen ? "300px" : "0",
    overflow: "hidden",
    marginLeft: "10px",
    transition: "max-height 0.3s ease",
  });

  const handleHover = (e) => (e.currentTarget.style.background = "#1b263b");
  const handleLeave = (e, isOpen) =>
    (e.currentTarget.style.background = isOpen ? "#0d1b2a" : "#0d1b2a");

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
      {/* Dashboard */}
      <NavLink
        to="/dashboard/admin"
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

      {/* Products */}
      <div>
        <div
          onClick={() => toggleMenu("products")}
          style={parentMenuStyle(openMenu === "products")}
          onMouseEnter={handleHover}
          onMouseLeave={(e) => handleLeave(e, openMenu === "products")}
        >
          <span style={{ display: "flex", alignItems: "center" }}>
            <BiPackage size={20} className="me-2" /> Products
          </span>
          {openMenu === "products" ? <BiChevronDown size={20} /> : <BiChevronRight size={20} />}
        </div>
        <div style={submenuContainer(openMenu === "products")}>
          <NavLink
            to="/dashboard/admin/create-category"
            style={({ isActive }) => ({
              ...menuItemStyle,
              fontSize: "14px",
              margin: "6px 0 6px 20px",
              ...(isActive ? hoverAndActiveColor : {}),
            })}
          >
            Create Category
          </NavLink>
          <NavLink
            to="/dashboard/admin/create-product"
            style={({ isActive }) => ({
              ...menuItemStyle,
              fontSize: "14px",
              margin: "6px 0 6px 20px",
              ...(isActive ? hoverAndActiveColor : {}),
            })}
          >
            Create Product
          </NavLink>
          <NavLink
            to="/dashboard/admin/products"
            style={({ isActive }) => ({
              ...menuItemStyle,
              fontSize: "14px",
              margin: "6px 0 6px 20px",
              ...(isActive ? hoverAndActiveColor : {}),
            })}
          >
            Manage Products
          </NavLink>
        </div>
      </div>

      {/* Orders & Reviews */}
      <div>
        <div
          onClick={() => toggleMenu("orders")}
          style={parentMenuStyle(openMenu === "orders")}
          onMouseEnter={handleHover}
          onMouseLeave={(e) => handleLeave(e, openMenu === "orders")}
        >
          <span style={{ display: "flex", alignItems: "center" }}>
            <BiCart size={20} className="me-2" /> Orders & Reviews
          </span>
          {openMenu === "orders" ? <BiChevronDown size={20} /> : <BiChevronRight size={20} />}
        </div>
        <div style={submenuContainer(openMenu === "orders")}>
          <NavLink
            to="/dashboard/admin/orders"
            style={({ isActive }) => ({
              ...menuItemStyle,
              fontSize: "14px",
              margin: "6px 0 6px 20px",
              ...(isActive ? hoverAndActiveColor : {}),
            })}
          >
            Orders
          </NavLink>
          <NavLink
            to="/dashboard/admin/reviews"
            style={({ isActive }) => ({
              ...menuItemStyle,
              fontSize: "14px",
              margin: "6px 0 6px 20px",
              ...(isActive ? hoverAndActiveColor : {}),
            })}
          >
            Reviews & Ratings
          </NavLink>
        </div>
      </div>

      {/* Users */}
      <NavLink
        to="/dashboard/admin/all-users"
        style={({ isActive }) => ({
          ...menuItemStyle,
          ...(isActive ? hoverAndActiveColor : {}),
        })}
        onMouseEnter={handleHover}
        onMouseLeave={(e) => handleLeave(e, false)}
      >
        <span style={{ display: "flex", alignItems: "center" }}>
          <BiUser size={20} className="me-2" /> Users
        </span>
        <BiChevronRight size={20} />
      </NavLink>

      {/* My Account */}
      <div>
        <div
          onClick={() => toggleMenu("account")}
          style={parentMenuStyle(openMenu === "account")}
          onMouseEnter={handleHover}
          onMouseLeave={(e) => handleLeave(e, openMenu === "account")}
        >
          <span style={{ display: "flex", alignItems: "center" }}>
            <BiUser size={20} className="me-2" /> My Account
          </span>
          {openMenu === "account" ? <BiChevronDown size={20} /> : <BiChevronRight size={20} />}
        </div>
        <div style={submenuContainer(openMenu === "account")}>
          <NavLink
            to="/dashboard/admin"
            style={({ isActive }) => ({
              ...menuItemStyle,
              fontSize: "14px",
              margin: "6px 0 6px 20px",
              ...(isActive ? hoverAndActiveColor : {}),
            })}
          >
            Profile
          </NavLink>
     <NavLink
  to="/login"
  onClick={handleLogout}
  style={({ isActive }) => ({
    ...menuItemStyle,
    fontSize: "14px",
    margin: "6px 0 6px 20px",
    ...(isActive ? hoverAndActiveColor : {}),
  })}
>
  Logout
</NavLink>

        </div>
      </div>
    </div>
  );
};

export default AdminMenu;
