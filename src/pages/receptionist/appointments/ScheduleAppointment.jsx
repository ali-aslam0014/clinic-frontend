import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  message,
  Row,
  Col,
  TimePicker,
  Space,
  Divider
} from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axiosInstance from '../../../utils/axiosConfig';
import './ScheduleAppointment.css';

const { Option } = Select;

const ScheduleAppointment = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axiosInstance.get('/doctors');
      setDoctors(response.data.data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      message.error('Error fetching doctors: ' + error.message);
      setDoctors([]);
    }
  };

  const fetchAvailableSlots = async (doctorId, date) => {
    try {
      if (!doctorId || !date) return;
      
      const response = await axiosInstance.get(`/appointments/slots`, {
        params: {
          doctorId,
          date: date.format('YYYY-MM-DD')
        }
      });
      setAvailableSlots(response.data.data || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
      message.error('Error fetching available slots: ' + error.message);
      setAvailableSlots([]);
    }
  };

  const handleDoctorChange = (value) => {
    setSelectedDoctor(value);
    form.setFieldsValue({ timeSlot: undefined });
    if (selectedDate) {
      fetchAvailableSlots(value, selectedDate);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    form.setFieldsValue({ timeSlot: undefined });
    if (selectedDoctor) {
      fetchAvailableSlots(selectedDoctor, date);
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const appointmentData = {
        ...values,
        appointmentDate: values.appointmentDate.format('YYYY-MM-DD'),
        timeSlot: {
          start: values.timeSlot.split('-')[0].trim(),
          end: values.timeSlot.split('-')[1].trim()
        }
      };

      await axiosInstance.post('/appointments', appointmentData);
      message.success('Appointment scheduled successfully');
      form.resetFields();
      setAvailableSlots([]);
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      message.error('Error scheduling appointment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const disabledDate = (current) => {
    return current && current < moment().startOf('day');
  };

  return (
    <div className="schedule-appointment">
      <Card title="Schedule New Appointment">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            type: 'New Visit',
            priority: 'Medium'
          }}
        >
          <Row gutter={16}>
            {/* Patient Information */}
            <Col xs={24} md={12}>
              <Card type="inner" title="Patient Information">
                <Form.Item
                  name="firstName"
                  label="First Name"
                  rules={[{ required: true, message: 'Please enter first name' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="First Name" />
                </Form.Item>

                <Form.Item
                  name="lastName"
                  label="Last Name"
                  rules={[{ required: true, message: 'Please enter last name' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Last Name" />
                </Form.Item>

                <Form.Item
                  name="contactNumber"
                  label="Contact Number"
                  rules={[
                    { required: true, message: 'Please enter contact number' },
                    { pattern: /^[0-9]{11}$/, message: 'Please enter valid contact number' }
                  ]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="03XXXXXXXXX" />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { type: 'email', message: 'Please enter valid email' }
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="Email" />
                </Form.Item>
              </Card>
            </Col>

            {/* Appointment Details */}
            <Col xs={24} md={12}>
              <Card type="inner" title="Appointment Details">
                <Form.Item
                  name="doctorId"
                  label="Select Doctor"
                  rules={[{ required: true, message: 'Please select doctor' }]}
                >
                  <Select
                    placeholder="Select Doctor"
                    onChange={handleDoctorChange}
                    showSearch
                    optionFilterProp="children"
                  >
                    {doctors.map(doctor => (
                      <Option key={doctor._id} value={doctor._id}>
                        Dr. {doctor.name} - {doctor.specialization}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="appointmentDate"
                  label="Appointment Date"
                  rules={[{ required: true, message: 'Please select date' }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    disabledDate={disabledDate}
                    onChange={handleDateChange}
                    format="YYYY-MM-DD"
                  />
                </Form.Item>

                <Form.Item
                  name="timeSlot"
                  label="Time Slot"
                  rules={[{ required: true, message: 'Please select time slot' }]}
                >
                  <Select placeholder="Select Time Slot">
                    {availableSlots.map((slot, index) => (
                      <Option key={index} value={`${slot.start} - ${slot.end}`}>
                        {moment(slot.start, 'HH:mm').format('hh:mm A')} - {moment(slot.end, 'HH:mm').format('hh:mm A')}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

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
                  name="priority"
                  label="Priority"
                  rules={[{ required: true }]}
                >
                  <Select>
                    <Option value="Low">Low</Option>
                    <Option value="Medium">Medium</Option>
                    <Option value="High">High</Option>
                    <Option value="Urgent">Urgent</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="reason"
                  label="Reason for Visit"
                  rules={[{ required: true, message: 'Please enter reason' }]}
                >
                  <Input.TextArea rows={4} placeholder="Enter reason for visit" />
                </Form.Item>
              </Card>
            </Col>
          </Row>

          <Divider />

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Schedule Appointment
              </Button>
              <Button onClick={() => form.resetFields()}>
                Reset
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ScheduleAppointment;