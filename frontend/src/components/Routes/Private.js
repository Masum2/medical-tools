import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth";
import { Outlet, Navigate } from "react-router-dom";
import axios from "axios";
import Spinner from "../Spinner";

export default function PrivateRoute() {
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(true);
  const [auth] = useAuth();

  const API = process.env.REACT_APP_API;

  useEffect(() => {
    const authCheck = async () => {
      try {
        if (!API || !auth?.token) {
          setOk(false);
          setLoading(false);
          return;
        }

        const res = await axios.get(`${API}/api/v1/auth/user-auth`, {
          headers: {
            Authorization: auth.token,
          },
        });

        setOk(res.data?.ok === true);
      } catch (err) {
        setOk(false);
      } finally {
        setLoading(false);
      }
    };

    authCheck();
  }, [auth?.token, API]);

  if (loading) return <Spinner />;

  return ok ? <Outlet /> : <Navigate to="/login" />;
}
