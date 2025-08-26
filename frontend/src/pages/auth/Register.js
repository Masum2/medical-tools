import React, { useState } from "react";
import Layout from "./../../components/Layout/Layout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [answer, setAnswer] = useState("");
  const navigate = useNavigate();
const API = process.env.REACT_APP_API;
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/api/v1/auth/register`, {
        name,
        email,
        password,
        phone,
        address,
        answer,
      });
      if (res && res.data.success) {
        toast.success(res.data && res.data.message);
        navigate("/login");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    margin: "8px 0 16px 0",
    border: "1px solid #ddd",
    borderRadius: "6px",
    background: "#f9f9f9",
    outline: "none",
  };

  return (
    <Layout title="Register - Ecommer App">
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
        
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            background: "#fff",
            padding: "30px",
            maxWidth: "600px",
            width: "100%",
            textAlign: "center",
            borderRadius: "8px",
            boxShadow: "0 0 10px rgba(0,0,0,0.05)",
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
            Register
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "#666",
              marginBottom: "20px",
              lineHeight: "1.4",
            }}
          >
            Please Fill In The Details Below To Create Your Account
          </p>

          {/* Two-column layout for inputs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px 16px",
            }}
          >
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Your Name"
              required
              autoFocus
              style={inputStyle}
            />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Your Email"
              required
              style={inputStyle}
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Your Password"
              required
              style={inputStyle}
            />

            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter Your Phone"
              required
              style={inputStyle}
            />

            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter Your Address"
              required
              style={inputStyle}
            />

            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="What is your favourite Sports"
              required
              style={inputStyle}
            />
          </div>

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
            Register Now
          </button>

          <p
            style={{
              fontSize: "13px",
              marginTop: "15px",
              color: "#333",
            }}
          >
            Already Have An Account?{" "}
            <span
              style={{ color: "#007580", cursor: "pointer",fontWeight:'bold' }}
              onClick={() => navigate("/login")}
            >
              Login Here
            </span>
          </p>
        </form>
      </div>
    </Layout>
  );
};

export default Register;
