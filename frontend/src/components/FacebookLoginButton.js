import React from 'react';

const FacebookLoginButton = () => {
  const API = process.env.REACT_APP_API || 'http://localhost:8080';

  const handleFacebookLogin = () => {
    window.location.href = `${API}/api/v1/auth/facebook`;
  };

  return (
    <button
      type="button"
      onClick={handleFacebookLogin}
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        border: "1px solid #ddd",
        background: "#3b5998",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: "18px",
        fontWeight: "bold"
      }}
      title="Facebook দিয়ে লগইন"
    >
      f
    </button>
  );
};

export default FacebookLoginButton;