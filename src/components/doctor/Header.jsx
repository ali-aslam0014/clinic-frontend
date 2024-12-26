import React from 'react';
import { Layout, Avatar, Dropdown, Space, Badge } from 'antd';
import {
  UserOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  ClockCircleOutlined,
  NotificationOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const DoctorHeader = () => {
  const navigate = useNavigate();
  const doctor = JSON.parse(localStorage.getItem('doctor'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('doctor');
    navigate('/login');
  };

  const items = [
    {
      key: 'profile',
      label: 'My Profile',
      icon: <UserOutlined />,
      onClick: () => navigate('/doctor/profile')
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <SettingOutlined />,
      children: [
        {
          key: 'schedule-settings',
          label: 'Schedule Settings',
          icon: <ClockCircleOutlined />,
          onClick: () => navigate('/doctor/settings/schedule')
        },
        {
          key: 'notification-settings',
          label: 'Notification Settings',
          icon: <NotificationOutlined />,
          onClick: () => navigate('/doctor/settings/notifications')
        }
      ]
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
      danger: true
    }
  ];

  return (
    <div className="doctor-header">
      <Space size="large">
        <Badge count={5}>
          <BellOutlined className="notification-icon" />
        </Badge>
        <Dropdown menu={{ items }} trigger={['click']}>
          <Space className="avatar-dropdown">
            <Avatar src={doctor?.avatar} icon={<UserOutlined />} />
            <span className="doctor-name">{doctor?.name}</span>
          </Space>
        </Dropdown>
      </Space>
    </div>
  );
};

export default DoctorHeader;