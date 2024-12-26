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
  Empty
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  DownloadOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import moment from 'moment';
import reportsAPI from '../../../services/reportsAPI';
import './DailyPatientCount.css';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography;

const DailyPatientCount = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([moment().startOf('week'), moment()]);
  const [patientStats, setPatientStats] = useState(null);
  const [viewType, setViewType] = useState('daily'); // daily, weekly, monthly
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchPatientStats();
  }, [dateRange, viewType]);

  const fetchPatientStats = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getDailyPatientCount({
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        viewType
      });
      setPatientStats(response.data);
      formatChartData(response.data.dailyCounts);
    } catch (error) {
      console.error('Error fetching patient stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatChartData = (dailyCounts) => {
    const formattedData = dailyCounts.map(item => ({
      date: moment(item.date).format('DD/MM/YYYY'),
      count: item.totalPatients,
      newPatients: item.newPatients,
      followUps: item.followUps
    }));
    setChartData(formattedData);
  };

  const handleExport = async () => {
    try {
      await reportsAPI.exportDailyPatientCount({
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        viewType
      });
    } catch (error) {
      console.error('Error exporting report:', error);
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
      title: 'New Patients',
      dataIndex: 'newPatients',
      key: 'newPatients',
      sorter: (a, b) => a.newPatients - b.newPatients
    },
    {
      title: 'Follow-ups',
      dataIndex: 'followUps',
      key: 'followUps',
      sorter: (a, b) => a.followUps - b.followUps
    },
    {
      title: 'Walk-ins',
      dataIndex: 'walkIns',
      key: 'walkIns',
      sorter: (a, b) => a.walkIns - b.walkIns
    }
  ];

  const config = {
    data: chartData,
    xField: 'date',
    yField: 'count',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000
      }
    },
    point: {
      size: 5,
      shape: 'diamond'
    }
  };

  return (
    <div className="daily-patient-count">
      <Card title={
        <Space>
          <UserOutlined />
          <span>Daily Patient Count</span>
        </Space>
      }>
        <div className="report-filters">
          <Space wrap>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              allowClear={false}
            />
            <Select value={viewType} onChange={setViewType}>
              <Option value="daily">Daily</Option>
              <Option value="weekly">Weekly</Option>
              <Option value="monthly">Monthly</Option>
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
        ) : patientStats ? (
          <>
            <Row gutter={[16, 16]} className="stats-cards">
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Total Patients"
                    value={patientStats.totalPatients}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="New Patients"
                    value={patientStats.newPatients}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Follow-ups"
                    value={patientStats.followUps}
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Average Daily Patients"
                    value={patientStats.averageDailyPatients}
                    precision={2}
                    prefix={<CalendarOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <Card className="chart-card">
              <Title level={4}>Patient Trend</Title>
              <Line {...config} />
            </Card>

            <Table
              columns={columns}
              dataSource={patientStats.dailyCounts}
              rowKey="date"
              pagination={{
                pageSize: 7,
                showTotal: (total) => `Total ${total} records`
              }}
            />
          </>
        ) : (
          <Empty description="No data available" />
        )}
      </Card>
    </div>
  );
};

export default DailyPatientCount; 