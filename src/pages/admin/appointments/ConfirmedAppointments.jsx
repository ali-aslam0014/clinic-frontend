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
  Tooltip
} from 'antd';
import {
  EyeOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  CalendarOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  PrinterOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './ConfirmedAppointments.css';

const { RangePicker } = DatePicker;

const ConfirmedAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState([]);
  const [statistics, setStatistics] = useState({
    totalConfirmed: 0,
    todayConfirmed: 0,
    weekConfirmed: 0
  });

  const fetchConfirmedAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/admin/appointments/status/confirmed');
      if (response.data && response.data.data) {
        setAppointments(response.data.data);
        
        // Calculate statistics
        const today = moment().startOf('day');
        const weekStart = moment().startOf('week');
        
        setStatistics({
          totalConfirmed: response.data.data.length,
          todayConfirmed: response.data.data.filter(app => 
            moment(app.appointmentDate).isSame(today, 'day')).length,
          weekConfirmed: response.data.data.filter(app => 
            moment(app.appointmentDate).isSameOrAfter(weekStart)).length
        });
      }
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Failed to fetch confirmed appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfirmedAppointments();
    const intervalId = setInterval(fetchConfirmedAppointments, 300000); // Refresh every 5 minutes
    
    return () => clearInterval(intervalId);
  }, [fetchConfirmedAppointments]);

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

  const handlePrint = useCallback((appointment) => {
    // Implementation for printing appointment details
    message.success('Printing appointment details...');
  }, []);

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
      title: 'Date & Time',
      key: 'datetime',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span>{moment(record.appointmentDate).format('DD/MM/YYYY')}</span>
          <Tag color="green">{record.timeSlot}</Tag>
        </Space>
      ),
      sorter: (a, b) => moment(a.appointmentDate) - moment(b.appointmentDate),
    },
    {
      title: 'Status',
      key: 'status',
      render: () => (
        <Tag color="green" icon={<CheckCircleOutlined />}>
          CONFIRMED
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedAppointment(record);
                setViewModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Print">
            <Button
              icon={<PrinterOutlined />}
              onClick={() => handlePrint(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="confirmed-appointments-container">
        <h2>Confirmed Appointments</h2>

        {/* Statistics Cards */}
        <Row gutter={16} className="statistics-row">
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Confirmed"
                value={statistics.totalConfirmed}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Today's Confirmed"
                value={statistics.todayConfirmed}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="This Week's Confirmed"
                value={statistics.weekConfirmed}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#3f8600' }}
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
              showTotal: (total) => `Total ${total} confirmed appointments`
            }}
          />
        </div>

        {/* View Modal */}
        <Modal
          title="Appointment Details"
          visible={viewModalVisible}
          onCancel={() => {
            setViewModalVisible(false);
            setSelectedAppointment(null);
          }}
          footer={[
            <Button 
              key="print" 
              icon={<PrinterOutlined />}
              onClick={() => handlePrint(selectedAppointment)}
            >
              Print Details
            </Button>,
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
                <Descriptions.Item label="Appointment Date">
                  {moment(selectedAppointment.appointmentDate).format('DD/MM/YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Time Slot">
                  {selectedAppointment.timeSlot}
                </Descriptions.Item>
                <Descriptions.Item label="Reason for Visit" span={2}>
                  {selectedAppointment.reason}
                </Descriptions.Item>
                {selectedAppointment.notes && (
                  <Descriptions.Item label="Additional Notes" span={2}>
                    {selectedAppointment.notes}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default ConfirmedAppointments;