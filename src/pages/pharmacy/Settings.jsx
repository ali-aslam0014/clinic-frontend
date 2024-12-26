import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Switch,
  Select,
  message,
  Divider,
  TimePicker,
  InputNumber,
  Space,
  Alert
} from 'antd';
import {
  SaveOutlined,
  BellOutlined,
  SecurityScanOutlined,
  ClockCircleOutlined,
  MailOutlined
} from '@ant-design/icons';
import PharmacyLayout from '../../components/pharmacy/Layout';
import axios from 'axios';
import moment from 'moment';
import './Settings.css';

const { TabPane } = Tabs;
const { Option } = Select;

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [generalForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [securityForm] = Form.useForm();

  // Fetch settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/pharmacy/settings');
      const settings = response.data.data;

      // Set form values
      generalForm.setFieldsValue({
        pharmacyName: settings.pharmacyName,
        operatingHours: [
          moment(settings.openTime, 'HH:mm'),
          moment(settings.closeTime, 'HH:mm')
        ],
        currency: settings.currency,
        language: settings.language,
        timeZone: settings.timeZone
      });

      notificationForm.setFieldsValue({
        lowStockAlert: settings.notifications.lowStock,
        expiryAlert: settings.notifications.expiry,
        emailNotifications: settings.notifications.email,
        stockAlertThreshold: settings.notifications.stockThreshold,
        expiryAlertDays: settings.notifications.expiryDays
      });

      securityForm.setFieldsValue({
        twoFactorAuth: settings.security.twoFactor,
        sessionTimeout: settings.security.sessionTimeout,
        passwordExpiry: settings.security.passwordExpiry
      });
    } catch (error) {
      message.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Handle general settings update
  const handleGeneralSubmit = async (values) => {
    try {
      setLoading(true);
      await axios.put('/api/pharmacy/settings/general', {
        ...values,
        openTime: values.operatingHours[0].format('HH:mm'),
        closeTime: values.operatingHours[1].format('HH:mm')
      });
      message.success('General settings updated successfully');
    } catch (error) {
      message.error('Failed to update general settings');
    } finally {
      setLoading(false);
    }
  };

  // Handle notification settings update
  const handleNotificationSubmit = async (values) => {
    try {
      setLoading(true);
      await axios.put('/api/pharmacy/settings/notifications', values);
      message.success('Notification settings updated successfully');
    } catch (error) {
      message.error('Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  // Handle security settings update
  const handleSecuritySubmit = async (values) => {
    try {
      setLoading(true);
      await axios.put('/api/pharmacy/settings/security', values);
      message.success('Security settings updated successfully');
    } catch (error) {
      message.error('Failed to update security settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PharmacyLayout>
      <div className="settings-container">
        <Card className="settings-card">
          <Tabs defaultActiveKey="general">
            <TabPane
              tab={
                <span>
                  <ClockCircleOutlined />
                  General
                </span>
              }
              key="general"
            >
              <Form
                form={generalForm}
                layout="vertical"
                onFinish={handleGeneralSubmit}
              >
                <Form.Item
                  name="pharmacyName"
                  label="Pharmacy Name"
                  rules={[{ required: true, message: 'Please enter pharmacy name' }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name="operatingHours"
                  label="Operating Hours"
                  rules={[{ required: true, message: 'Please set operating hours' }]}
                >
                  <TimePicker.RangePicker format="HH:mm" />
                </Form.Item>

                <Form.Item
                  name="currency"
                  label="Currency"
                  rules={[{ required: true, message: 'Please select currency' }]}
                >
                  <Select>
                    <Option value="USD">USD ($)</Option>
                    <Option value="EUR">EUR (€)</Option>
                    <Option value="GBP">GBP (£)</Option>
                    <Option value="PKR">PKR (₨)</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="language"
                  label="Language"
                  rules={[{ required: true, message: 'Please select language' }]}
                >
                  <Select>
                    <Option value="en">English</Option>
                    <Option value="ur">Urdu</Option>
                    <Option value="ar">Arabic</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="timeZone"
                  label="Time Zone"
                  rules={[{ required: true, message: 'Please select time zone' }]}
                >
                  <Select>
                    <Option value="PKT">Pakistan Time (PKT)</Option>
                    <Option value="GMT">GMT</Option>
                    <Option value="EST">Eastern Time (EST)</Option>
                  </Select>
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    <SaveOutlined /> Save General Settings
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <BellOutlined />
                  Notifications
                </span>
              }
              key="notifications"
            >
              <Form
                form={notificationForm}
                layout="vertical"
                onFinish={handleNotificationSubmit}
              >
                <Form.Item
                  name="lowStockAlert"
                  valuePropName="checked"
                  label="Low Stock Alerts"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="stockAlertThreshold"
                  label="Stock Alert Threshold"
                  rules={[{ required: true, message: 'Please set threshold' }]}
                >
                  <InputNumber min={1} />
                </Form.Item>

                <Form.Item
                  name="expiryAlert"
                  valuePropName="checked"
                  label="Expiry Alerts"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="expiryAlertDays"
                  label="Days Before Expiry"
                  rules={[{ required: true, message: 'Please set days' }]}
                >
                  <InputNumber min={1} />
                </Form.Item>

                <Form.Item
                  name="emailNotifications"
                  valuePropName="checked"
                  label="Email Notifications"
                >
                  <Switch />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    <SaveOutlined /> Save Notification Settings
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <SecurityScanOutlined />
                  Security
                </span>
              }
              key="security"
            >
              <Form
                form={securityForm}
                layout="vertical"
                onFinish={handleSecuritySubmit}
              >
                <Form.Item
                  name="twoFactorAuth"
                  valuePropName="checked"
                  label="Two-Factor Authentication"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="sessionTimeout"
                  label="Session Timeout (minutes)"
                  rules={[{ required: true, message: 'Please set timeout' }]}
                >
                  <InputNumber min={5} max={120} />
                </Form.Item>

                <Form.Item
                  name="passwordExpiry"
                  label="Password Expiry (days)"
                  rules={[{ required: true, message: 'Please set expiry' }]}
                >
                  <InputNumber min={30} max={180} />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    <SaveOutlined /> Save Security Settings
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </PharmacyLayout>
  );
};

export default Settings; 