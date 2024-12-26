import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Button,
  message,
  Switch,
  TimePicker,
  Select,
  Space,
  Table,
  Tag,
  Divider,
  Typography,
  Row,
  Col,
  Popconfirm
} from 'antd';
import {
  ClockCircleOutlined,
  CalendarOutlined,
  DeleteOutlined,
  SaveOutlined,
  PlusOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import DoctorLayout from '../../../components/doctor/Layout';

const { Title } = Typography;
const { Option } = Select;

const ScheduleSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [editingKey, setEditingKey] = useState('');

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/doctors/schedule');
      setSchedules(response.data.data);
    } catch (error) {
      message.error('Failed to fetch schedule settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const formattedValues = {
        ...values,
        startTime: values.startTime.format('HH:mm'),
        endTime: values.endTime.format('HH:mm'),
      };
      
      await axios.post('/api/doctors/schedule', formattedValues);
      message.success('Schedule added successfully');
      form.resetFields();
      fetchSchedule();
    } catch (error) {
      message.error('Failed to save schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/doctors/schedule/${id}`);
      message.success('Schedule deleted successfully');
      fetchSchedule();
    } catch (error) {
      message.error('Failed to delete schedule');
    }
  };

  const handleToggleAvailability = async (id, isAvailable) => {
    try {
      await axios.patch(`/api/doctors/schedule/${id}`, {
        isAvailable
      });
      message.success('Availability updated successfully');
      fetchSchedule();
    } catch (error) {
      message.error('Failed to update availability');
    }
  };

  const columns = [
    {
      title: 'Day',
      dataIndex: 'day',
      key: 'day',
      render: (day) => (
        <Tag color="blue">
          {day}
        </Tag>
      )
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
    },
    {
      title: 'Slot Duration (mins)',
      dataIndex: 'slotDuration',
      key: 'slotDuration',
    },
    {
      title: 'Max Appointments',
      dataIndex: 'maxAppointments',
      key: 'maxAppointments',
    },
    {
      title: 'Available',
      dataIndex: 'isAvailable',
      key: 'isAvailable',
      render: (isAvailable, record) => (
        <Switch
          checked={isAvailable}
          onChange={(checked) => handleToggleAvailability(record._id, checked)}
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Are you sure you want to delete this schedule?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <DoctorLayout>
      <div className="schedule-settings-container">
        <Card>
          <Title level={2}>
            <ClockCircleOutlined /> Schedule Settings
          </Title>
          <Divider />

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="day"
                  label="Day"
                  rules={[{ required: true, message: 'Please select day' }]}
                >
                  <Select placeholder="Select day">
                    <Option value="Monday">Monday</Option>
                    <Option value="Tuesday">Tuesday</Option>
                    <Option value="Wednesday">Wednesday</Option>
                    <Option value="Thursday">Thursday</Option>
                    <Option value="Friday">Friday</Option>
                    <Option value="Saturday">Saturday</Option>
                    <Option value="Sunday">Sunday</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="startTime"
                  label="Start Time"
                  rules={[{ required: true, message: 'Please select start time' }]}
                >
                  <TimePicker format="HH:mm" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="endTime"
                  label="End Time"
                  rules={[{ required: true, message: 'Please select end time' }]}
                >
                  <TimePicker format="HH:mm" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="slotDuration"
                  label="Slot Duration (minutes)"
                  rules={[{ required: true, message: 'Please select slot duration' }]}
                >
                  <Select placeholder="Select duration">
                    <Option value={15}>15 minutes</Option>
                    <Option value={30}>30 minutes</Option>
                    <Option value={45}>45 minutes</Option>
                    <Option value={60}>60 minutes</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="maxAppointments"
                  label="Max Appointments"
                  rules={[{ required: true, message: 'Please enter max appointments' }]}
                >
                  <Select placeholder="Select max appointments">
                    {[...Array(10)].map((_, i) => (
                      <Option key={i + 1} value={i + 1}>{i + 1}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="isAvailable"
                  label="Available"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<PlusOutlined />}
                loading={loading}
              >
                Add Schedule
              </Button>
            </Form.Item>
          </Form>

          <Divider>Current Schedule</Divider>

          <Table
            columns={columns}
            dataSource={schedules}
            rowKey="_id"
            loading={loading}
          />
        </Card>
      </div>
    </DoctorLayout>
  );
};

export default ScheduleSettings;