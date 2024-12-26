import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Tag,
  Button,
  Space,
  Modal,
  message,
  Empty,
  Tooltip,
  Badge,
  Typography
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import './UpcomingAppointments.css';

const { Text, Title } = Typography;
const { confirm } = Modal;

const UpcomingAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8080/api/v1/appointments/my-appointments',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      // Filter only upcoming appointments and sort by date
      const upcomingAppointments = response.data.data
        .filter(app => moment(app.appointmentDate).isAfter(moment()))
        .sort((a, b) => moment(a.appointmentDate) - moment(b.appointmentDate));
      
      setAppointments(upcomingAppointments);
    } catch (error) {
      message.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = (appointmentId) => {
    confirm({
      title: 'Cancel Appointment',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to cancel this appointment?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await axios.put(
            `http://localhost:8080/api/v1/appointments/${appointmentId}/cancel`,
            {},
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            }
          );
          message.success('Appointment cancelled successfully');
          fetchAppointments();
        } catch (error) {
          message.error('Failed to cancel appointment');
        }
      }
    });
  };

  const getStatusTag = (status) => {
    const statusColors = {
      'Scheduled': 'processing',
      'Confirmed': 'success',
      'Cancelled': 'error',
      'Completed': 'default'
    };
    return <Tag color={statusColors[status]}>{status}</Tag>;
  };

  const getAppointmentTypeIcon = (type) => {
    return type === 'Virtual' ? (
      <VideoCameraOutlined style={{ color: '#1890ff' }} />
    ) : (
      <MedicineBoxOutlined style={{ color: '#52c41a' }} />
    );
  };

  const renderAppointmentItem = (appointment) => (
    <List.Item
      key={appointment._id}
      actions={[
        appointment.status === 'Scheduled' && (
          <Button
            type="text"
            danger
            icon={<CloseCircleOutlined />}
            onClick={() => handleCancelAppointment(appointment._id)}
          >
            Cancel
          </Button>
        )
      ]}
    >
      <List.Item.Meta
        avatar={
          <Badge status={appointment.status === 'Confirmed' ? 'processing' : 'default'}>
            {getAppointmentTypeIcon(appointment.type)}
          </Badge>
        }
        title={
          <Space>
            <Text strong>Dr. {appointment.doctor.name}</Text>
            {getStatusTag(appointment.status)}
          </Space>
        }
        description={
          <Space direction="vertical" size={1}>
            <Space>
              <CalendarOutlined />
              <Text>{moment(appointment.appointmentDate).format('dddd, MMMM DD, YYYY')}</Text>
            </Space>
            <Space>
              <ClockCircleOutlined />
              <Text>{appointment.timeSlot}</Text>
            </Space>
            <Space>
              <UserOutlined />
              <Text>{appointment.doctor.specialization}</Text>
            </Space>
            {appointment.type === 'Virtual' && appointment.meetingLink && (
              <Button 
                type="primary" 
                icon={<VideoCameraOutlined />}
                href={appointment.meetingLink}
                target="_blank"
              >
                Join Meeting
              </Button>
            )}
          </Space>
        }
      />
    </List.Item>
  );

  return (
    <div className="upcoming-appointments-container">
      <Card
        title={
          <Space>
            <CalendarOutlined />
            <span>Upcoming Appointments</span>
          </Space>
        }
        extra={
          <Button type="primary" href="/patient/book-appointment">
            Book New Appointment
          </Button>
        }
      >
        <List
          className="appointments-list"
          loading={loading}
          itemLayout="horizontal"
          dataSource={appointments}
          renderItem={renderAppointmentItem}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No upcoming appointments"
              />
            )
          }}
        />
      </Card>
    </div>
  );
};

export default UpcomingAppointments;