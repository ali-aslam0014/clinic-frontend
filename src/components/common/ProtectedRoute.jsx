import React, { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { checkAuth } from '../../redux/features/authSlice'

const ProtectedRoute = ({ allowedRoles }) => {
  const dispatch = useDispatch()
  const { isAuthenticated, token, user } = useSelector((state) => state.auth)
  
  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  console.log('Protected Route Check:', {
    isAuthenticated,
    token,
    userRole: user?.role,
    allowedRoles,
    user: user
  });
  
  // Check if still loading
  if (!user && token) {
    return <div>Loading...</div>
  }

  // Check authentication
  if (!token || !isAuthenticated) {
    console.log('No token or not authenticated');
    return <Navigate to="/login" replace />
  }

  // Check role
  if (!allowedRoles.includes(user?.role)) {
    console.log(`Role ${user?.role} not in allowed roles:`, allowedRoles);
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute;