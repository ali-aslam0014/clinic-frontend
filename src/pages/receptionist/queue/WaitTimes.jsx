import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  Table,
  Tag,
  Space,
  Statistic,
  Progress,
  Alert,
  Timeline,
  Button,
  message
} from 'antd';
import {
  ClockCircleOutlined,
  UserOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import moment from 'moment';
import queueAPI from '../../../services/queueAPI';
import './WaitTimes.css';

const { Option } = Select;

const WaitTimes = () => {
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [waitTimeData, setWaitTimeData] = useState({
    current: [],
    stats: {
      averageWaitTime: 0,
      maxWaitTime: 0,
      totalPatients: 0,
      inProgress: 0
    }
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      fetchWaitTimeData();
      const interval = setInterval(fetchWaitTimeData, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [selectedDoctor]);

  const fetchDoctors = async () => {
    try {
      const response = await queueAPI.getDoctors();
      setDoctors(response.data);
    } catch (error) {
      message.error('Error fetching doctors: ' + error.message);
    }
  };

  const fetchWaitTimeData = async () => {
    try {
      setLoading(true);
      const response = await queueAPI.getWaitTimeEstimation(selectedDoctor);
      setWaitTimeData(response.data);
    } catch (error) {
      message.error('Error fetching wait time data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getWaitTimeStatus = (minutes) => {
    if (minutes <= 15) return 'success';
    if (minutes <= 30) return 'normal';
    if (minutes <= 45) return 'warning';
    return 'exception';
  };

  const columns = [
    {
      title: 'Position',
      dataIndex: 'tokenNumber',
      key: 'position',
      render: (token) => (
        <Tag color="blue">{token}</Tag>
      )
    },
    {
      title: 'Patient',
      dataIndex: 'patientId',
      key: 'patient',
      render: (patient) => (
        <Space direction="vertical" size="small">
          <span>{patient.firstName} {patient.lastName}</span>
          <small>{patient.contactNumber}</small>
        </Space>
      )
    },
    {
      title: 'Waiting Since',
      dataIndex: 'checkInTime',
      key: 'waitingSince',
      render: (time) => (
        <Space>
          <ClockCircleOutlined />
          {moment(time).format('hh:mm A')}
          <small>({moment(time).fromNow()})</small>
        </Space>
      )
    },
    {
      title: 'Estimated Wait',
      dataIndex: 'estimatedWaitTime',
      key: 'estimatedWait',
      render: (wait) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <span>{formatDuration(wait)}</span>
          <Progress 
            percent={Math.min((wait / 60) * 100, 100)} 
            status={getWaitTimeStatus(wait)}
            showInfo={false}
            size="small"
          />
        </Space>
      )
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const colors = {
          High: 'red',
          Medium: 'orange',
          Low: 'green'
        };
        return <Tag color={colors[priority]}>{priority}</Tag>;
      }
    }
  ];

  return (
    <div className="wait-times">
      <Card title="Wait Times Monitor">
        <Row gutter={[16, 16]} className="filters">
          <Col xs={24} md={8}>
            <Select
              placeholder="Select Doctor"
              style={{ width: '100%' }}
              onChange={setSelectedDoctor}
              loading={loading}
            >
              {doctors.map(doctor => (
                <Option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.name} - {doctor.specialization}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={16}>
            <Button 
              type="primary" 
              icon={<SyncOutlined />} 
              onClick={fetchWaitTimeData}
              loading={loading}
            >
              Refresh
            </Button>
          </Col>
        </Row>

        {selectedDoctor && (
          <>
            <Row gutter={[16, 16]} className="stats-row">
              <Col xs={12} sm={6}>
                <Card>
                  <Statistic
                    title="Average Wait"
                    value={waitTimeData.stats.averageWaitTime}
                    suffix="min"
                    prefix={<ClockCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card>
                  <Statistic
                    title="Max Wait"
                    value={waitTimeData.stats.maxWaitTime}
                    suffix="min"
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card>
                  <Statistic
                    title="Waiting Patients"
                    value={waitTimeData.stats.totalPatients}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card>
                  <Statistic
                    title="In Progress"
                    value={waitTimeData.stats.inProgress}
                    prefix={<LoadingOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
            </Row>

            {waitTimeData.stats.totalPatients > 0 ? (
              <Table
                columns={columns}
                dataSource={waitTimeData.current}
                rowKey="_id"
                loading={loading}
                pagination={false}
              />
            ) : (
              <Alert
                message="No patients in queue"
                description="There are currently no patients waiting."
                type="info"
                showIcon
              />
            )}

            <Card title="Recent Updates" className="updates-card">
              <Timeline>
                {waitTimeData.current.slice(0, 5).map(patient => (
                  <Timeline.Item 
                    key={patient._id}
                    color={getWaitTimeStatus(patient.estimatedWaitTime)}
                  >
                    <p>
                      <strong>{patient.patientId.firstName} {patient.patientId.lastName}</strong>
                      <br />
                      <small>
                        Estimated wait: {formatDuration(patient.estimatedWaitTime)}
                        <br />
                        Last updated: {moment(patient.positionUpdateTime).fromNow()}
                      </small>
                    </p>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </>
        )}
      </Card>
    </div>
  );
};

export default WaitTimes;