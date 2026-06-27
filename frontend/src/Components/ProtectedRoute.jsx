import { Navigate, useLocation } from 'react-router-dom';

// Redirects unauthenticated users to /login and stores the attempted path
// so they are returned to it after a successful login.
export const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  if (!localStorage.getItem('auth-token')) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
