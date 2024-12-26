import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  CalendarOutlined,
  DollarOutlined 
} from '@ant-design/icons';
import AdminLayout from '../../components/admin/Layout';

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div style={{ padding: '20px' }}>
        <h2>Dashboard Overview</h2>
        
        <Row gutter={[16, 16]}>
          {/* Total Doctors */}
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Doctors"
                value={25}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>

          {/* Total Patients */}
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Patients"
                value={150}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>

          {/* Today's Appointments */}
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Today's Appointments"
                value={12}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>

          {/* Total Revenue */}
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Revenue"
                value={15000}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Recent Activities Section */}
        <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
          <Col span={16}>
            <Card title="Recent Appointments">
              <p>Recent appointment list will go here</p>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Notifications">
              <p>Recent notifications will go here</p>
            </Card>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;