import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Calendar,
  Badge,
  Timeline,
  List,
  Avatar,
  message,
  Typography,
  Spin
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import axiosInstance from '../../../utils/axiosConfig';
import DoctorLayout from '../../../components/doctor/Layout';
import './Dashboard.css';

const { Title } = Typography;

const DoctorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalPatients: 0,
      todayAppointments: 0,
      completedAppointments: 0,
      pendingAppointments: 0
    },
    recentPatients: [],
    upcomingAppointments: [],
    todaySchedule: []
  });
  const [doctorInfo, setDoctorInfo] = useState({
    name: '',
    specialization: ''
  });

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching dashboard data...');
      const response = await axiosInstance.get('/api/v1/doctor/dashboard', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Dashboard data received:', response.data);
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err.message);
      message.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch doctor info
  const fetchDoctorInfo = async () => {
    try {
      // Get doctorInfo from localStorage instead of making API call
      const doctorInfo = JSON.parse(localStorage.getItem('doctorInfo'));
      if (doctorInfo) {
        setDoctorInfo({
          name: doctorInfo.name,
          specialization: doctorInfo.specialization
        });
      }
    } catch (err) {
      console.error('Doctor info fetch error:', err);
      message.error('Failed to load doctor information');
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchDoctorInfo(),
          fetchDashboardData()
        ]);
      } catch (error) {
        console.error('Dashboard initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  if (loading) {
    return (
      <DoctorLayout>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <p>Loading dashboard...</p>
        </div>
      </DoctorLayout>
    );
  }

  if (error) {
    return (
      <DoctorLayout>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Error loading dashboard</h2>
          <p>{error}</p>
          <Button onClick={fetchDashboardData}>Retry</Button>
        </div>
      </DoctorLayout>
    );
  }

  // Recent patients columns
  const patientColumns = [
    {
      title: 'Patient Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <span>
          <Avatar icon={<UserOutlined />} /> {text}
        </span>
      )
    },
    {
      title: 'Last Visit',
      dataIndex: 'lastVisit',
      key: 'lastVisit',
      render: date => new Date(date).toLocaleDateString()
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Badge 
          status={status === 'active' ? 'success' : 'default'} 
          text={status.charAt(0).toUpperCase() + status.slice(1)} 
        />
      )
    }
  ];

  // Upcoming appointments columns
  const appointmentColumns = [
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time'
    },
    {
      title: 'Patient',
      dataIndex: 'patientName',
      key: 'patientName'
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
      render: status => (
        <Badge 
          status={
            status === 'confirmed' ? 'success' : 
            status === 'pending' ? 'warning' : 
            'error'
          } 
          text={status.charAt(0).toUpperCase() + status.slice(1)} 
        />
      )
    }
  ];

  return (
    <DoctorLayout>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <Title level={2}>
            Dr. {doctorInfo.name}'s Dashboard
            <span className="doctor-specialization">
              {doctorInfo.specialization}
            </span>
          </Title>
        </div>

        {/* Statistics Cards */}
        <Row gutter={16} className="stats-row">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Patients"
                value={dashboardData.stats.totalPatients}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Today's Appointments"
                value={dashboardData.stats.todayAppointments}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Completed"
                value={dashboardData.stats.completedAppointments}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Pending"
                value={dashboardData.stats.pendingAppointments}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Row gutter={16} className="main-content">
          {/* Recent Patients */}
          <Col xs={24} lg={12}>
            <Card 
              title="Recent Patients" 
              className="dashboard-card"
              loading={loading}
            >
              <Table
                dataSource={dashboardData.recentPatients}
                columns={patientColumns}
                pagination={{ pageSize: 5 }}
                rowKey="id"
              />
            </Card>
          </Col>

          {/* Today's Schedule */}
          <Col xs={24} lg={12}>
            <Card 
              title="Today's Schedule" 
              className="dashboard-card"
              loading={loading}
            >
              <Timeline mode="left">
                {dashboardData.todaySchedule.map(item => (
                  <Timeline.Item 
                    key={item.id}
                    color={item.status === 'completed' ? 'green' : 'blue'}
                    label={item.time}
                  >
                    <p>{item.patientName}</p>
                    <p className="appointment-type">{item.type}</p>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </Col>
        </Row>

        {/* Upcoming Appointments */}
        <Row>
          <Col span={24}>
            <Card 
              title="Upcoming Appointments" 
              className="dashboard-card"
              loading={loading}
            >
              <Table
                dataSource={dashboardData.upcomingAppointments}
                columns={appointmentColumns}
                pagination={{ pageSize: 5 }}
                rowKey="id"
              />
            </Card>
          </Col>
        </Row>
      </div>
    </DoctorLayout>
  );
};

export default DoctorDashboard;