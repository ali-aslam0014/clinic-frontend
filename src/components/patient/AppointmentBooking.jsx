import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Select, 
  DatePicker, 
  Input, 
  Button, 
  message, 
  Card,
  Radio,
  Timeline,
  Spin,
  Empty
} from 'antd';
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import './AppointmentBooking.css';

const { Option } = Select;
const { TextArea } = Input;

const AppointmentBooking = () => {
  const [form] = Form.useForm();
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Fetch doctors list
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/v1/doctors', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setDoctors(response.data.data);
      } catch (error) {
        message.error('Failed to fetch doctors list');
      }
    };
    fetchDoctors();
  }, []);

  // Fetch available slots when doctor and date are selected
  const fetchAvailableSlots = async (doctorId, date) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8080/api/v1/appointments/available-slots`,
        {
          params: { 
            doctorId,
            date: date.format('YYYY-MM-DD')
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setAvailableSlots(response.data.data);
      } else {
        message.error('No available slots found');
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Fetch slots error:', error.response?.data || error);
      message.error('Failed to fetch available slots');
      setAvailableSlots([]);
    } finally {
      setLoading(false);
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
    setLoading(true);
    try {
      const appointmentData = {
        doctorId: values.doctorId,
        appointmentDate: values.date.format('YYYY-MM-DD'),
        timeSlot: {
          start: values.timeSlot.split('-')[0].trim(),
          end: values.timeSlot.split('-')[1].trim()
        },
        reason: values.reason,
        type: values.type
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
        form.resetFields();
        setAvailableSlots([]);
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="appointment-booking-card">
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
          <Select
            placeholder="Select a doctor"
            onChange={handleDoctorChange}
            loading={loading}
          >
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
            onChange={handleDateChange}
            disabledDate={current => {
              return current && current < moment().startOf('day');
            }}
            className="w-100"
          />
        </Form.Item>

        <Form.Item
          name="timeSlot"
          label="Available Time Slots"
          rules={[{ required: true, message: 'Please select a time slot' }]}
        >
          {loading ? (
            <Spin />
          ) : availableSlots.length > 0 ? (
            <Radio.Group className="time-slots-group">
              {availableSlots.map((slot, index) => (
                <Radio.Button 
                  key={index} 
                  value={`${slot.start}-${slot.end}`}
                  className="time-slot-option"
                >
                  {slot.start} - {slot.end}
                </Radio.Button>
              ))}
            </Radio.Group>
          ) : (
            <Empty description="No slots available for selected date" />
          )}
        </Form.Item>

        <Form.Item
          name="type"
          label="Appointment Type"
          rules={[{ required: true, message: 'Please select appointment type' }]}
        >
          <Select placeholder="Select appointment type">
            <Option value="New Visit">New Visit</Option>
            <Option value="Follow-up">Follow-up</Option>
            <Option value="Consultation">Consultation</Option>
            <Option value="Emergency">Emergency</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="reason"
          label="Reason for Visit"
          rules={[{ required: true, message: 'Please provide a reason' }]}
        >
          <TextArea 
            rows={4} 
            placeholder="Please describe your symptoms or reason for visit"
          />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            block
          >
            Book Appointment
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AppointmentBooking;