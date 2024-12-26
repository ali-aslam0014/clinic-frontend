import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Tabs,
  Timeline,
  Table,
  Tag,
  Space,
  Button,
  message,
  Spin
} from 'antd';
import {
  UserOutlined,
  HistoryOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import DoctorLayout from '../../../components/doctor/Layout';
import axios from 'axios';
import './DoctorPatientDetails.css';

const { TabPane } = Tabs;

const DoctorPatientDetails = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('1');

  const fetchPatientDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8080/api/v1/doctor/patients/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log('Patient details:', response.data);
      
      if (response.data.success) {
        setPatient(response.data.data);
      } else {
        message.error('Failed to fetch patient details');
      }
    } catch (error) {
      message.error('Failed to fetch patient details');
      console.error('Fetch patient details error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientDetails();
  }, [id]);

  const appointmentColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'completed' ? 'green' :
          status === 'scheduled' ? 'blue' :
          status === 'cancelled' ? 'red' : 'default'
        }>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Doctor',
      dataIndex: ['doctor', 'name'],
      key: 'doctor',
    }
  ];

  if (loading) {
    return (
      <DoctorLayout>
        <div className="loading-container">
          <Spin size="large" />
        </div>
      </DoctorLayout>
    );
  }

  if (!patient) {
    return (
      <DoctorLayout>
        <div className="error-container">
          Patient not found
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="patient-details-container">
        {/* Basic Information Card */}
        <Card className="info-card">
          <Descriptions title="Patient Information" bordered>
            <Descriptions.Item label="Patient ID">{patient.patientId}</Descriptions.Item>
            <Descriptions.Item label="Full Name">{`${patient.firstName} ${patient.lastName}`}</Descriptions.Item>
            <Descriptions.Item label="Gender">{patient.gender}</Descriptions.Item>
            <Descriptions.Item label="Date of Birth">{new Date(patient.dateOfBirth).toLocaleDateString()}</Descriptions.Item>
            <Descriptions.Item label="Contact">{patient.contactNumber}</Descriptions.Item>
            <Descriptions.Item label="Email">{patient.email}</Descriptions.Item>
            <Descriptions.Item label="Blood Group">{patient.bloodGroup}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={patient.status === 'Active' ? 'green' : 'red'}>{patient.status}</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Patient Actions/Links Section */}
        <Card title="Patient Actions">
          <Space wrap>
            <Link to={`/doctor/patients/${patient.patientId}/treatment-history`}>
              <Button icon={<MedicineBoxOutlined />}>Treatment History</Button>
            </Link>
          </Space>
        </Card>

        {/* Detailed Information Tabs */}
        <Card className="tabs-card">
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane 
              tab={<span><HistoryOutlined />Medical History</span>}
              key="1"
            >
              <Timeline>
                {patient.medicalHistory?.map((history, index) => (
                  <Timeline.Item key={index}>
                    <p><strong>{new Date(history.diagnosedDate).toLocaleDateString()}</strong></p>
                    <p>Condition: {history.condition}</p>
                    <p>Notes: {history.notes}</p>
                  </Timeline.Item>
                ))}
              </Timeline>
            </TabPane>

            <TabPane 
              tab={<span><MedicineBoxOutlined />Current Medications</span>}
              key="2"
            >
              <Table
                dataSource={patient.currentMedications}
                columns={[
                  { title: 'Medicine', dataIndex: 'name', key: 'name' },
                  { title: 'Dosage', dataIndex: 'dosage', key: 'dosage' },
                  { title: 'Frequency', dataIndex: 'frequency', key: 'frequency' },
                  { 
                    title: 'Duration', 
                    key: 'duration',
                    render: (_, record) => (
                      `${new Date(record.startDate).toLocaleDateString()} - 
                       ${new Date(record.endDate).toLocaleDateString()}`
                    )
                  }
                ]}
                rowKey={(record, index) => index}
              />
            </TabPane>

            <TabPane 
              tab={<span><CalendarOutlined />Appointments</span>}
              key="3"
            >
              <Table
                dataSource={patient.appointments}
                columns={appointmentColumns}
                rowKey="_id"
              />
            </TabPane>

            <TabPane 
              tab={<span><FileTextOutlined />Documents</span>}
              key="4"
            >
              <Table
                dataSource={patient.documents}
                columns={[
                  { title: 'Document Name', dataIndex: 'name', key: 'name' },
                  { title: 'Type', dataIndex: 'type', key: 'type' },
                  { title: 'Date', dataIndex: 'date', key: 'date', render: date => new Date(date).toLocaleDateString() },
                  {
                    title: 'Action',
                    key: 'action',
                    render: (_, record) => (
                      <Button type="link" onClick={() => window.open(record.url, '_blank')}>
                        View
                      </Button>
                    )
                  }
                ]}
                rowKey="_id"
              />
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </DoctorLayout>
  );
};

export default DoctorPatientDetails;