import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Tabs,
  Table,
  Tag,
  Button,
  Space,
  Row,
  Col,
  Badge,
  message,
  Timeline
} from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  PrinterOutlined
} from '@ant-design/icons';
import moment from 'moment';
import patientAPI from '../../services/patientAPI';
import './PatientDetail.css';

const { TabPane } = Tabs;

const PatientDetail = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('1');

  useEffect(() => {
    fetchPatientDetails();
  }, [id]);

  const fetchPatientDetails = async () => {
    try {
      setLoading(true);
      const response = await patientAPI.getPatientDetails(id);
      setPatient(response.data);
    } catch (error) {
      message.error('Error fetching patient details: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintCard = async () => {
    try {
      await patientAPI.generatePatientCard(id);
      message.success('Patient card generated successfully');
    } catch (error) {
      message.error('Error generating card: ' + error.message);
    }
  };

  const appointmentColumns = [
    {
      title: 'Date',
      dataIndex: 'appointmentDate',
      key: 'date',
      render: date => moment(date).format('DD-MM-YYYY')
    },
    {
      title: 'Time',
      dataIndex: 'timeSlot',
      key: 'time',
      render: slot => `${slot.start} - ${slot.end}`
    },
    {
      title: 'Doctor',
      dataIndex: 'doctorId',
      key: 'doctor',
      render: doctor => doctor.name
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: type => (
        <Tag color={type === 'emergency' ? 'red' : 'blue'}>
          {type.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        let color = 'default';
        switch (status) {
          case 'confirmed': color = 'green'; break;
          case 'cancelled': color = 'red'; break;
          case 'completed': color = 'blue'; break;
          default: color = 'orange';
        }
        return <Badge status={color} text={status.toUpperCase()} />;
      }
    }
  ];

  if (loading) {
    return <Card loading={true} />;
  }

  if (!patient) {
    return <Card>Patient not found</Card>;
  }

  return (
    <div className="patient-detail">
      <Card
        title={
          <Space>
            <UserOutlined />
            {`${patient.firstName} ${patient.lastName}`}
            <Tag color="blue">{patient.mrNumber}</Tag>
          </Space>
        }
        extra={
          <Button
            icon={<PrinterOutlined />}
            onClick={handlePrintCard}
          >
            Print Card
          </Button>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* Basic Information */}
          <TabPane tab="Basic Info" key="1">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="MR Number">
                {patient.mrNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Registration Date">
                {moment(patient.createdAt).format('DD-MM-YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Full Name">
                {`${patient.firstName} ${patient.lastName}`}
              </Descriptions.Item>
              <Descriptions.Item label="Gender">
                {patient.gender}
              </Descriptions.Item>
              <Descriptions.Item label="Date of Birth">
                {moment(patient.dateOfBirth).format('DD-MM-YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Age">
                {moment().diff(moment(patient.dateOfBirth), 'years')}
              </Descriptions.Item>
              <Descriptions.Item label="Blood Group">
                <Tag color="red">{patient.bloodGroup}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="CNIC">
                {patient.cnic}
              </Descriptions.Item>
              <Descriptions.Item label="Contact" span={2}>
                <Space>
                  <PhoneOutlined />
                  {patient.contactNumber}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Email" span={2}>
                <Space>
                  <MailOutlined />
                  {patient.email}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>
                <Space>
                  <HomeOutlined />
                  {`${patient.address.street}, ${patient.address.city}, ${patient.address.state}`}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Emergency Contact" span={2}>
                <Space direction="vertical">
                  <span>{patient.emergencyContact.name} ({patient.emergencyContact.relationship})</span>
                  <span>{patient.emergencyContact.phone}</span>
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </TabPane>

          {/* Appointments */}
          <TabPane tab="Appointments" key="2">
            <Table
              columns={appointmentColumns}
              dataSource={patient.appointments}
              rowKey="_id"
              pagination={false}
            />
          </TabPane>

          {/* Medical History */}
          <TabPane tab="Medical History" key="3">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="Allergies" size="small">
                  {patient.allergies?.map((allergy, index) => (
                    <Tag key={index} color="red">{allergy}</Tag>
                  ))}
                </Card>
              </Col>
              <Col span={24}>
                <Card title="Current Medications" size="small">
                  {patient.currentMedications?.map((med, index) => (
                    <Tag key={index} color="blue">{med}</Tag>
                  ))}
                </Card>
              </Col>
              <Col span={24}>
                <Card title="Medical History" size="small">
                  <Timeline>
                    {patient.medicalHistory?.map((history, index) => (
                      <Timeline.Item key={index}>
                        <p>{history.condition}</p>
                        <small>{moment(history.date).format('DD-MM-YYYY')}</small>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Documents */}
          <TabPane tab="Documents" key="4">
            <Table
              columns={[
                {
                  title: 'Date',
                  dataIndex: 'createdAt',
                  key: 'date',
                  render: date => moment(date).format('DD-MM-YYYY')
                },
                {
                  title: 'Type',
                  dataIndex: 'type',
                  key: 'type'
                },
                {
                  title: 'Description',
                  dataIndex: 'description',
                  key: 'description'
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: (_, record) => (
                    <Button
                      icon={<FileTextOutlined />}
                      onClick={() => window.open(record.fileUrl)}
                    >
                      View
                    </Button>
                  )
                }
              ]}
              dataSource={patient.documents}
              rowKey="_id"
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default PatientDetail;