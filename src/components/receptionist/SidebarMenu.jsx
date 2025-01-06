import React, { useState } from 'react';
import { Menu, Layout } from 'antd';
import {
  DashboardOutlined,
  UserAddOutlined,
  CalendarOutlined,
  TeamOutlined,
  SolutionOutlined,
  DollarOutlined,
  AlertOutlined,
  FileTextOutlined,
  MessageOutlined,
  SettingOutlined,
  PrinterOutlined,
  HistoryOutlined,
  BellOutlined,
  BarChartOutlined,
  UploadOutlined,
  BuildOutlined,
  UserSwitchOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  FileDoneOutlined,
  HomeOutlined,
  NotificationOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './SidebarMenu.css';

const { Sider } = Layout;

const SidebarMenu = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState([]);

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      path: '/receptionist/dashboard'
    },
    {
      key: 'quick-actions',
      icon: <AlertOutlined />,
      label: 'Quick Actions',
      children: [
        {
          key: 'register-patient',
          icon: <UserAddOutlined />,
          label: 'Patient Registration',
          path: '/receptionist/register-patient'
        },
        {
          key: 'book-appointment',
          icon: <CalendarOutlined />,
          label: 'Book Appointment',
          path: '/receptionist/book-appointment'
        },
        {
          key: 'check-in',
          icon: <UserSwitchOutlined />,
          label: 'Check-in Patient',
          path: '/receptionist/check-in'
        },
        {
          key: 'queue',
          icon: <SolutionOutlined />,
          label: 'Queue Management',
          path: '/receptionist/queue'
        },
        {
          key: 'emergency',
          icon: <AlertOutlined />,
          label: 'Emergency Registration',
          path: '/receptionist/emergency'
        }
      ]
    },
    {
      key: 'patients',
      icon: <TeamOutlined />,
      label: 'Patient Management',
      children: [
        {
          key: 'search-patients',
          label: 'Search Patients',
          path: '/receptionist/search-patients'
        },
        {
          key: 'patient-details',
          label: 'Patient Details',
          path: '/receptionist/patient-details'
        },
        {
          key: 'update-patient',
          label: 'Update Patient',
          path: '/receptionist/update-patient'
        },
        {
          key: 'patient-history',
          icon: <HistoryOutlined />,
          label: 'Patient History',
          path: '/receptionist/patient-history'
        },
        {
          key: 'print-cards',
          icon: <PrinterOutlined />,
          label: 'Print Patient Cards',
          path: '/receptionist/print-cards'
        }
      ]
    },
    {
      key: 'appointments',
      icon: <CalendarOutlined />,
      label: 'Appointments',
      children: [
        {
          key: 'today-appointments',
          label: "Today's Appointments",
          path: '/receptionist/today-appointments'
        },
        {
          key: 'schedule-appointment',
          label: 'Schedule New',
          path: '/receptionist/schedule-appointment'
        },
        {
          key: 'manage-appointments',
          label: 'Reschedule/Cancel',
          path: '/receptionist/reschedule-cancel'
        },
        {
          key: 'appointment-reminders',
          label: 'Send Reminders',
          path: '/receptionist/send-reminders'
        },
        {
          key: 'doctor-schedules',
          label: 'Doctor Schedules',
          path: '/receptionist/doctor-schedules'
        }
      ]
    },
    {
      key: 'queue-management',
      icon: <ClockCircleOutlined />,
      label: 'Queue Management',
      children: [
        {
          key: 'current-queue',
          label: 'Current Status',
          path: '/receptionist/current-queue'
        },
        {
          key: 'add-to-queue',
          label: 'Add to Queue',
          path: '/receptionist/add-to-queue'
        },
        {
          key: 'update-queue',
          label: 'Update Position',
          path: '/receptionist/update-queue'
        },
        {
          key: 'wait-times',
          label: 'Wait Times',
          path: '/receptionist/wait-times'
        },
        {
          key: 'call-next',
          label: 'Call Next Patient',
          path: '/receptionist/call-next'
        }
      ]
    },
    {
      key: 'billing',
      icon: <DollarOutlined />,
      label: 'Billing & Payments',
      children: [
        {
          key: 'generate-bill',
          icon: <CreditCardOutlined />,
          label: 'Generate Bill',
          path: '/receptionist/generate-bill'
        },
        {
          key: 'process-payment',
          label: 'Process Payment',
          path: '/receptionist/process-payment'
        },
        {
          key: 'print-receipt',
          icon: <PrinterOutlined />,
          label: 'Print Receipt',
          path: '/receptionist/print-receipt'
        },
        {
          key: 'payment-history',
          label: 'Payment History',
          path: '/receptionist/payment-history'
        },
        {
          key: 'refunds',
          label: 'Handle Refunds',
          path: '/receptionist/refunds'
        }
      ]
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: 'Reports & Statistics',
      children: [
        {
          key: 'patient-count',
          label: 'Daily Patient Count',
          path: '/receptionist/patient-count'
        },
        {
          key: 'appointment-stats',
          label: 'Appointment Stats',
          path: '/receptionist/appointment-stats'
        },
        {
          key: 'revenue-reports',
          label: 'Revenue Reports',
          path: '/receptionist/revenue-reports'
        },
        {
          key: 'queue-analytics',
          label: 'Queue Analytics',
          path: '/receptionist/queue-analytics'
        },
        {
          key: 'doctor-reports',
          label: 'Doctor-wise Reports',
          path: '/receptionist/doctor-reports'
        }
      ]
    },
    {
      key: 'communication',
      icon: <MessageOutlined />,
      label: 'Communication',
      children: [
        {
          key: 'send-reminders',
          icon: <BellOutlined />,
          label: 'SMS/Email Reminders',
          path: '/receptionist/sms-email-reminders'
        },
        // {
        //   key: 'patient-notifications',
        //   icon: <NotificationOutlined />,
        //   label: 'Patient Notifications',
        //   path: '/receptionist/patient-notifications'
        // },
        // {
        //   key: 'staff-messages',
        //   label: 'Message Staff',
        //   path: '/receptionist/staff-messages'
        // },
        // {
        //   key: 'emergency-alerts',
        //   icon: <AlertOutlined />,
        //   label: 'Emergency Alerts',
        //   path: '/receptionist/emergency-alerts'
        // }
      ]
    },
    {
      key: 'documents',
      icon: <FileTextOutlined />,
      label: 'Document Management',
      children: [
        {
          key: 'scan-upload',
          icon: <UploadOutlined />,
          label: 'Scan & Upload',
          path: '/receptionist/scan-upload'
        },
        // {
        //   key: 'print-forms',
        //   icon: <PrinterOutlined />,
        //   label: 'Print Forms',
        //   path: '/receptionist/print-forms'
        // },
        {
          key: 'generate-reports',
          icon: <FileDoneOutlined />,
          label: 'Generate Reports',
          path: '/receptionist/generate-reports'
        },
        {
          key: 'file-management',
          label: 'File Management',
          path: '/receptionist/file-management'
        }
      ]
    },
    // {
    //   key: 'administrative',
    //   icon: <BuildOutlined />,
    //   label: 'Administrative',
    //   children: [
    //     {
    //       key: 'room-assignment',
    //       icon: <HomeOutlined />,
    //       label: 'Room Assignment',
    //       path: '/receptionist/room-assignment'
    //     },
    //     {
    //       key: 'notice-board',
    //       label: 'Notice Board',
    //       path: '/receptionist/notice-board'
    //     },
    //     {
    //       key: 'visitor-passes',
    //       label: 'Visitor Passes',
    //       path: '/receptionist/visitor-passes'
    //     },
    //     {
    //       key: 'staff-attendance',
    //       label: 'Staff Attendance',
    //       path: '/receptionist/staff-attendance'
    //     }
    //   ]
    // }
  ];

  const handleMenuClick = (item) => {
    const menuItem = findMenuItem(menuItems, item.key);
    if (menuItem && menuItem.path) {
      navigate(menuItem.path);
    }
  };

  const handleOpenChange = (keys) => {
    const latestOpenKey = keys.find(key => openKeys.indexOf(key) === -1);
    setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
  };

  const findMenuItem = (items, key) => {
    for (const item of items) {
      if (item.key === key) return item;
      if (item.children) {
        const found = findMenuItem(item.children, key);
        if (found) return found;
      }
    }
  };

  return (
    <Sider 
      width={260} 
      collapsed={collapsed}
      className="sidebar"
      trigger={null}
    >
      <div className="logo-container">
        <img 
          src="/path/to/your/logo.png" 
          alt="HMS Logo" 
          className="sidebar-logo"
          onClick={() => navigate('/receptionist/dashboard')}
        />
        {!collapsed && <span className="logo-text">HMS Clinic</span>}
      </div>
      <div className="sidebar-menu-container">
        <Menu
          theme="dark"
          mode="inline"
          openKeys={collapsed ? [] : openKeys}
          selectedKeys={[location.pathname.split('/')[2] || 'dashboard']}
          items={menuItems}
          onClick={handleMenuClick}
          onOpenChange={handleOpenChange}
          className="sidebar-menu"
        />
      </div>
    </Sider>
  );
};

export default SidebarMenu;