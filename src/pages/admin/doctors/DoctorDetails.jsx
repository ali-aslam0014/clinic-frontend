import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Descriptions,
  Tag,
  Table,
  Button,
  Space,
  Tabs
} from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import AdminLayout from '../../../components/admin/Layout';
import './DoctorDetails.css';

const { TabPane } = Tabs;

const DoctorDetails = () => {
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch doctor details
    setLoading(false);
  }, [doctorId]);

  const appointmentsColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Patient',
      dataIndex: 'patient',
      key: 'patient',
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'completed' ? 'green' :
          status === 'pending' ? 'orange' :
          'red'
        }>
          {status.toUpperCase()}
        </Tag>
      ),
    }
  ];

  return (
    <AdminLayout>
      <div className="doctor-details-container">
        <Card loading={loading}>
          <Row gutter={[24, 24]}>
            <Col span={24} md={8}>
              <Card className="doctor-info-card">
                <div className="doctor-header">
                  <div className="doctor-avatar">
                    <UserOutlined />
                  </div>
                  <div className="doctor-basic-info">
                    <h2>{doctor?.name}</h2>
                    <p>{doctor?.specialization}</p>
                  </div>
                </div>
                <Descriptions column={1}>
                  <Descriptions.Item label={<><PhoneOutlined /> Phone</>}>
                    {doctor?.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><MailOutlined /> Email</>}>
                    {doctor?.email}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><CalendarOutlined /> Joined</>}>
                    {doctor?.joiningDate}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col span={24} md={16}>
              <Tabs defaultActiveKey="1">
                <TabPane tab="Appointments" key="1">
                  <Table
                    columns={appointmentsColumns}
                    dataSource={[]}
                    pagination={{ pageSize: 5 }}
                  />
                </TabPane>
                <TabPane tab="Schedule" key="2">
                  <Card>
                    {/* Schedule content */}
                  </Card>
                </TabPane>
                <TabPane tab="Qualifications" key="3">
                  <Card>
                    <ul className="qualifications-list">
                      {doctor?.qualifications?.map((qual, index) => (
                        <li key={index}>{qual}</li>
                      ))}
                    </ul>
                  </Card>
                </TabPane>
              </Tabs>
            </Col>
          </Row>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default DoctorDetails;