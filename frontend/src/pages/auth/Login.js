import React, { useState } from "react";
import Layout from "./../../components/Layout/Layout";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [auth, setAuth] = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/v1/auth/login", { email, password });
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
      toast.error("Something went wrong");
    }
  };

  return (
    <Layout title="Login - Ecommer App">
      <div
        style={{
          display: "flex",
          justifyContent: "center", // push form to right
          alignItems: "center",
          padding: "40px",
          minHeight: "100vh", // full page height
          // backgroundImage: `url('/images/background.jpg')`, // your bg image path
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            background: "rgba(255,255,255,0.95)", // slight transparency over image
            padding: "30px",
            maxWidth: "400px",
            width: "100%",
            textAlign: "center",
            borderRadius: "8px",
            boxShadow: "0 0 15px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "700",
              marginBottom: "10px",
              color: "#1d1d1d",
            }}
          >
            Login
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "#666",
              marginBottom: "20px",
              lineHeight: "1.4",
            }}
          >
            Enter Your Email Address And Password To Access Health Account
          </p>

          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              textAlign: "left",
            }}
          >
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

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <label
              style={{
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Password<span style={{ color: "red" }}>*</span>
            </label>
            <span
              style={{
                fontSize: "12px",
                color: "#007580",
                cursor: "pointer",
                fontWeight:'bold'
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

          <p
            style={{
              fontSize: "13px",
              marginTop: "15px",
              color: "#333",
            }}
          >
            If You Don’t Have An Account Please,{" "}
            <span
              style={{ color: "#007580", cursor: "pointer",fontWeight:'bold' }}
              onClick={() => navigate("/register")}
            >
              Sign Up Now
            </span>
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              marginTop: "15px",
            }}
          >
            <button
              type="button"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "1px solid #ddd",
                background: `url('/images/google-icon.png') center/cover no-repeat`,
                cursor: "pointer",
              }}
            />
            <button
              type="button"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "1px solid #ddd",
                background: `url('/images/facebook-icon.png') center/cover no-repeat`,
                cursor: "pointer",
              }}
            />
            <button
              type="button"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "1px solid #ddd",
                background: `url('/images/twitter-icon.png') center/cover no-repeat`,
                cursor: "pointer",
              }}
            />
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Login;
