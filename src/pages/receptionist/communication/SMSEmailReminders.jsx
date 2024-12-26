import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Switch,
  Form,
  Input,
  Select,
  Modal,
  message,
  Tag,
  Tooltip,
  Typography,
  Row,
  Col,
  Tabs
} from 'antd';
import {
  MailOutlined,
  MessageOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SettingOutlined
} from '@ant-design/icons';
import communicationAPI from '../../../services/communicationAPI';
import './SMSEmailReminders.css';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;
const { TabPane } = Tabs;

const SMSEmailReminders = () => {
  const [loading, setLoading] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchReminders();
    fetchTemplates();
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const response = await communicationAPI.getReminders();
      setReminders(response.data);
    } catch (error) {
      message.error('Failed to fetch reminders');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await communicationAPI.getTemplates();
      setTemplates(response.data);
    } catch (error) {
      message.error('Failed to fetch templates');
    }
  };

  const handleAddEdit = (record = null) => {
    setEditingReminder(record);
    form.setFieldsValue(record || {
      type: 'appointment',
      method: ['email'],
      status: true,
      timing: '24'
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await communicationAPI.deleteReminder(id);
      message.success('Reminder deleted successfully');
      fetchReminders();
    } catch (error) {
      message.error('Failed to delete reminder');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingReminder) {
        await communicationAPI.updateReminder(editingReminder._id, values);
        message.success('Reminder updated successfully');
      } else {
        await communicationAPI.createReminder(values);
        message.success('Reminder created successfully');
      }
      setModalVisible(false);
      fetchReminders();
    } catch (error) {
      message.error('Failed to save reminder');
    }
  };

  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text) => (
        <Tag color={text === 'appointment' ? 'blue' : 'green'}>
          {text.charAt(0).toUpperCase() + text.slice(1)}
        </Tag>
      )
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      render: (methods) => (
        <Space>
          {methods.includes('email') && (
            <Tooltip title="Email">
              <MailOutlined style={{ color: '#1890ff' }} />
            </Tooltip>
          )}
          {methods.includes('sms') && (
            <Tooltip title="SMS">
              <MessageOutlined style={{ color: '#52c41a' }} />
            </Tooltip>
          )}
        </Space>
      )
    },
    {
      title: 'Template',
      dataIndex: 'templateId',
      key: 'templateId',
      render: (templateId) => {
        const template = templates.find(t => t._id === templateId);
        return template ? template.name : '-';
      }
    },
    {
      title: 'Timing',
      dataIndex: 'timing',
      key: 'timing',
      render: (hours) => (
        <Space>
          <ClockCircleOutlined />
          {`${hours} hours before`}
        </Space>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Switch
          checked={status}
          checkedChildren={<CheckCircleOutlined />}
          unCheckedChildren={<CloseCircleOutlined />}
          disabled
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleAddEdit(record)}
          />
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          />
        </Space>
      )
    }
  ];

  return (
    <div className="sms-email-reminders">
      <Card
        title={
          <Space>
            <MailOutlined />
            <span>SMS/Email Reminders</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleAddEdit()}
          >
            Add Reminder
          </Button>
        }
      >
        <Tabs defaultActiveKey="reminders">
          <TabPane
            tab={
              <span>
                <ClockCircleOutlined />
                Reminders
              </span>
            }
            key="reminders"
          >
            <Table
              loading={loading}
              columns={columns}
              dataSource={reminders}
              rowKey="_id"
            />
          </TabPane>
          <TabPane
            tab={
              <span>
                <SettingOutlined />
                Settings
              </span>
            }
            key="settings"
          >
            {/* Add settings component here */}
          </TabPane>
        </Tabs>

        <Modal
          title={`${editingReminder ? 'Edit' : 'Add'} Reminder`}
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="type"
              label="Reminder Type"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="appointment">Appointment</Option>
                <Option value="followup">Follow-up</Option>
                <Option value="medication">Medication</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="method"
              label="Reminder Method"
              rules={[{ required: true }]}
            >
              <Select mode="multiple">
                <Option value="email">Email</Option>
                <Option value="sms">SMS</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="templateId"
              label="Template"
              rules={[{ required: true }]}
            >
              <Select>
                {templates.map(template => (
                  <Option key={template._id} value={template._id}>
                    {template.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="timing"
              label="Send Before (hours)"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="24">24 hours</Option>
                <Option value="48">48 hours</Option>
                <Option value="72">72 hours</Option>
                <Option value="168">1 week</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item>
              <Space className="form-buttons">
                <Button onClick={() => setModalVisible(false)}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  Save
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default SMSEmailReminders; 