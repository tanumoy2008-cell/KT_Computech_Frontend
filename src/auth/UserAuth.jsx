import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { useDispatch, useSelector } from "react-redux";
import { authData } from "../Store/reducers/UserReducer";

const UserAuth = () => {
    const dispatch = useDispatch()
   const user = useSelector(state=> state.UserReducer);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  console.log(user)

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        let currentUser = user;
        if (!user) {
          const res = await axios.get("/api/user/profile");
          currentUser = res.data.metaData;
          dispatch(authData(currentUser));
        }
        setReady(true);
      } catch (err) {
       if (err.response?.status === 401) {
          navigate("/user/login");
        } else {
          console.error("Auth check failed:", err);
        }
      }
    };

    authenticateUser();
  }, [dispatch, navigate, user]);

  if (!ready) return <div>Loading...</div>; 

  return <Outlet />;
};

export default UserAuth;