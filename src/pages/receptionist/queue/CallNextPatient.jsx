import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  message,
  Alert,
  Typography,
  Badge,
  Descriptions
} from 'antd';
import {
  UserSwitchOutlined,
  BellOutlined,
  AudioOutlined,
  PhoneOutlined,
  MessageOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import queueAPI from '../../../services/queueAPI';
import './CallNextPatient.css';

const { Option } = Select;
const { Title, Text } = Typography;

const CallNextPatient = () => {
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [nextPatient, setNextPatient] = useState(null);
  const [queueData, setQueueData] = useState([]);
  const [callModalVisible, setCallModalVisible] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      fetchQueueData();
      const interval = setInterval(fetchQueueData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [selectedDoctor]);

  const fetchDoctors = async () => {
    try {
      const response = await queueAPI.getDoctors();
      setDoctors(response.data);
    } catch (error) {
      message.error('Error fetching doctors: ' + error.message);
    }
  };

  const fetchQueueData = async () => {
    try {
      setLoading(true);
      const response = await queueAPI.getDoctorQueue(selectedDoctor);
      setQueueData(response.data);
      updateCurrentAndNextPatient(response.data);
    } catch (error) {
      message.error('Error fetching queue data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateCurrentAndNextPatient = (data) => {
    const current = data.find(p => p.status === 'in-consultation');
    const waiting = data.filter(p => p.status === 'waiting').sort((a, b) => a.tokenNumber - b.tokenNumber);
    setCurrentPatient(current);
    setNextPatient(waiting[0]);
  };

  const handleCallNext = () => {
    if (!nextPatient) {
      message.warning('No patients in waiting queue');
      return;
    }
    setCallModalVisible(true);
    setNotificationSent(false);
  };

  const handleConfirmCall = async () => {
    try {
      setLoading(true);
      await queueAPI.callNextPatient(nextPatient._id);
      message.success('Patient called successfully');
      setNotificationSent(true);
      fetchQueueData();
    } catch (error) {
      message.error('Error calling next patient: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (patientId) => {
    try {
      await queueAPI.sendReminder(patientId);
      message.success('Reminder sent successfully');
    } catch (error) {
      message.error('Error sending reminder: ' + error.message);
    }
  };

  const columns = [
    {
      title: 'Token',
      dataIndex: 'tokenNumber',
      key: 'token',
      render: (token) => <Badge count={token} style={{ backgroundColor: '#108ee9' }} />
    },
    {
      title: 'Patient',
      dataIndex: 'patientId',
      key: 'patient',
      render: (patient) => (
        <Space direction="vertical" size="small">
          <Text strong>{patient.firstName} {patient.lastName}</Text>
          <Text type="secondary">{patient.contactNumber}</Text>
        </Space>
      )
    },
    {
      title: 'Wait Time',
      key: 'waitTime',
      render: (_, record) => (
        <Space>
          <ClockCircleOutlined />
          {moment(record.checkInTime).fromNow(true)}
        </Space>
      )
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const colors = {
          High: 'red',
          Medium: 'orange',
          Low: 'green'
        };
        return <Tag color={colors[priority]}>{priority}</Tag>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          waiting: 'orange',
          'in-consultation': 'blue',
          completed: 'green',
          cancelled: 'red'
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<MessageOutlined />}
            onClick={() => handleSendReminder(record.patientId._id)}
            disabled={record.status !== 'waiting'}
          >
            Remind
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="call-next-patient">
      <Card title="Call Next Patient">
        <Row gutter={[16, 16]} className="doctor-select">
          <Col xs={24} md={8}>
            <Select
              placeholder="Select Doctor"
              style={{ width: '100%' }}
              onChange={setSelectedDoctor}
              loading={loading}
            >
              {doctors.map(doctor => (
                <Option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.name} - {doctor.specialization}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={16}>
            <Button
              type="primary"
              icon={<BellOutlined />}
              onClick={handleCallNext}
              disabled={!nextPatient}
              loading={loading}
            >
              Call Next Patient
            </Button>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="status-cards">
          <Col xs={24} md={12}>
            <Card title="Current Patient" className="current-patient-card">
              {currentPatient ? (
                <Descriptions column={1}>
                  <Descriptions.Item label="Name">
                    {currentPatient.patientId.firstName} {currentPatient.patientId.lastName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Token">
                    <Badge count={currentPatient.tokenNumber} style={{ backgroundColor: '#108ee9' }} />
                  </Descriptions.Item>
                  <Descriptions.Item label="Started">
                    {moment(currentPatient.consultationStartTime).format('hh:mm A')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Duration">
                    {moment(currentPatient.consultationStartTime).fromNow(true)}
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <Alert message="No patient in consultation" type="info" showIcon />
              )}
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Next Patient" className="next-patient-card">
              {nextPatient ? (
                <Descriptions column={1}>
                  <Descriptions.Item label="Name">
                    {nextPatient.patientId.firstName} {nextPatient.patientId.lastName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Token">
                    <Badge count={nextPatient.tokenNumber} style={{ backgroundColor: '#108ee9' }} />
                  </Descriptions.Item>
                  <Descriptions.Item label="Waiting Since">
                    {moment(nextPatient.checkInTime).format('hh:mm A')}
                    <Text type="secondary"> ({moment(nextPatient.checkInTime).fromNow()})</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Priority">
                    <Tag color={nextPatient.priority === 'High' ? 'red' : 'orange'}>
                      {nextPatient.priority}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <Alert message="No patients waiting" type="info" showIcon />
              )}
            </Card>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={queueData}
          rowKey="_id"
          loading={loading}
          pagination={false}
          className="queue-table"
        />

        <Modal
          title="Call Next Patient"
          visible={callModalVisible}
          onOk={handleConfirmCall}
          onCancel={() => setCallModalVisible(false)}
          confirmLoading={loading}
        >
          {nextPatient && (
            <>
              <Descriptions title="Patient Details" column={1}>
                <Descriptions.Item label="Name">
                  {nextPatient.patientId.firstName} {nextPatient.patientId.lastName}
                </Descriptions.Item>
                <Descriptions.Item label="Token Number">
                  {nextPatient.tokenNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Contact">
                  {nextPatient.patientId.contactNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Waiting Since">
                  {moment(nextPatient.checkInTime).fromNow()}
                </Descriptions.Item>
              </Descriptions>

              {notificationSent && (
                <Alert
                  message="Notification Sent"
                  description="Patient has been notified via SMS and display board."
                  type="success"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}
            </>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default CallNextPatient;