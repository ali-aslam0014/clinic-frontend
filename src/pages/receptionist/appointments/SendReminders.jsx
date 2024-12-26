import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Space,
  Button,
  message,
  Tag,
  Row,
  Col,
  Select,
  DatePicker,
  Badge,
  Tooltip,
  Modal
} from 'antd';
import {
  BellOutlined,
  WhatsAppOutlined,
  MailOutlined,
  PhoneOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import appointmentAPI from '../../../services/appointmentAPI';
import './SendReminders.css';

const { Option } = Select;

const SendReminders = () => {
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [selectedStatus, setSelectedStatus] = useState('confirmed');
  const [reminderType, setReminderType] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate, selectedStatus]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getAppointmentsForReminders({
        date: selectedDate.format('YYYY-MM-DD'),
        status: selectedStatus
      });
      setAppointments(response.data);
    } catch (error) {
      message.error('Error fetching appointments: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (appointmentId, type) => {
    try {
      setLoading(true);
      await appointmentAPI.sendAppointmentReminder(appointmentId, type);
      message.success('Reminder sent successfully');
      fetchAppointments();
    } catch (error) {
      message.error('Error sending reminder: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkReminders = async () => {
    Modal.confirm({
      title: 'Send Bulk Reminders',
      content: 'Are you sure you want to send reminders to all selected appointments?',
      onOk: async () => {
        try {
          setLoading(true);
          await appointmentAPI.sendBulkReminders({
            date: selectedDate.format('YYYY-MM-DD'),
            status: selectedStatus,
            type: reminderType
          });
          message.success('Bulk reminders sent successfully');
          fetchAppointments();
        } catch (error) {
          message.error('Error sending bulk reminders: ' + error.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const columns = [
    {
      title: 'Time',
      dataIndex: 'timeSlot',
      key: 'time',
      render: (timeSlot) => (
        `${moment(timeSlot.start, 'HH:mm').format('hh:mm A')}`
      ),
      sorter: (a, b) => moment(a.timeSlot.start, 'HH:mm') - moment(b.timeSlot.start, 'HH:mm')
    },
    {
      title: 'Patient',
      dataIndex: 'patientId',
      key: 'patient',
      render: (patient) => (
        <Space direction="vertical" size="small">
          <span>{patient.firstName} {patient.lastName}</span>
          <Space size="small">
            <Tag icon={<PhoneOutlined />}>{patient.contactNumber}</Tag>
            {patient.email && <Tag icon={<MailOutlined />}>Email</Tag>}
            {patient.whatsapp && <Tag icon={<WhatsAppOutlined />}>WhatsApp</Tag>}
          </Space>
        </Space>
      )
    },
    {
      title: 'Doctor',
      dataIndex: 'doctorId',
      key: 'doctor',
      render: (doctor) => (
        <>
          <div>Dr. {doctor.name}</div>
          <small>{doctor.specialization}</small>
        </>
      )
    },
    {
      title: 'Last Reminder',
      key: 'reminder',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.reminder?.sent ? (
            <>
              <Badge status="success" text="Sent" />
              <small>{moment(record.reminder.sentAt).format('hh:mm A')}</small>
            </>
          ) : (
            <Badge status="warning" text="Not Sent" />
          )}
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Send SMS">
            <Button
              icon={<PhoneOutlined />}
              onClick={() => handleSendReminder(record._id, 'sms')}
              disabled={loading}
            />
          </Tooltip>
          <Tooltip title="Send Email">
            <Button
              icon={<MailOutlined />}
              onClick={() => handleSendReminder(record._id, 'email')}
              disabled={loading || !record.patientId.email}
            />
          </Tooltip>
          <Tooltip title="Send WhatsApp">
            <Button
              icon={<WhatsAppOutlined />}
              onClick={() => handleSendReminder(record._id, 'whatsapp')}
              disabled={loading || !record.patientId.whatsapp}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="send-reminders">
      <Card title="Send Appointment Reminders">
        <Row gutter={[16, 16]} className="filters">
          <Col xs={24} sm={8} md={6}>
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              style={{ width: '100%' }}
              format="DD-MM-YYYY"
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: '100%' }}
            >
              <Option value="confirmed">Confirmed</Option>
              <Option value="pending">Pending</Option>
              <Option value="all">All Active</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              value={reminderType}
              onChange={setReminderType}
              style={{ width: '100%' }}
            >
              <Option value="all">All Methods</Option>
              <Option value="sms">SMS Only</Option>
              <Option value="email">Email Only</Option>
              <Option value="whatsapp">WhatsApp Only</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Button
              type="primary"
              icon={<BellOutlined />}
              onClick={handleBulkReminders}
              loading={loading}
              block
            >
              Send Bulk Reminders
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={appointments}
          rowKey="_id"
          loading={loading}
          pagination={false}
          rowClassName={(record) => 
            record.reminder?.sent ? 'reminder-sent' : ''
          }
        />

        <div className="reminder-stats">
          <Space size="large">
            <Tooltip title="Total Appointments">
              <Badge count={appointments.length} showZero color="#108ee9">
                <Card size="small">Total</Card>
              </Badge>
            </Tooltip>
            <Tooltip title="Reminders Sent">
              <Badge 
                count={appointments.filter(a => a.reminder?.sent).length} 
                showZero 
                color="#52c41a"
              >
                <Card size="small">Sent</Card>
              </Badge>
            </Tooltip>
            <Tooltip title="Pending Reminders">
              <Badge 
                count={appointments.filter(a => !a.reminder?.sent).length} 
                showZero 
                color="#faad14"
              >
                <Card size="small">Pending</Card>
              </Badge>
            </Tooltip>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default SendReminders;