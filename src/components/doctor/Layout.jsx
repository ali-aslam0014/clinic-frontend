import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined,
  DashboardOutlined,
  TeamOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
  UserOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  SolutionOutlined,
  ExperimentOutlined,
  ProfileOutlined,
  ScheduleOutlined,
  BellOutlined,
  DatabaseOutlined,
  ShopOutlined,
  SignatureOutlined,
  PictureOutlined,
  HistoryOutlined,
  NotificationOutlined,
  ToolOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import DoctorHeader from './Header';
import './Layout.css';

const { Header, Sider, Content } = Layout;
const { SubMenu } = Menu;

const DoctorLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="doctor-layout">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={260}
        className="doctor-sider"
      >
        <div className="logo">
          <h2>{collapsed ? 'CMS' : 'Clinic Management'}</h2>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          defaultOpenKeys={['patients']}
        >
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
            <Link to="/doctor/dashboard">Dashboard</Link>
          </Menu.Item>

          {/* Patient Management */}
          <SubMenu key="patients" icon={<TeamOutlined />} title="Patient Management">
            <Menu.Item key="patientList">
              <Link to="/doctor/patients">Patient List</Link>
            </Menu.Item>
            {/* <Menu.Item key="patientDetails">
              <Link to="/doctor/patients/details">Patient Details/History</Link>
            </Menu.Item> */}
            <Menu.Item key="medicalRecords">
              <Link to="/doctor/patients/records">Medical Records</Link>
            </Menu.Item>
            <Menu.Item key="treatmentPlans">
              <Link to="/doctor/patients/treatments">Treatment Plans</Link>
            </Menu.Item>
            <Menu.Item key="patientPrescriptions">
              <Link to="/doctor/prescriptions">Prescriptions</Link>
            </Menu.Item>
          </SubMenu>

          {/* Appointment Management */}
          <SubMenu key="appointments" icon={<CalendarOutlined />} title="Appointment Management">
            <Menu.Item key="calendarView">
              <Link to="/doctor/appointments/calendar">Calendar View</Link>
            </Menu.Item>
            <Menu.Item key="appointmentList">
              <Link to="/doctor/appointments/list">Appointment List</Link>
            </Menu.Item>
            <Menu.Item key="scheduleManagement">
              <Link to="/doctor/appointments/schedule">Schedule Management</Link>
            </Menu.Item>
            <Menu.Item key="patientQueue">
              <Link to="/doctor/appointments/queue">Patient Queue</Link>
            </Menu.Item>
            <Menu.Item key="followUps">
              <Link to="/doctor/appointments/followups">Follow-ups</Link>
            </Menu.Item>
          </SubMenu>

          {/* Prescription Management */}
          <SubMenu key="prescriptions" icon={<MedicineBoxOutlined />} title="Prescription Management">
            <Menu.Item key="createPrescription">
              <Link to="/doctor/prescriptions/create">Create Prescription</Link>
            </Menu.Item>
            <Menu.Item key="prescriptionHistory">
              <Link to="/doctor/prescriptions/history">Prescription History</Link>
            </Menu.Item>
            <Menu.Item key="medicineDatabase">
              <Link to="/doctor/prescriptions/medicines">Medicine Database</Link>
            </Menu.Item>
            {/* <Menu.Item key="pharmacyIntegration">
              <Link to="/doctor/prescriptions/pharmacy">Pharmacy Integration</Link>
            </Menu.Item> */}
            <Menu.Item key="digitalSignatures">
              <Link to="/common/digital-signature">Digital Signatures</Link>
            </Menu.Item>
          </SubMenu>

          {/* Medical Records */}
          <SubMenu key="records" icon={<FileTextOutlined />} title="Medical Records">
            <Menu.Item key="patientHistory">
              <Link to="/doctor/patients/history">Patient History</Link>
            </Menu.Item>
            <Menu.Item key="diagnosisRecords">
              <Link to="/doctor/records/diagnosis">Diagnosis Records</Link>
            </Menu.Item>
            <Menu.Item key="labReports">
              <Link to="/doctor/records/lab">Lab Reports</Link>
            </Menu.Item>
            {/* <Menu.Item key="imagingResults">
              <Link to="/doctor/records/imaging">Imaging Results</Link>
            </Menu.Item> */}
            <Menu.Item key="treatmentHistory">
              <Link to="/doctor/records/treatments">Treatment History</Link>
            </Menu.Item>
          </SubMenu>

          {/* Profile & Settings */}
          <SubMenu key="settings" icon={<SettingOutlined />} title="Profile & Settings">
            <Menu.Item key="doctorProfile" icon={<UserOutlined />}>
              <Link to="/doctor/profile">Doctor Profile</Link>
            </Menu.Item>
            <Menu.Item key="scheduleSettings" icon={<ScheduleOutlined />}>
              <Link to="/doctor/settings/schedule">Schedule Settings</Link>
            </Menu.Item>
            <Menu.Item key="notificationSettings" icon={<BellOutlined />}>
              <Link to="/doctor/settings/notifications">Notification Settings</Link>
            </Menu.Item>
            {/* <Menu.Item key="preferences" icon={<ToolOutlined />}>
              <Link to="/doctor/settings/preferences">Preferences</Link>
            </Menu.Item> */}
          </SubMenu>
        </Menu>
      </Sider>
      <Layout className={`site-layout ${collapsed ? 'collapsed' : ''}`}>
        <Header className="site-header">
          <div className="header-left">
            {React.createElement(
              collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
              {
                className: 'trigger',
                onClick: () => setCollapsed(!collapsed),
              }
            )}
          </div>
          <DoctorHeader />
        </Header>
        <Content className="site-content">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default DoctorLayout;