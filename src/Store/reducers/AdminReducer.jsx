import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import axios from '../../config/axios';
import {env} from "../../config/key"

// Helper function to set auth token in axios defaults
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common[env.VITE_ADMIN_TOKEN_NAME] = token;
  } else {
    delete axios.defaults.headers.common[env.VITE_ADMIN_TOKEN_NAME];
  }
};

// Initialize axios headers from token if it exists
const token = localStorage.getItem('adminToken');
if (token) {
  setAuthToken(token);
}

// Async thunk for admin registration
export const registerAdmin = createAsyncThunk(
  'admin/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/admin/register', userData);
      const { success, message } = response.data;
      
      if (success) {
        return { success, message };
      }
      return rejectWithValue(message || 'Registration failed');
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Registration failed. Please try again.'
      );
    }
  }
);

// Async thunk for admin login
export const login = createAsyncThunk(
  'admin/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/admin/login', credentials);
      const { token, data, success, message } = response.data;
      
      if (success && token) {
        localStorage.setItem('adminToken', token);
        setAuthToken(token);
        return { 
          user: data,
          token,
          success
        };
      }
      return rejectWithValue(message || 'Login failed');
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Login failed. Please check your credentials and try again.'
      );
    }
  }
);

// Async thunk for fetching admin profile
export const fetchAdminProfile = createAsyncThunk(
  'admin/fetchProfile',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().admin?.token || localStorage.getItem('adminToken');
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      setAuthToken(token);
      const response = await axios.get('/api/admin/profile');
      const { data, success, message } = response.data;
      
      if (success && data) {
        return { 
          user: {
            name: data.name || 'Admin User',
            email: data.email || '',
            role: data.role || 'admin',
            _id: data._id
          }
        };
      }
      return rejectWithValue(message || 'Failed to fetch profile');
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        delete axios.defaults.headers.common[env.VITE_ADMIN_TOKEN_NAME];
      }
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch profile. Please log in again.'
      );
    }
  }
);

// Async thunk for admin logout
export const logout = createAsyncThunk(
  'admin/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axios.post('/api/admin/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('adminToken');
      delete axios.defaults.headers.common[env.VITE_ADMIN_TOKEN_NAME];
      return {};
    }
  }
);

const initialState = {
  user: null,
  token: token || null,
  isAuthenticated: !!token,
  isLoading: false,
  error: null,
  isInitialized: false,
  lastAction: null,
  role: null
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.role = user?.role || 'admin';
    },
    initializeAuth: (state) => {
      state.isInitialized = true;
    }
  },
  extraReducers: (builder) => {
    // Register Admin
    builder.addCase(registerAdmin.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(registerAdmin.fulfilled, (state) => {
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(registerAdmin.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, { payload }) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = payload.user;
      state.token = payload.token;
      state.role = payload.user?.role || 'admin';
      state.error = null;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;
    });

    // Fetch Profile
    builder.addCase(fetchAdminProfile.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchAdminProfile.fulfilled, (state, { payload }) => {
      state.isLoading = false;
      state.user = payload.user;
      state.isAuthenticated = true;
      state.role = payload.user?.role || 'admin';
    });
    builder.addCase(fetchAdminProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;
      localStorage.removeItem('adminToken');
      delete axios.defaults.headers.common[env.VITE_ADMIN_TOKEN_NAME];
    });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.role = null;
      state.error = null;
    });
  }
});

// Selectors
const selectAdminState = (state) => state.AdminReducer;

export const selectIsAuthenticated = createSelector(
  [selectAdminState],
  (admin) => admin.isAuthenticated
);

export const selectIsLoading = createSelector(
  [selectAdminState],
  (admin) => admin.isLoading
);

export const selectError = createSelector(
  [selectAdminState],
  (admin) => admin.error
);

export const selectUser = createSelector(
  [selectAdminState],
  (admin) => admin.user
);

export const selectRole = createSelector(
  [selectAdminState],
  (admin) => admin.role
);

export const selectToken = createSelector(
  [selectAdminState],
  (admin) => admin.token || localStorage.getItem('adminToken')
);

export const selectLastAction = createSelector(
  [selectAdminState],
  (admin) => admin.lastAction
);

export const selectIsInitialized = createSelector(
  [selectAdminState],
  (admin) => admin.isInitialized
);

export const { clearError, setLoading, setCredentials, initializeAuth } = adminSlice.actions;

export const AdminReducer = adminSlice.reducer;