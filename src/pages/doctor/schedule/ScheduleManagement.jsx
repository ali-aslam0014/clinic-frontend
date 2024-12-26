import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  TimePicker,
  Select,
  Switch,
  message,
  Tag,
  Space,
  Tooltip,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import DoctorLayout from '../../../components/doctor/Layout';
import './ScheduleManagement.css';

const { Option } = Select;

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [form] = Form.useForm();

  const weekDays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/schedules/doctor', {
        params: {
          doctorId: localStorage.getItem('doctorId')
        }
      });
      setSchedules(response.data.data);
    } catch (error) {
      message.error('Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        doctorId: localStorage.getItem('doctorId'),
        timeSlots: values.timeSlots.map(slot => ({
          start: slot.start.format('HH:mm'),
          end: slot.end.format('HH:mm')
        }))
      };

      if (editingSchedule) {
        await axios.put(`/api/schedules/${editingSchedule._id}`, data);
        message.success('Schedule updated successfully');
      } else {
        await axios.post('/api/schedules', data);
        message.success('Schedule created successfully');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingSchedule(null);
      fetchSchedules();
    } catch (error) {
      message.error('Failed to save schedule');
    }
  };

  const handleEdit = (record) => {
    setEditingSchedule(record);
    form.setFieldsValue({
      ...record,
      timeSlots: record.timeSlots.map(slot => ({
        start: moment(slot.start, 'HH:mm'),
        end: moment(slot.end, 'HH:mm')
      }))
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/schedules/${id}`);
      message.success('Schedule deleted successfully');
      fetchSchedules();
    } catch (error) {
      message.error('Failed to delete schedule');
    }
  };

  const columns = [
    {
      title: 'Day',
      dataIndex: 'day',
      key: 'day',
      render: (day) => <Tag color="blue">{day}</Tag>
    },
    {
      title: 'Time Slots',
      dataIndex: 'timeSlots',
      key: 'timeSlots',
      render: (slots) => (
        <Space direction="vertical">
          {slots.map((slot, index) => (
            <Tag icon={<ClockCircleOutlined />} color="green" key={index}>
              {slot.start} - {slot.end}
            </Tag>
          ))}
        </Space>
      )
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'error'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this schedule?"
              onConfirm={() => handleDelete(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <DoctorLayout>
      <div className="schedule-management-container">
        <Card
          title="Schedule Management"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingSchedule(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              Add Schedule
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={schedules}
            loading={loading}
            rowKey="_id"
          />
        </Card>

        <Modal
          title={`${editingSchedule ? 'Edit' : 'Add'} Schedule`}
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
            setEditingSchedule(null);
          }}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              isActive: true,
              timeSlots: [{ start: null, end: null }]
            }}
          >
            <Form.Item
              name="day"
              label="Day"
              rules={[{ required: true }]}
            >
              <Select>
                {weekDays.map(day => (
                  <Option key={day} value={day}>{day}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.List name="timeSlots">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <Space key={field.key} align="baseline">
                      <Form.Item
                        {...field}
                        label={index === 0 ? "Time Slots" : ""}
                        required
                        name={[field.name, 'start']}
                        rules={[{ required: true, message: 'Start time required' }]}
                      >
                        <TimePicker format="HH:mm" />
                      </Form.Item>

                      <Form.Item
                        {...field}
                        name={[field.name, 'end']}
                        rules={[{ required: true, message: 'End time required' }]}
                      >
                        <TimePicker format="HH:mm" />
                      </Form.Item>

                      {fields.length > 1 && (
                        <Button
                          type="link"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(field.name)}
                        />
                      )}
                    </Space>
                  ))}

                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Time Slot
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Form.Item
              name="isActive"
              label="Status"
              valuePropName="checked"
            >
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                {editingSchedule ? 'Update' : 'Create'} Schedule
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </DoctorLayout>
  );
};

export default ScheduleManagement;