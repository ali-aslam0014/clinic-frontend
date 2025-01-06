import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Switch,
  Form,
  Input,
  Button,
  Select,
  Divider,
  message,
  List,
  Typography,
  Space,
  Alert
} from 'antd';
import {
  BellOutlined,
  MailOutlined,
  SecurityScanOutlined,
  GlobalOutlined,
  SettingOutlined,
  SoundOutlined,
  ClockCircleOutlined,
  SaveOutlined
} from '@ant-design/icons';
import axiosInstance from '../../../utils/axiosConfig';
import './Settings.css';

const { Title, Text } = Typography;
const { Option } = Select;

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/receptionist/settings');
      const { data } = response.data;
      setSettings(data);
      form.setFieldsValue(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      message.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const response = await axiosInstance.put('/receptionist/settings', values);
      message.success('Settings updated successfully');
      setSettings(response.data.data);
    } catch (error) {
      console.error('Error updating settings:', error);
      message.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values) => {
    try {
      setLoading(true);
      await axiosInstance.put('/receptionist/change-password', values);
      message.success('Password changed successfully');
      form.resetFields(['currentPassword', 'newPassword', 'confirmPassword']);
    } catch (error) {
      console.error('Error changing password:', error);
      message.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <Row gutter={[24, 24]}>
        {/* Notifications Settings */}
        <Col xs={24} lg={12}>
          <Card title={<Space><BellOutlined /> Notification Settings</Space>}>
            <Form
              layout="vertical"
              initialValues={settings?.notifications}
              onFinish={(values) => handleSubmit({ notifications: values })}
            >
              <List>
                <List.Item>
                  <div className="setting-item">
                    <Text>Email Notifications</Text>
                    <Form.Item name="emailNotifications" valuePropName="checked" noStyle>
                      <Switch />
                    </Form.Item>
                  </div>
                </List.Item>
                <List.Item>
                  <div className="setting-item">
                    <Text>SMS Notifications</Text>
                    <Form.Item name="smsNotifications" valuePropName="checked" noStyle>
                      <Switch />
                    </Form.Item>
                  </div>
                </List.Item>
                <List.Item>
                  <div className="setting-item">
                    <Text>Desktop Notifications</Text>
                    <Form.Item name="desktopNotifications" valuePropName="checked" noStyle>
                      <Switch />
                    </Form.Item>
                  </div>
                </List.Item>
                <List.Item>
                  <div className="setting-item">
                    <Text>Sound Alerts</Text>
                    <Form.Item name="soundAlerts" valuePropName="checked" noStyle>
                      <Switch />
                    </Form.Item>
                  </div>
                </List.Item>
              </List>
              <Button type="primary" htmlType="submit" loading={loading}>
                Save Notification Settings
              </Button>
            </Form>
          </Card>
        </Col>

        {/* Display Settings */}
        <Col xs={24} lg={12}>
          <Card title={<Space><SettingOutlined /> Display Settings</Space>}>
            <Form
              layout="vertical"
              initialValues={settings?.display}
              onFinish={(values) => handleSubmit({ display: values })}
            >
              <Form.Item name="theme" label="Theme">
                <Select>
                  <Option value="light">Light</Option>
                  <Option value="dark">Dark</Option>
                  <Option value="system">System Default</Option>
                </Select>
              </Form.Item>
              <Form.Item name="language" label="Language">
                <Select>
                  <Option value="en">English</Option>
                  <Option value="es">Spanish</Option>
                  <Option value="fr">French</Option>
                </Select>
              </Form.Item>
              <Form.Item name="timezone" label="Time Zone">
                <Select>
                  <Option value="UTC">UTC</Option>
                  <Option value="EST">EST</Option>
                  <Option value="PST">PST</Option>
                </Select>
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Save Display Settings
              </Button>
            </Form>
          </Card>
        </Col>

        {/* Security Settings */}
        <Col xs={24}>
          <Card title={<Space><SecurityScanOutlined /> Security Settings</Space>}>
            <Alert
              message="Password Requirements"
              description="Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
            <Form
              layout="vertical"
              onFinish={handlePasswordChange}
            >
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="currentPassword"
                    label="Current Password"
                    rules={[{ required: true, message: 'Please enter current password' }]}
                  >
                    <Input.Password />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="newPassword"
                    label="New Password"
                    rules={[
                      { required: true, message: 'Please enter new password' },
                      { min: 8, message: 'Password must be at least 8 characters' }
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="confirmPassword"
                    label="Confirm Password"
                    dependencies={['newPassword']}
                    rules={[
                      { required: true, message: 'Please confirm password' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Passwords do not match'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>
                </Col>
              </Row>
              <Button type="primary" htmlType="submit" loading={loading}>
                Change Password
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Settings; 