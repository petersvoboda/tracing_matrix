import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = ({ children }) => {
  // Select state individually to prevent unnecessary re-renders
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loading = useAuthStore((state) => state.loading);
  const location = useLocation();

  // Show loading indicator only if loading is true AND user is not yet authenticated
  // This prevents flashing the loading indicator unnecessarily after login
  if (loading && !isAuthenticated) { // Use correct && operator
     // You might want a more sophisticated loading spinner here (e.g., Ant Design Spin)
     return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading Session...</div>;
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children; // Render the children routes if authenticated
};

export default ProtectedRoute;