import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tooltip,
  Badge,
  Row,
  Col,
  Drawer
} from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  RightCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import DoctorLayout from '../../../components/doctor/Layout';
import './PatientQueue.css';

const { Option } = Select;
const { TextArea } = Input;

const PatientQueue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [consultationDrawer, setConsultationDrawer] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchQueue();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/queue/doctor', {
        params: {
          doctorId: localStorage.getItem('doctorId'),
          date: moment().format('YYYY-MM-DD')
        }
      });
      setQueue(response.data.data);
    } catch (error) {
      message.error('Failed to fetch queue');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (queueId, newStatus) => {
    try {
      await axios.put(`/api/queue/${queueId}/status`, {
        status: newStatus
      });
      message.success('Queue status updated successfully');
      fetchQueue();
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  const handleStartConsultation = (patient) => {
    setSelectedPatient(patient);
    setConsultationDrawer(true);
    form.resetFields();
  };

  const handleConsultationSubmit = async (values) => {
    try {
      await axios.post(`/api/consultations`, {
        patientId: selectedPatient.patientId._id,
        doctorId: localStorage.getItem('doctorId'),
        appointmentId: selectedPatient.appointmentId,
        ...values
      });

      await handleStatusChange(selectedPatient._id, 'completed');
      message.success('Consultation completed successfully');
      setConsultationDrawer(false);
      setSelectedPatient(null);
      form.resetFields();
    } catch (error) {
      message.error('Failed to save consultation');
    }
  };

  const columns = [
    {
      title: 'Token',
      dataIndex: 'tokenNumber',
      key: 'tokenNumber',
      render: (token) => <Badge count={token} style={{ backgroundColor: '#52c41a' }} />
    },
    {
      title: 'Patient',
      dataIndex: ['patientId', 'name'],
      key: 'patientName',
      render: (name, record) => (
        <Space direction="vertical" size={0}>
          <span>{name}</span>
          <small style={{ color: '#8c8c8c' }}>{record.patientId.phone}</small>
        </Space>
      )
    },
    {
      title: 'Appointment Time',
      dataIndex: ['appointmentId', 'timeSlot'],
      key: 'time',
      render: (timeSlot) => (
        <Tag icon={<ClockCircleOutlined />}>
          {timeSlot.start} - {timeSlot.end}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          waiting: { color: 'warning', text: 'Waiting' },
          'in-consultation': { color: 'processing', text: 'In Consultation' },
          completed: { color: 'success', text: 'Completed' },
          cancelled: { color: 'error', text: 'Cancelled' },
          'no-show': { color: 'default', text: 'No Show' }
        };

        const config = statusConfig[status] || statusConfig.waiting;
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'waiting' && (
            <Tooltip title="Start Consultation">
              <Button
                type="primary"
                icon={<RightCircleOutlined />}
                onClick={() => handleStartConsultation(record)}
              />
            </Tooltip>
          )}
          {record.status === 'waiting' && (
            <Tooltip title="Mark as No Show">
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleStatusChange(record._id, 'no-show')}
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  return (
    <DoctorLayout>
      <div className="patient-queue-container">
        <Card 
          title={
            <Space>
              Today's Queue
              <Tag color="blue">
                {moment().format('DD MMM YYYY')}
              </Tag>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={queue}
            loading={loading}
            rowKey="_id"
            pagination={false}
          />
        </Card>

        <Drawer
          title="Consultation"
          placement="right"
          width={720}
          onClose={() => {
            setConsultationDrawer(false);
            setSelectedPatient(null);
            form.resetFields();
          }}
          visible={consultationDrawer}
          extra={
            <Space>
              <Button onClick={() => setConsultationDrawer(false)}>Cancel</Button>
              <Button type="primary" onClick={() => form.submit()}>
                Complete Consultation
              </Button>
            </Space>
          }
        >
          {selectedPatient && (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleConsultationSubmit}
            >
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="symptoms"
                    label="Symptoms"
                    rules={[{ required: true, message: 'Please enter symptoms' }]}
                  >
                    <TextArea rows={4} />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    name="diagnosis"
                    label="Diagnosis"
                    rules={[{ required: true, message: 'Please enter diagnosis' }]}
                  >
                    <TextArea rows={4} />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    name="prescription"
                    label="Prescription"
                    rules={[{ required: true, message: 'Please enter prescription' }]}
                  >
                    <TextArea rows={4} />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    name="notes"
                    label="Additional Notes"
                  >
                    <TextArea rows={4} />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    name="followUpDate"
                    label="Follow Up Date"
                  >
                    <Input type="date" />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          )}
        </Drawer>
      </div>
    </DoctorLayout>
  );
};

export default PatientQueue;