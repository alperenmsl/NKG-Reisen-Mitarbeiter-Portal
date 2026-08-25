import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import AppHome from "@/pages/AppHome";
import AppData from "@/pages/AppData";
import { useAuthUser } from "@/hooks/useAuthUser";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthUser();
  if (loading) return <div />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthUser();
  if (loading) return <div />;
  if (user) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={
            <GuestGuard>
              <Login />
            </GuestGuard>
          }
        />
        <Route
          path="/app"
          element={
            <AuthGuard>
              <AppHome />
            </AuthGuard>
          }
        />
        <Route
          path="/app/daten"
          element={
            <AuthGuard>
              <AppData />
            </AuthGuard>
          }
        />
      </Routes>
    </Router>
  );
}
