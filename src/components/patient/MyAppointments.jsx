import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Tag, 
  Button, 
  Card, 
  message, 
  Modal,
  Space,
  Tooltip 
} from 'antd';
import { 
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import './MyAppointments.css';

const API_URL = 'http://localhost:8080/api/v1';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Please login to view appointments');
        return;
      }

      console.log('Fetching appointments with token:', token);
      
      const response = await axios.get(
        `${API_URL}/appointments/my-appointments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Response:', response.data);

      if (response.data.success) {
        setAppointments(response.data.data);
      } else {
        message.error(response.data.message || 'Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Full error details:', error.response || error);
      message.error(
        error.response?.data?.message || 
        'Failed to fetch appointments. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Please login to cancel appointment');
        return;
      }

      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/appointments/${appointmentId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      message.success('Appointment cancelled successfully');
      fetchAppointments();
    } catch (error) {
      console.error('Cancel appointment error:', error);
      message.error(
        error.response?.data?.message || 
        'Failed to cancel appointment'
      );
    }
  };

  const getStatusTag = (status) => {
    const statusColors = {
      pending: 'gold',
      confirmed: 'green',
      cancelled: 'red',
      completed: 'blue',
      'no-show': 'gray'
    };
    return <Tag color={statusColors[status]}>{status.toUpperCase()}</Tag>;
  };

  const columns = [
    {
      title: 'Doctor',
      dataIndex: ['doctorId', 'name'],
      key: 'doctorName',
      render: (text, record) => (
        <Space>
          <UserOutlined />
          Dr. {text}
          <small>({record.doctorId.specialization})</small>
        </Space>
      )
    },
    {
      title: 'Date & Time',
      dataIndex: 'appointmentDate',
      key: 'datetime',
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <span>
            <CalendarOutlined /> {moment(text).format('MMM DD, YYYY')}
          </span>
          <span>
            <ClockCircleOutlined /> {record.timeSlot.start} - {record.timeSlot.end}
          </span>
        </Space>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => getStatusTag(status)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="primary"
              icon={<FileTextOutlined />}
              onClick={() => {
                setSelectedAppointment(record);
                setModalVisible(true);
              }}
            >
              Details
            </Button>
          </Tooltip>
          {['pending', 'confirmed'].includes(record.status) && (
            <Button 
              type="danger"
              onClick={() => handleCancel(record._id)}
            >
              Cancel
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="my-appointments-container">
      <Card title="My Appointments" className="appointments-card">
        <Table
          columns={columns}
          dataSource={appointments}
          rowKey="_id"
          loading={loading}
        />
      </Card>

      <Modal
        title="Appointment Details"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedAppointment && (
          <div className="appointment-details">
            <p><strong>Doctor:</strong> Dr. {selectedAppointment.doctorId.name}</p>
            <p><strong>Specialization:</strong> {selectedAppointment.doctorId.specialization}</p>
            <p><strong>Date:</strong> {moment(selectedAppointment.appointmentDate).format('MMMM DD, YYYY')}</p>
            <p><strong>Time:</strong> {selectedAppointment.timeSlot.start} - {selectedAppointment.timeSlot.end}</p>
            <p><strong>Type:</strong> {selectedAppointment.type}</p>
            <p><strong>Status:</strong> {getStatusTag(selectedAppointment.status)}</p>
            <p><strong>Reason:</strong> {selectedAppointment.reason}</p>
            {selectedAppointment.notes && (
              <p><strong>Notes:</strong> {selectedAppointment.notes}</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyAppointments;