import React from "react";
import AdminMenu from "../../components/Layout/AdminMenu";
import Layout from "./../../components/Layout/Layout";
import { useAuth } from "../../context/auth";
import { NavLink } from "react-router-dom";

const AdminDashboard = () => {
  const [auth] = useAuth();

  return (
    <div className="container-fluid p-0">
      <div className="row g-0">
        {/* Sidebar */}
        <div className="col-12 col-md-3 col-lg-2 p-0 border-end" style={{ minHeight: "100vh" }}>
          <AdminMenu />
        </div>

        {/* Main Content */}
        <div className="col-12 col-md-9 col-lg-10 d-flex flex-column" style={{ backgroundColor: "#f4f5f7", minHeight: "100vh" }}>
          {/* Top Header */}
          <div
            className="d-flex flex-wrap justify-content-center align-items-center px-3 py-2 text-white shadow-sm"
            style={{ background: "#001219",  position: "sticky",
        top: 0,
        overflowY: "auto", }}
          >
           <NavLink
                       to="/"
                       style={{
                      
                         fontSize: "14px",
                         margin: "6px 0 6px 20px",
                         textDecoration:'none',
                         color:'#FFF'
                        
                       }}
                     >
                      Admin Dashboard
                     </NavLink>
        
          </div>

          {/* Admin Details Card */}
          <div className="container my-4">
            <div
              className="card shadow border-0 mx-auto"
              style={{ borderRadius: "16px", maxWidth: "700px" }}
            >
              <div className="card-body p-4">
                <h3 className="mb-3 fw-bold text-primary">Admin Details</h3>
                <hr />
                <p className="mb-2">
                  <strong>Name:</strong> {auth?.user?.name}
                </p>
                <p className="mb-2">
                  <strong>Email:</strong> {auth?.user?.email}
                </p>
                <p className="mb-0">
                  <strong>Contact:</strong> {auth?.user?.phone}
                </p>
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

export default AdminDashboard;