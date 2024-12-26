import React from 'react';
import { useLocation } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  
  const getDashboardTitle = () => {
    if (location.pathname.includes('/admin')) {
      return 'Admin Dashboard';
    } else if (location.pathname.includes('/doctor')) {
      return 'Doctor Dashboard';
    } else if (location.pathname.includes('/patient')) {
      return 'Patient Dashboard';
    } else if (location.pathname.includes('/staff')) {
      return 'Staff Dashboard';
    } else if (location.pathname.includes('/pharmacy')) {
      return 'Pharmacy Dashboard';
    }
    return 'Dashboard';
  };

  return (
    <div className="layout">
      <div className="header">
        <h2>{getDashboardTitle()}</h2>
      </div>
      <div className="content">
        {children}
      </div>
    </div>
  );
};

export default Layout;