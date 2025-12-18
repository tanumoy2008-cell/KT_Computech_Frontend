import { createSlice, createSelector } from '@reduxjs/toolkit';
import axios from '../../config/axios';

// Helper to set auth token header for delivery-related requests
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['x-delivery-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-delivery-token'];
  }
};

// initialize token and set axios header when present
const token = localStorage.getItem('deliveryToken');
if (token) setAuthToken(token);

// State shape mirrors AdminReducer: agent (user), token, isAuthenticated, isLoading, error
const initialState = {
  agent: null,
  token: token || null,
  isAuthenticated: !!token,
  isLoading: false,
  isInitialized: false,
  error: null,
};

const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {
              // Called when agent logs in successfully. payload: { agent, token }
              // login lifecycle
              loginStart: (state) => {
                state.isLoading = true;
                state.error = null;
              },
              loginSuccess: (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                const { agent, token } = action.payload || {};
                state.agent = agent || action.payload || null;
                state.token = token || state.token;
                state.isInitialized = true;
                try {
                  // Persist only token to localStorage; keep agent in memory only
                  if (state.token) localStorage.setItem('deliveryToken', state.token);
                  if (state.token) setAuthToken(state.token);
                } catch (e) {
                  console.warn('Failed to persist delivery agent/token', e);
                }
              },
              loginFailure: (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Login failed';
              },

              // Set loading flag (useful for auth wrappers)
              setLoading: (state, action) => {
                state.isLoading = Boolean(action.payload);
              },

              // Mark that auth initialization has run
              initializeAuth: (state) => {
                state.isInitialized = true;
              },

              // Logout and clear stored values
              logout: (state) => {
                try {

                  localStorage.removeItem('deliveryToken');
                } catch (e) {
                  /* ignore */
                }
                state.agent = null;
                state.token = null;
                state.isAuthenticated = false;
                state.error = null;
                setAuthToken(null);
              },

              // Replace agent data (useful after fetching profile)
              authData: (state, action) => {
                state.agent = action.payload || null;
                state.isAuthenticated = !!action.payload;
              },

              // Partial update of agent fields (safe merge)
              updateAgent: (state, action) => {
                if (!state.agent) return;
                state.agent = { ...state.agent, ...action.payload };
              },

              // Set availability flag
              setAvailability: (state, action) => {
                if (!state.agent) return;
                state.agent.isAvailable = Boolean(action.payload);
              },

              // Update status (active/inactive/blocked/pending)
              setStatus: (state, action) => {
                if (!state.agent) return;
                state.agent.status = action.payload;
              },

              // Update last online timestamp
              setLastOnline: (state, action) => {
                if (!state.agent) return;
                state.agent.lastOnline = action.payload || new Date().toISOString();
              },

              // Update vehicle info
              setVehicle: (state, action) => {
                if (!state.agent) return;
                state.agent.vehicle = { ...(state.agent.vehicle || {}), ...(action.payload || {}) };
              },

              // Set OTP/hash fields (do not expose raw OTP)
              setOtpFields: (state, action) => {
                if (!state.agent) return;
                const { otpHash, otpExpires } = action.payload || {};
                if (otpHash !== undefined) state.agent.otp = otpHash;
                if (otpExpires !== undefined) state.agent.otpExpires = otpExpires;
              },

              // Clear sensitive fields from the agent object (password, otp, reset tokens)
              clearSensitive: (state) => {
                if (!state.agent) return;
                delete state.agent.password;
                delete state.agent.otp;
                delete state.agent.otpExpires;
                delete state.agent.resetPasswordToken;
                delete state.agent.resetPasswordExpire;
              },
            },
          });

          export const {
            // keep full login lifecycle exported for backwards compatibility
            loginStart,
            loginSuccess,
            loginFailure,
            setLoading,
            initializeAuth,
            logout,
            authData,
            updateAgent,
            setAvailability,
            setStatus,
            setLastOnline,
            setVehicle,
            setOtpFields,
            clearSensitive,
          } = deliverySlice.actions;

          export const DeliveryReducer = deliverySlice.reducer;

          // Selectors (admin-like)
          const selectDeliveryState = (state) => state.DeliveryReducer;

          export const selectIsAuthenticated = createSelector([selectDeliveryState], (d) => !!d?.isAuthenticated);
          export const selectIsLoading = createSelector([selectDeliveryState], (d) => !!d?.isLoading);
          export const selectIsInitialized = createSelector([selectDeliveryState], (d) => !!d?.isInitialized);
          export const selectDeliveryAgent = createSelector([selectDeliveryState], (d) => d?.agent || null);
          export const selectDeliveryToken = createSelector([selectDeliveryState], (d) => d?.token || localStorage.getItem('deliveryToken'));
          export const selectDeliveryError = createSelector([selectDeliveryState], (d) => d?.error || null);

// Helper to persist token and set axios header from other modules (same pattern as AdminReducer)
export const setDeliveryAuthToken = (tokenValue) => {
  try {
    if (tokenValue) {
      localStorage.setItem('deliveryToken', tokenValue);
      setAuthToken(tokenValue);
    } else {
      localStorage.removeItem('deliveryToken');
      setAuthToken(null);
    }
  } catch (e) {
    console.warn('setDeliveryAuthToken error', e);
  }
};