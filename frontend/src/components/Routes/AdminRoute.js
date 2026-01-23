import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth";
import { Outlet, Navigate } from "react-router-dom";
import axios from "axios";
import Spinner from "../Spinner";

export default function AdminRoute() {
  const [ok, setOk] = useState(false);
  const [auth] = useAuth();
const API = process.env.REACT_APP_API;
useEffect(() => {
  const authCheck = async () => {
    try {
      const res = await axios.get(`${API}/api/v1/auth/admin-auth`, {
        headers: {
          Authorization: auth?.token,
        },
      });
      setOk(res.data.ok);
    } catch (err) {
      setOk(false);
    }
  };

  if (auth?.token && API) authCheck();
}, [auth?.token, API]);


  return ok ? <Outlet /> : auth?.token ? <Spinner /> : <Navigate to="" />;
}
