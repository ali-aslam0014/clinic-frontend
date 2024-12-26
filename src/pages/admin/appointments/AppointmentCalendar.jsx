import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Modal,
  Button,
  Tag,
  Space,
  message,
  Descriptions,
  Select,
  Row,
  Col
} from 'antd';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import moment from 'moment';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './AppointmentCalendar.css';

const { Option } = Select;

const AppointmentCalendar = () => {
  const calendarRef = useRef(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const config = {
          headers: { 'Authorization': `Bearer ${token}` }
        };

        const [appointmentsRes, doctorsRes] = await Promise.all([
          axios.get('/api/v1/admin/appointments', config),
          axios.get('/api/v1/admin/doctors', config)
        ]);

        if (appointmentsRes.data?.data) {
          const events = appointmentsRes.data.data.map(appointment => ({
            id: appointment._id,
            title: `${appointment.patientId?.name || 'Patient'} - ${appointment.doctorId?.name || 'Doctor'}`,
            start: moment(appointment.appointmentDate).format('YYYY-MM-DD') + 'T' + appointment.timeSlot.split('-')[0].trim(),
            end: moment(appointment.appointmentDate).format('YYYY-MM-DD') + 'T' + appointment.timeSlot.split('-')[1].trim(),
            backgroundColor: getStatusColor(appointment.status),
            borderColor: getStatusColor(appointment.status),
            extendedProps: appointment
          }));
          setAppointments(events);
        }

        if (doctorsRes.data?.data) {
          setDoctors(doctorsRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      confirmed: '#52c41a',
      pending: '#faad14',
      cancelled: '#f5222d'
    };
    return colors[status] || '#1890ff';
  };

  const handleEventClick = (info) => {
    setSelectedEvent(info.event.extendedProps);
    setViewModalVisible(true);
  };

  const filteredEvents = appointments.filter(event => 
    selectedDoctor === 'all' || event.extendedProps.doctorId?._id === selectedDoctor
  );

  const calendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: filteredEvents,
    eventClick: handleEventClick,
    height: 'auto',
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    allDaySlot: false,
    slotDuration: '00:30:00',
    weekends: true,
    dayMaxEvents: true,
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      meridiem: true
    }
  };

  return (
    <AdminLayout>
      <div className="calendar-container">
        <Row gutter={[16, 16]} className="calendar-header">
          <Col xs={24} sm={12}>
            <h2>Appointment Calendar</h2>
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
            <Select
              style={{ width: 200 }}
              placeholder="Filter by Doctor"
              value={selectedDoctor}
              onChange={setSelectedDoctor}
            >
              <Option value="all">All Doctors</Option>
              {doctors.map(doctor => (
                <Option key={doctor._id} value={doctor._id}>
                  {doctor.name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Card className="calendar-card">
          <FullCalendar
            {...calendarOptions}
            ref={calendarRef}
          />
        </Card>

        <Modal
          title="Appointment Details"
          visible={viewModalVisible}
          onCancel={() => {
            setViewModalVisible(false);
            setSelectedEvent(null);
          }}
          footer={[
            <Button key="close" onClick={() => setViewModalVisible(false)}>
              Close
            </Button>
          ]}
        >
          {selectedEvent && (
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Patient">
                {selectedEvent.patientId?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Doctor">
                {selectedEvent.doctorId?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Date">
                {moment(selectedEvent.appointmentDate).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Time">
                {selectedEvent.timeSlot}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedEvent.status)}>
                  {selectedEvent.status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Reason">
                {selectedEvent.reason}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default AppointmentCalendar;