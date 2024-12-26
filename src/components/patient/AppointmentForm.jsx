import React, { useState, useEffect } from 'react';
import { Form, Select, DatePicker, TimePicker, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import './AppointmentForm.css';

const { Option } = Select;
const { TextArea } = Input;

const AppointmentForm = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const patient = JSON.parse(localStorage.getItem('patient'));

  // Fetch doctors list
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/v1/doctors');
        setDoctors(response.data.data);
      } catch (error) {
        message.error('Failed to fetch doctors');
      }
    };
    fetchDoctors();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const appointmentData = {
        doctorId: values.doctorId,
        patientId: patient._id,
        appointmentDate: values.date.format('YYYY-MM-DD'),
        appointmentTime: values.time.format('HH:mm'),
        reason: values.reason,
        status: 'pending'
      };

      const response = await axios.post(
        'http://localhost:8080/api/v1/appointments/book',
        appointmentData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        message.success('Appointment booked successfully!');
        navigate('/patient/appointments');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="appointment-form-container">
      <h2>Book an Appointment</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          name="doctorId"
          label="Select Doctor"
          rules={[{ required: true, message: 'Please select a doctor' }]}
        >
          <Select placeholder="Select a doctor">
            {doctors.map(doctor => (
              <Option key={doctor._id} value={doctor._id}>
                Dr. {doctor.name} - {doctor.specialization}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="date"
          label="Appointment Date"
          rules={[{ required: true, message: 'Please select a date' }]}
        >
          <DatePicker
            disabledDate={(current) => {
              return current && current < moment().startOf('day');
            }}
          />
        </Form.Item>

        <Form.Item
          name="time"
          label="Preferred Time"
          rules={[{ required: true, message: 'Please select a time' }]}
        >
          <TimePicker format="HH:mm" minuteStep={30} />
        </Form.Item>

        <Form.Item
          name="reason"
          label="Reason for Visit"
          rules={[{ required: true, message: 'Please provide a reason' }]}
        >
          <TextArea rows={4} placeholder="Please describe your symptoms or reason for visit" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Book Appointment
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AppointmentForm;