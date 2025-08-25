import React from "react";
import AdminMenu from "../../components/Layout/AdminMenu";
import Layout from "./../../components/Layout/Layout";
import { useAuth } from "../../context/auth";

const AdminDashboard = () => {
  const [auth] = useAuth();
  return (
    <Layout>
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-2 p-0">
            <AdminMenu />
          </div>

          {/* Main Content */}
          <div
            className="col-md-10"
            style={{
              backgroundColor: "#f4f5f7",
              minHeight: "100vh",
              padding: "20px",
            }}
          >
            <div
              className="card shadow-sm"
              style={{
                borderRadius: "12px",
                backgroundColor: "#fff",
                padding: "20px",
              }}
            >
              <h3 className="mb-3 fw-bold">Admin Details</h3>
              <hr />
              <p>
                <strong>Name:</strong> {auth?.user?.name}
              </p>
              <p>
                <strong>Email:</strong> {auth?.user?.email}
              </p>
              <p>
                <strong>Contact:</strong> {auth?.user?.phone}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
