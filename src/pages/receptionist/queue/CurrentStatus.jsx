import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Badge,
  Row,
  Col,
  Statistic,
  Button,
  Tooltip,
  Modal,
  message
} from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import queueAPI from '../../../services/queueAPI';
import './CurrentStatus.css';

const CurrentStatus = () => {
  const [loading, setLoading] = useState(false);
  const [queueData, setQueueData] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    waiting: 0,
    inProgress: 0,
    completed: 0,
    averageWaitTime: 0
  });

  useEffect(() => {
    fetchQueueData();
    const interval = setInterval(fetchQueueData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchQueueData = async () => {
    try {
      setLoading(true);
      const response = await queueAPI.getCurrentQueue();
      setQueueData(response.data);
      calculateStats(response.data);
    } catch (error) {
      message.error('Error fetching queue data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      waiting: data.filter(item => item.status === 'waiting').length,
      inProgress: data.filter(item => item.status === 'in-progress').length,
      completed: data.filter(item => item.status === 'completed').length,
      averageWaitTime: calculateAverageWaitTime(data)
    };
    setStats(stats);
  };

  const calculateAverageWaitTime = (data) => {
    const waitingTimes = data
      .filter(item => item.startTime)
      .map(item => moment(item.startTime).diff(moment(item.checkInTime), 'minutes'));
    
    return waitingTimes.length > 0 
      ? Math.round(waitingTimes.reduce((a, b) => a + b, 0) / waitingTimes.length)
      : 0;
  };

  const getStatusTag = (status) => {
    const statusColors = {
      'waiting': 'orange',
      'in-progress': 'blue',
      'completed': 'green',
      'no-show': 'red'
    };

    return (
      <Tag color={statusColors[status]}>
        {status.toUpperCase()}
      </Tag>
    );
  };

  const getWaitingTime = (checkInTime) => {
    const duration = moment.duration(moment().diff(moment(checkInTime)));
    const minutes = Math.floor(duration.asMinutes());
    
    if (minutes < 60) {
      return `${minutes}m`;
    }
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  const columns = [
    {
      title: 'Token',
      dataIndex: 'tokenNumber',
      key: 'token',
      render: (token) => (
        <Badge count={token} style={{ backgroundColor: '#108ee9' }} />
      )
    },
    {
      title: 'Patient',
      dataIndex: 'patient',
      key: 'patient',
      render: (patient) => (
        <Space direction="vertical" size="small">
          <span>{patient.firstName} {patient.lastName}</span>
          <small>{patient.contactNumber}</small>
        </Space>
      )
    },
    {
      title: 'Doctor',
      dataIndex: 'doctor',
      key: 'doctor',
      render: (doctor) => (
        <>
          <div>Dr. {doctor.name}</div>
          <small>{doctor.specialization}</small>
        </>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Waiting Time',
      key: 'waitingTime',
      render: (_, record) => (
        <Space>
          <ClockCircleOutlined />
          {getWaitingTime(record.checkInTime)}
        </Space>
      ),
      sorter: (a, b) => moment(a.checkInTime).unix() - moment(b.checkInTime).unix()
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const colors = {
          'High': 'red',
          'Medium': 'orange',
          'Low': 'green'
        };
        return <Tag color={colors[priority]}>{priority}</Tag>;
      }
    }
  ];

  return (
    <div className="current-status">
      <Card title="Current Queue Status">
        <Row gutter={[16, 16]} className="stats-row">
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Total Patients"
                value={stats.total}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Waiting"
                value={stats.waiting}
                valueStyle={{ color: '#faad14' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="In Progress"
                value={stats.inProgress}
                valueStyle={{ color: '#1890ff' }}
                prefix={<ArrowUpOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Avg. Wait Time"
                value={stats.averageWaitTime}
                suffix="min"
                valueStyle={{ color: '#52c41a' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={queueData}
          rowKey="tokenNumber"
          loading={loading}
          pagination={false}
          className="queue-table"
          rowClassName={(record) => {
            if (record.status === 'in-progress') return 'in-progress-row';
            if (record.priority === 'High') return 'high-priority-row';
            return '';
          }}
        />
      </Card>
    </div>
  );
};

export default CurrentStatus;