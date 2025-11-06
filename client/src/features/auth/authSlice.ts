import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Keep User typed as any to avoid a hard dependency on server DTO here.
interface AuthState {
  user: any | null;
  accessToken?: string | null;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  loading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any | null>) => {
      state.user = action.payload;
      state.loading = false;
    },
    setAccessToken: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.loading = false;
    },
  },
});

export const { setUser, setAccessToken, setLoading, clearAuth } = authSlice.actions;
export default authSlice.reducer;
