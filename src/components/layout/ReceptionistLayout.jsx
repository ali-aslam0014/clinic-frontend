import React, { useState } from 'react';
import { Layout, theme, Dropdown, Avatar, Space, Menu } from 'antd';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useNavigate, Outlet } from 'react-router-dom';
import SidebarMenu from '../receptionist/SidebarMenu';
import './ReceptionistLayout.css';

const { Header, Content } = Layout;

const ReceptionistLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const profileMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => navigate('/receptionist/my-profile')}>
        My Profile
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />} onClick={() => navigate('/receptionist/settings')}>
        Settings
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout className="layout-container">
      <SidebarMenu collapsed={collapsed} />
      
      <Layout 
        className="site-layout" 
        style={{ 
          marginLeft: collapsed ? '80px' : '260px',
          transition: 'margin-left 0.2s'
        }}
      >
        <Header 
          className="site-header"
          style={{ 
            padding: 0, 
            background: colorBgContainer,
            width: '100%'
          }}
        >
          <div className="header-container">
            <div className="header-left">
              {React.createElement(
                collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                  className: 'trigger',
                  onClick: () => setCollapsed(!collapsed),
                }
              )}
              <h2>Receptionist Dashboard</h2>
            </div>
            
            <div className="header-right">
              <Dropdown 
                overlay={profileMenu} 
                trigger={['click']}
                placement="bottomRight"
              >
                <Space className="user-profile-trigger">
                  <Avatar icon={<UserOutlined />} />
                  <span className="username">John Doe</span>
                </Space>
              </Dropdown>
            </div>
          </div>
        </Header>
        
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default ReceptionistLayout;