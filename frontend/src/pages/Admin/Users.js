import React from "react";
import AdminMenu from "../../components/Layout/AdminMenu";
import Layout from "./../../components/Layout/Layout";

const Users = () => {
  return (
    // <Layout title={"Dashboard - All Users"}>
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-2 p-0">
            <AdminMenu />
          </div>
          <div className="col-md-10">
            <h1>All Users</h1>
          </div>
        </div>
      </div>
    // </Layout>
  );
};

export default Users;