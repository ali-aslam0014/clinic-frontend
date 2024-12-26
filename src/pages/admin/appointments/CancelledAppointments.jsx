import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Tag,
  Space,
  Button,
  Modal,
  message,
  DatePicker,
  Input,
  Card,
  Row,
  Col,
  Statistic,
  Descriptions,
  Tooltip,
  Typography
} from 'antd';
import {
  EyeOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  CalendarOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './CancelledAppointments.css';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const CancelledAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState([]);
  const [statistics, setStatistics] = useState({
    totalCancelled: 0,
    todayCancelled: 0,
    weekCancelled: 0,
    cancellationRate: 0
  });

  const fetchCancelledAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/admin/appointments/status/cancelled');
      if (response.data && response.data.data) {
        setAppointments(response.data.data);
        
        // Calculate statistics
        const today = moment().startOf('day');
        const weekStart = moment().startOf('week');
        const data = response.data.data;
        
        setStatistics({
          totalCancelled: data.length,
          todayCancelled: data.filter(app => 
            moment(app.appointmentDate).isSame(today, 'day')).length,
          weekCancelled: data.filter(app => 
            moment(app.appointmentDate).isSameOrAfter(weekStart)).length,
          cancellationRate: ((data.length / (data.length + response.data.totalAppointments)) * 100).toFixed(1)
        });
      }
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Failed to fetch cancelled appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCancelledAppointments();
  }, [fetchCancelledAppointments]);

  const getFilteredAppointments = useCallback(() => {
    let filtered = [...appointments];

    if (searchText) {
      filtered = filtered.filter(app => 
        (app.patientId?.name?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
        (app.doctorId?.name?.toLowerCase() || '').includes(searchText.toLowerCase())
      );
    }

    if (dateRange && dateRange.length === 2) {
      filtered = filtered.filter(app => 
        moment(app.appointmentDate).isBetween(dateRange[0], dateRange[1], 'day', '[]')
      );
    }

    return filtered;
  }, [appointments, searchText, dateRange]);

  const columns = [
    {
      title: 'Patient',
      dataIndex: ['patientId', 'name'],
      key: 'patientName',
      render: (text, record) => (
        <Space>
          <UserOutlined />
          {record.patientId?.name || 'N/A'}
        </Space>
      ),
    },
    {
      title: 'Doctor',
      dataIndex: ['doctorId', 'name'],
      key: 'doctorName',
      render: (text, record) => (
        <Space>
          <MedicineBoxOutlined />
          {record.doctorId?.name || 'N/A'}
          <Tag color="blue">{record.doctorId?.specialization}</Tag>
        </Space>
      ),
    },
    {
      title: 'Scheduled For',
      key: 'datetime',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span>{moment(record.appointmentDate).format('DD/MM/YYYY')}</span>
          <Text type="secondary">{record.timeSlot}</Text>
        </Space>
      ),
      sorter: (a, b) => moment(a.appointmentDate) - moment(b.appointmentDate),
    },
    {
      title: 'Cancelled On',
      dataIndex: 'updatedAt',
      key: 'cancelledDate',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Status',
      key: 'status',
      render: () => (
        <Tag color="red" icon={<CloseCircleOutlined />}>
          CANCELLED
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Tooltip title="View Details">
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedAppointment(record);
              setViewModalVisible(true);
            }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="cancelled-appointments-container">
        <h2>Cancelled Appointments</h2>

        {/* Statistics Cards */}
        <Row gutter={16} className="statistics-row">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Cancelled"
                value={statistics.totalCancelled}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Today's Cancelled"
                value={statistics.todayCancelled}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="This Week's Cancelled"
                value={statistics.weekCancelled}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Cancellation Rate"
                value={statistics.cancellationRate}
                suffix="%"
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: statistics.cancellationRate > 20 ? '#cf1322' : '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <div className="filters-section">
          <Space size="middle" wrap>
            <RangePicker
              onChange={setDateRange}
              format="DD/MM/YYYY"
            />
            <Input
              placeholder="Search patient or doctor"
              prefix={<SearchOutlined />}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
          </Space>
        </div>

        {/* Table */}
        <div className="table-container">
          <Table
            columns={columns}
            dataSource={getFilteredAppointments()}
            loading={loading}
            rowKey="_id"
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total ${total} cancelled appointments`
            }}
          />
        </div>

        {/* View Modal */}
        <Modal
          title="Cancelled Appointment Details"
          visible={viewModalVisible}
          onCancel={() => {
            setViewModalVisible(false);
            setSelectedAppointment(null);
          }}
          footer={[
            <Button 
              key="close" 
              onClick={() => setViewModalVisible(false)}
            >
              Close
            </Button>
          ]}
          width={700}
        >
          {selectedAppointment && (
            <div className="appointment-details">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Patient Name" span={2}>
                  {selectedAppointment.patientId?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Doctor Name" span={2}>
                  {selectedAppointment.doctorId?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Specialization" span={2}>
                  {selectedAppointment.doctorId?.specialization}
                </Descriptions.Item>
                <Descriptions.Item label="Scheduled Date">
                  {moment(selectedAppointment.appointmentDate).format('DD/MM/YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Time Slot">
                  {selectedAppointment.timeSlot}
                </Descriptions.Item>
                <Descriptions.Item label="Cancelled On" span={2}>
                  {moment(selectedAppointment.updatedAt).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>
                <Descriptions.Item label="Original Reason" span={2}>
                  {selectedAppointment.reason}
                </Descriptions.Item>
                <Descriptions.Item label="Cancellation Reason" span={2}>
                  <Text type="danger">
                    {selectedAppointment.cancelReason || 'No reason provided'}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default CancelledAppointments;