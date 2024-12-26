import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Select,
  TimePicker,
  message,
  Space,
  Tag,
  Row,
  Col,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './TimeSlots.css';

const { Option } = Select;

const TimeSlots = () => {
  const [slots, setSlots] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true); // Set initial loading to true
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [form] = Form.useForm();

  // Fetch time slots and doctors
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      // Using Promise.all for parallel requests
      const [slotsRes, doctorsRes] = await Promise.all([
        axios.get('/api/v1/admin/time-slots', config),
        axios.get('/api/v1/admin/doctors', config)
      ]);

      if (slotsRes.data?.data) {
        setSlots(slotsRes.data.data);
      }

      if (doctorsRes.data?.data) {
        setDoctors(doctorsRes.data.data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddEdit = async (values) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const formattedValues = {
        ...values,
        startTime: values.timeRange[0].format('HH:mm'),
        endTime: values.timeRange[1].format('HH:mm'),
      };
      delete formattedValues.timeRange;

      if (editingSlot) {
        await axios.put(`/api/v1/admin/time-slots/${editingSlot._id}`, formattedValues, config);
        message.success('Time slot updated successfully');
      } else {
        await axios.post('/api/v1/admin/time-slots', formattedValues, config);
        message.success('Time slot added successfully');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingSlot(null);
      fetchData();
    } catch (error) {
      console.error('Operation error:', error);
      message.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      await axios.delete(`/api/v1/admin/time-slots/${id}`, config);
      message.success('Time slot deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Failed to delete time slot');
    }
  };

  const columns = [
    {
      title: 'Doctor',
      dataIndex: ['doctorId', 'name'],
      key: 'doctorName',
      render: (text, record) => (
        <Space>
          {record.doctorId?.name || 'N/A'}
          <Tag color="blue">{record.doctorId?.specialization || 'N/A'}</Tag>
        </Space>
      ),
    },
    {
      title: 'Time Slot',
      key: 'timeSlot',
      render: (_, record) => (
        <Tag icon={<ClockCircleOutlined />} color="green">
          {`${record.startTime || '--:--'} - ${record.endTime || '--:--'}`}
        </Tag>
      ),
    },
    {
      title: 'Days Available',
      dataIndex: 'daysAvailable',
      key: 'daysAvailable',
      render: (days = []) => (
        <Space wrap>
          {days.map(day => (
            <Tag key={day} color="purple">{day}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'error'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingSlot(record);
              form.setFieldsValue({
                doctorId: record.doctorId?._id,
                timeRange: [
                  moment(record.startTime, 'HH:mm'),
                  moment(record.endTime, 'HH:mm')
                ],
                daysAvailable: record.daysAvailable,
                isActive: record.isActive,
              });
              setModalVisible(true);
            }}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record._id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="time-slots-container">
        <Row justify="space-between" align="middle" className="page-header">
          <Col>
            <h2>Time Slots Management</h2>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingSlot(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              Add Time Slot
            </Button>
          </Col>
        </Row>

        <Card className="table-card">
          <Table
            columns={columns}
            dataSource={slots}
            loading={loading}
            rowKey="_id"
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total ${total} time slots`
            }}
          />
        </Card>

        <Modal
          title={editingSlot ? 'Edit Time Slot' : 'Add Time Slot'}
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingSlot(null);
            form.resetFields();
          }}
          footer={null}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddEdit}
            initialValues={{
              isActive: true,
            }}
          >
            <Form.Item
              name="doctorId"
              label="Doctor"
              rules={[{ required: true, message: 'Please select a doctor' }]}
            >
              <Select placeholder="Select doctor">
                {doctors.map(doctor => (
                  <Option key={doctor._id} value={doctor._id}>
                    {doctor.name} - {doctor.specialization}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="timeRange"
              label="Time Range"
              rules={[{ required: true, message: 'Please select time range' }]}
            >
              <TimePicker.RangePicker
                format="HH:mm"
                minuteStep={30}
              />
            </Form.Item>

            <Form.Item
              name="daysAvailable"
              label="Available Days"
              rules={[{ required: true, message: 'Please select available days' }]}
            >
              <Select
                mode="multiple"
                placeholder="Select days"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                  .map(day => (
                    <Option key={day} value={day}>{day}</Option>
                  ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="isActive"
              label="Status"
            >
              <Select>
                <Option value={true}>Active</Option>
                <Option value={false}>Inactive</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingSlot ? 'Update' : 'Add'}
                </Button>
                <Button onClick={() => {
                  setModalVisible(false);
                  setEditingSlot(null);
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

export default TimeSlots;