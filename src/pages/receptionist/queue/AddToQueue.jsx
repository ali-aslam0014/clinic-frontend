import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Select,
  DatePicker,
  Button,
  Table,
  Tag,
  Space,
  message,
  Row,
  Col,
  Input,
  Modal,
  Radio
} from 'antd';
import {
  UserAddOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import appointmentAPI from '../../../services/appointmentAPI';
import queueAPI from '../../../services/queueAPI';
import './AddToQueue.css';

const { Option } = Select;
const { Search } = Input;

const AddToQueue = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [priorityModalVisible, setPriorityModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAppointments();
    }
  }, [selectedDoctor, selectedDate]);

  const fetchDoctors = async () => {
    try {
      const response = await appointmentAPI.getDoctors();
      setDoctors(response.data);
    } catch (error) {
      message.error('Error fetching doctors: ' + error.message);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getAppointments({
        doctorId: selectedDoctor,
        date: selectedDate.format('YYYY-MM-DD'),
        status: 'confirmed'
      });
      setAppointments(response.data);
    } catch (error) {
      message.error('Error fetching appointments: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToQueue = async (appointment) => {
    setSelectedAppointment(appointment);
    setPriorityModalVisible(true);
  };

  const handlePrioritySubmit = async (priority) => {
    try {
      setLoading(true);
      await queueAPI.addToQueue({
        appointmentId: selectedAppointment._id,
        priority
      });
      message.success('Patient added to queue successfully');
      setPriorityModalVisible(false);
      fetchAppointments(); // Refresh the list
    } catch (error) {
      message.error('Error adding to queue: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = (appointments) => {
    return appointments.filter(appointment => {
      const patientName = `${appointment.patientId.firstName} ${appointment.patientId.lastName}`.toLowerCase();
      const patientPhone = appointment.patientId.contactNumber;
      const searchValue = searchText.toLowerCase();
      
      return patientName.includes(searchValue) || patientPhone.includes(searchValue);
    });
  };

  const columns = [
    {
      title: 'Time',
      dataIndex: ['timeSlot', 'start'],
      key: 'time',
      render: (time) => moment(time, 'HH:mm').format('hh:mm A')
    },
    {
      title: 'Patient',
      dataIndex: 'patientId',
      key: 'patient',
      render: (patient) => (
        <Space direction="vertical" size="small">
          <span>{patient.firstName} {patient.lastName}</span>
          <small>{patient.contactNumber}</small>
        </Space>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'New' ? 'green' : 'blue'}>
          {type}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'queueStatus',
      key: 'queueStatus',
      render: (status) => {
        if (!status) return <Tag>Not in Queue</Tag>;
        return (
          <Tag color={
            status === 'waiting' ? 'orange' :
            status === 'in-consultation' ? 'blue' :
            status === 'completed' ? 'green' : 'red'
          }>
            {status.toUpperCase()}
          </Tag>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {!record.queueStatus && (
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => handleAddToQueue(record)}
            >
              Add to Queue
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="add-to-queue">
      <Card title="Add to Queue">
        <Row gutter={[16, 16]} className="filters">
          <Col xs={24} md={8}>
            <Select
              placeholder="Select Doctor"
              style={{ width: '100%' }}
              onChange={setSelectedDoctor}
              loading={loading}
            >
              {doctors.map(doctor => (
                <Option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.name} - {doctor.specialization}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <DatePicker
              style={{ width: '100%' }}
              value={selectedDate}
              onChange={setSelectedDate}
              disabledDate={(current) => current < moment().startOf('day')}
            />
          </Col>
          <Col xs={24} md={8}>
            <Search
              placeholder="Search patient name or phone"
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filterAppointments(appointments)}
          rowKey="_id"
          loading={loading}
          pagination={false}
        />

        <Modal
          title="Set Priority"
          visible={priorityModalVisible}
          onCancel={() => setPriorityModalVisible(false)}
          footer={null}
        >
          <Form onFinish={handlePrioritySubmit}>
            <Form.Item
              name="priority"
              rules={[{ required: true, message: 'Please select priority' }]}
            >
              <Radio.Group>
                <Space direction="vertical">
                  <Radio value="High">
                    High Priority
                    <Tag color="red" style={{ marginLeft: 8 }}>Emergency</Tag>
                  </Radio>
                  <Radio value="Medium">
                    Medium Priority
                    <Tag color="orange" style={{ marginLeft: 8 }}>Urgent</Tag>
                  </Radio>
                  <Radio value="Low">
                    Low Priority
                    <Tag color="green" style={{ marginLeft: 8 }}>Regular</Tag>
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Add to Queue
                </Button>
                <Button onClick={() => setPriorityModalVisible(false)}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default AddToQueue;