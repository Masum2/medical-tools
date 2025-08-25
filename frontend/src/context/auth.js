import { useState, useEffect, useContext, createContext } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    // Initialize state from localStorage if available
    const data = localStorage.getItem("auth");
    return data ? JSON.parse(data) : { user: null, token: "" };
  });

  // Remove the useEffect that was causing re-renders
  // useEffect is not needed here as we're initializing from localStorage directly

  return (
    <AuthContext.Provider value={[auth, setAuth]}>
      {children}
    </AuthContext.Provider>
  );
};

// custom hook
const useAuth = () => useContext(AuthContext);

export { useAuth, AuthProvider };