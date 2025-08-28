import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  BiSolidDashboard,
  BiPackage,
  BiCart,
  BiUser,
  BiChevronDown,
  BiChevronRight,
} from "react-icons/bi";

const AdminMenu = () => {
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const menuItemStyle = {
    display: "flex",
    alignItems: "center",
    padding: "10px 15px",
    margin: "10px",
    borderRadius: "8px",
    fontWeight: 500,
    textDecoration: "none",
    color: "#e9ecef",
    transition: "all 0.2s ease",
  };

  const hoverAndActiveColor = {
    background: "#20c997", // teal color
    color: "#fff",
  };

  const parentMenuStyle = (isOpen) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 15px",
    margin: "10px",
    borderRadius: "8px",
    fontWeight: 500,
    cursor: "pointer",
    color: "#e9ecef",
    background: isOpen ? "rgba(32,201,151,0.2)" : "transparent", // light teal for open submenu
    transition: "all 0.2s ease",
  });

  const submenuContainer = (isOpen) => ({
    maxHeight: isOpen ? "300px" : "0",
    overflow: "hidden",
    transition: "max-height 0.3s ease",
  });

  const handleHover = (e) => (e.currentTarget.style.background = "#20c997");
  const handleLeave = (e, isOpen) =>
    (e.currentTarget.style.background = isOpen ? "rgba(32,201,151,0.2)" : "transparent");

  return (
    <div
      style={{
        height: "100vh",
        background: "#007580",
        width: "250px",
        paddingTop: "15px",
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
        <BiSolidDashboard size={20} className="me-2" />
        Dashboard
      </NavLink>

      {/* Products */}
      <div>
        <div
          onClick={() => toggleMenu("products")}
          style={parentMenuStyle(openMenu === "products")}
          onMouseEnter={handleHover}
          onMouseLeave={(e) => handleLeave(e, openMenu === "products")}
        >
          <span className="d-flex align-items-center">
            <BiPackage size={20} className="me-2" />
            Products
          </span>
          {openMenu === "products" ? <BiChevronDown size={20} /> : <BiChevronRight size={20} />}
        </div>
        <div style={submenuContainer(openMenu === "products")}>
          <NavLink
            to="/dashboard/admin/create-category"
            style={({ isActive }) => ({
              ...menuItemStyle,
              ...(isActive ? hoverAndActiveColor : {}),
            })}
            onMouseEnter={handleHover}
            onMouseLeave={(e) => handleLeave(e, false)}
          >
            Create Category
          </NavLink>
          <NavLink
            to="/dashboard/admin/create-product"
            style={({ isActive }) => ({
              ...menuItemStyle,
              ...(isActive ? hoverAndActiveColor : {}),
            })}
            onMouseEnter={handleHover}
            onMouseLeave={(e) => handleLeave(e, false)}
          >
            Create Product
          </NavLink>
          <NavLink
            to="/dashboard/admin/products"
            style={({ isActive }) => ({
              ...menuItemStyle,
              ...(isActive ? hoverAndActiveColor : {}),
            })}
            onMouseEnter={handleHover}
            onMouseLeave={(e) => handleLeave(e, false)}
          >
            Manage  Products
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
          <span className="d-flex align-items-center">
            <BiCart size={20} className="me-2" />
            Orders & Reviews
          </span>
          {openMenu === "orders" ? <BiChevronDown size={20} /> : <BiChevronRight size={20} />}
        </div>
        <div style={submenuContainer(openMenu === "orders")}>
          <NavLink
            to="/dashboard/admin/orders"
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
            to="/dashboard/admin/reviews"
            style={({ isActive }) => ({
              ...menuItemStyle,
              ...(isActive ? hoverAndActiveColor : {}),
            })}
            onMouseEnter={handleHover}
            onMouseLeave={(e) => handleLeave(e, false)}
          >
            Reviews & Ratings
          </NavLink>
        </div>
      </div>

      {/* Users */}
      <NavLink
        to="/dashboard/admin/users"
        style={({ isActive }) => ({
          ...menuItemStyle,
          ...(isActive ? hoverAndActiveColor : {}),
        })}
        onMouseEnter={handleHover}
        onMouseLeave={(e) => handleLeave(e, false)}
      >
        <BiUser size={20} className="me-2" />
        Users
      </NavLink>

      {/* My Account */}
      <div>
        <div
          onClick={() => toggleMenu("account")}
          style={parentMenuStyle(openMenu === "account")}
          onMouseEnter={handleHover}
          onMouseLeave={(e) => handleLeave(e, openMenu === "account")}
        >
          <span className="d-flex align-items-center">
            <BiUser size={20} className="me-2" />
            My Account
          </span>
          {openMenu === "account" ? <BiChevronDown size={20} /> : <BiChevronRight size={20} />}
        </div>
        <div style={submenuContainer(openMenu === "account")}>
          <NavLink
            to="/dashboard/admin/profile"
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
            to="/dashboard/admin/settings"
            style={({ isActive }) => ({
              ...menuItemStyle,
              ...(isActive ? hoverAndActiveColor : {}),
            })}
            onMouseEnter={handleHover}
            onMouseLeave={(e) => handleLeave(e, false)}
          >
            Settings
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default AdminMenu;
