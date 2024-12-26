import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Space, Button, Tag, Image, Modal, message } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import './DoctorList.css';
import AdminLayout from '../../../components/admin/Layout';

const DoctorList = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);

  // Fetch doctors from backend - Updated endpoint
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/v1/doctors/admin/doctors', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`  // Add token
        }
      });
      
      if (response.data.success) {
        setDoctors(response.data.data);
      } else {
        message.error('Failed to fetch doctors');
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      message.error(error.response?.data?.error || 'Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Delete doctor - Updated endpoint
  const handleDelete = async (doctorId) => {
    try {
      const response = await axios.delete(
        `http://localhost:8080/api/v1/doctors/admin/doctors/${doctorId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`  // Add token
          }
        }
      );

      if (response.data.success) {
        message.success('Doctor deleted successfully');
        fetchDoctors(); // Refresh list
      }
    } catch (error) {
      console.error('Error deleting doctor:', error);
      message.error(error.response?.data?.error || 'Failed to delete doctor');
    }
  };

  // Updated image URL handling
  const columns = [
    {
      title: 'Photo',
      dataIndex: 'image',
      key: 'image',
      render: (image) => (
        <Image
          src={image ? `http://localhost:8080${image}` : '/default-avatar.png'}
          alt="Doctor"
          width={50}
          height={50}
          style={{ borderRadius: '50%', objectFit: 'cover' }}
          fallback="/default-avatar.png"
        />
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Specialization',
      dataIndex: 'specialization',
      key: 'specialization',
      render: (specialization) => (
        <Tag color="blue">{specialization}</Tag>
      ),
    },
    {
      title: 'Experience',
      dataIndex: 'experience',
      key: 'experience',
    },
    {
      title: 'Contact',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedDoctor(record);
              setViewModalVisible(true);
            }}
          />
          <Button 
            type="default" 
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/doctors/edit/${record._id}`)}
          />
          <Button 
            type="danger" 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          />
        </Space>
      ),
    },
  ];

  // Add doctor details modal content
  const DoctorDetailsModal = ({ doctor }) => (
    <div className="doctor-details">
      <div className="doctor-details-header">
        <Image
          src={doctor.image ? `http://localhost:8080${doctor.image}` : '/default-avatar.png'}
          alt={doctor.name}
          width={100}
          height={100}
          style={{ borderRadius: '50%', objectFit: 'cover' }}
        />
        <h2>{doctor.name}</h2>
        <Tag color="blue">{doctor.specialization}</Tag>
      </div>
      <div className="doctor-details-content">
        <p><strong>Email:</strong> {doctor.email}</p>
        <p><strong>Phone:</strong> {doctor.phone}</p>
        <p><strong>Experience:</strong> {doctor.experience} years</p>
        <p><strong>Qualifications:</strong> {doctor.qualifications}</p>
        <p><strong>Address:</strong> {doctor.address}</p>
        <p><strong>Consultation Fee:</strong> ${doctor.consultationFee}</p>
        <p><strong>Status:</strong> <Tag color={doctor.status === 'active' ? 'green' : 'red'}>{doctor.status.toUpperCase()}</Tag></p>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="doctor-list-container">
        <div className="doctor-list-header">
          <h2>Doctors List</h2>
          <Button 
            type="primary" 
            onClick={() => navigate('/admin/doctors/add')}
          >
            Add New Doctor
          </Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={doctors}
          loading={loading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} doctors`
          }}
        />

        <Modal
          title="Doctor Details"
          visible={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={null}
          width={700}
        >
          {selectedDoctor && <DoctorDetailsModal doctor={selectedDoctor} />}
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default DoctorList;