import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Profile from './pages/Profile';
import ClubDetail from './pages/ClubDetail';
import AdminPanel from './pages/AdminPanel';
import { useAuthStore } from './store/authStore';
import { useEffect, useState } from 'react';
import LoadingSpinner from './components/common/LoadingSpinner';
import VerifyEmail from "./pages/VerifyEmail";
import Clubs from './pages/Clubs';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'club_admin' | 'super_admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <LoadingSpinner />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Public Route Component
interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <LoadingSpinner />;

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

const App: React.FC = () => {
  const { checkAuth, isLoading, isAuthenticated } = useAuthStore();
  const [authChecked, setAuthChecked] = useState(false); // NEW: track if checkAuth completed

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setAuthChecked(true);
    };
    initAuth();
  }, []);

  // Wait until auth is checked to prevent premature redirects
  if (!authChecked) return <LoadingSpinner />;

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          <Route path="/auth/verify-email" element={<VerifyEmail />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="events" element={<Events />} />
            <Route path="events/:id" element={<EventDetail />} />
            <Route path="profile" element={<Profile />} />
            <Route path="clubs" element={<Clubs />} />
            <Route path="clubs/:id" element={<ClubDetail />} />
            
            {/* Admin Routes */}
            <Route
              path="admin"
              element={
                <ProtectedRoute requiredRole="super_admin">
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        {/* Global Toast Notifications */}
        <Toaster position="top-right" />
      </div>
    </Router>
  );
};

export default App;
