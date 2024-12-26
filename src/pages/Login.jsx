import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import './styles.css'
import { message } from 'antd'
import { setCredentials } from '../redux/features/authSlice'
import axiosInstance from '../utils/axiosConfig'

const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      console.log('Login attempt:', formData);

      const response = await axiosInstance.post('/api/v1/user/login', formData);
      console.log('Full Login response:', response);

      if (response.data.success) {
        const token = response.data.data.token;
        const user = response.data.data.user;
        
        console.log('Token:', token);
        console.log('User:', user);

        if (user.role !== formData.role) {
          throw new Error(`Invalid role selected. You are registered as a ${user.role}`);
        }

        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        if (user.role === 'doctor') {
          localStorage.setItem('doctorId', user.id);
          localStorage.setItem('doctorInfo', JSON.stringify({
            name: user.name,
            specialization: user.specialization,
            experience: user.experience
          }));
        }

        dispatch(setCredentials({ 
          user,
          token 
        }));

        console.log('Redux state updated');
        console.log('LocalStorage token:', localStorage.getItem('token'));

        switch (user.role) {
          case 'doctor':
            console.log('Navigating to doctor dashboard...');
            navigate('/doctor/dashboard', { replace: true });
            break;
          case 'patient':
            navigate('/patient/dashboard', { replace: true });
            break;
          case 'pharmacist':
            navigate('/pharmacy/dashboard', { replace: true });
            break;
          case 'staff':
            navigate('/receptionist/dashboard', { replace: true });
            break;
          default:
            console.log('Unknown role:', user.role);
            throw new Error('Invalid role');
        }

        message.success(`Welcome ${user.name}!`);
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to login';
      setError(errorMessage);
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="welcome-section">
          <h1>Welcome to</h1>
          <h2>Clinic Management System</h2>
          <p>Please login to continue</p>
        </div>

        <div className="card auth-card">
          <div className="card-body">
            <h3 className="text-center mb-4">Login</h3>
            
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  className="form-control"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Role</label>
                <select 
                  className="form-select" 
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="doctor">Doctor</option>
                  <option value="patient">Patient</option>
                  <option value="staff">Staff</option>
                  <option value="pharmacist">Pharmacist</option>
                </select>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
              <Link to="/register" className="d-block text-center mt-3">
                Not registered? Register here
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login;