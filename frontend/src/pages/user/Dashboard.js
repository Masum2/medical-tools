import React from "react";
import Layout from "../../components/Layout/Layout";
import UserMenu from "../../components/Layout/UserMenu";
import { useAuth } from "../../context/auth";

const Dashboard = () => {
  const [auth] = useAuth();

  return (
    <Layout title={"Dashboard - Ecommerce App"}>
      <div className="container-fluid p-0">
        <div className="row g-0">
          {/* Sidebar */}
          <div
            className="col-12 col-md-3 col-lg-2 border-end bg-dark"
            style={{ minHeight: "100vh" }}
          >
            <UserMenu />
          </div>

          {/* Dashboard Content */}
          <div className="col-12 col-md-9 col-lg-10 p-3">
            <div className="d-flex justify-content-center">
              <div
                className="card shadow-sm border-0 rounded-3 w-100"
                style={{ maxWidth: "600px" }}
              >
                <div className="card-header bg-white border-0 text-center py-3">
                  <h4 className="fw-bold mb-0">👋 Welcome, {auth?.user?.name}</h4>
                  <p className="text-muted small mb-0">
                    Here’s your account overview
                  </p>
                </div>

                <div className="card-body p-4">
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item px-0 py-3 d-flex justify-content-between">
                      <span className="fw-semibold">Full Name:</span>
                      <span>{auth?.user?.name}</span>
                    </li>
                    <li className="list-group-item px-0 py-3 d-flex justify-content-between">
                      <span className="fw-semibold">Email:</span>
                      <span>{auth?.user?.email}</span>
                    </li>
                    <li className="list-group-item px-0 py-3 d-flex justify-content-between">
                      <span className="fw-semibold">Address:</span>
  <p className="mb-0 text-end">
    {auth?.user?.address
      ? `${auth.user.address.street}, ${auth.user.address.city}, ${auth.user.address.state}, ${auth.user.address.zipCode}, ${auth.user.address.country}`
      : "No address available"}
  </p>
                    </li>
                  </ul>
                </div>

                <div className="card-footer bg-light text-center small text-muted">
                  Last login: {new Date().toLocaleDateString()}  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
