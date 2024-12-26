import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Switch,
  Button,
  message,
  Divider,
  Typography,
  Row,
  Col,
  Select,
  TimePicker,
  Space
} from 'antd';
import {
  BellOutlined,
  MailOutlined,
  MobileOutlined,
  SaveOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import DoctorLayout from '../../../components/doctor/Layout';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const NotificationSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  const fetchNotificationSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/doctors/settings/notifications');
      const settings = response.data.data;
      if (settings?.scheduleTime) {
        settings.scheduleTime = dayjs(settings.scheduleTime, 'HH:mm');
      }
      form.setFieldsValue(settings);
    } catch (error) {
      message.error('Failed to fetch notification settings');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const formattedValues = {
        ...values,
        scheduleTime: values.scheduleTime ? values.scheduleTime.format('HH:mm') : undefined
      };
      await axios.put('/api/doctors/settings/notifications', formattedValues);
      message.success('Notification settings updated successfully');
    } catch (error) {
      message.error('Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  const initialValues = {
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminders: true,
    reminderTime: 30,
    dailySchedule: true,
    scheduleTime: dayjs('08:00', 'HH:mm'),
    newPatientAlerts: true,
    cancelationAlerts: true,
    emergencyAlerts: true,
    marketingEmails: false
  };

  return (
    <DoctorLayout>
      <div className="notification-settings-container">
        <Card>
          <Title level={2}>
            <BellOutlined /> Notification Settings
          </Title>
          <Text type="secondary">
            Manage how you receive notifications about your appointments and patients
          </Text>
          <Divider />

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={initialValues}
          >
            <Row gutter={24}>
              <Col span={12}>
                <Title level={4}>
                  <MailOutlined /> Email Notifications
                </Title>
                <Form.Item
                  name="emailNotifications"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="dailySchedule"
                  label="Daily Schedule Email"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="scheduleTime"
                  label="Schedule Email Time"
                  dependencies={['dailySchedule']}
                >
                  <TimePicker 
                    format="HH:mm"
                    disabled={!form.getFieldValue('dailySchedule')}
                  />
                </Form.Item>

                <Form.Item
                  name="marketingEmails"
                  label="Marketing & Updates"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Title level={4}>
                  <MobileOutlined /> SMS Notifications
                </Title>
                <Form.Item
                  name="smsNotifications"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="appointmentReminders"
                  label="Appointment Reminders"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="reminderTime"
                  label="Reminder Time"
                  dependencies={['appointmentReminders']}
                >
                  <Select disabled={!form.getFieldValue('appointmentReminders')}>
                    <Option value={15}>15 minutes before</Option>
                    <Option value={30}>30 minutes before</Option>
                    <Option value={60}>1 hour before</Option>
                    <Option value={120}>2 hours before</Option>
                    <Option value={1440}>1 day before</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Title level={4}>
              <ClockCircleOutlined /> Alert Preferences
            </Title>
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  name="newPatientAlerts"
                  label="New Patient Alerts"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="cancelationAlerts"
                  label="Cancelation Alerts"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="emergencyAlerts"
                  label="Emergency Alerts"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
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
                    form.setFieldsValue(initialValues);
                    message.success('Settings reset to default');
                  }}
                >
                  Reset to Default
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </DoctorLayout>
  );
};

export default NotificationSettings;