import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminMenu from "../../components/Layout/AdminMenu";
import Layout from "../../components/Layout/Layout";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/auth";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [auth, setAuth] = useAuth();
   const API = process.env.REACT_APP_API;
 
  // Fetch Users
const getAllUsers = async () => {
  try {
    const { data } = await axios.get(`${API}/api/v1/auth/all-users`, {
      headers: {
          Authorization: auth?.token,
      },
    });
    console.log("API Response:", data); // 👈 এখানে দেখুন আসলে কি আসছে
    if (data?.success) {
      setUsers(data.users);
    }
  } catch (error) {
    console.log("Error fetching users:", error);
  }
};

useEffect(() => {
  if (auth?.token) {
    getAllUsers();
  }
}, [auth?.token]);

  return (
    <div className="container-fluid p-0">
      <div className="row g-0">
        {/* Sidebar */}
        <div
          className="col-12 col-md-3 col-lg-2 p-0 border-end"
          style={{ minHeight: "100vh" }}
        >
          <AdminMenu />
        </div>

        {/* Main Content */}
        <div
          className="col-12 col-md-9 col-lg-10 d-flex flex-column"
          style={{ backgroundColor: "#f4f5f7", minHeight: "100vh" }}
        >
          {/* Top Header */}
          <div
            className="d-flex flex-wrap justify-content-center align-items-center px-3 py-2 text-white shadow-sm"
            style={{
              background: "#001219",
              position: "sticky",
              top: 0,
              overflowY: "auto",
            }}
          >
            <NavLink
              to="/"
              style={{
                fontSize: "18px",
                margin: "6px 0 6px 20px",
                textDecoration: "none",
                color: "#FFF",
                backgroundColor: "#0d1b2a",
              }}
            >
              All User
            </NavLink>
          </div>

          {/* User List */}
      <div style={{ padding: "20px" }}>
  <table className="table table-hover align-middle shadow-sm" style={{ borderRadius: "10px", overflow: "hidden", backgroundColor: "#fff" }}>
<thead>
  <tr>
    <th scope="col" style={{ backgroundColor: "#0d1b2a", color: "#fff", fontSize: "16px" }}>#</th>
    <th scope="col" style={{ backgroundColor: "#0d1b2a", color: "#fff", fontSize: "16px" }}>Name</th>
    <th scope="col" style={{ backgroundColor: "#0d1b2a", color: "#fff", fontSize: "16px" }}>Email</th>
    <th scope="col" style={{ backgroundColor: "#0d1b2a", color: "#fff", fontSize: "16px" }}>Phone</th>
    <th scope="col" style={{ backgroundColor: "#0d1b2a", color: "#fff", fontSize: "16px" }}>Role</th>
  </tr>
</thead>
    <tbody>
      {users?.map((u, i) => (
        <tr key={u._id} style={{ transition: "all 0.3s", cursor: "pointer" }} className="table-row-hover">
          <td>{i + 1}</td>
          <td>{u.name}</td>
          <td>{u.email}</td>
          <td>{u.phone}</td>
          <td>
            <span
              style={{
                padding: "4px 10px",
                borderRadius: "15px",
                color: "#fff",
                backgroundColor: u.role === 1 ? "#ff4d6d" : "#4caf50",
                fontWeight: "500",
                fontSize: "14px",
              }}
            >
              {u.role === 1 ? "Admin" : "User"}
            </span>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

        </div>
      </div>
    </div>
  );
};

export default Users;
