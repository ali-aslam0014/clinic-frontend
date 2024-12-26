import { createSlice } from '@reduxjs/toolkit';

// Helper function to check if token is valid
const isValidToken = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const doctorInfo = localStorage.getItem('doctorInfo');
  return !!(token && (user || doctorInfo));
};

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || JSON.parse(localStorage.getItem('doctorInfo')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: isValidToken()
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      
      // If user is doctor, store doctor specific info
      if (user.role === 'doctor') {
        localStorage.setItem('doctorInfo', JSON.stringify({
          name: user.name,
          specialization: user.specialization,
          experience: user.experience
        }));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.clear(); // Clear all storage
    },
    checkAuth: (state) => {
      state.isAuthenticated = isValidToken();
      if (!state.isAuthenticated) {
        state.user = null;
        state.token = null;
        localStorage.clear();
      }
    }
  },
});

export const { setCredentials, logout, checkAuth } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;