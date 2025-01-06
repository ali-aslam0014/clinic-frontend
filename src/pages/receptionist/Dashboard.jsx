import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Statistic, 
  List, 
  Badge, 
  Tag, 
  Space, 
  Avatar,
  Table,
  Timeline,
  Alert 
} from 'antd';
import {
  UserAddOutlined,
  CalendarOutlined,
  TeamOutlined,
  SolutionOutlined,
  DollarOutlined,
  AlertOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  BellOutlined,
  HistoryOutlined,
  BarChartOutlined,
  UserOutlined,
  HomeOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';

const ReceptionistDashboard = () => {
  // States
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [currentQueue, setCurrentQueue] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);

  const navigate = useNavigate();

  // Quick Actions
  const quickActions = [
    {
      title: 'Register Patient',
      icon: <UserAddOutlined />,
      color: '#1890ff',
      path: '/receptionist/register-patient'
    },
    {
      title: 'Book Appointment',
      icon: <CalendarOutlined />,
      color: '#52c41a',
      path: '/receptionist/book-appointment'
    },
    {
      title: 'Queue Management',
      icon: <SolutionOutlined />,
      color: '#722ed1',
      path: '/receptionist/queue'
    },
    {
      title: 'Emergency',
      icon: <AlertOutlined />,
      color: '#f5222d',
      path: '/receptionist/emergency'
    }
  ];

  // Stats Cards Data
  const statsCards = [
    {
      title: "Today's Appointments",
      value: stats.todayAppointments || 0,
      icon: <CalendarOutlined />,
      color: '#1890ff',
      onClick: () => navigate('/receptionist/appointments/today')
    },
    {
      title: 'Patients in Queue',
      value: stats.queueCount || 0,
      icon: <TeamOutlined />,
      color: '#52c41a',
      onClick: () => navigate('/receptionist/queue')
    },
    {
      title: 'New Registrations',
      value: stats.newRegistrations || 0,
      icon: <UserAddOutlined />,
      color: '#722ed1',
      onClick: () => navigate('/receptionist/patient-registration')
    },
    {
      title: "Today's Revenue",
      value: stats.todayRevenue || 0,
      prefix: 'Rs.',
      icon: <DollarOutlined />,
      color: '#faad14',
      onClick: () => navigate('/receptionist/billing')
    }
  ];

  // Fetch Dashboard Data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/receptionist/dashboard', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const { data } = response.data;
      setStats(data.stats);
      setTodayAppointments(data.todayAppointments);
      setCurrentQueue(data.currentQueue);
      setRecentPatients(data.recentPatients);
      setEmergencyAlerts(data.emergencyAlerts);
      setPendingTasks(data.pendingTasks);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Emergency Alerts Section */}
      {emergencyAlerts.length > 0 && (
        <Alert
          message="Emergency Alerts"
          description={
            <List
              size="small"
              dataSource={emergencyAlerts}
              renderItem={alert => (
                <List.Item>
                  <Badge status="error" text={alert.message} />
                </List.Item>
              )}
            />
          }
          type="error"
          showIcon
          className="emergency-alerts"
        />
      )}

      {/* Quick Actions Section */}
      <Row gutter={[16, 16]} className="quick-actions">
        {quickActions.map((action, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card 
              hoverable 
              className="action-card"
              onClick={() => navigate(action.path)}
            >
              <Space direction="vertical" align="center" className="action-content">
                <div className="action-icon" style={{ color: action.color }}>
                  {action.icon}
                </div>
                <span className="action-title">{action.title}</span>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Statistics Section */}
      <Row gutter={[16, 16]} className="stats-section">
        {statsCards.map((card, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card 
              className="stats-card" 
              onClick={card.onClick}
              style={{ cursor: 'pointer' }}
            >
              <Statistic 
                title={card.title}
                value={card.value}
                prefix={card.prefix}
                valueStyle={{ color: card.color }}
              />
              <div className="stat-icon" style={{ color: card.color }}>
                {card.icon}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Updated Dashboard Overview Sections */}
      <Row gutter={[16, 16]} className="dashboard-overview">
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <CalendarOutlined />
                <span>Today's Summary</span>
              </Space>
            } 
            className="summary-card"
          >
            <List
              size="small"
              dataSource={[
                { title: 'Total Appointments', value: '24' },
                { title: 'Checked In', value: '18' },
                { title: 'Waiting', value: '6' },
                { title: 'New Registrations', value: '8' },
                { title: 'Emergency Cases', value: '2' }
              ]}
              renderItem={item => (
                <List.Item>
                  <span>{item.title}</span>
                  <span className="summary-value">{item.value}</span>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <HistoryOutlined />
                <span>Recent Activities</span>
              </Space>
            } 
            className="activities-card"
          >
            <Timeline>
              <Timeline.Item color="green">
                Patient checked in - John Doe
                <div className="activity-time">2 minutes ago</div>
              </Timeline.Item>
              <Timeline.Item color="blue">
                New appointment booked - Sarah Smith
                <div className="activity-time">15 minutes ago</div>
              </Timeline.Item>
              <Timeline.Item color="red">
                Emergency registration - Mike Johnson
                <div className="activity-time">45 minutes ago</div>
              </Timeline.Item>
              <Timeline.Item>
                Payment received - Rs. 1,500
                <div className="activity-time">1 hour ago</div>
              </Timeline.Item>
            </Timeline>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <BarChartOutlined />
                <span>Quick Stats</span>
              </Space>
            } 
            className="quick-stats-card"
          >
            <List
              size="small"
              dataSource={[
                { 
                  title: 'Today\'s Revenue', 
                  value: 'Rs. 45,000',
                  icon: <DollarOutlined style={{ color: '#52c41a' }} />
                },
                { 
                  title: 'Queue Wait Time', 
                  value: '~25 mins',
                  icon: <ClockCircleOutlined style={{ color: '#1890ff' }} />
                },
                { 
                  title: 'Available Doctors', 
                  value: '8/10',
                  icon: <UserOutlined style={{ color: '#722ed1' }} />
                },
                { 
                  title: 'Room Occupancy', 
                  value: '85%',
                  icon: <HomeOutlined style={{ color: '#faad14' }} />
                }
              ]}
              renderItem={item => (
                <List.Item>
                  <Space>
                    {item.icon}
                    <span>{item.title}</span>
                  </Space>
                  <span className="stat-value">{item.value}</span>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReceptionistDashboard;