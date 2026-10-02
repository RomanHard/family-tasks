import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ParentHome from "./pages/ParentHome.jsx";
import ChildHome from "./pages/ChildHome.jsx";

function Protected({ allow, children }) {
  const { user, loading } = useAuth();
  if (loading) return <p style={{ padding: 24 }}>Завантаження…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (allow && !allow.includes(user.type)) return <Navigate to="/login" replace />;
  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <p style={{ padding: 24 }}>Завантаження…</p>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.type === "parent" ? "/parent" : "/kid"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/parent"
            element={
              <Protected allow={["parent"]}>
                <ParentHome />
              </Protected>
            }
          />
          <Route
            path="/kid"
            element={
              <Protected allow={["child"]}>
                <ChildHome />
              </Protected>
            }
          />
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
