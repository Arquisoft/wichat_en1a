import React from 'react'
import { Navigate } from 'react-router-dom';

const LoggedInRoutes = () => {
  return (({ children }) => {
      const token = localStorage.getItem("sessionToken");
      if (!token) {
        return <Navigate to="/auth/true" />;//redirect to login page
      }
      return children;
    }
  )
}

export default LoggedInRoutes