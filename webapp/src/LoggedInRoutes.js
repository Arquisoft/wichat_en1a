import React from 'react'
import { Navigate } from 'react-router-dom';

const LoggedInRoutes = ({ children }) => {
  const token = sessionStorage.getItem("sessionToken");
  if (!token) {
    return <Navigate to="/auth/true" replace/>;//redirect to login page
  }
  return children;
}

export default LoggedInRoutes;