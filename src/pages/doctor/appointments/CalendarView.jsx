import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Badge,
  Card,
  Modal,
  Form,
  Input,
  Select,
  TimePicker,
  Button,
  message,
  Tooltip,
  Tag,
  Row,
  Col,
  Drawer,
  Spin,
  Space
} from 'antd';
import {
  PlusOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import DoctorLayout from '../../../components/doctor/Layout';
import './CalendarView.css';

const { Option } = Select;
const { TextArea } = Input;

const CalendarView = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [patients, setPatients] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, patientsRes] = await Promise.all([
        fetchAppointments(),
        fetchPatients()
      ]);
      setAppointments(appointmentsRes.data.data || []);
      setPatients(patientsRes.data.data || []);
    } catch (error) {
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = () => {
    return axios.get('/api/appointments/date-range', {
      params: {
        start: moment().startOf('month').format('YYYY-MM-DD'),
        end: moment().endOf('month').format('YYYY-MM-DD'),
        doctorId: localStorage.getItem('doctorId')
      }
    });
  };

  const fetchPatients = () => {
    return axios.get('/api/patients');
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    form.setFieldsValue({
      appointmentDate: date,
    });
    setModalVisible(true);
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setDrawerVisible(true);
  };

  const dateCellRender = (value) => {
    const dayAppointments = appointments.filter(app => 
      moment(app.appointmentDate).isSame(value, 'day')
    );

    return (
      <ul className="appointments-list">
        {dayAppointments.map(app => (
          <li key={app._id} onClick={() => handleAppointmentClick(app)}>
            <Badge
              status={getStatusBadge(app.status)}
              text={
                <Tooltip title={getAppointmentTooltip(app)}>
                  <span>{app.timeSlot.start} - {app.patientId.name}</span>
                </Tooltip>
              }
            />
          </li>
        ))}
      </ul>
    );
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'warning',
      confirmed: 'processing',
      completed: 'success',
      cancelled: 'error',
      'no-show': 'default'
    };
    return statusMap[status] || 'default';
  };

  const getAppointmentTooltip = (appointment) => (
    <div>
      <p><strong>Patient:</strong> {appointment.patientId.name}</p>
      <p><strong>Time:</strong> {appointment.timeSlot.start} - {appointment.timeSlot.end}</p>
      <p><strong>Type:</strong> {appointment.type}</p>
      <p><strong>Status:</strong> {appointment.status}</p>
      <p><strong>Reason:</strong> {appointment.reason}</p>
    </div>
  );

  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        doctorId: localStorage.getItem('doctorId'),
        timeSlot: {
          start: values.timeSlot[0].format('HH:mm'),
          end: values.timeSlot[1].format('HH:mm')
        }
      };

      await axios.post('/api/appointments', data);
      message.success('Appointment created successfully');
      setModalVisible(false);
      form.resetFields();
      fetchAppointments();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to create appointment');
    }
  };

  const handleCancel = async () => {
    try {
      await axios.put(`/api/appointments/${selectedAppointment._id}/cancel`, {
        reason: 'Cancelled by doctor'
      });
      message.success('Appointment cancelled successfully');
      setDrawerVisible(false);
      fetchAppointments();
    } catch (error) {
      message.error('Failed to cancel appointment');
    }
  };

  const renderCalendar = () => {
    if (loading) {
      return <Spin size="large" />;
    }

    return (
      <Calendar
        dateCellRender={dateCellRender}
        onSelect={handleDateSelect}
        className="custom-calendar"
      />
    );
  };

  return (
    <DoctorLayout>
      <div className="calendar-view-container">
        <Card
          title="Appointment Calendar"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
            >
              New Appointment
            </Button>
          }
          className="calendar-card"
        >
          {renderCalendar()}
        </Card>

        {/* New Appointment Modal */}
        <Modal
          title="New Appointment"
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={800}
          destroyOnClose={true}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="patientId"
              label="Patient"
              rules={[{ required: true }]}
            >
              <Select
                showSearch
                placeholder="Select patient"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {patients.map(patient => (
                  <Option key={patient._id} value={patient._id}>
                    {patient.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="appointmentDate"
                  label="Date"
                  rules={[{ required: true }]}
                  initialValue={selectedDate}
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="timeSlot"
                  label="Time Slot"
                  rules={[{ required: true }]}
                >
                  <TimePicker.RangePicker
                    format="HH:mm"
                    minuteStep={15}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="type"
              label="Appointment Type"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="New Visit">New Visit</Option>
                <Option value="Follow-up">Follow-up</Option>
                <Option value="Consultation">Consultation</Option>
                <Option value="Emergency">Emergency</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="reason"
              label="Reason"
              rules={[{ required: true }]}
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item
              name="priority"
              label="Priority"
              initialValue="Medium"
            >
              <Select>
                <Option value="Low">Low</Option>
                <Option value="Medium">Medium</Option>
                <Option value="High">High</Option>
                <Option value="Urgent">Urgent</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Create Appointment
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        {/* Appointment Details Drawer */}
        <Drawer
          title="Appointment Details"
          placement="right"
          onClose={() => {
            setDrawerVisible(false);
            setSelectedAppointment(null);
          }}
          visible={drawerVisible}
          width={600}
          destroyOnClose={true}
          extra={
            <Space>
              <Button 
                type="primary" 
                danger 
                onClick={handleCancel}
                disabled={selectedAppointment?.status === 'cancelled'}
              >
                Cancel Appointment
              </Button>
            </Space>
          }
        >
          {selectedAppointment && (
            <div className="appointment-details">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Tag color={getStatusBadge(selectedAppointment.status)}>
                    {selectedAppointment.status.toUpperCase()}
                  </Tag>
                </Col>
                
                <Col span={12}>
                  <label>Patient Name</label>
                  <p>{selectedAppointment.patientId.name}</p>
                </Col>
                
                <Col span={12}>
                  <label>Phone</label>
                  <p>{selectedAppointment.patientId.phone}</p>
                </Col>
                
                <Col span={12}>
                  <label>Date</label>
                  <p>{moment(selectedAppointment.appointmentDate).format('DD/MM/YYYY')}</p>
                </Col>
                
                <Col span={12}>
                  <label>Time</label>
                  <p>{selectedAppointment.timeSlot.start} - {selectedAppointment.timeSlot.end}</p>
                </Col>
                
                <Col span={12}>
                  <label>Type</label>
                  <p>{selectedAppointment.type}</p>
                </Col>
                
                <Col span={12}>
                  <label>Priority</label>
                  <p>{selectedAppointment.priority}</p>
                </Col>
                
                <Col span={24}>
                  <label>Reason</label>
                  <p>{selectedAppointment.reason}</p>
                </Col>

                {selectedAppointment.notes && (
                  <Col span={24}>
                    <label>Notes</label>
                    <p>{selectedAppointment.notes}</p>
                  </Col>
                )}
              </Row>
            </div>
          )}
        </Drawer>
      </div>
    </DoctorLayout>
  );
};

export default CalendarView;