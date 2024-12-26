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
  CalendarOutlined,
  DownloadOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { Pie, Column } from '@ant-design/plots';
import moment from 'moment';
import reportsAPI from '../../../services/reportsAPI';
import './AppointmentStats.css';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography;

const AppointmentStats = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([moment().startOf('week'), moment()]);
  const [stats, setStats] = useState(null);
  const [viewType, setViewType] = useState('daily');
  const [selectedDoctor, setSelectedDoctor] = useState('all');

  useEffect(() => {
    fetchAppointmentStats();
  }, [dateRange, viewType, selectedDoctor]);

  const fetchAppointmentStats = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getAppointmentStats({
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        viewType,
        doctorId: selectedDoctor !== 'all' ? selectedDoctor : undefined
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching appointment stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await reportsAPI.exportAppointmentStats({
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        viewType,
        doctorId: selectedDoctor !== 'all' ? selectedDoctor : undefined
      });
    } catch (error) {
      console.error('Error exporting stats:', error);
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
      title: 'Total Appointments',
      dataIndex: 'totalAppointments',
      key: 'totalAppointments',
      sorter: (a, b) => a.totalAppointments - b.totalAppointments
    },
    {
      title: 'Completed',
      dataIndex: 'completed',
      key: 'completed',
      sorter: (a, b) => a.completed - b.completed
    },
    {
      title: 'Cancelled',
      dataIndex: 'cancelled',
      key: 'cancelled',
      sorter: (a, b) => a.cancelled - b.cancelled
    },
    {
      title: 'No-Shows',
      dataIndex: 'noShows',
      key: 'noShows',
      sorter: (a, b) => a.noShows - b.noShows
    },
    {
      title: 'Completion Rate',
      dataIndex: 'completionRate',
      key: 'completionRate',
      render: (rate) => `${(rate * 100).toFixed(1)}%`,
      sorter: (a, b) => a.completionRate - b.completionRate
    }
  ];

  const pieConfig = {
    data: stats?.statusDistribution || [],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}'
    },
    interactions: [{ type: 'element-active' }]
  };

  const columnConfig = {
    data: stats?.timeSlotDistribution || [],
    xField: 'timeSlot',
    yField: 'count',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6
      }
    }
  };

  return (
    <div className="appointment-stats">
      <Card title={
        <Space>
          <CalendarOutlined />
          <span>Appointment Statistics</span>
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
              value={selectedDoctor}
              onChange={setSelectedDoctor}
              style={{ width: 200 }}
            >
              <Option value="all">All Doctors</Option>
              {/* Add doctor options dynamically */}
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
        ) : stats ? (
          <>
            <Row gutter={[16, 16]} className="stats-cards">
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Total Appointments"
                    value={stats.totalAppointments}
                    prefix={<CalendarOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Completed"
                    value={stats.completed}
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Cancelled"
                    value={stats.cancelled}
                    valueStyle={{ color: '#cf1322' }}
                    prefix={<CloseCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Completion Rate"
                    value={stats.completionRate * 100}
                    precision={1}
                    suffix="%"
                    prefix={<ClockCircleOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} className="chart-row">
              <Col xs={24} md={12}>
                <Card title="Appointment Status Distribution">
                  <Pie {...pieConfig} />
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card title="Time Slot Distribution">
                  <Column {...columnConfig} />
                </Card>
              </Col>
            </Row>

            <Card className="table-card">
              <Table
                columns={columns}
                dataSource={stats.dailyStats}
                rowKey="date"
                pagination={{
                  pageSize: 7,
                  showTotal: (total) => `Total ${total} records`
                }}
              />
            </Card>
          </>
        ) : (
          <Empty description="No data available" />
        )}
      </Card>
    </div>
  );
};

export default AppointmentStats; 