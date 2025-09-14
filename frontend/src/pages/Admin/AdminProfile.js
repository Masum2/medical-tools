import React from "react";
import AdminMenu from "../../components/Layout/AdminMenu";
import Layout from "./../../components/Layout/Layout";
import { useAuth } from "../../context/auth";
import { NavLink } from "react-router-dom";

const AdminProfile = () => {
  const [auth] = useAuth();

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
              background: "linear-gradient(90deg, #0d1b2a, #001219)", // modern gradient
              position: "sticky",
              top: 0,
              overflowY: "auto",
              zIndex: 1000,
            }}
          >
            <NavLink
              to="/"
              style={{
                fontSize: "16px",
                margin: "6px 0 6px 20px",
                textDecoration: "none",
                color: "#FFF",
                padding: "6px 12px",
                borderRadius: "8px",
                transition: "0.3s",
              }}
              className="navlink-hover"
            >
              Admin Dashboard
            </NavLink>
          </div>

          {/* Admin Details Card */}
          <div className="container my-5">
            <div
              className="card shadow-lg border-0 mx-auto"
              style={{ borderRadius: "20px", maxWidth: "700px", backgroundColor: "#fff" }}
            >
              <div className="card-body p-5">
                <h3 className="mb-4 fw-bold text-primary">Admin Profile</h3>
                <hr style={{ borderTop: "2px solid #0d1b2a" }} />
                <div className="row mt-3">
                  <div className="col-12 mb-3">
                    <p className="mb-1" style={{ fontSize: "16px" }}>
                      <strong>Name:</strong> {auth?.user?.name}
                    </p>
                  </div>
                  <div className="col-12 mb-3">
                    <p className="mb-1" style={{ fontSize: "16px" }}>
                      <strong>Email:</strong> {auth?.user?.email}
                    </p>
                  </div>
                  <div className="col-12">
                    <p className="mb-0" style={{ fontSize: "16px" }}>
                      <strong>Contact:</strong> {auth?.user?.phone || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto text-center py-3 small text-muted">
            © {new Date().getFullYear()} Your Company | Admin Dashboard
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
