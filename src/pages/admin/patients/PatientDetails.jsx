import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Descriptions,
  Button,
  Tabs,
  Table,
  Tag,
  Space
} from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  EditOutlined
} from '@ant-design/icons';
import AdminLayout from '../../../components/admin/Layout';
import './PatientDetails.css';

const { TabPane } = Tabs;

const PatientDetails = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    // Fetch patient details
    const fetchPatient = async () => {
      try {
        // API call will go here
        const mockPatient = {
          id: patientId,
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          dateOfBirth: '1990-01-01',
          gender: 'Male',
          bloodGroup: 'A+',
          address: '123 Street',
          medicalHistory: 'None'
        };
        setPatient(mockPatient);
      } catch (error) {
        console.error('Error fetching patient:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  const appointmentsColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Doctor',
      dataIndex: 'doctor',
      key: 'doctor',
    },
    {
      title: 'Purpose',
      dataIndex: 'purpose',
      key: 'purpose',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'completed' ? 'green' :
          status === 'scheduled' ? 'blue' :
          status === 'cancelled' ? 'red' :
          'orange'
        }>
          {status.toUpperCase()}
        </Tag>
      ),
    }
  ];

  const prescriptionsColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Doctor',
      dataIndex: 'doctor',
      key: 'doctor',
    },
    {
      title: 'Diagnosis',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="link">View Details</Button>
      ),
    }
  ];

  return (
    <AdminLayout>
      <div className="patient-details-container">
        <Card loading={loading}>
          <Row gutter={[24, 24]}>
            <Col span={24} md={8}>
              <Card className="patient-info-card">
                <div className="patient-header">
                  <div className="patient-avatar">
                    <UserOutlined />
                  </div>
                  <div className="patient-basic-info">
                    <h2>{patient?.name}</h2>
                    <p>Patient ID: {patient?.id}</p>
                  </div>
                  <Button 
                    type="primary" 
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/admin/patients/edit/${patientId}`)}
                  >
                    Edit
                  </Button>
                </div>

                <Descriptions column={1}>
                  <Descriptions.Item label={<><PhoneOutlined /> Phone</>}>
                    {patient?.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><MailOutlined /> Email</>}>
                    {patient?.email}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><CalendarOutlined /> Date of Birth</>}>
                    {patient?.dateOfBirth}
                  </Descriptions.Item>
                  <Descriptions.Item label="Gender">
                    {patient?.gender}
                  </Descriptions.Item>
                  <Descriptions.Item label="Blood Group">
                    {patient?.bloodGroup}
                  </Descriptions.Item>
                  <Descriptions.Item label="Address">
                    {patient?.address}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col span={24} md={16}>
              <Tabs defaultActiveKey="1">
                <TabPane tab="Appointments" key="1">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button 
                      type="primary"
                      onClick={() => navigate(`/admin/patients/${patientId}/appointments`)}
                    >
                      Schedule Appointment
                    </Button>
                    <Table 
                      columns={appointmentsColumns}
                      dataSource={[]}
                      pagination={{ pageSize: 5 }}
                    />
                  </Space>
                </TabPane>

                <TabPane tab="Prescriptions" key="2">
                  <Table 
                    columns={prescriptionsColumns}
                    dataSource={[]}
                    pagination={{ pageSize: 5 }}
                  />
                </TabPane>

                <TabPane tab="Medical History" key="3">
                  <Card>
                    <p>{patient?.medicalHistory || 'No medical history available.'}</p>
                  </Card>
                </TabPane>

                <TabPane tab="Billing" key="4">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button 
                      type="primary"
                      onClick={() => navigate(`/admin/patients/${patientId}/billing`)}
                    >
                      View All Bills
                    </Button>
                    {/* Billing summary or recent bills can be shown here */}
                  </Space>
                </TabPane>
              </Tabs>
            </Col>
          </Row>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default PatientDetails;