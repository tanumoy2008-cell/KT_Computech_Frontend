import React, { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  fetchAdminProfile, 
  selectIsAuthenticated, 
  selectIsLoading, 
  selectIsInitialized,
  selectRole,
  clearError,
  initializeAuth,
  selectError,
  selectToken
} from '../Store/reducers/AdminReducer';
import axios from '../config/axios';
import { env } from "../config/key";

const AdminAuth = ({ requiredRoles = [] }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const isInitialized = useSelector(selectIsInitialized);
  const userRole = useSelector(selectRole);
  const error = useSelector(selectError);
  const token = useSelector(selectToken) || localStorage.getItem('adminToken');

  // Memoize the required role check (case-insensitive)
  const hasRequiredRole = useMemo(() => {
    if (requiredRoles.length === 0) return true;
    if (!userRole) return false;
    const normalizedUserRole = String(userRole).toLowerCase();
    return requiredRoles.some((r) => String(r).toLowerCase() === normalizedUserRole);
  }, [requiredRoles, userRole]);

  // Memoize the checkAuth function with proper dependencies
  const checkAuth = useCallback(async () => {
    // If no token, redirect to login
    if (!token) {
      navigate('/admin/login', { 
        state: { 
          from: location.pathname !== '/admin/login' ? location.pathname : '/admin',
          error: 'Please log in to continue'
        },
        replace: true 
      });
      return false;
    }

    // If we already have authenticated state and a role, short-circuit only when no role checks are required
    if (isAuthenticated && userRole && requiredRoles.length === 0) {
      return true;
    }

    try {
      // If we don't have profile/userRole yet but token exists, fetch profile
      let fetchedUser = null;
      if ((!isAuthenticated || !userRole) && token) {
        const payload = await dispatch(fetchAdminProfile()).unwrap();
        fetchedUser = payload?.user || null;
      }

      // Decide which role to validate: prefer fetchedUser.role then existing userRole
      const roleToCheck = (fetchedUser && fetchedUser.role) || userRole || null;

      // If role restrictions exist, enforce them now (case-insensitive)
      if (requiredRoles.length > 0) {
        const normalizedRole = roleToCheck ? String(roleToCheck).toLowerCase() : null;
        const allowed = requiredRoles.some((r) => String(r).toLowerCase() === normalizedRole);
        if (!allowed) {
          navigate('/admin/unauthorized', { 
            replace: true,
            state: { 
              error: 'You do not have permission to access this page',
              from: location.pathname
            }
          });
          return false;
        }
      }

      return true;
    } catch (err) {
      console.error('Authentication check failed:', err);
      localStorage.removeItem('adminToken');
      // Clear axios header as well (safe-guard)
      try { delete axios.defaults.headers.common[env.VITE_ADMIN_TOKEN_NAME]; } catch (e) {}
      navigate('/admin/login', { 
        state: { 
          from: location.pathname,
          error: err || 'Session expired. Please log in again.'
        },
        replace: true 
      });
      return false;
    }
  }, [
    dispatch, 
    hasRequiredRole, 
    isAuthenticated, 
    location.pathname, 
    navigate, 
    requiredRoles.length,
    token
  ]);

  // Initialize auth state only once
  useEffect(() => {
    if (!isInitialized) {
      dispatch(initializeAuth());
    }
  }, [dispatch, isInitialized]);

  // Check auth when necessary
  useEffect(() => {
    // Only check auth if we're not already on the login page
    if (isInitialized && !location.pathname.includes('/admin/login')) {
      checkAuth();
    }
  }, [checkAuth, isInitialized, location.pathname]);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error('Auth Error:', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Show loading state while initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Only render children if authenticated and has required role
  return isAuthenticated && hasRequiredRole ? <Outlet /> : null;
};

export default React.memo(AdminAuth);