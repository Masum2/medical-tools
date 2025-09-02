import React, { useState, useEffect } from "react";
import UserMenu from "../../components/Layout/UserMenu";
import Layout from "./../../components/Layout/Layout";
import { useAuth } from "../../context/auth";
import toast from "react-hot-toast";
import axios from "axios";

const Profile = () => {
  // context
  const [auth, setAuth] = useAuth();
  // state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const API = process.env.REACT_APP_API;

  // get user data
  useEffect(() => {
    const { email, name, phone, address } = auth?.user || {};
    if (auth?.user) {
      setName(name);
      setPhone(phone);
      setEmail(email);
      setAddress(address);
    }
  }, [auth?.user]);

  // form function
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        `${API}/api/v1/auth/profile`,
        { name, email, password, phone, address },
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );
      if (data?.errro) {
        toast.error(data?.error);
      } else {
        setAuth({ ...auth, user: data?.updatedUser });
        let ls = localStorage.getItem("auth");
        ls = JSON.parse(ls);
        ls.user = data.updatedUser;
        localStorage.setItem("auth", JSON.stringify(ls));
        toast.success("Profile Updated Successfully");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <Layout title={"Your Profile"}>
      <div className="container-fluid p-0">
        <div className="row g-0">
          {/* Sidebar */}
          <div
            className="col-12 col-md-3 col-lg-2 border-end bg-dark"
            style={{ minHeight: "100vh" }}
          >
            <UserMenu />
          </div>

          {/* Profile Form */}
          <div className="col-12 col-md-9 col-lg-10 p-3">
            <div className="d-flex justify-content-center">
              <div className="card shadow-sm border-0 rounded-3 w-100" style={{ maxWidth: "600px" }}>
                <div className="card-header bg-white border-0 text-center py-3">
                  <h4 className="fw-bold mb-0">👤 User Profile</h4>
                  <p className="text-muted small mb-0">
                    Update your account details below
                  </p>
                </div>
                <div className="card-body p-4">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="form-control rounded-3"
                        placeholder="Enter Your Name"
                        autoFocus
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-control rounded-3"
                        placeholder="Enter Your Email"
                        disabled
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-control rounded-3"
                        placeholder="Enter New Password"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Phone</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="form-control rounded-3"
                        placeholder="Enter Your Phone"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Address</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="form-control rounded-3"
                        placeholder="Enter Your Address"
                      />
                    </div>
                    <div className="d-grid mt-4">
                      <button type="submit" className="btn btn-primary rounded-pill py-2">
                        Update Profile
                      </button>
                    </div>
                  </form>
                </div>
                <div className="card-footer bg-light text-center small text-muted">
                  Your information is safe with <strong>HealthProo Ltd.</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
