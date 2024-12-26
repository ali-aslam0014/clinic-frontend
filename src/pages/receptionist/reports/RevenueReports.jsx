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
  DollarOutlined,
  DownloadOutlined,
  RiseOutlined,
  FallOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import { Line, Column } from '@ant-design/plots';
import moment from 'moment';
import reportsAPI from '../../../services/reportsAPI';
import './RevenueReports.css';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

const RevenueReports = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([moment().startOf('month'), moment()]);
  const [viewType, setViewType] = useState('daily');
  const [revenueData, setRevenueData] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState('all');

  useEffect(() => {
    fetchRevenueData();
  }, [dateRange, viewType, departmentFilter]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getRevenueStats({
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        viewType,
        department: departmentFilter
      });
      setRevenueData(response.data);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await reportsAPI.exportRevenueStats({
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        viewType,
        department: departmentFilter
      });
    } catch (error) {
      console.error('Error exporting revenue data:', error);
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
      title: 'Total Revenue',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      render: (value) => `$${value.toFixed(2)}`,
      sorter: (a, b) => a.totalRevenue - b.totalRevenue
    },
    {
      title: 'Consultations',
      dataIndex: 'consultationRevenue',
      key: 'consultationRevenue',
      render: (value) => `$${value.toFixed(2)}`
    },
    {
      title: 'Procedures',
      dataIndex: 'procedureRevenue',
      key: 'procedureRevenue',
      render: (value) => `$${value.toFixed(2)}`
    },
    {
      title: 'Medications',
      dataIndex: 'medicationRevenue',
      key: 'medicationRevenue',
      render: (value) => `$${value.toFixed(2)}`
    },
    {
      title: 'Growth',
      dataIndex: 'growth',
      key: 'growth',
      render: (value) => (
        <span style={{ color: value >= 0 ? '#3f8600' : '#cf1322' }}>
          {value >= 0 ? <RiseOutlined /> : <FallOutlined />}
          {` ${Math.abs(value).toFixed(1)}%`}
        </span>
      )
    }
  ];

  const revenueChartConfig = {
    data: revenueData?.dailyRevenue || [],
    xField: 'date',
    yField: 'amount',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000
      }
    }
  };

  const departmentChartConfig = {
    data: revenueData?.departmentRevenue || [],
    xField: 'department',
    yField: 'revenue',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6
      }
    }
  };

  return (
    <div className="revenue-reports">
      <Card title={
        <Space>
          <DollarOutlined />
          <span>Revenue Reports</span>
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
        ) : revenueData ? (
          <>
            <Row gutter={[16, 16]} className="stats-cards">
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Total Revenue"
                    value={revenueData.totalRevenue}
                    precision={2}
                    prefix="$"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Average Daily Revenue"
                    value={revenueData.averageDailyRevenue}
                    precision={2}
                    prefix="$"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Growth Rate"
                    value={revenueData.growthRate}
                    precision={1}
                    prefix={revenueData.growthRate >= 0 ? <RiseOutlined /> : <FallOutlined />}
                    suffix="%"
                    valueStyle={{ color: revenueData.growthRate >= 0 ? '#3f8600' : '#cf1322' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Outstanding Amount"
                    value={revenueData.outstandingAmount}
                    precision={2}
                    prefix="$"
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} className="chart-row">
              <Col xs={24} lg={14}>
                <Card title="Revenue Trend">
                  <Line {...revenueChartConfig} />
                </Card>
              </Col>
              <Col xs={24} lg={10}>
                <Card title="Department-wise Revenue">
                  <Column {...departmentChartConfig} />
                </Card>
              </Col>
            </Row>

            <Card className="table-card">
              <Table
                columns={columns}
                dataSource={revenueData.dailyStats}
                rowKey="date"
                pagination={{
                  pageSize: 7,
                  showTotal: (total) => `Total ${total} records`
                }}
              />
            </Card>
          </>
        ) : (
          <Empty description="No revenue data available" />
        )}
      </Card>
    </div>
  );
};

export default RevenueReports; 