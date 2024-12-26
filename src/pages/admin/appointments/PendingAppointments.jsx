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
  Tooltip,
  Card,
  Row,
  Col,
  Statistic,
  Descriptions
} from 'antd';
import {
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  UserOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './PendingAppointments.css';

const { RangePicker } = DatePicker;

const PendingAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState([]);
  const [statistics, setStatistics] = useState({
    totalPending: 0,
    todayPending: 0,
    weekPending: 0
  });

  const fetchPendingAppointments = useCallback(async () => {
    if (!loading) setLoading(true);
    try {
      const response = await axios.get('/api/v1/admin/appointments/status/pending');
      if (response.data && response.data.data) {
        setAppointments(response.data.data);
        
        // Calculate statistics
        const today = moment().startOf('day');
        const weekStart = moment().startOf('week');
        
        setStatistics({
          totalPending: response.data.data.length,
          todayPending: response.data.data.filter(app => 
            moment(app.appointmentDate).isSame(today, 'day')).length,
          weekPending: response.data.data.filter(app => 
            moment(app.appointmentDate).isSameOrAfter(weekStart)).length
        });
      }
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Failed to fetch pending appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingAppointments();
    const intervalId = setInterval(fetchPendingAppointments, 300000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchPendingAppointments]);

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

  const handleStatusUpdate = useCallback(async (appointmentId, newStatus) => {
    try {
      const data = { 
        status: newStatus,
        ...(newStatus === 'cancelled' && { cancelReason })
      };

      await axios.put(`/api/v1/admin/appointments/${appointmentId}/status`, data);
      message.success(`Appointment ${newStatus} successfully`);
      fetchPendingAppointments();
      setCancelModalVisible(false);
      setCancelReason('');
    } catch (error) {
      console.error('Update error:', error);
      message.error(`Failed to ${newStatus} appointment`);
    }
  }, [cancelReason, fetchPendingAppointments]);

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
        </Space>
      ),
    },
    {
      title: 'Date & Time',
      key: 'datetime',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span>{moment(record.appointmentDate).format('DD/MM/YYYY')}</span>
          <Tag color="blue">{record.timeSlot}</Tag>
        </Space>
      ),
      sorter: (a, b) => moment(a.appointmentDate) - moment(b.appointmentDate),
    },
    {
      title: 'Waiting Time',
      key: 'waitingTime',
      render: (_, record) => {
        const waitingDays = moment(record.appointmentDate).diff(moment(), 'days');
        return (
          <Tag color={waitingDays <= 1 ? 'red' : waitingDays <= 3 ? 'orange' : 'green'}>
            {waitingDays === 0 ? 'Today' : `${waitingDays} days`}
          </Tag>
        );
      },
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
          <Tooltip title="Confirm">
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => handleStatusUpdate(record._id, 'confirmed')}
            />
          </Tooltip>
          <Tooltip title="Cancel">
            <Button
              danger
              icon={<CloseOutlined />}
              onClick={() => {
                setSelectedAppointment(record);
                setCancelModalVisible(true);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="pending-appointments-container">
        <h2>Pending Appointments</h2>

        {/* Statistics Cards */}
        <Row gutter={16} className="statistics-row">
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Pending"
                value={statistics.totalPending}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Today's Pending"
                value={statistics.todayPending}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: statistics.todayPending > 0 ? '#cf1322' : '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="This Week's Pending"
                value={statistics.weekPending}
                prefix={<ClockCircleOutlined />}
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

        {/* Table with error boundary */}
        <div className="table-container">
          <Table
            columns={columns}
            dataSource={getFilteredAppointments()}
            loading={loading}
            rowKey="_id"
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total ${total} pending appointments`
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
          footer={null}
          width={600}
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
              
              <div className="modal-actions">
                <Space>
                  <Button
                    type="primary"
                    onClick={() => handleStatusUpdate(selectedAppointment._id, 'confirmed')}
                  >
                    Confirm Appointment
                  </Button>
                  <Button
                    danger
                    onClick={() => {
                      setViewModalVisible(false);
                      setCancelModalVisible(true);
                    }}
                  >
                    Cancel Appointment
                  </Button>
                </Space>
              </div>
            </div>
          )}
        </Modal>

        {/* Cancel Modal */}
        <Modal
          title="Cancel Appointment"
          visible={cancelModalVisible}
          onOk={() => handleStatusUpdate(selectedAppointment?._id, 'cancelled')}
          onCancel={() => {
            setCancelModalVisible(false);
            setCancelReason('');
          }}
        >
          <Input.TextArea
            placeholder="Enter reason for cancellation"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={4}
          />
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default PendingAppointments;