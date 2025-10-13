import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { useDispatch, useSelector } from "react-redux";
import { authData } from "../Store/reducers/AdminReducer";

const AdminAuth = () => {
    const dispatch = useDispatch()
   const admin = useSelector(state=> state.AdminReducer);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const authenticateAdmin = async () => {
      try {
        let currentUser = admin;
        if (!admin) {
          const res = await axios.get("/api/admin/profile");
          currentUser = res.data.hiddenDetsAdmin;
          dispatch(authData(currentUser));
        }
        setReady(true);
      } catch (err) {
        navigate("/admin/login");
      }
    };

    authenticateAdmin();
  }, []);

  if (!ready) return <div>Loading...</div>; 

  return <Outlet />;
};

export default AdminAuth;