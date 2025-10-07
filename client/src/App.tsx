import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { setTheme } from './store/slices/themeSlice';
import AuthProvider from './components/AuthProvider';
import PersistLogin from './components/PersistLogin';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import DashboardHome from './components/DashboardHome';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AppContent() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.mode);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (storedTheme) {
      dispatch(setTheme(storedTheme));
    }
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme, dispatch]);

  return (
    <BrowserRouter>
      <PersistLogin>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
              <Route index element={<DashboardHome />} />
              <Route path="register" element={
                <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
                  <Register />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </AuthProvider>
      </PersistLogin>
    </BrowserRouter>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
      <ToastContainer />
    </Provider>
  );
}

export default App;
