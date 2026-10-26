import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

const ProtectedRoute = ({ children, requireAdmin = false, allowGuest = true }) => {
  const location = useLocation();
  let user = authService.getCurrentUser();

  // If unauthenticated but guest play is allowed on this route, initialize guest session
  if (!user && allowGuest) {
    user = authService.loginAsGuest('Guest Player');
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
