import React, { useState, useEffect } from 'react';
import {
  Card,
  DatePicker,
  Table,
  Row,
  Col,
  Statistic,
  Button,
  Space,
  Select,
  Typography,
  Spin,
  Empty,
  Tag
} from 'antd';
import {
  TeamOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  FieldTimeOutlined,
  UserSwitchOutlined
} from '@ant-design/icons';
import { Line, Heatmap } from '@ant-design/plots';
import moment from 'moment';
import reportsAPI from '../../../services/reportsAPI';
import './QueueAnalytics.css';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography;

const QueueAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([moment().startOf('week'), moment()]);
  const [queueData, setQueueData] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState('all');

  useEffect(() => {
    fetchQueueData();
  }, [dateRange, departmentFilter]);

  const fetchQueueData = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getQueueAnalytics({
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        department: departmentFilter
      });
      setQueueData(response.data);
    } catch (error) {
      console.error('Error fetching queue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await reportsAPI.exportQueueAnalytics({
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        department: departmentFilter
      });
    } catch (error) {
      console.error('Error exporting queue data:', error);
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('DD/MM/YYYY')
    },
    {
      title: 'Total Patients',
      dataIndex: 'totalPatients',
      key: 'totalPatients',
      sorter: (a, b) => a.totalPatients - b.totalPatients
    },
    {
      title: 'Avg. Wait Time',
      dataIndex: 'avgWaitTime',
      key: 'avgWaitTime',
      render: (mins) => `${mins.toFixed(1)} mins`,
      sorter: (a, b) => a.avgWaitTime - b.avgWaitTime
    },
    {
      title: 'Peak Hours',
      dataIndex: 'peakHours',
      key: 'peakHours',
      render: (hours) => (
        <Tag color="orange">
          {`${hours[0]}:00 - ${hours[1]}:00`}
        </Tag>
      )
    },
    {
      title: 'Service Rate',
      dataIndex: 'serviceRate',
      key: 'serviceRate',
      render: (rate) => `${(rate * 100).toFixed(1)}%`,
      sorter: (a, b) => a.serviceRate - b.serviceRate
    }
  ];

  const waitTimeConfig = {
    data: queueData?.waitTimeTrend || [],
    xField: 'hour',
    yField: 'waitTime',
    seriesField: 'day',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000
      }
    }
  };

  const heatmapConfig = {
    data: queueData?.queueDensity || [],
    xField: 'hour',
    yField: 'day',
    colorField: 'patients',
    color: ['#BAE7FF', '#1890FF', '#0050B3'],
    meta: {
      hour: {
        type: 'cat',
        values: Array.from({ length: 12 }, (_, i) => `${i + 8}:00`)
      }
    }
  };

  return (
    <div className="queue-analytics">
      <Card title={
        <Space>
          <TeamOutlined />
          <span>Queue Analytics</span>
        </Space>
      }>
        <div className="report-filters">
          <Space wrap>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              allowClear={false}
            />
            <Select
              value={departmentFilter}
              onChange={setDepartmentFilter}
              style={{ width: 150 }}
            >
              <Option value="all">All Departments</Option>
              {/* Add department options dynamically */}
            </Select>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              Export Report
            </Button>
          </Space>
        </div>

        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : queueData ? (
          <>
            <Row gutter={[16, 16]} className="stats-cards">
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Average Wait Time"
                    value={queueData.averageWaitTime}
                    suffix="mins"
                    prefix={<ClockCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Peak Hour Patients"
                    value={queueData.peakHourPatients}
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Service Rate"
                    value={queueData.averageServiceRate * 100}
                    precision={1}
                    suffix="%"
                    prefix={<UserSwitchOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Busiest Day"
                    value={queueData.busiestDay}
                    prefix={<FieldTimeOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} className="chart-row">
              <Col xs={24} lg={12}>
                <Card title="Wait Time Trend">
                  <Line {...waitTimeConfig} />
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Queue Density Heatmap">
                  <Heatmap {...heatmapConfig} />
                </Card>
              </Col>
            </Row>

            <Card className="table-card">
              <Table
                columns={columns}
                dataSource={queueData.dailyStats}
                rowKey="date"
                pagination={{
                  pageSize: 7,
                  showTotal: (total) => `Total ${total} records`
                }}
              />
            </Card>
          </>
        ) : (
          <Empty description="No queue data available" />
        )}
      </Card>
    </div>
  );
};

export default QueueAnalytics; 