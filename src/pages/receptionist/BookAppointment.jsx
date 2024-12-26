import React, { useState } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Button,
  Card,
  Row,
  Col,
  message,
  Space
} from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { appointmentAPI } from '../../services/api';

const { Option } = Select;

const BookAppointment = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Mock data (replace with API calls later)
  const doctors = [
    { id: 1, name: 'Dr. John Doe', specialization: 'General Physician' },
    { id: 2, name: 'Dr. Jane Smith', specialization: 'Cardiologist' },
    // Add more doctors
  ];

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM',
    '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'
  ];

  const onFinish = async (values) => {
    try {
      setLoading(true);
      
      const formattedData = {
        patientName: values.patientName,
        patientPhone: values.phone,
        doctorId: values.doctor,
        appointmentDate: moment(values.date).format('YYYY-MM-DD'),
        appointmentTime: values.time,
        appointmentType: values.type,
        reason: values.reason
      };

      console.log('Booking appointment:', formattedData);

      const result = await appointmentAPI.createAppointment(formattedData);
      
      if (result.success) {
        message.success('Appointment booked successfully!');
        form.resetFields();
      }
    } catch (error) {
      console.error('Booking error:', error);
      message.error('Failed to book appointment: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Disable past dates
  const disabledDate = (current) => {
    return current && current < moment().startOf('day');
  };

  return (
    <Card title="Book Appointment" className="appointment-card">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          type: 'regular'
        }}
      >
        <Row gutter={16}>
          {/* Patient Information */}
          <Col xs={24} sm={12}>
            <Form.Item
              name="patientName"
              label="Patient Name"
              rules={[{ required: true, message: 'Please enter patient name' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Enter patient name" />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12}>
            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[
                { required: true, message: 'Please enter phone number' },
                { pattern: /^03\d{9}$/, message: 'Please enter valid phone number' }
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="03XXXXXXXXX" maxLength={11} />
            </Form.Item>
          </Col>

          {/* Appointment Details */}
          <Col xs={24} sm={12}>
            <Form.Item
              name="doctor"
              label="Select Doctor"
              rules={[{ required: true, message: 'Please select a doctor' }]}
            >
              <Select placeholder="Select doctor">
                {doctors.map(doctor => (
                  <Option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialization}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="type"
              label="Appointment Type"
              rules={[{ required: true, message: 'Please select appointment type' }]}
            >
              <Select placeholder="Select type">
                <Option value="regular">Regular</Option>
                <Option value="followup">Follow-up</Option>
                <Option value="emergency">Emergency</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="date"
              label="Appointment Date"
              rules={[{ required: true, message: 'Please select date' }]}
            >
              <DatePicker 
                style={{ width: '100%' }}
                disabledDate={disabledDate}
                onChange={(date) => setSelectedDate(date)}
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="time"
              label="Preferred Time"
              rules={[{ required: true, message: 'Please select time' }]}
            >
              <Select placeholder="Select time slot">
                {timeSlots.map(slot => (
                  <Option key={slot} value={slot}>
                    {slot}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Reason/Notes */}
          <Col xs={24}>
            <Form.Item
              name="reason"
              label="Reason for Visit"
              rules={[{ required: true, message: 'Please enter reason for visit' }]}
            >
              <Input.TextArea rows={4} placeholder="Enter reason for visit" />
            </Form.Item>
          </Col>
        </Row>

        {/* Submit Button */}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Book Appointment
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default BookAppointment;