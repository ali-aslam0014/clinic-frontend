import React, { useState } from 'react';
import { Layout, Menu, Input, Avatar, Dropdown, Badge } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  DollarOutlined,
  MessageOutlined,
  SettingOutlined,
  BellOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import './Layout.css';

const { Header, Sider, Content } = Layout;
const { Search } = Input;
const { SubMenu } = Menu;

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Menu items configuration
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      path: '/admin/dashboard'
    },
    {
      key: 'doctors',
      icon: <UserOutlined />,
      label: 'Doctors',
      children: [
        {
          key: 'doctors-list',
          label: 'Doctors List',
          path: '/admin/doctors/list'
        },
        {
          key: 'add-doctor',
          label: 'Add New Doctor',
          path: '/admin/doctors/add'
        },
        {
          key: 'specializations',
          label: 'Specializations',
          path: '/admin/doctors/specializations'
        },
        {
          key: 'schedules',
          label: 'Doctor Schedules',
          path: '/admin/doctors/schedules'
        }
      ]
    },
    {
      key: 'patients',
      icon: <TeamOutlined />,
      label: 'Patients',
      children: [
        {
          key: 'patients-list',
          label: 'Patients List',
          path: '/admin/patients/list'
        },
        {
          key: 'add-patient',
          label: 'Add New Patient',
          path: '/admin/patients/add'
        },
        {
          key: 'patient-records',
          label: 'Medical Records',
          path: '/admin/patients/records'
        },
        {
          key: 'patient-history',
          label: 'Visit History',
          path: '/admin/patients/history'
        },
        {
          key: 'prescriptions',
          label: 'Prescriptions',
          path: '/admin/patients/prescriptions'
        },
        {
          key: 'lab-reports',
          label: 'Lab Reports',
          path: '/admin/patients/lab-reports'
        },
        {
          key: 'patient-billing',
          label: 'Patient Billing',
          path: '/admin/patients/billing'
        },
        // {
        //   key: 'patient-insurance',
        //   label: 'Insurance Details',
        //   path: '/admin/patients/insurance'
        // },
        {
          key: 'patient-documents',
          label: 'Documents',
          path: '/admin/patients/documents'
        },
        {
          key: 'patient-appointments',
          label: 'Patient Appointments',
          path: '/admin/patients/appointments'
        }
      ]
    },
    {
      key: 'appointments',
      icon: <CalendarOutlined />,
      label: 'Appointments',
      children: [
        {
          key: 'all-appointments',
          label: 'All Appointments',
          path: '/admin/appointments/all'
        },
        {
          key: 'pending-appointments',
          label: 'Pending Appointments',
          path: '/admin/appointments/pending'
        },
        {
          key: 'confirmed-appointments',
          label: 'Confirmed Appointments',
          path: '/admin/appointments/confirmed'
        },
        {
          key: 'cancelled-appointments',
          label: 'Cancelled Appointments',
          path: '/admin/appointments/cancelled'
        },
        {
          key: 'appointment-calendar',
          label: 'Appointment Calendar',
          path: '/admin/appointments/calendar'
        },
        {
          key: 'appointment-slots',
          label: 'Time Slots',
          path: '/admin/appointments/slots'
        }
      ]
    },
    {
      key: 'staff',
      icon: <TeamOutlined />,
      label: 'Staff Management',
      children: [
        {
          key: 'receptionist',
          label: 'Receptionist',
          path: '/admin/staff/receptionist'
        },
        {
          key: 'pharmacist',
          label: 'Pharmacist',
          path: '/admin/staff/pharmacist'
        }
      ]
    },
    {
      key: 'billing',
      icon: <DollarOutlined />,
      label: 'Billing/Invoice',
      children: [
        {
          key: 'create-invoice',
          label: 'Create/Edit Invoices',
          path: '/admin/billing/create'
        },
        {
          key: 'payment-history',
          label: 'Payment History',
          path: '/admin/billing/history'
        },
        {
          key: 'due-payments',
          label: 'Due Payments',
          path: '/admin/billing/due'
        },
        {
          key: 'reports',
          label: 'Generate Reports',
          path: '/admin/billing/reports'
        },
        {
          key: 'print-invoices',
          label: 'Print Invoices',
          path: '/admin/billing/print'
        }
      ]
    },
    {
      key: 'pharmacy',
      icon: <MedicineBoxOutlined />,
      label: 'Pharmacy',
      children: [
        {
          key: 'inventory',
          label: 'Medicine Inventory',
          path: '/admin/pharmacy/inventory'
        },
        {
          key: 'stock',
          label: 'Stock Management',
          path: '/admin/pharmacy/stock'
        },
        {
          key: 'sales',
          label: 'Medicine Sales',
          path: '/admin/pharmacy/sales'
        },
        {
          key: 'orders',
          label: 'Purchase Orders',
          path: '/admin/pharmacy/orders'
        },
        {
          key: 'expiry',
          label: 'Expiry Tracking',
          path: '/admin/pharmacy/expiry'
        },
        {
          key: 'alerts',
          label: 'Low Stock Alerts',
          path: '/admin/pharmacy/alerts'
        }
      ]
    },
    {
      key: 'communication',
      icon: <MessageOutlined />,
      label: 'Communication',
      children: [
        {
          key: 'sms',
          label: 'SMS Notifications',
          path: '/admin/communication/sms'
        },
        {
          key: 'email',
          label: 'Email Reminders',
          path: '/admin/communication/email'
        },
        {
          key: 'feedback',
          label: 'Patient Feedback',
          path: '/admin/communication/feedback'
        },
        {
          key: 'messaging',
          label: 'Internal Messaging',
          path: '/admin/communication/messaging'
        }
      ]
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      children: [
        {
          key: 'clinic',
          label: 'Clinic Details',
          path: '/admin/settings/clinic'
        },
        {
          key: 'users',
          label: 'User Management',
          path: '/admin/settings/users'
        },
        {
          key: 'roles',
          label: 'Roles & Permissions',
          path: '/admin/settings/roles'
        },
        {
          key: 'backup',
          label: 'Backup & Restore',
          path: '/admin/settings/backup'
        },
        {
          key: 'logs',
          label: 'System Logs',
          path: '/admin/settings/logs'
        }
      ]
    }
  ];

  // Profile menu items
  const profileMenu = (
    <Menu>
      <Menu.Item key="profile">
        <Link to="/admin/profile">My Profile</Link>
      </Menu.Item>
      <Menu.Item key="settings">
        <Link to="/admin/profile/ProfileSettings">Settings</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item 
        key="logout" 
        onClick={() => {
          localStorage.removeItem('token');
          navigate('/admin/login');
        }}
      >
        <span>Logout</span>
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout className="admin-layout">
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        className="admin-sidebar"
        width={260}
        collapsedWidth={80}
      >
        <div className="logo">
          {!collapsed && <span>CMS Admin</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          className="sidebar-menu"
        >
          {menuItems.map(item => {
            if (item.children) {
              return (
                <SubMenu key={item.key} icon={item.icon} title={item.label}>
                  {item.children.map(child => (
                    <Menu.Item key={child.path}>
                      <Link to={child.path}>{child.label}</Link>
                    </Menu.Item>
                  ))}
                </SubMenu>
              );
            }
            return (
              <Menu.Item key={item.path} icon={item.icon}>
                <Link to={item.path}>{item.label}</Link>
              </Menu.Item>
            );
          })}
        </Menu>
      </Sider>
      
      <Layout className="site-layout">
        <Header className="site-header">
          <div className="header-left">
            <Search
              placeholder="Search..."
              className="search-input"
              onSearch={value => console.log(value)}
            />
          </div>
          <div className="header-right">
            <Badge count={5} className="notification-badge">
              <BellOutlined className="header-icon" />
            </Badge>
            <Dropdown overlay={profileMenu} trigger={['click']}>
              <div className="profile-trigger">
                <Avatar icon={<UserOutlined />} />
                <span className="username">Admin</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content className="site-content">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;