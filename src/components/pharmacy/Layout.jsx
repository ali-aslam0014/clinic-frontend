import React, { useState } from 'react';
import {
  Layout,
  Menu,
  Button,
  theme,
  Avatar,
  Dropdown,
  Space
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  MedicineBoxOutlined,
  ShoppingCartOutlined,
  WarningOutlined,
  FileTextOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Layout.css';

const { Header, Sider, Content } = Layout;

const PharmacyLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/pharmacy/profile">Profile</Link>
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <Link to="/pharmacy/settings">Settings</Link>
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: <Link to="/login">Logout</Link>
    }
  ];

  const menuItems = [
    {
      key: '/pharmacy',
      icon: <DashboardOutlined />,
      label: <Link to="/pharmacy/dashboard">Dashboard</Link>
    },
    {
      key: '/pharmacy/medicines',
      icon: <MedicineBoxOutlined />,
      label: <Link to="/pharmacy/medicines">Medicines</Link>
    },
    {
      key: '/pharmacy/sales',
      icon: <ShoppingCartOutlined />,
      label: <Link to="/pharmacy/sales">Sales</Link>
    },
    {
      key: '/pharmacy/inventory',
      icon: <WarningOutlined />,
      label: <Link to="/pharmacy/inventory">Inventory</Link>
    },
    {
      key: '/pharmacy/reports',
      icon: <FileTextOutlined />,
      label: <Link to="/pharmacy/reports">Reports</Link>
    }
  ];

  return (
    <Layout>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0
        }}
      >
        <div className="pharmacy-logo">
          {collapsed ? 'PH' : 'PHARMACY'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200 }}>
        <Header 
          style={{ 
            padding: 0, 
            background: token.colorBgContainer,
            position: 'sticky',
            top: 0,
            zIndex: 1,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <div style={{ paddingRight: 24 }}>
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: ({ key }) => {
                  if (key === 'logout') {
                    handleLogout();
                  }
                }
              }}
            >
              <Space>
                <Avatar icon={<UserOutlined />} />
                <span>Pharmacist Name</span>
              </Space>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: token.colorBgContainer,
            borderRadius: token.borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default PharmacyLayout; 