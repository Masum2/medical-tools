import React, { useState, useEffect } from "react";
import Layout from "./../../components/Layout/Layout";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/auth";
import FacebookLoginButton from "../../components/FacebookLoginButton";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [auth, setAuth] = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const API = process.env.REACT_APP_API;

  // --- Handle callback for Facebook & Google login ---
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const error = urlParams.get("error");

    if (token) {
      handleSocialLoginCallback(token); // common handler
    }

    if (error) {
      toast.error("Social login failed");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // 🔹 Verify social login token with backend
  const handleSocialLoginCallback = async (token) => {
    try {
      const res = await axios.post(`${API}/api/v1/auth/social/verify`, { token });
      if (res.data.success) {
        setAuth({
          ...auth,
          user: res.data.user,
          token: res.data.token,
        });
        localStorage.setItem("auth", JSON.stringify(res.data));
        toast.success("Login successful");
        navigate("/dashboard/user", { replace: true });
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Login failed its");
    }
  };

  // 🔹 Normal login
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/api/v1/auth/login`, { email, password });
      if (res && res.data.success) {
        toast.success(res.data && res.data.message);
        setAuth({ ...auth, user: res.data.user, token: res.data.token });
        localStorage.setItem("auth", JSON.stringify(res.data));
        navigate(location.state || "/");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  // 🔹 Redirect to Google login
  const handleGoogleLogin = () => {
    window.location.href = `${API}/api/v1/auth/google`;
  };

  return (
    <Layout title="Login - Ecommer App">
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
          minHeight: "100vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            background: "rgba(255,255,255,0.95)",
            padding: "30px",
            maxWidth: "400px",
            width: "100%",
            textAlign: "center",
            borderRadius: "8px",
            boxShadow: "0 0 15px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "10px", color: "#1d1d1d" }}>
            Login
          </h2>
          <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px", lineHeight: "1.4" }}>
            Enter Your Email Address And Password To Access Your Account
          </p>

          {/* --- Email --- */}
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", textAlign: "left" }}>
            Email Address<span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter Email Address"
            required
            style={{
              width: "100%",
              padding: "12px",
              margin: "8px 0 16px 0",
              border: "1px solid #ddd",
              borderRadius: "6px",
              background: "#f9f9f9",
              outline: "none",
            }}
          />

          {/* --- Password --- */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontSize: "14px", fontWeight: "500" }}>
              Password<span style={{ color: "red" }}>*</span>
            </label>
            <span
              style={{
                fontSize: "12px",
                color: "#007580",
                cursor: "pointer",
                fontWeight: "bold",
              }}
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </span>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            style={{
              width: "100%",
              padding: "12px",
              margin: "8px 0 16px 0",
              border: "1px solid #ddd",
              borderRadius: "6px",
              background: "#f9f9f9",
              outline: "none",
            }}
          />

          {/* --- Submit --- */}
          <button
            type="submit"
            style={{
              backgroundColor: "#42BAC9",
              color: "white",
              padding: "12px",
              width: "100%",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: "pointer",
              marginTop: "5px",
            }}
          >
            Login Now
          </button>

          {/* --- Social login --- */}
          <div style={{ margin: "15px 0", position: "relative" }}>
            <div style={{ borderTop: "1px solid #ddd", margin: "15px 0", position: "relative" }}>
              <span
                style={{
                  background: "rgba(255,255,255,0.95)",
                  padding: "0 10px",
                  position: "absolute",
                  top: "-10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  color: "#666",
                  fontSize: "12px",
                }}
              >
                Or continue with
              </span>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "15px" }}>
            <FacebookLoginButton />

            {/* --- Google button --- */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "1px solid #ddd",
                background: `url('/images/google.png') center/cover no-repeat`,
                cursor: "pointer",
              }}
              title="Google দিয়ে লগইন"
            />


          </div>

          <p style={{ fontSize: "13px", marginTop: "15px", color: "#333" }}>
            If You Don’t Have An Account Please,{" "}
            <span
              style={{ color: "#007580", cursor: "pointer", fontWeight: "bold" }}
              onClick={() => navigate("/register")}
            >
              Sign Up Now
            </span>
          </p>
        </form>
      </div>
    </Layout>
  );
};

export default Login;
