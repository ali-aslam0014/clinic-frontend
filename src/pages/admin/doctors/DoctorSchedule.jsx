import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Select, 
  TimePicker, 
  message, 
  Card, 
  Calendar,
  Badge
} from 'antd';
import moment from 'moment';
import axios from 'axios';
import './DoctorSchedule.css';
import AdminLayout from '../../../components/admin/Layout';

const { Option } = Select;

const DoctorSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [form] = Form.useForm();

  // Fetch doctors and their schedules
  useEffect(() => {
    fetchDoctors();
    fetchSchedules();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/doctors/admin/doctors', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Fetched doctors:', response.data.data); // Debug log
      setDoctors(response.data.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      message.error('Failed to fetch doctors');
    }
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/v1/schedules', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('API Response:', response.data); // Check API response
      console.log('Schedules data:', response.data.data); // Check schedules data
      
      setSchedules(response.data.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      message.error('Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  // Update fetchSchedules when doctors list changes
  useEffect(() => {
    if (doctors.length > 0) {
      fetchSchedules();
    }
  }, [doctors]);

  const handleSubmit = async (values) => {
    try {
      if (!values.timeSlots || values.timeSlots.length === 0) {
        message.error('Please add at least one time slot');
        return;
      }

      const formattedValues = {
        doctorId: values.doctorId,
        timeSlots: values.timeSlots.map(slot => ({
          day: slot.day,
          startTime: slot.startTime.format('HH:mm'),
          endTime: slot.endTime.format('HH:mm')
        }))
      };

      console.log('Submitting schedule:', formattedValues); // Debug log

      await axios.post('http://localhost:8080/api/v1/schedules', formattedValues, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      message.success('Schedule added successfully');
      setModalVisible(false);
      form.resetFields();
      fetchSchedules();
    } catch (error) {
      console.error('Error adding schedule:', error);
      message.error('Failed to add schedule');
    }
  };

  const columns = [
    {
      title: 'Doctor',
      key: 'doctor',
      render: (text, record) => {
        console.log('Record in column:', record); // Check record data
        return record.doctorId?.name || record.doctor?.name || 'Unknown Doctor';
      }
    },
    {
      title: 'Day',
      dataIndex: ['timeSlots', '0', 'day'],
      key: 'day',
    },
    {
      title: 'Start Time',
      dataIndex: ['timeSlots', '0', 'startTime'],
      key: 'startTime',
    },
    {
      title: 'End Time',
      dataIndex: ['timeSlots', '0', 'endTime'],
      key: 'endTime',
    },
    {
      title: 'Max Appointments',
      dataIndex: 'maxAppointments',
      key: 'maxAppointments',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={status === 'active' ? 'success' : 'error'} 
          text={status?.toUpperCase() || 'ACTIVE'} 
        />
      ),
    },
  ];

  // Update Calendar render function
  const dateCellRender = (date) => {
    const scheduleForDate = schedules.filter(schedule => {
      // Filter schedules based on the day of week
      const scheduleDay = schedule.timeSlots?.[0]?.day;
      const currentDay = date.format('dddd');
      return scheduleDay === currentDay;
    });

    if (scheduleForDate.length === 0) return null;

    return scheduleForDate.map(schedule => {
      const timeSlot = schedule.timeSlots?.[0];
      return (
        <Badge 
          key={schedule._id}
          status="processing" 
          text={`${schedule.doctor?.name || 'Loading...'} (${timeSlot?.startTime || ''}-${timeSlot?.endTime || ''})`}
        />
      );
    });
  };

  return (
    <AdminLayout>
      <div className="schedule-container">
        <div className="schedule-header">
          <h2>Doctor Schedules</h2>
          <Button 
            type="primary" 
            onClick={() => setModalVisible(true)}
          >
            Add Schedule
          </Button>
        </div>

        <div className="schedule-content">
          <Card className="schedule-calendar">
            <Calendar
              fullscreen={false}
              dateCellRender={dateCellRender}
            />
          </Card>

          <Table 
            columns={columns}
            dataSource={schedules.map(schedule => ({
              ...schedule,
              startTime: schedule.timeSlots?.[0]?.startTime,
              endTime: schedule.timeSlots?.[0]?.endTime,
              day: schedule.timeSlots?.[0]?.day
            }))}
            loading={loading}
            rowKey="_id"
          />
        </div>

        <Modal
          title="Add Schedule"
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="doctorId"
              label="Select Doctor"
              rules={[{ required: true, message: 'Please select a doctor' }]}
            >
              <Select
                placeholder="Select doctor"
                onChange={(value) => setSelectedDoctor(value)}
              >
                {doctors.map(doctor => (
                  <Option key={doctor._id} value={doctor._id}>
                    {doctor.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.List name="timeSlots">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} style={{ display: 'flex', gap: '8px' }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'day']}
                        rules={[{ required: true, message: 'Missing day' }]}
                      >
                        <Select placeholder="Select day">
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                            <Option key={day} value={day}>{day}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'startTime']}
                        rules={[{ required: true, message: 'Missing start time' }]}
                      >
                        <TimePicker format="HH:mm" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'endTime']}
                        rules={[{ required: true, message: 'Missing end time' }]}
                      >
                        <TimePicker format="HH:mm" />
                      </Form.Item>
                      <Button onClick={() => remove(name)} type="link" danger>
                        Delete
                      </Button>
                    </div>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block>
                      Add Time Slot
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save Schedule
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default DoctorSchedule;