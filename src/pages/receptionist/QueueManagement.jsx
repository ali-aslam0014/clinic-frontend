import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Row,
  Col,
  Select,
  Statistic,
  Space,
  message,
  Modal
} from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { appointmentAPI } from '../../services/api';

const { Option } = Select;

const QueueManagement = () => {
  const [loading, setLoading] = useState(false);
  const [queue, setQueue] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [stats, setStats] = useState({
    waiting: 0,
    inProgress: 0,
    completed: 0,
    averageWaitTime: 0
  });

  // Fetch queue data
  const fetchQueue = async () => {
    try {
      setLoading(true);
      const today = moment().format('YYYY-MM-DD');
      const response = await appointmentAPI.getQueueByDate(today, selectedDoctor);
      setQueue(response.data);
      calculateStats(response.data);
    } catch (error) {
      message.error('Error fetching queue: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    // Set up auto-refresh every minute
    const interval = setInterval(fetchQueue, 60000);
    return () => clearInterval(interval);
  }, [selectedDoctor]);

  // Calculate queue statistics
  const calculateStats = (queueData) => {
    const waiting = queueData.filter(item => item.status === 'checked-in').length;
    const inProgress = queueData.filter(item => item.status === 'in-progress').length;
    const completed = queueData.filter(item => item.status === 'completed').length;

    // Calculate average wait time
    const waitTimes = queueData
      .filter(item => item.startTime)
      .map(item => moment(item.startTime).diff(moment(item.checkInTime), 'minutes'));
    
    const averageWaitTime = waitTimes.length > 0 
      ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length)
      : 0;

    setStats({ waiting, inProgress, completed, averageWaitTime });
  };

  // Call next patient
  const handleCallNext = async (appointmentId) => {
    try {
      await appointmentAPI.callNextPatient(appointmentId);
      message.success('Patient called successfully');
      fetchQueue();
    } catch (error) {
      message.error('Error calling patient: ' + error.message);
    }
  };

  // Mark as completed
  const handleComplete = async (appointmentId) => {
    try {
      await appointmentAPI.completeAppointment(appointmentId);
      message.success('Appointment marked as completed');
      fetchQueue();
    } catch (error) {
      message.error('Error completing appointment: ' + error.message);
    }
  };

  const columns = [
    {
      title: 'Token',
      dataIndex: 'tokenNumber',
      key: 'tokenNumber',
      width: 80,
    },
    {
      title: 'Patient',
      dataIndex: 'patientName',
      key: 'patientName',
    },
    {
      title: 'Doctor',
      dataIndex: 'doctorId',
      key: 'doctor',
      render: (doctor) => doctor.name,
    },
    {
      title: 'Wait Time',
      key: 'waitTime',
      render: (_, record) => {
        const waitTime = record.checkInTime 
          ? moment.duration(moment().diff(moment(record.checkInTime))).asMinutes()
          : 0;
        return `${Math.round(waitTime)} mins`;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'checked-in' ? 'blue' :
          status === 'in-progress' ? 'green' :
          status === 'completed' ? 'gray' :
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
          {record.status === 'checked-in' && (
            <Button
              type="primary"
              icon={<ArrowRightOutlined />}
              onClick={() => handleCallNext(record._id)}
            >
              Call
            </Button>
          )}
          {record.status === 'in-progress' && (
            <Button
              type="primary"
              onClick={() => handleComplete(record._id)}
            >
              Complete
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="queue-management">
      <Row gutter={[16, 16]}>
        {/* Statistics Cards */}
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Waiting"
              value={stats.waiting}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="In Progress"
              value={stats.inProgress}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Completed"
              value={stats.completed}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Avg. Wait Time"
              value={stats.averageWaitTime}
              suffix="min"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Queue Management Table */}
      <Card 
        title="Queue Management" 
        className="queue-table"
        extra={
          <Select
            value={selectedDoctor}
            onChange={setSelectedDoctor}
            style={{ width: 200 }}
          >
            <Option value="all">All Doctors</Option>
            {/* Add doctor options dynamically */}
          </Select>
        }
      >
        <Table
          columns={columns}
          dataSource={queue}
          rowKey="_id"
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default QueueManagement;