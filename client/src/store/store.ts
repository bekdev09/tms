import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import themeReducer from './slices/themeSlice';
import authReducer from '../features/auth/authSlice';
import baseApi from './api/baseApi';

export const store = configureStore({
  reducer: {
    theme: themeReducer, // Registration of theme normal reducer
    auth: authReducer, // Registration of authentication normal reducer
    [baseApi.reducerPath]: baseApi.reducer, // Registration of rtk query reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
