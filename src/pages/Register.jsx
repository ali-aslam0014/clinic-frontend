import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/axiosConfig'
import './styles.css'

const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    gender: '',
    dateOfBirth: '',
    bloodGroup: '',
    role: '',
    specialization: '',
    experience: '',
    licenseNumber: ''
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axiosInstance.post('/api/v1/user/register', formData)
      if (res.data.success) {
        alert('Registration successful!')
        navigate('/login')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('Registration failed. Please try again.')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="welcome-section">
          <h1>Welcome to</h1>
          <h2>Clinic Management System</h2>
          <p>Create your account</p>
        </div>

        <div className="card auth-card">
          <div className="card-body">
            <h3 className="text-center mb-4">Register</h3>
            
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label">Register As</label>
                <select 
                  className="form-select"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="staff">Staff</option>
                  <option value="pharmacist">Pharmacist</option>
                </select>
              </div>

              {formData.role === 'doctor' && (
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Specialization</label>
                    <input 
                      type="text"
                      className="form-control"
                      name="specialization"
                      value={formData.specialization || ''}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Experience (Years)</label>
                    <input 
                      type="number"
                      className="form-control"
                      name="experience"
                      value={formData.experience || ''}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              )}

              {formData.role === 'pharmacist' && (
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">License Number</label>
                    <input 
                      type="text"
                      className="form-control"
                      name="licenseNumber"
                      value={formData.licenseNumber || ''}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
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
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
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
                <div className="col-md-6 mb-3">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="tel" 
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Address</label>
                <textarea 
                  className="form-control"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="2"
                  required
                />
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Gender</label>
                  <select 
                    className="form-select"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Date of Birth</label>
                  <input 
                    type="date" 
                    className="form-control"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Blood Group</label>
                  <select 
                    className="form-select"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100">
                Register
              </button>
              <Link to="/login" className="d-block text-center mt-3">
                Already registered? Login here
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register;