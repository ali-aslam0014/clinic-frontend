import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/v1/user/admin-login', formData);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        navigate('/admin/dashboard');
      }
    } catch (error) {
      setError('Invalid admin credentials');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="card">
        <div className="card-body">
          <h2 className="text-center mb-4">Admin Login</h2>
          {/* ... login form fields ... */}
        </div>
      </div>
    </div>
  );
};