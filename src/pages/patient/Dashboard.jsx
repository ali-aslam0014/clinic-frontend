import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Statistic, List, Calendar, Badge, Spin, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  FileTextOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  DollarOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import './Dashboard.css';
// import PatientLayout from '../../components/patient/Layout';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    appointments: [],
    prescriptions: [],
    reports: [],
    payments: []
  });

  const patient = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [appointments, prescriptions, reports, payments] = await Promise.all([
        axios.get('http://localhost:8080/api/v1/appointments/my-appointments'),
        axios.get('http://localhost:8080/api/v1/prescriptions/my-prescriptions'),
        axios.get('http://localhost:8080/api/v1/reports/my-reports'),
        axios.get('http://localhost:8080/api/v1/payments/my-payments')
      ]);

      setDashboardData({
        appointments: appointments.data.data || [],
        prescriptions: prescriptions.data.data || [],
        reports: reports.data.data || [],
        payments: payments.data.data || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Quick Actions Section
  const quickActions = [
    {
      title: 'Book Appointment',
      icon: <CalendarOutlined />,
      route: '/patient/book-appointment',
      color: '#1890ff',
      description: 'Schedule a new appointment with a doctor'
    },
    {
      title: 'My Appointments',
      icon: <ClockCircleOutlined />,
      route: '/patient/my-appointments',
      color: '#52c41a',
      description: 'View and manage your appointments'
    },
    {
      title: 'View Prescriptions',
      icon: <MedicineBoxOutlined />,
      route: '/patient/view-prescriptions',
      color: '#faad14',
      description: 'Access your medical prescriptions'
    },
    {
      title: 'Lab Reports',
      icon: <FileTextOutlined />,
      route: '/patient/lab-reports-list',
      color: '#eb2f96',
      description: 'Check your laboratory test results'
    },
    {
      title: 'Find Doctor',
      icon: <UserOutlined />,
      route: '/patient/find-doctors',
      color: '#722ed1',
      description: 'Search for available doctors'
    }
  ];

  // Stats Cards (Updated to match quick actions style)
  const statsCards = [
    {
      title: 'Upcoming Appointments',
      value: dashboardData.appointments.filter(apt => 
        moment(apt.appointmentDate).isAfter(moment())
      ).length,
      icon: <CalendarOutlined className="action-icon" />,
      route: '/patient/upcoming-appointments',
      color: '#1890ff'
    },
    {
      title: 'Active Prescriptions',
      value: dashboardData.prescriptions.length,
      icon: <MedicineBoxOutlined className="action-icon" />,
      route: '/patient/active-prescriptions',
      color: '#52c41a'
    },
    {
      title: 'Pending Reports',
      value: dashboardData.reports.filter(report => report.status === 'pending').length,
      icon: <FileTextOutlined className="action-icon" />,
      route: '/patient/pending-reports',
      color: '#faad14'
    },
    {
      title: 'Recent Payments',
      value: dashboardData.payments.length,
      icon: <DollarOutlined className="action-icon" />,
      route: '/patient/recent-payments',
      color: '#722ed1'
    }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Welcome Section with gradient background */}
      <Card className="welcome-card">
        <div className="welcome-content">
          <h1>Welcome back, {patient?.name}! 👋</h1>
          <p>Here's an overview of your health records and upcoming appointments</p>
        </div>
      </Card>

      {/* Quick Actions Grid */}
      <Row gutter={[16, 16]} className="quick-actions-section">
        {quickActions.map((action, index) => (
          <Col xs={24} sm={12} md={8} lg={6} key={index}>
            <Card 
              hoverable 
              className="action-card"
              onClick={() => navigate(action.route)}
            >
              <div className="action-icon-wrapper" style={{ color: action.color }}>
                {action.icon}
              </div>
              <h3>{action.title}</h3>
              <p className="action-description">{action.description}</p>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Stats Overview */}
      <Row gutter={[16, 16]} className="stats-section">
        {statsCards.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card 
              className="stat-card"
              style={{ borderTop: `3px solid ${stat.color}` }}
            >
              <Statistic 
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Appointments and Calendar Section */}
      <Row gutter={[16, 16]} className="appointments-calendar-section">
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <CalendarOutlined />
                <span>Upcoming Appointments</span>
              </Space>
            }
            className="appointments-card"
            extra={
              <Button type="primary" onClick={() => navigate('/patient/book-appointment')}>
                Book New
              </Button>
            }
          >
            <List
              dataSource={dashboardData.appointments
                .filter(apt => moment(apt.appointmentDate).isAfter(moment()))
                .slice(0, 5)}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button type="link" onClick={() => navigate(`/patient/appointments/${item._id}`)}>
                      View Details
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge status={item.status === 'confirmed' ? 'processing' : 'default'}>
                        <UserOutlined className="doctor-avatar" />
                      </Badge>
                    }
                    title={`Dr. ${item.doctorId.name}`}
                    description={
                      <Space direction="vertical" size={1}>
                        <Space>
                          <CalendarOutlined />
                          {moment(item.appointmentDate).format('MMMM DD, YYYY')}
                        </Space>
                        <Space>
                          <ClockCircleOutlined />
                          {item.timeSlot}
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card className="calendar-card">
            <Calendar 
              fullscreen={false}
              dateCellRender={(date) => {
                const appointmentsForDate = dashboardData.appointments
                  .filter(apt => moment(apt.appointmentDate).isSame(date, 'day'));
                return appointmentsForDate.length > 0 ? (
                  <Badge count={appointmentsForDate.length} />
                ) : null;
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PatientDashboard;