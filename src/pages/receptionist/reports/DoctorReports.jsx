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
  Avatar,
  Tag,
  Progress
} from 'antd';
import {
  UserOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  DollarOutlined,
  StarOutlined
} from '@ant-design/icons';
import { Column, Pie } from '@ant-design/plots';
import moment from 'moment';
import reportsAPI from '../../../services/reportsAPI';
import './DoctorReports.css';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

const DoctorReports = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([moment().startOf('month'), moment()]);
  const [doctorData, setDoctorData] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchDoctors();
    fetchDoctorStats();
  }, [dateRange, selectedDoctor]);

  const fetchDoctors = async () => {
    try {
      const response = await reportsAPI.getDoctorsList();
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchDoctorStats = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getDoctorStats({
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        doctorId: selectedDoctor
      });
      setDoctorData(response.data);
    } catch (error) {
      console.error('Error fetching doctor stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await reportsAPI.exportDoctorStats({
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        doctorId: selectedDoctor
      });
    } catch (error) {
      console.error('Error exporting doctor stats:', error);
    }
  };

  const columns = [
    {
      title: 'Doctor',
      dataIndex: 'doctorName',
      key: 'doctorName',
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Patients Seen',
      dataIndex: 'patientsSeen',
      key: 'patientsSeen',
      sorter: (a, b) => a.patientsSeen - b.patientsSeen
    },
    {
      title: 'Avg. Consultation Time',
      dataIndex: 'avgConsultationTime',
      key: 'avgConsultationTime',
      render: (mins) => `${mins.toFixed(1)} mins`,
      sorter: (a, b) => a.avgConsultationTime - b.avgConsultationTime
    },
    {
      title: 'Revenue Generated',
      dataIndex: 'revenueGenerated',
      key: 'revenueGenerated',
      render: (amount) => `$${amount.toFixed(2)}`,
      sorter: (a, b) => a.revenueGenerated - b.revenueGenerated
    },
    {
      title: 'Patient Satisfaction',
      dataIndex: 'patientSatisfaction',
      key: 'patientSatisfaction',
      render: (rating) => (
        <Space>
          <Progress
            percent={rating * 20}
            size="small"
            format={() => `${rating.toFixed(1)}/5`}
          />
        </Space>
      ),
      sorter: (a, b) => a.patientSatisfaction - b.patientSatisfaction
    }
  ];

  const performanceConfig = {
    data: doctorData?.performanceTrend || [],
    xField: 'date',
    yField: 'value',
    seriesField: 'metric',
    smooth: true
  };

  const specialtyDistConfig = {
    data: doctorData?.specialtyDistribution || [],
    angleField: 'value',
    colorField: 'specialty',
    radius: 0.8,
    label: {
      type: 'outer'
    }
  };

  return (
    <div className="doctor-reports">
      <Card title={
        <Space>
          <UserOutlined />
          <span>Doctor Performance Reports</span>
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
              value={selectedDoctor}
              onChange={setSelectedDoctor}
              style={{ width: 200 }}
            >
              <Option value="all">All Doctors</Option>
              {doctors.map(doctor => (
                <Option key={doctor._id} value={doctor._id}>
                  {doctor.name}
                </Option>
              ))}
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
        ) : doctorData ? (
          <>
            <Row gutter={[16, 16]} className="stats-cards">
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Total Patients"
                    value={doctorData.totalPatients}
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Avg. Consultation Time"
                    value={doctorData.avgConsultationTime}
                    suffix="mins"
                    prefix={<ClockCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Total Revenue"
                    value={doctorData.totalRevenue}
                    precision={2}
                    prefix={<DollarOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Avg. Patient Rating"
                    value={doctorData.avgRating}
                    precision={1}
                    prefix={<StarOutlined />}
                    suffix="/5"
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} className="chart-row">
              <Col xs={24} lg={14}>
                <Card title="Performance Trends">
                  <Column {...performanceConfig} />
                </Card>
              </Col>
              <Col xs={24} lg={10}>
                <Card title="Specialty Distribution">
                  <Pie {...specialtyDistConfig} />
                </Card>
              </Col>
            </Row>

            <Card className="table-card">
              <Table
                columns={columns}
                dataSource={doctorData.doctorStats}
                rowKey="doctorId"
                pagination={{
                  pageSize: 7,
                  showTotal: (total) => `Total ${total} doctors`
                }}
              />
            </Card>
          </>
        ) : (
          <Empty description="No doctor data available" />
        )}
      </Card>
    </div>
  );
};

export default DoctorReports; 