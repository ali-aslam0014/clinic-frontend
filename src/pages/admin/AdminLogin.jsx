import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './AdminLogin.css';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../../redux/features/authSlice';

const AdminLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin/dashboard');
    }
    if (isAuthenticated && user?.role !== 'admin') {
      localStorage.clear();
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      localStorage.clear();

      const response = await axios.post('/api/v1/user/admin/login', {
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        const { token, user } = response.data.data;

        if (user.role !== 'admin') {
          throw new Error('Invalid admin credentials');
        }

        localStorage.setItem('token', token);
        localStorage.setItem('admin', JSON.stringify(user));

        dispatch(setCredentials({
          user: { ...user, role: 'admin' },
          token
        }));

        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Invalid admin credentials');
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="welcome-section">
        <h1>Welcome to</h1>
        <h2>Clinic Management System</h2>
        <h3>Admin Portal</h3>
      </div>
      
      <div className="card admin-card">
        <div className="card-body">
          <h3 className="text-center mb-4">Admin Login</h3>
          
          {error && (
            <div className="alert alert-danger">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Admin Email</label>
              <input 
                type="email" 
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-control"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login as Admin'}
            </button>

            <Link to="/login" className="d-block text-center mt-3">
              Back to Main Login
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;