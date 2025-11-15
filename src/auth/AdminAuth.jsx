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

  // Memoize the required role check
  const hasRequiredRole = useMemo(() => {
    return requiredRoles.length === 0 || (userRole && requiredRoles.includes(userRole));
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

    // If authenticated and has required role, allow access
    if (isAuthenticated && (requiredRoles.length === 0 || hasRequiredRole)) {
      return true;
    }

    try {
      // If not authenticated but has token, fetch profile
      if (!isAuthenticated && token) {
        await dispatch(fetchAdminProfile()).unwrap();
      }

      // Check roles after potential authentication
      if (requiredRoles.length > 0 && !hasRequiredRole) {
        navigate('/admin/unauthorized', { 
          replace: true,
          state: { 
            error: 'You do not have permission to access this page',
            from: location.pathname
          }
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Authentication check failed:', error);
      localStorage.removeItem('adminToken');
      navigate('/admin/login', { 
        state: { 
          from: location.pathname,
          error: error || 'Session expired. Please log in again.'
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