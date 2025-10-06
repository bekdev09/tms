import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import themeReducer from './slices/themeSlice';
import authReducer from './slices/authSlice';
import { dataApi } from './api/dataApi';
import authApi from './api/authApi';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    [dataApi.reducerPath]: dataApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(dataApi.middleware, authApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
