import React from 'react';
import { Layout, Menu } from 'antd';
import { 
  DashboardOutlined, 
  CalendarOutlined,
  FileTextOutlined,
  UserOutlined,
  LogoutOutlined 
} from '@ant-design/icons';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import './Layout.css';

const { Header, Sider, Content } = Layout;

const PatientLayout = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{ 
          position: 'fixed',
          left: 0,
          height: '100vh',
          zIndex: 999 
        }}
      >
        <div className="logo-container">
          <h2 className="brand-title">Clinic Management System</h2>
          <h3 className="portal-title">Patient Portal</h3>
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
          <Menu.Item key="1" icon={<DashboardOutlined />}>
            <Link to="/patient/dashboard">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<CalendarOutlined />}>
            <Link to="/patient/my-appointments">Appointments</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<FileTextOutlined />}>
            <Link to="/patient/prescriptions">Prescriptions</Link>
          </Menu.Item>
          <Menu.Item key="4" icon={<FileTextOutlined />}>
            <Link to="/patient/lab-reports-detail">Reports</Link>
          </Menu.Item>
          <Menu.Item key="5" icon={<UserOutlined />}>
            <Link to="/patient/profile">Profile</Link>
          </Menu.Item>
          <Menu.Item key="6" icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Menu.Item>
        </Menu>
      </Sider>
      
      <Layout style={{ marginLeft: 200 }}>
        <Header style={{ 
          padding: 0, 
          background: '#fff',
          position: 'sticky',
          top: 0,
          zIndex: 998,
          boxShadow: '0 1px 4px rgba(0,21,41,.08)'
        }}>
          <div style={{ float: 'right', marginRight: '20px' }}>
            Welcome, {user?.name}
          </div>
        </Header>
        <Content style={{ 
          margin: '24px 16px',
          padding: 24,
          minHeight: 280,
          overflow: 'initial'
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default PatientLayout;