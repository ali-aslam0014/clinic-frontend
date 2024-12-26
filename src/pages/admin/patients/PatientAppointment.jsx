import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  TimePicker,
  Space,
  Tag,
  message,
  Card,
  Row,
  Col,
  Calendar,
  Badge,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  UserOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { appointmentAPI } from '../../../services/api';
import AdminLayout from '../../../components/admin/Layout';
import './PatientAppointment.css';

const { Option } = Select;
const { TextArea } = Input;

const PatientAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [form] = Form.useForm();
  const { patientId } = useParams();
  const navigate = useNavigate();

  // Add validation for patientId
  useEffect(() => {
    if (!patientId) {
      message.error('Patient ID is missing');
      navigate('/admin/patients/appointments'); // Redirect to patients list
      return;
    }
  }, [patientId, navigate]);

  // Fetch appointments and doctors
  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching appointments for patient:', patientId); // Debug log

      const [appointmentsRes, doctorsRes] = await Promise.all([
        appointmentAPI.fetchAppointments(patientId),
        axios.get('/api/v1/admin/doctors')
      ]);

      setAppointments(appointmentsRes.data.data);
      setDoctors(doctorsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [patientId]);

  const columns = [
    {
      title: 'Date',
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.appointmentDate) - moment(b.appointmentDate),
    },
    {
      title: 'Time',
      dataIndex: 'appointmentTime',
      key: 'appointmentTime',
      render: (time) => moment(time, 'HH:mm').format('hh:mm A'),
    },
    {
      title: 'Doctor',
      dataIndex: 'doctorId',
      key: 'doctorId',
      render: (doctor) => doctor?.name || 'N/A',
    },
    {
      title: 'Type',
      dataIndex: 'appointmentType',
      key: 'appointmentType',
      render: (type) => (
        <Tag color={
          type === 'regular' ? 'blue' :
          type === 'followup' ? 'green' :
          type === 'emergency' ? 'red' :
          'default'
        }>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'scheduled' ? 'processing' :
          status === 'completed' ? 'success' :
          status === 'cancelled' ? 'error' :
          'default'
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
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Cancel">
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleCancel(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Calendar dateCellRender
  const dateCellRender = (value) => {
    const listData = appointments.filter(app => 
      moment(app.appointmentDate).isSame(value, 'day')
    );

    return (
      <ul className="calendar-events">
        {listData.map(item => (
          <li key={item._id}>
            <Badge
              status={
                item.status === 'scheduled' ? 'processing' :
                item.status === 'completed' ? 'success' :
                'error'
              }
              text={`${moment(item.appointmentTime, 'HH:mm').format('HH:mm')} - ${item.doctorId?.name}`}
            />
          </li>
        ))}
      </ul>
    );
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        patientId,
        appointmentDate: values.appointmentDate.format('YYYY-MM-DD'),
        appointmentTime: values.appointmentTime.format('HH:mm'),
      };

      if (selectedAppointment) {
        await appointmentAPI.updateAppointment(selectedAppointment._id, data);
        message.success('Appointment updated successfully');
      } else {
        await appointmentAPI.createAppointment(data);
        message.success('Appointment scheduled successfully');
      }

      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error('Failed to save appointment');
    }
  };

  // Handle edit appointment
  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    form.setFieldsValue({
      ...appointment,
      appointmentDate: moment(appointment.appointmentDate),
      appointmentTime: moment(appointment.appointmentTime, 'HH:mm'),
      doctorId: appointment.doctorId?._id,
    });
    setModalVisible(true);
  };

  // Handle cancel appointment
  const handleCancel = async (appointmentId) => {
    try {
      await appointmentAPI.cancelAppointment(appointmentId);
      message.success('Appointment cancelled successfully');
      fetchData();
    } catch (error) {
      message.error('Failed to cancel appointment');
    }
  };

  return (
    <AdminLayout>
      <div className="appointments-container">
        <div className="appointments-header">
          <h2>Patient Appointments</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedAppointment(null);
              setModalVisible(true);
            }}
          >
            New Appointment
          </Button>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card title="Appointments List" className="appointments-table-card">
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
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Calendar View" className="appointments-calendar-card">
              <Calendar
                fullscreen={false}
                value={selectedDate}
                onChange={setSelectedDate}
                dateCellRender={dateCellRender}
              />
            </Card>
          </Col>
        </Row>

        {/* Appointment Modal */}
        <Modal
          title={selectedAppointment ? "Edit Appointment" : "New Appointment"}
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setSelectedAppointment(null);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="appointmentDate"
                  label="Date"
                  rules={[{ required: true, message: 'Please select date' }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    disabledDate={(current) => current && current < moment().startOf('day')}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="appointmentTime"
                  label="Time"
                  rules={[{ required: true, message: 'Please select time' }]}
                >
                  <TimePicker
                    style={{ width: '100%' }}
                    format="HH:mm"
                    minuteStep={15}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="doctorId"
              label="Doctor"
              rules={[{ required: true, message: 'Please select doctor' }]}
            >
              <Select
                placeholder="Select doctor"
                showSearch
                optionFilterProp="children"
              >
                {doctors.map(doctor => (
                  <Option key={doctor._id} value={doctor._id}>
                    {doctor.name} - {doctor.specialization}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="appointmentType"
              label="Appointment Type"
              rules={[{ required: true, message: 'Please select type' }]}
            >
              <Select placeholder="Select type">
                <Option value="regular">Regular Checkup</Option>
                <Option value="followup">Follow-up</Option>
                <Option value="emergency">Emergency</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="reason"
              label="Reason for Visit"
              rules={[{ required: true, message: 'Please enter reason' }]}
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item
              name="notes"
              label="Additional Notes"
            >
              <TextArea rows={3} />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {selectedAppointment ? 'Update Appointment' : 'Schedule Appointment'}
                </Button>
                <Button onClick={() => {
                  setModalVisible(false);
                  setSelectedAppointment(null);
                  form.resetFields();
                }}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default PatientAppointment;