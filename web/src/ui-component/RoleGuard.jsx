import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectCurrentUser } from 'store/auth/authSlice';
import Loader from './Loader';

/**
 * RoleGuard Component
 * Prevents unauthorized users from accessing specific routes based on their role.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if authorized
 * @param {string[]} props.allowedRoles - Array of roles allowed to access this route
 */
const RoleGuard = ({ children, allowedRoles }) => {
  const user = useSelector(selectCurrentUser);

  // While user data is being fetched (me query in MainLayout), show loader
  if (!user) {
    return <Loader />;
  }

  // Check if user's role is in the allowedRoles list
  if (!allowedRoles.includes(user.role)) {
    console.warn(`Access denied for role: ${user.role}. Allowed roles: ${allowedRoles.join(', ')}`);
    // Redirect to a safe page (dashboard) if not authorized
    return <Navigate to="/dashboard/default" replace />;
  }

  return children;
};

export default RoleGuard;
