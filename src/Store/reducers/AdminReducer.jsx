import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import axios from '../../config/axios';

// Helper function to set auth token in axios defaults
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['x-admin-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-admin-token'];
  }
};

// Initialize axios headers from localStorage if token exists
const token = localStorage.getItem('adminToken');
if (token) {
  setAuthToken(token);
}

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
        // Return a consistent payload structure
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
      // If unauthorized, clear the token
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        delete axios.defaults.headers.common['x-admin-token'];
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
      // Continue with client-side logout even if server logout fails
    } finally {
      localStorage.removeItem('adminToken');
      delete axios.defaults.headers.common['x-admin-token'];
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
  role: null,
  lastAction: null,
  isInitialized: false
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  // Use Immer's createReducer for better performance
  reducers: (create) => ({
    clearError: create.reducer((state) => {
      state.error = null;
    }),
    setLoading: create.reducer((state, action) => {
      state.isLoading = action.payload;
    }),
    setCredentials: create.reducer((state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.role = user?.role || null;
      state.isInitialized = true;
      if (token) {
        localStorage.setItem('adminToken', token);
        setAuthToken(token);
      }
    }),
    initializeAuth: create.reducer((state) => {
      state.isInitialized = true;
    })
  }),
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
      state.role = user?.role || null;
      state.isInitialized = true;
      if (token) {
        localStorage.setItem('adminToken', token);
        setAuthToken(token);
      }
    },
    initializeAuth: (state) => {
      state.isInitialized = true;
    }
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.lastAction = 'login/pending';
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        if (payload) {
          state.isLoading = false;
          state.isAuthenticated = true;
          state.user = payload.user;
          state.role = payload.user?.role || null;
          state.token = payload.token;
          state.error = null;
          state.isInitialized = true;
          state.lastAction = 'login/fulfilled';
          
          if (payload.token) {
            localStorage.setItem('adminToken', payload.token);
            setAuthToken(payload.token);
          }
        }
      })
      .addCase(login.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
        state.token = null;
        state.error = payload || 'Login failed';
        state.isInitialized = true;
        state.lastAction = 'login/rejected';
        localStorage.removeItem('adminToken');
        delete axios.defaults.headers.common['x-admin-token'];
      })

      // Fetch Profile
      .addCase(fetchAdminProfile.pending, (state) => {
        // Only update if not already loading to prevent unnecessary re-renders
        if (!state.isLoading) {
          state.isLoading = true;
          state.error = null;
          state.lastAction = 'fetchProfile/pending';
        }
      })
      .addCase(fetchAdminProfile.fulfilled, (state, { payload }) => {
        if (payload?.user) {
          state.isLoading = false;
          state.user = payload.user;
          state.role = payload.user.role || null;
          state.isAuthenticated = true;
          state.isInitialized = true;
          state.error = null;
          state.lastAction = 'fetchProfile/fulfilled';
        }
      })
      .addCase(fetchAdminProfile.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
        state.error = payload || 'Failed to fetch profile';
        state.isInitialized = true;
        state.lastAction = 'fetchProfile/rejected';
        
        // Only clear token if we have a 401 Unauthorized error
        if (payload?.status === 401) {
          localStorage.removeItem('adminToken');
          delete axios.defaults.headers.common['x-admin-token'];
        }
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.role = null;
        state.isLoading = false;
        state.error = null;
        state.lastAction = 'logout/fulfilled';
      });
  }
});

// Memoized selectors using createSelector for better performance
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

export default adminSlice.reducer;