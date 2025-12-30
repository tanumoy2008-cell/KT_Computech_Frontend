import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import axios from '../config/axios';
import {
  selectIsAuthenticated,
  selectIsLoading,
  selectDeliveryAgent,
  selectDeliveryToken,
  authData,
  setDeliveryAuthToken,
  selectIsInitialized,
  initializeAuth,
  setLoading,
} from '../Store/reducers/DeliveryReducer';
import { env } from "../config/key"

const DeliveryAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const isInitialized = useSelector(selectIsInitialized);
  const agent = useSelector(selectDeliveryAgent);
  const token = useSelector(selectDeliveryToken) || localStorage.getItem('deliveryToken');

  const checkAuth = useCallback(async () => {
    // if no token redirect to delivery login
    if (!token) {
      navigate('/delivery-login');
      return false;
    }

    // indicate loading started
    try { dispatch(setLoading(true)); } catch (e) {}

    // ensure token is applied to axios header (use helper to keep behaviour consistent)
      // debug current auth state before attempting profile fetch
      console.debug('DeliveryAuth state before fetch', { isAuthenticated, agent });

      // ensure token is applied to axios header (use helper to keep behaviour consistent)
    try {
      setDeliveryAuthToken(token);
      // debug: ensure token is set on axios defaults
      console.debug('DeliveryAuth: token', token);
      console.debug('DeliveryAuth: axios header', axios.defaults.headers.common[env.VITE_DELIVERY_TOKEN_NAME]);
    } catch (e) {
      /* ignore */
    }

    // if already authenticated and have agent, ok
    if (isAuthenticated && agent) return true;

    // otherwise try to fetch profile
    try {
      
        const res = await axios.get('/api/delivery/me');

        // If backend returns 304 (not modified) axios may not include profile body.
        if (res.status === 304) {
          console.debug('DeliveryAuth: profile returned 304 Not Modified');
          // If we already have agent in memory, consider that sufficient
          if (agent) return true;
          // otherwise try a second request forcing a different cache key
          const retry = await axios.get('/api/delivery/me');
          const profileRetry = retry.data?.agent || retry.data?.metaData || retry.data;
          if (profileRetry) dispatch(authData(profileRetry));
          return !!profileRetry;
        }

      const profile = res.data?.agent || res.data?.metaData || res.data;
      if (profile) dispatch(authData(profile));
      return true;
    } catch (err) {
      console.error('Delivery auth check failed:', err);
      console.debug('Delivery auth error response status:', err.response?.status, 'data:', err.response?.data);
      // Only clear token and redirect on 401 Unauthorized
      const status = err.response?.status;
      if (status === 401 || status === 404) {
        try { setDeliveryAuthToken(null); } catch (e) {}
        navigate('/delivery-login', {
          state: { from: location.pathname, error: err?.message || 'Session expired' },
          replace: true,
        });
        return false;
      }

      // For other errors (network/500), don't immediately redirect; leave agent null and log
      return false;
    } finally {
      try { dispatch(setLoading(false)); } catch (e) {}
      try { dispatch(initializeAuth()); } catch (e) {}
    }
  }, [agent, dispatch, isAuthenticated, location.pathname, navigate, token]);

  // Run auth check on mount (unless we are on the login page). We will mark
  // initialization complete after the check finishes to avoid racing with
  // consumers that redirect when `isInitialized` is true but `agent` is still null.
  useEffect(() => {
    if (location.pathname.includes('/delivery-login')) return;
    checkAuth();
  }, [checkAuth, location.pathname]);

  // Show loader while initialization hasn't run, or while we're loading and
  // we don't yet have an agent object. If an agent is present we should
  // render the protected UI even if `isLoading` wasn't cleared for any reason.
  if (!isInitialized && !agent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : null;
};

export default React.memo(DeliveryAuth);
