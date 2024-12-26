import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Typography,
  Tag,
  Row,
  Col,
  Statistic,
  Tooltip,
  Spin,
  Alert
} from 'antd';
import {
  SendOutlined,
  ReloadOutlined,
  PhoneOutlined,
  UserOutlined,
  MessageOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './SMSNotifications.css';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

const SMSNotifications = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [patients, setPatients] = useState([]);
  const [statistics, setStatistics] = useState({
    totalSent: 0,
    delivered: 0,
    failed: 0
  });
  const [error, setError] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error('No authentication token found');
        }

        const [messagesRes, templatesRes, patientsRes] = await Promise.all([
          axios.get('/api/v1/admin/communications/sms', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get('/api/v1/admin/communications/sms/templates', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get('/api/v1/admin/patients', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (mounted) {
          if (messagesRes.data?.data) {
            setMessages(messagesRes.data.data);
            setStatistics(messagesRes.data.statistics || {
              totalSent: 0,
              delivered: 0,
              failed: 0
            });
          }

          if (templatesRes.data?.data) {
            setTemplates(templatesRes.data.data);
          }

          if (patientsRes.data?.data) {
            setPatients(patientsRes.data.data);
          }
        }
      } catch (err) {
        console.error('Fetch error:', err);
        if (mounted) {
          setError(err.message || 'Failed to load data');
          message.error('Failed to fetch data: ' + err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSendSMS = async (values) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/v1/admin/communications/sms/send', values, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      message.success('SMS sent successfully');
      setModalVisible(false);
      form.resetFields();
      
      // Refresh messages list
      const response = await axios.get('/api/v1/admin/communications/sms', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data?.data) {
        setMessages(response.data.data);
        setStatistics(response.data.statistics);
      }
    } catch (error) {
      message.error('Failed to send SMS: ' + error.message);
    }
  };

  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => t._id === templateId);
    if (template) {
      form.setFieldsValue({
        message: template.content
      });
    }
  };

  const columns = [
    {
      title: 'Recipient',
      dataIndex: 'recipient',
      key: 'recipient',
      render: (text, record) => (
        <Space>
          <UserOutlined />
          {record.patient ? record.patient.name : text}
        </Space>
      )
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={
          status === 'delivered' ? 'green' :
          status === 'failed' ? 'red' : 'orange'
        }>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Sent At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: date => moment(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Resend">
            <Button
              icon={<SendOutlined />}
              onClick={() => {
                form.setFieldsValue({
                  recipient: record.recipient,
                  phone: record.phone,
                  message: record.message
                });
                setModalVisible(true);
              }}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="sms-notifications-container">
        <Title level={2}>
          <MessageOutlined /> SMS Notifications
        </Title>

        {error ? (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        ) : (
          <>
            <Row gutter={16} className="statistics-row">
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Total Sent"
                    value={statistics.totalSent}
                    prefix={<SendOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Delivered"
                    value={statistics.delivered}
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<CheckOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Failed"
                    value={statistics.failed}
                    valueStyle={{ color: '#cf1322' }}
                    prefix={<CloseOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <Card className="action-card">
              <Space>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={() => setModalVisible(true)}
                >
                  Send New SMS
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    setLoading(true);
                    fetchData();
                  }}
                >
                  Refresh
                </Button>
              </Space>
            </Card>

            <Card>
              <Table
                loading={loading}
                columns={columns}
                dataSource={messages}
                rowKey="_id"
                pagination={{
                  defaultPageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} items`
                }}
              />
            </Card>
          </>
        )}

        <Modal
          title="Send SMS"
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSendSMS}
          >
            <Form.Item
              name="recipient"
              label="Recipient"
              rules={[{ required: true, message: 'Please select recipient' }]}
            >
              <Select
                showSearch
                placeholder="Select patient"
                optionFilterProp="children"
                onChange={(value, option) => {
                  const patient = patients.find(p => p._id === value);
                  if (patient) {
                    form.setFieldsValue({
                      phone: patient.phone
                    });
                  }
                }}
              >
                {patients.map(patient => (
                  <Option key={patient._id} value={patient._id}>
                    {patient.name} ({patient.phone})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[
                { required: true, message: 'Please enter phone number' },
                { pattern: /^\+?[1-9]\d{1,14}$/, message: 'Please enter valid phone number' }
              ]}
            >
              <Input prefix={<PhoneOutlined />} />
            </Form.Item>

            <Form.Item
              name="template"
              label="Template"
            >
              <Select
                placeholder="Select template"
                onChange={handleTemplateSelect}
                allowClear
              >
                {templates.map(template => (
                  <Option key={template._id} value={template._id}>
                    {template.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="message"
              label="Message"
              rules={[
                { required: true, message: 'Please enter message' },
                { max: 160, message: 'Message cannot exceed 160 characters' }
              ]}
            >
              <TextArea
                rows={4}
                showCount
                maxLength={160}
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Send
                </Button>
                <Button onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default SMSNotifications;