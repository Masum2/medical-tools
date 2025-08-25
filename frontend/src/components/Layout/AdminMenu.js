import React from "react";
import { NavLink } from "react-router-dom";
import {
  BiSolidDashboard,
  BiCategoryAlt,
  BiPackage,
  BiCart,
  BiUser,
} from "react-icons/bi";

const menuItems = [
  { to: "/dashboard/admin", icon: <BiSolidDashboard size={20} />, label: "Dashboard" },
  { to: "/dashboard/admin/create-category", icon: <BiCategoryAlt size={20} />, label: "Create Category" },
  { to: "/dashboard/admin/create-product", icon: <BiPackage size={20} />, label: "Create Product" },
  { to: "/dashboard/admin/products", icon: <BiCart size={20} />, label: "Products" },
  { to: "/dashboard/admin/users", icon: <BiUser size={20} />, label: "Users" },
  { to: "/dashboard/admin/orders", icon: <BiUser size={20} />, label: "Orders" },
];

const AdminMenu = () => {
  return (
    <div
      style={{
        height: "100vh",
        background: "#f8f9fa",
        borderRight: "1px solid #ddd",
        paddingTop: "15px",
      }}
    >
  {menuItems.map((item, index) => (
  <NavLink
    key={index}
    to={item.to}
    end={item.to === "/dashboard/admin"} // only Dashboard should match exactly
    className={({ isActive }) =>
      `d-flex align-items-center text-decoration-none ${
        isActive ? "active" : ""
      }`
    }
    style={({ isActive }) => ({
      background: isActive ? "#42BAC9" : "#e9ecef",
      color: isActive ? "#fff" : "#333",
      fontWeight: 500,
      borderRadius: "8px",
      padding: "10px 15px",
      margin: "10px 10px",
      transition: "all 0.2s ease",
    })}
  >
    <span className="me-2">{item.icon}</span>
    {item.label}
  </NavLink>
))}

    </div>
  );
};

export default AdminMenu;
