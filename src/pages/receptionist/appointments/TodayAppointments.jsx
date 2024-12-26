import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Badge,
  message,
  Tooltip,
  Input,
  Row,
  Col
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  BellOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import moment from 'moment';
import appointmentAPI from '../../../services/appointmentAPI';
import './TodayAppointments.css';

const { Search } = Input;

const TodayAppointments = () => {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchTodayAppointments();
  }, []);

  const fetchTodayAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getTodayAppointments();
      setAppointments(response.data);
    } catch (error) {
      message.error('Error fetching appointments: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await appointmentAPI.updateAppointmentStatus(appointmentId, newStatus);
      message.success('Appointment status updated successfully');
      fetchTodayAppointments(); // Refresh list
    } catch (error) {
      message.error('Error updating status: ' + error.message);
    }
  };

  const handleSendReminder = async (appointmentId) => {
    try {
      await appointmentAPI.sendAppointmentReminder(appointmentId);
      message.success('Reminder sent successfully');
    } catch (error) {
      message.error('Error sending reminder: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'green';
      case 'cancelled': return 'red';
      case 'completed': return 'blue';
      case 'no-show': return 'orange';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Time',
      dataIndex: 'appointmentTime',
      key: 'time',
      render: (text) => (
        <Space>
          <ClockCircleOutlined />
          {moment(text).format('HH:mm')}
        </Space>
      ),
      sorter: (a, b) => moment(a.appointmentTime).unix() - moment(b.appointmentTime).unix()
    },
    {
      title: 'Patient',
      dataIndex: 'patient',
      key: 'patient',
      render: (patient) => (
        <Space direction="vertical" size="small">
          <span>
            <UserOutlined /> {patient.firstName} {patient.lastName}
          </span>
          <small>
            <PhoneOutlined /> {patient.contactNumber}
          </small>
        </Space>
      ),
      filteredValue: [searchText],
      onFilter: (value, record) => {
        const patient = record.patient;
        return `${patient.firstName} ${patient.lastName} ${patient.contactNumber}`
          .toLowerCase()
          .includes(value.toLowerCase());
      }
    },
    {
      title: 'Doctor',
      dataIndex: 'doctor',
      key: 'doctor',
      render: (doctor) => (
        <>
          <div>{doctor.name}</div>
          <small>{doctor.specialization}</small>
        </>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type.toLowerCase() === 'emergency' ? 'red' : 'blue'}>
          {type}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge status={getStatusColor(status)} text={status} />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'scheduled' && (
            <>
              <Tooltip title="Mark as Arrived">
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleStatusChange(record._id, 'confirmed')}
                />
              </Tooltip>
              <Tooltip title="Mark as No-Show">
                <Button
                  danger
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleStatusChange(record._id, 'no-show')}
                />
              </Tooltip>
            </>
          )}
          <Tooltip title="Send Reminder">
            <Button
              size="small"
              icon={<BellOutlined />}
              onClick={() => handleSendReminder(record._id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="today-appointments">
      <Card title="Today's Appointments">
        <Row gutter={[16, 16]} className="appointments-header">
          <Col xs={24} sm={8}>
            <Search
              placeholder="Search patient name or phone"
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={16} className="appointments-summary">
            <Space size="large">
              <Tooltip title="Total Appointments">
                <Badge count={appointments.length} showZero color="#108ee9">
                  <Card size="small">Total</Card>
                </Badge>
              </Tooltip>
              <Tooltip title="Confirmed">
                <Badge 
                  count={appointments.filter(a => a.status === 'confirmed').length} 
                  showZero 
                  color="#52c41a"
                >
                  <Card size="small">Confirmed</Card>
                </Badge>
              </Tooltip>
              <Tooltip title="Waiting">
                <Badge 
                  count={appointments.filter(a => a.status === 'scheduled').length} 
                  showZero 
                  color="#faad14"
                >
                  <Card size="small">Waiting</Card>
                </Badge>
              </Tooltip>
              <Tooltip title="Completed">
                <Badge 
                  count={appointments.filter(a => a.status === 'completed').length} 
                  showZero 
                  color="#1890ff"
                >
                  <Card size="small">Completed</Card>
                </Badge>
              </Tooltip>
            </Space>
          </Col>
        </Row>

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

export default TodayAppointments;