import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Select,
  Tag,
  Space,
  Calendar,
  Badge,
  Row,
  Col,
  Tooltip,
  Button,
  Modal,
  message
} from 'antd';
import {
  ClockCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  TeamOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axiosInstance from '../../../utils/axiosConfig';
import './DoctorSchedules.css';

const { Option } = Select;

const DoctorSchedules = () => {
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchScheduleAndAppointments();
    }
  }, [selectedDoctor, selectedDate]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/doctors');
      setDoctors(response.data.data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      message.error('Error fetching doctors: ' + error.message);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduleAndAppointments = async () => {
    try {
      setLoading(true);
      const [scheduleRes, appointmentsRes] = await Promise.all([
        axiosInstance.get(`/doctors/${selectedDoctor}/schedule`, {
          params: { date: selectedDate.format('YYYY-MM-DD') }
        }),
        axiosInstance.get(`/doctors/${selectedDoctor}/appointments`, {
          params: { date: selectedDate.format('YYYY-MM-DD') }
        })
      ]);
      
      setSchedules(scheduleRes.data.data || []);
      setAppointments(appointmentsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      message.error('Error fetching schedule: ' + error.message);
      setSchedules([]);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const getListData = (value) => {
    const date = value.format('YYYY-MM-DD');
    const daySchedule = schedules.find(s => 
      moment(s.date).format('YYYY-MM-DD') === date
    );
    
    const dayAppointments = appointments.filter(a => 
      moment(a.appointmentDate).format('YYYY-MM-DD') === date
    );

    return {
      schedule: daySchedule,
      appointments: dayAppointments
    };
  };

  const dateCellRender = (value) => {
    const data = getListData(value);
    const isAvailable = data.schedule?.isAvailable;
    const appointmentCount = data.appointments?.length || 0;

    return (
      <div className="date-cell">
        {isAvailable && (
          <Badge 
            status="success" 
            text={`${appointmentCount} appointments`}
          />
        )}
        {!isAvailable && <Badge status="error" text="Unavailable" />}
      </div>
    );
  };

  const columns = [
    {
      title: 'Time',
      dataIndex: 'timeSlot',
      key: 'time',
      render: (timeSlot) => (
        <Space>
          <ClockCircleOutlined />
          {moment(timeSlot.start, 'HH:mm').format('hh:mm A')} - 
          {moment(timeSlot.end, 'HH:mm').format('hh:mm A')}
        </Space>
      )
    },
    {
      title: 'Patient',
      dataIndex: 'patientId',
      key: 'patient',
      render: (patient) => patient ? (
        <Space>
          <UserOutlined />
          {patient.firstName} {patient.lastName}
        </Space>
      ) : 'Available'
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => type && (
        <Tag color={type === 'Emergency' ? 'red' : 'blue'}>
          {type}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => status && (
        <Tag color={
          status === 'confirmed' ? 'green' :
          status === 'cancelled' ? 'red' :
          'orange'
        }>
          {status.toUpperCase()}
        </Tag>
      )
    }
  ];

  const handleDoctorChange = (value) => {
    setSelectedDoctor(value);
    setSelectedDate(moment());
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleViewSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setModalVisible(true);
  };

  return (
    <div className="doctor-schedules">
      <Card title="Doctor Schedules">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Select
              placeholder="Select Doctor"
              style={{ width: '100%' }}
              onChange={handleDoctorChange}
              loading={loading}
            >
              {doctors.map(doctor => (
                <Option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.name} - {doctor.specialization}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        {selectedDoctor && (
          <Row gutter={[16, 16]} className="schedule-content">
            <Col xs={24} md={16}>
              <Calendar
                value={selectedDate}
                onSelect={handleDateSelect}
                dateCellRender={dateCellRender}
                loading={loading}
              />
            </Col>
            <Col xs={24} md={8}>
              <Card 
                title={`Schedule for ${selectedDate.format('DD MMM YYYY')}`}
                className="daily-schedule"
              >
                {loading ? (
                  <div className="loading-container">Loading...</div>
                ) : (
                  <>
                    <div className="schedule-stats">
                      <Space size="large">
                        <Tooltip title="Total Slots">
                          <Badge count={appointments.length} showZero>
                            <TeamOutlined style={{ fontSize: 20 }} />
                          </Badge>
                        </Tooltip>
                        <Tooltip title="Available Slots">
                          <Badge 
                            count={appointments.filter(a => !a.patientId).length} 
                            showZero 
                            color="#52c41a"
                          >
                            <CalendarOutlined style={{ fontSize: 20 }} />
                          </Badge>
                        </Tooltip>
                      </Space>
                    </div>

                    <Table
                      columns={columns}
                      dataSource={appointments}
                      rowKey="_id"
                      size="small"
                      pagination={false}
                    />
                  </>
                )}
              </Card>
            </Col>
          </Row>
        )}
      </Card>

      <Modal
        title="Schedule Details"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        {selectedSchedule && (
          <div>
            {/* Add detailed schedule view here */}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorSchedules;