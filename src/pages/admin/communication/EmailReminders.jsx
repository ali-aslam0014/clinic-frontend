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
  Alert,
  DatePicker
} from 'antd';
import {
  MailOutlined,
  ReloadOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './EmailReminders.css';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

const EmailReminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [patients, setPatients] = useState([]);
  const [statistics, setStatistics] = useState({
    scheduled: 0,
    sent: 0,
    failed: 0
  });
  const [error, setError] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('/api/v1/admin/communications/email-reminders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data?.data) {
        setReminders(response.data.data);
        setStatistics(response.data.statistics || {
          scheduled: 0,
          sent: 0,
          failed: 0
        });
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to load reminders');
      message.error('Failed to fetch reminders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      title: 'Patient',
      dataIndex: ['patient', 'name'],
      key: 'patient'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={
          status === 'sent' ? 'green' :
          status === 'failed' ? 'red' : 'blue'
        }>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Scheduled For',
      dataIndex: 'scheduledFor',
      key: 'scheduledFor',
      render: date => moment(date).format('DD/MM/YYYY HH:mm')
    }
  ];

  return (
    <AdminLayout>
      <div className="email-reminders-container">
        <Title level={2}>
          <MailOutlined /> Email Reminders
        </Title>

        <Row gutter={16} className="statistics-row">
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Scheduled"
                value={statistics.scheduled}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Sent"
                value={statistics.sent}
                prefix={<CheckOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Failed"
                value={statistics.failed}
                prefix={<CloseOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        <Card className="action-card">
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
            >
              Create Reminder
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchData}
            >
              Refresh
            </Button>
          </Space>
        </Card>

        {error ? (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        ) : (
          <Card>
            <Table
              loading={loading}
              columns={columns}
              dataSource={reminders}
              rowKey="_id"
              pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} items`
              }}
            />
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default EmailReminders;