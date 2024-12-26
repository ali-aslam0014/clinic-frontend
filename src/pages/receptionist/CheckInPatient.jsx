import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Table,
  Tag,
  Space,
  message,
  Row,
  Col,
  Select
} from 'antd';
import { SearchOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { appointmentAPI } from '../../services/api';
import moment from 'moment';

const { Option } = Select;

const CheckInPatient = () => {
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [form] = Form.useForm();

  // Get today's appointments
  const fetchTodayAppointments = async () => {
    try {
      setLoading(true);
      const today = moment().format('YYYY-MM-DD');
      const response = await appointmentAPI.getAppointmentsByDateRange({
        start: today,
        end: today,
        status: 'confirmed'
      });
      
      setAppointments(response.data);
    } catch (error) {
      message.error('Error fetching appointments: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAppointments();
  }, []);

  // Search patient
  const onSearch = async (values) => {
    try {
      setSearchLoading(true);
      const response = await appointmentAPI.searchAppointments(values);
      setAppointments(response.data);
    } catch (error) {
      message.error('Error searching: ' + error.message);
    } finally {
      setSearchLoading(false);
    }
  };

  // Check-in patient
  const handleCheckIn = async (appointmentId) => {
    try {
      setLoading(true);
      await appointmentAPI.checkInAppointment(appointmentId);
      message.success('Patient checked in successfully');
      fetchTodayAppointments(); // Refresh list
    } catch (error) {
      message.error('Check-in failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Token',
      dataIndex: 'tokenNumber',
      key: 'tokenNumber',
      width: 100,
    },
    {
      title: 'Time',
      dataIndex: 'timeSlot',
      key: 'timeSlot',
      render: (timeSlot) => timeSlot.start,
      width: 100,
    },
    {
      title: 'Patient Name',
      dataIndex: 'patientName',
      key: 'patientName',
    },
    {
      title: 'Phone',
      dataIndex: 'patientPhone',
      key: 'patientPhone',
    },
    {
      title: 'Doctor',
      dataIndex: 'doctorId',
      key: 'doctor',
      render: (doctor) => doctor.name,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'confirmed' ? 'blue' :
          status === 'checked-in' ? 'green' :
          'default'
        }>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status === 'confirmed' && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleCheckIn(record._id)}
              loading={loading}
            >
              Check In
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="check-in-container">
      <Card title="Patient Check-In">
        {/* Search Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={onSearch}
          className="search-form"
        >
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="searchType"
                label="Search By"
                initialValue="phone"
              >
                <Select>
                  <Option value="phone">Phone Number</Option>
                  <Option value="name">Patient Name</Option>
                  <Option value="token">Token Number</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="searchValue"
                label="Search Value"
                rules={[{ required: true, message: 'Please enter search value' }]}
              >
                <Input 
                  prefix={<SearchOutlined />}
                  placeholder="Enter search value"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label=" " className="search-button">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={searchLoading}
                  icon={<SearchOutlined />}
                >
                  Search
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        {/* Appointments Table */}
        <Table
          columns={columns}
          dataSource={appointments}
          rowKey="_id"
          loading={loading}
          pagination={false}
          scroll={{ x: true }}
        />
      </Card>
    </div>
  );
};

export default CheckInPatient;