import React, { useState, useEffect } from 'react';
import { Table, Space, Button, Tag, Image, Modal, message } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './PatientList.css';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const navigate = useNavigate();

  // Fetch patients
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/v1/patients', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Fetched patients:', response.data);
      setPatients(response.data.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      message.error('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Delete patient
  const handleDelete = async (patientId) => {
    try {
      Modal.confirm({
        title: 'Are you sure you want to delete this patient?',
        content: 'This action cannot be undone.',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk: async () => {
          await axios.delete(`http://localhost:8080/api/v1/patients/${patientId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          message.success('Patient deleted successfully');
          fetchPatients(); // Refresh the list
        }
      });
    } catch (error) {
      console.error('Delete error:', error);
      message.error(error.response?.data?.message || 'Failed to delete patient');
    }
  };

  // Add this function for edit navigation
  const handleEdit = async (patientId) => {
    try {
      navigate(`/admin/patients/edit/${patientId}`);
    } catch (error) {
      console.error('Navigation error:', error);
      message.error('Failed to navigate to edit page');
    }
  };

  const columns = [
    {
      title: 'Photo',
      dataIndex: 'profile',
      key: 'profile',
      render: (profile) => {
        console.log('Profile image path:', profile); // Debug log
        return (
          <Image
            src={profile ? `http://localhost:8080/uploads/profile-images/${profile.split('\\').pop()}` : '/default-avatar.png'}
            alt="Patient"
            width={50}
            height={50}
            style={{ borderRadius: '50%' }}
            fallback="/default-avatar.png"
            onError={(e) => {
              console.error('Image load error:', e);
            }}
          />
        );
      },
    },
    {
      title: 'Patient ID',
      dataIndex: 'patientId',
      key: 'patientId',
    },
    {
      title: 'Name',
      key: 'name',
      render: (record) => `${record.firstName} ${record.lastName}`,
      sorter: (a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
    },
    {
      title: 'Age',
      key: 'age',
      render: (record) => {
        const dob = new Date(record.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        return age;
      },
      sorter: (a, b) => new Date(a.dateOfBirth) - new Date(b.dateOfBirth),
    },
    {
      title: 'Contact Number',
      dataIndex: 'contactNumber',
      key: 'contactNumber',
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      filters: [
        { text: 'Male', value: 'Male' },
        { text: 'Female', value: 'Female' },
        { text: 'Other', value: 'Other' },
      ],
      onFilter: (value, record) => record.gender === value,
    },
    {
      title: 'Blood Group',
      dataIndex: 'bloodGroup',
      key: 'bloodGroup',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>
          {status}
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
              setSelectedPatient(record);
              setViewModalVisible(true);
            }}
          />
          <Button 
            type="default" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record._id)}
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

  return (
    <AdminLayout>
      <div className="patient-list-container">
        <div className="patient-list-header">
          <h2>Patients List</h2>
          <Button 
            type="primary" 
            onClick={() => navigate('/admin/patients/add')}
          >
            Add New Patient
          </Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={patients}
          loading={loading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} patients`
          }}
        />

        <Modal
          title="Patient Details"
          visible={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={null}
          width={800}
        >
          {selectedPatient && (
            <div className="patient-details">
              <div className="patient-info">
                <h3>Personal Information</h3>
                <p><strong>Patient ID:</strong> {selectedPatient.patientId}</p>
                <p><strong>Name:</strong> {`${selectedPatient.firstName} ${selectedPatient.lastName}`}</p>
                <p><strong>Date of Birth:</strong> {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</p>
                <p><strong>Gender:</strong> {selectedPatient.gender}</p>
                <p><strong>Blood Group:</strong> {selectedPatient.bloodGroup}</p>
                <p><strong>Contact Number:</strong> {selectedPatient.contactNumber}</p>
                <p><strong>Email:</strong> {selectedPatient.email}</p>
                <p><strong>Address:</strong> {selectedPatient.address}</p>
              </div>
              
              <div className="emergency-contact">
                <h3>Emergency Contact</h3>
                <p><strong>Name:</strong> {selectedPatient.emergencyContact?.name}</p>
                <p><strong>Relation:</strong> {selectedPatient.emergencyContact?.relation}</p>
                <p><strong>Phone:</strong> {selectedPatient.emergencyContact?.phone}</p>
              </div>

              <div className="medical-info">
                <h3>Medical Information</h3>
                <p><strong>Allergies:</strong> {selectedPatient.allergies?.join(', ') || 'None'}</p>
                <p><strong>Status:</strong> {selectedPatient.status}</p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default PatientList;