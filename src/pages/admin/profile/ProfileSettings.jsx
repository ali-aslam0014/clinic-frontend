import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Switch,
  Form,
  Select,
  Button,
  Divider,
  message,
  Radio,
  TimePicker,
  Space
} from 'antd';
import {
  SettingOutlined,
  BellOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
  SecurityScanOutlined,
  SaveOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axiosInstance from '../../../utils/axiosConfig';
import AdminLayout from '../../../components/admin/Layout';

import './ProfileSettings.css';

const { Title } = Typography;
const { Option } = Select;

const ProfileSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSettingsUpdate = async (values) => {
    try {
      setLoading(true);
      const formattedValues = {
        ...values,
        workingHours: {
          ...values.workingHours,
          start: values.workingHours?.start?.format('HH:mm'),
          end: values.workingHours?.end?.format('HH:mm'),
        }
      };
      await axiosInstance.put('/api/v1/admin/profile/profile-settings', formattedValues);
      message.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      message.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-settings-container">
        <Title level={2}>
          <SettingOutlined /> System Settings
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSettingsUpdate}
        >
          <Row gutter={[24, 24]}>
            {/* Notifications Settings */}
            <Col xs={24} lg={12}>
              <Card title={<><BellOutlined /> Notifications</>} loading={loading}>
                <Form.Item
                  name={['notifications', 'email']}
                  label="Email Notifications"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name={['notifications', 'system']}
                  label="System Notifications"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name={['notifications', 'appointments']}
                  label="Appointment Notifications"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name={['notifications', 'updates']}
                  label="System Updates Notifications"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Card>
            </Col>

            {/* Appearance Settings */}
            <Col xs={24} lg={12}>
              <Card title="Appearance" loading={loading}>
                <Form.Item
                  name={['appearance', 'theme']}
                  label="Theme"
                >
                  <Radio.Group>
                    <Radio.Button value="light">Light</Radio.Button>
                    <Radio.Button value="dark">Dark</Radio.Button>
                  </Radio.Group>
                </Form.Item>

                <Form.Item
                  name={['appearance', 'fontSize']}
                  label="Font Size"
                >
                  <Select>
                    <Option value="small">Small</Option>
                    <Option value="medium">Medium</Option>
                    <Option value="large">Large</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name={['appearance', 'colorScheme']}
                  label="Color Scheme"
                >
                  <Select>
                    <Option value="blue">Blue</Option>
                    <Option value="green">Green</Option>
                    <Option value="purple">Purple</Option>
                    <Option value="red">Red</Option>
                  </Select>
                </Form.Item>
              </Card>
            </Col>

            {/* System Settings */}
            <Col xs={24} lg={12}>
              <Card title={<><GlobalOutlined /> System</>} loading={loading}>
                <Form.Item
                  name={['system', 'language']}
                  label="Language"
                >
                  <Select>
                    <Option value="en">English</Option>
                    <Option value="es">Spanish</Option>
                    <Option value="fr">French</Option>
                    <Option value="de">German</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name={['system', 'timeZone']}
                  label="Time Zone"
                >
                  <Select>
                    <Option value="UTC">UTC</Option>
                    <Option value="GMT">GMT</Option>
                    <Option value="EST">EST</Option>
                    <Option value="PST">PST</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name={['system', 'dateFormat']}
                  label="Date Format"
                >
                  <Select>
                    <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                    <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                    <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name={['system', 'timeFormat']}
                  label="Time Format"
                >
                  <Radio.Group>
                    <Radio.Button value="12">12 Hours</Radio.Button>
                    <Radio.Button value="24">24 Hours</Radio.Button>
                  </Radio.Group>
                </Form.Item>

                <Form.Item
                  name={['system', 'currency']}
                  label="Currency"
                >
                  <Select>
                    <Option value="USD">USD ($)</Option>
                    <Option value="EUR">EUR (€)</Option>
                    <Option value="GBP">GBP (£)</Option>
                    <Option value="PKR">PKR (₨)</Option>
                  </Select>
                </Form.Item>
              </Card>
            </Col>

            {/* Security Settings */}
            <Col xs={24} lg={12}>
              <Card title={<><SecurityScanOutlined /> Security</>} loading={loading}>
                <Form.Item
                  name={['security', 'twoFactorAuth']}
                  label="Two Factor Authentication"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name={['security', 'sessionTimeout']}
                  label="Session Timeout (minutes)"
                >
                  <Select>
                    <Option value={15}>15 minutes</Option>
                    <Option value={30}>30 minutes</Option>
                    <Option value={60}>1 hour</Option>
                    <Option value={120}>2 hours</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name={['security', 'passwordExpiry']}
                  label="Password Expiry (days)"
                >
                  <Select>
                    <Option value={30}>30 days</Option>
                    <Option value={60}>60 days</Option>
                    <Option value={90}>90 days</Option>
                    <Option value={180}>180 days</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name={['security', 'loginAttempts']}
                  label="Max Login Attempts"
                >
                  <Select>
                    <Option value={3}>3 attempts</Option>
                    <Option value={5}>5 attempts</Option>
                    <Option value={10}>10 attempts</Option>
                  </Select>
                </Form.Item>
              </Card>
            </Col>

            {/* Working Hours */}
            <Col xs={24} lg={12}>
              <Card title={<><ClockCircleOutlined /> Working Hours</>} loading={loading}>
                <Form.Item
                  name={['workingHours', 'workingDays']}
                  label="Working Days"
                >
                  <Select mode="multiple">
                    <Option value="monday">Monday</Option>
                    <Option value="tuesday">Tuesday</Option>
                    <Option value="wednesday">Wednesday</Option>
                    <Option value="thursday">Thursday</Option>
                    <Option value="friday">Friday</Option>
                    <Option value="saturday">Saturday</Option>
                    <Option value="sunday">Sunday</Option>
                  </Select>
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name={['workingHours', 'start']}
                      label="Start Time"
                    >
                      <TimePicker format="HH:mm" style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={['workingHours', 'end']}
                      label="End Time"
                    >
                      <TimePicker format="HH:mm" style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          <Divider />

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
              >
                Save Settings
              </Button>
              <Button
                onClick={() => {
                  form.resetFields();
                  message.info('Settings reset to last saved state');
                }}
              >
                Reset
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </AdminLayout>
  );
};

export default ProfileSettings;