import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Tag,
  Space,
  Button,
  Modal,
  message,
  Select,
  Input,
  DatePicker
} from 'antd';
import {
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  SearchOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './AllAppointments.css';

const { Option } = Select;
const { RangePicker } = DatePicker;

const AllAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [filters, setFilters] = useState({
    dateRange: [],
    status: '',
    search: ''
  });

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/admin/appointments');
      setAppointments(response.data.data);
    } catch (error) {
      message.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      const data = { status: newStatus };
      if (newStatus === 'cancelled' && cancelReason) {
        data.cancelReason = cancelReason;
      }

      await axios.put(`/api/v1/admin/appointments/${appointmentId}/status`, data);
      message.success('Appointment status updated successfully');
      fetchAppointments();
      setStatusModalVisible(false);
      setCancelReason('');
    } catch (error) {
      message.error('Failed to update appointment status');
    }
  };

  const columns = [
    {
      title: 'Patient',
      dataIndex: ['patientId', 'name'],
      key: 'patientName',
      render: (text, record) => record.patientId?.name || 'N/A',
    },
    {
      title: 'Doctor',
      dataIndex: ['doctorId', 'name'],
      key: 'doctorName',
      render: (text, record) => record.doctorId?.name || 'N/A',
    },
    {
      title: 'Date',
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.appointmentDate) - moment(b.appointmentDate),
    },
    {
      title: 'Time',
      dataIndex: 'timeSlot',
      key: 'timeSlot',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'confirmed' ? 'green' :
          status === 'pending' ? 'gold' :
          'red'
        }>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedAppointment(record);
              setViewModalVisible(true);
            }}
          />
          {record.status === 'pending' && (
            <>
              <Button
                icon={<CheckOutlined />}
                type="primary"
                onClick={() => handleStatusUpdate(record._id, 'confirmed')}
              />
              <Button
                icon={<CloseOutlined />}
                danger
                onClick={() => {
                  setSelectedAppointment(record);
                  setStatusModalVisible(true);
                }}
              />
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="appointments-container">
        <div className="appointments-header">
          <h2>All Appointments</h2>
          
          <div className="filters-section">
            <RangePicker
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
              style={{ marginRight: 16 }}
            />
            
            <Select
              placeholder="Filter by status"
              style={{ width: 150, marginRight: 16 }}
              onChange={(value) => setFilters({ ...filters, status: value })}
              allowClear
            >
              <Option value="pending">Pending</Option>
              <Option value="confirmed">Confirmed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>

            <Input
              placeholder="Search patient or doctor"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={appointments}
          loading={loading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} appointments`
          }}
        />

        {/* View Modal */}
        <Modal
          title="Appointment Details"
          visible={viewModalVisible}
          onCancel={() => {
            setViewModalVisible(false);
            setSelectedAppointment(null);
          }}
          footer={null}
        >
          {selectedAppointment && (
            <div className="appointment-details">
              <p><strong>Patient:</strong> {selectedAppointment.patientId?.name}</p>
              <p><strong>Doctor:</strong> {selectedAppointment.doctorId?.name}</p>
              <p><strong>Date:</strong> {moment(selectedAppointment.appointmentDate).format('DD/MM/YYYY')}</p>
              <p><strong>Time:</strong> {selectedAppointment.timeSlot}</p>
              <p><strong>Status:</strong> {selectedAppointment.status.toUpperCase()}</p>
              <p><strong>Reason:</strong> {selectedAppointment.reason}</p>
              {selectedAppointment.notes && (
                <p><strong>Notes:</strong> {selectedAppointment.notes}</p>
              )}
              {selectedAppointment.cancelReason && (
                <p><strong>Cancellation Reason:</strong> {selectedAppointment.cancelReason}</p>
              )}
            </div>
          )}
        </Modal>

        {/* Cancel Modal */}
        <Modal
          title="Cancel Appointment"
          visible={statusModalVisible}
          onOk={() => handleStatusUpdate(selectedAppointment?._id, 'cancelled')}
          onCancel={() => {
            setStatusModalVisible(false);
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

export default AllAppointments;