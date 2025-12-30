import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { useDispatch, useSelector } from "react-redux";
import { authData } from "../Store/reducers/UserReducer";
import { env } from '../config/key'

const UserAuth = () => {
    const dispatch = useDispatch()
   const user = useSelector(state=> state.UserReducer);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  // Ensure axios has the user token header if present
  try {
    const userToken = localStorage.getItem('userToken');
    if (userToken) {
      axios.defaults.headers.common[env.VITE_USER_TOKEN_NAME] = userToken;
    } else {
      delete axios.defaults.headers.common[env.VITE_USER_TOKEN_NAME];
    }
  } catch (e) {
    /* ignore */

  }

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        let currentUser = user;
        if (!user) {
          // try to use stored token header first; if not present, allow cookie-based auth
          const res = await axios.get("/api/user/profile", { withCredentials: true });
          currentUser = res.data.metaData;
          // if server returned a token in response body or header, persist it
          const tokenFromBody = res.data?.token;
          const tokenFromHeader = res.headers?.[env.VITE_USER_TOKEN_NAME];
          const tokenToUse = tokenFromBody || tokenFromHeader;
          if (tokenToUse) {
            try {
              localStorage.setItem('userToken', tokenToUse);
              axios.defaults.headers.common[env.VITE_USER_TOKEN_NAME] = tokenToUse;
            } catch (e) {
              /* ignore */
            }
          }
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