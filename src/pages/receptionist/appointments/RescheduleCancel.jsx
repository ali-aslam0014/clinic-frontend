import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Space,
  Button,
  Modal,
  Form,
  Select,
  DatePicker,
  Input,
  message,
  Tag,
  Tooltip,
  Row,
  Col
} from 'antd';
import {
  CalendarOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  SwapOutlined
} from '@ant-design/icons';
import moment from 'moment';
import appointmentAPI from '../../../services/appointmentAPI';
import './RescheduleCancel.css';

const { Option } = Select;
const { TextArea } = Input;

const RescheduleCancel = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getUpcomingAppointments();
      setAppointments(response.data);
    } catch (error) {
      message.error('Error fetching appointments: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async (values) => {
    try {
      setLoading(true);
      await appointmentAPI.rescheduleAppointment(selectedAppointment._id, {
        appointmentDate: values.newDate.format('YYYY-MM-DD'),
        timeSlot: {
          start: values.newTimeSlot.split('-')[0].trim(),
          end: values.newTimeSlot.split('-')[1].trim()
        }
      });
      message.success('Appointment rescheduled successfully');
      setRescheduleModalVisible(false);
      fetchAppointments();
    } catch (error) {
      message.error('Error rescheduling appointment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (values) => {
    try {
      setLoading(true);
      await appointmentAPI.cancelAppointment(selectedAppointment._id, {
        reason: values.cancelReason
      });
      message.success('Appointment cancelled successfully');
      setCancelModalVisible(false);
      fetchAppointments();
    } catch (error) {
      message.error('Error cancelling appointment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (date) => {
    if (!selectedAppointment || !date) return;
    
    try {
      const response = await appointmentAPI.getAvailableSlots(
        selectedAppointment.doctorId._id,
        date.format('YYYY-MM-DD')
      );
      setAvailableSlots(response.data);
    } catch (error) {
      message.error('Error fetching available slots: ' + error.message);
    }
  };

  const columns = [
    {
      title: 'Patient',
      dataIndex: ['patientId'],
      key: 'patient',
      render: (patient) => `${patient.firstName} ${patient.lastName}`,
      filteredValue: [searchText],
      onFilter: (value, record) => {
        const patient = record.patientId;
        return `${patient.firstName} ${patient.lastName} ${patient.contactNumber}`
          .toLowerCase()
          .includes(value.toLowerCase());
      }
    },
    {
      title: 'Doctor',
      dataIndex: ['doctorId'],
      key: 'doctor',
      render: (doctor) => `Dr. ${doctor.name}`
    },
    {
      title: 'Date',
      dataIndex: 'appointmentDate',
      key: 'date',
      render: (date) => moment(date).format('DD-MM-YYYY')
    },
    {
      title: 'Time',
      dataIndex: 'timeSlot',
      key: 'time',
      render: (timeSlot) => (
        `${moment(timeSlot.start, 'HH:mm').format('hh:mm A')} - 
         ${moment(timeSlot.end, 'HH:mm').format('hh:mm A')}`
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'Emergency' ? 'red' : 'blue'}>
          {type}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'confirmed' ? 'green' :
          status === 'cancelled' ? 'red' :
          'orange'
        }>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Reschedule">
            <Button
              icon={<SwapOutlined />}
              onClick={() => {
                setSelectedAppointment(record);
                setRescheduleModalVisible(true);
              }}
              disabled={record.status === 'cancelled'}
            />
          </Tooltip>
          <Tooltip title="Cancel">
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => {
                setSelectedAppointment(record);
                setCancelModalVisible(true);
              }}
              disabled={record.status === 'cancelled'}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="reschedule-cancel">
      <Card title="Manage Appointments">
        <Row gutter={[16, 16]} className="table-header">
          <Col xs={24} sm={8}>
            <Input
              placeholder="Search patient name or phone"
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={appointments}
          rowKey="_id"
          loading={loading}
        />

        {/* Reschedule Modal */}
        <Modal
          title="Reschedule Appointment"
          visible={rescheduleModalVisible}
          onCancel={() => setRescheduleModalVisible(false)}
          footer={null}
        >
          <Form
            form={form}
            onFinish={handleReschedule}
            layout="vertical"
          >
            <Form.Item
              name="newDate"
              label="New Date"
              rules={[{ required: true, message: 'Please select new date' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                disabledDate={(current) => current && current < moment().startOf('day')}
                onChange={fetchAvailableSlots}
              />
            </Form.Item>

            <Form.Item
              name="newTimeSlot"
              label="New Time Slot"
              rules={[{ required: true, message: 'Please select new time slot' }]}
            >
              <Select placeholder="Select time slot">
                {availableSlots.map((slot, index) => (
                  <Option key={index} value={`${slot.start} - ${slot.end}`}>
                    {moment(slot.start, 'HH:mm').format('hh:mm A')} - 
                    {moment(slot.end, 'HH:mm').format('hh:mm A')}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Reschedule
                </Button>
                <Button onClick={() => setRescheduleModalVisible(false)}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Cancel Modal */}
        <Modal
          title="Cancel Appointment"
          visible={cancelModalVisible}
          onCancel={() => setCancelModalVisible(false)}
          footer={null}
        >
          <Form
            form={form}
            onFinish={handleCancel}
            layout="vertical"
          >
            <Form.Item
              name="cancelReason"
              label="Cancellation Reason"
              rules={[{ required: true, message: 'Please enter cancellation reason' }]}
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" danger htmlType="submit" loading={loading}>
                  Cancel Appointment
                </Button>
                <Button onClick={() => setCancelModalVisible(false)}>
                  Close
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default RescheduleCancel;