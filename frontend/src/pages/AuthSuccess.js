import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth";
import Layout from "../components/Layout/Layout";
import toast from "react-hot-toast";

const AuthSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [auth, setAuth] = useAuth();

  useEffect(() => {
    const processAuthSuccess = async () => {
      try {
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');
        
        if (token) {
          // Save token to localStorage
          localStorage.setItem("auth", JSON.stringify({
            token: token,
            user: null // User data will be fetched separately
          }));
          
          // Set auth context
          setAuth({
            ...auth,
            token: token
          });
          
          // Fetch user data using the token
          try {
            const response = await fetch(`${process.env.REACT_APP_API}/api/v1/auth/user-auth`, {
              headers: {
                'Authorization': token
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.ok) {
                // User is authenticated, now get user details
                const userResponse = await fetch(`${process.env.REACT_APP_API}/api/v1/auth/profile`, {
                  headers: {
                    'Authorization': token
                  }
                });
                
                if (userResponse.ok) {
                  const userData = await userResponse.json();
                  
                  // Update auth context with user data
                  const updatedAuth = {
                    user: userData.user,
                    token: token
                  };
                  
                  setAuth(updatedAuth);
                  localStorage.setItem("auth", JSON.stringify(updatedAuth));
                  
                  toast.success("Login successful!");
                  navigate("/");
                }
              }
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            toast.error("Login successful but failed to load user data");
            navigate("/");
          }
        } else {
          toast.error("Invalid authentication");
          navigate("/login");
        }
      } catch (error) {
        console.error("Auth success error:", error);
        toast.error("Authentication failed");
        navigate("/login");
      }
    };

    processAuthSuccess();
  }, [location, navigate, setAuth, auth]);

  return (
    <Layout title="Authentication - Ecommerce App">
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "60vh",
        flexDirection: "column"
      }}>
        <h2>Login Successful!</h2>
        <p>Redirecting to home page...</p>
        <div style={{ marginTop: "20px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AuthSuccess;