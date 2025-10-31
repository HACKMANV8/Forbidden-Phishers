import { backendUrl } from '@/config/backendUrl';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

  
  const initialState = {
    isLoggedIn : false,
    user: null,
    accessToken: null,
    loading: true,
    isResumeUploaded: false,
  };

  export const silentRefresh = createAsyncThunk('auth/silentRefresh', async (_, { dispatch }) => {
    try {
      const response = await axios.post(`${backendUrl}/api/v1/auth/refresh`, {}, { withCredentials: true });
      return response.data;
    } catch (error) {
      dispatch(logout());
      throw error;
    }
  });


  const authSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
      setAccessToken: (state, action) => {
        state.accessToken = action.payload;
        state.loading = false;
      },
      logout: (state) => {
        state.accessToken = null;
        state.loading = false;
      },
    },
    extraReducers: (builder) => {
      builder.addCase(silentRefresh.pending, (state) => {
        state.loading = true;
      });
      builder.addCase(silentRefresh.fulfilled, (state, action) => {
        state.isLoggedIn = true;
        state.accessToken = action.payload.accessToken;
        state.loading = false;
        state.user = action.payload.user;
        state.isResumeUploaded = action.payload.isResumeUploaded;
      });
      builder.addCase(silentRefresh.rejected, (state) => {
        state.loading = false;
        state.isLoggedIn = false;
      });
    },
  });

  export const { setAccessToken, logout } = authSlice.actions;

  export default authSlice.reducer;


