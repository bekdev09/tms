import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { setTheme } from "./store/slices/themeSlice";
import AuthProvider from "./app/AuthProvider";
import PersistLogin from "./features/auth/PersistLogin";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./components/layout/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NotFound from "./pages/NotFound";

function AppContent() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.mode);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as "light" | "dark";
    if (storedTheme) {
      dispatch(setTheme(storedTheme));
    }
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme, dispatch]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<PersistLogin />}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route
                path="register"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
                    <Register />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
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
