import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Tag,
  Space,
  Tooltip,
  Modal,
  message,
  Badge,
  Select,
  DatePicker,
  Input,
  Row,
  Col
} from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import DoctorLayout from '../../../components/doctor/Layout';
import './AppointmentList.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: null,
    searchText: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, [filters]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {
        doctorId: localStorage.getItem('doctorId'),
        status: filters.status !== 'all' ? filters.status : undefined,
        startDate: filters.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: filters.dateRange?.[1]?.format('YYYY-MM-DD'),
        search: filters.searchText || undefined
      };

      const response = await axios.get('/api/appointments', { params });
      setAppointments(response.data.data);
    } catch (error) {
      message.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await axios.put(`/api/appointments/${appointmentId}/status`, {
        status: newStatus
      });
      message.success('Appointment status updated successfully');
      fetchAppointments();
    } catch (error) {
      message.error('Failed to update appointment status');
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'warning', text: 'Pending' },
      confirmed: { color: 'processing', text: 'Confirmed' },
      completed: { color: 'success', text: 'Completed' },
      cancelled: { color: 'error', text: 'Cancelled' },
      'no-show': { color: 'default', text: 'No Show' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: 'Date & Time',
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
      render: (date, record) => (
        <Space direction="vertical" size={0}>
          <span>{moment(date).format('DD/MM/YYYY')}</span>
          <small style={{ color: '#8c8c8c' }}>
            {record.timeSlot.start} - {record.timeSlot.end}
          </small>
        </Space>
      ),
      sorter: (a, b) => moment(a.appointmentDate).unix() - moment(b.appointmentDate).unix()
    },
    {
      title: 'Patient',
      dataIndex: ['patientId', 'name'],
      key: 'patientName',
      render: (name, record) => (
        <Space direction="vertical" size={0}>
          <span>{name}</span>
          <small style={{ color: '#8c8c8c' }}>{record.patientId.phone}</small>
        </Space>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag>{type}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const colorMap = {
          Low: 'green',
          Medium: 'blue',
          High: 'orange',
          Urgent: 'red'
        };
        return <Tag color={colorMap[priority]}>{priority}</Tag>;
      }
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
          {record.status === 'pending' && (
            <Tooltip title="Confirm">
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleStatusChange(record._id, 'confirmed')}
              />
            </Tooltip>
          )}
          {['pending', 'confirmed'].includes(record.status) && (
            <Tooltip title="Cancel">
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleStatusChange(record._id, 'cancelled')}
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  return (
    <DoctorLayout>
      <div className="appointment-list-container">
        <Card 
          title="Appointments List"
          extra={
            <Space>
              <Input
                placeholder="Search patient name"
                prefix={<SearchOutlined />}
                onChange={(e) => setFilters(prev => ({ ...prev, searchText: e.target.value }))}
                allowClear
              />
              <RangePicker
                onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
              />
              <Select
                defaultValue="all"
                style={{ width: 120 }}
                onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <Option value="all">All Status</Option>
                <Option value="pending">Pending</Option>
                <Option value="confirmed">Confirmed</Option>
                <Option value="completed">Completed</Option>
                <Option value="cancelled">Cancelled</Option>
                <Option value="no-show">No Show</Option>
              </Select>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={appointments}
            loading={loading}
            rowKey="_id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} appointments`
            }}
          />
        </Card>

        {/* View Appointment Modal Content */}
        <Modal
          title="Appointment Details"
          visible={viewModalVisible}
          onCancel={() => {
            setViewModalVisible(false);
            setSelectedAppointment(null);
          }}
          footer={[
            <Button 
              key="close" 
              onClick={() => {
                setViewModalVisible(false);
                setSelectedAppointment(null);
              }}
            >
              Close
            </Button>,
            selectedAppointment?.status === 'pending' && (
              <Button
                key="confirm"
                type="primary"
                onClick={() => handleStatusChange(selectedAppointment._id, 'confirmed')}
              >
                Confirm Appointment
              </Button>
            )
          ].filter(Boolean)}
          width={700}
        >
          {selectedAppointment && (
            <div className="appointment-details">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div className="detail-header">
                    <Space>
                      {getStatusTag(selectedAppointment.status)}
                      <Tag color={selectedAppointment.priority === 'High' ? 'red' : 'blue'}>
                        {selectedAppointment.priority} Priority
                      </Tag>
                    </Space>
                  </div>
                </Col>

                <Col span={12}>
                  <div className="detail-item">
                    <label>Patient Name</label>
                    <p>{selectedAppointment.patientId.name}</p>
                  </div>
                </Col>

                <Col span={12}>
                  <div className="detail-item">
                    <label>Contact Number</label>
                    <p>{selectedAppointment.patientId.phone}</p>
                  </div>
                </Col>

                <Col span={12}>
                  <div className="detail-item">
                    <label>Appointment Date</label>
                    <p>{moment(selectedAppointment.appointmentDate).format('DD MMMM, YYYY')}</p>
                  </div>
                </Col>

                <Col span={12}>
                  <div className="detail-item">
                    <label>Time Slot</label>
                    <p>{selectedAppointment.timeSlot.start} - {selectedAppointment.timeSlot.end}</p>
                  </div>
                </Col>

                <Col span={12}>
                  <div className="detail-item">
                    <label>Appointment Type</label>
                    <p>{selectedAppointment.type}</p>
                  </div>
                </Col>

                <Col span={12}>
                  <div className="detail-item">
                    <label>Created On</label>
                    <p>{moment(selectedAppointment.createdAt).format('DD/MM/YYYY HH:mm')}</p>
                  </div>
                </Col>

                <Col span={24}>
                  <div className="detail-item">
                    <label>Reason for Visit</label>
                    <p>{selectedAppointment.reason}</p>
                  </div>
                </Col>

                {selectedAppointment.notes && (
                  <Col span={24}>
                    <div className="detail-item">
                      <label>Additional Notes</label>
                      <p>{selectedAppointment.notes}</p>
                    </div>
                  </Col>
                )}

                {selectedAppointment.status === 'cancelled' && (
                  <Col span={24}>
                    <div className="detail-item cancelled-info">
                      <label>Cancellation Details</label>
                      <p>
                        Cancelled on {moment(selectedAppointment.cancelledBy?.date).format('DD/MM/YYYY HH:mm')}
                        {selectedAppointment.cancelledBy?.reason && (
                          <> - Reason: {selectedAppointment.cancelledBy.reason}</>
                        )}
                      </p>
                    </div>
                  </Col>
                )}
              </Row>
            </div>
          )}
        </Modal>
      </div>
    </DoctorLayout>
  );
};

export default AppointmentList;