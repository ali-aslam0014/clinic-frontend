import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  Tabs,
  Timeline,
  Table,
  Tag,
  Space,
  Badge,
  Empty,
  message,
  Spin
} from 'antd';
import {
  MedicineBoxOutlined,
  AlertOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import moment from 'moment';
import patientAPI from '../../services/patientAPI';
import './PatientHistory.css';

const { TabPane } = Tabs;

const PatientHistory = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState(null);
  const [activeTab, setActiveTab] = useState('1');

  useEffect(() => {
    fetchPatientHistory();
  }, [id]);

  const fetchPatientHistory = async () => {
    try {
      setLoading(true);
      const response = await patientAPI.getPatientHistory(id);
      setHistory(response.data);
    } catch (error) {
      message.error('Error fetching patient history: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const appointmentColumns = [
    {
      title: 'Date',
      dataIndex: 'appointmentDate',
      key: 'date',
      render: date => moment(date).format('DD-MM-YYYY')
    },
    {
      title: 'Doctor',
      dataIndex: 'doctorId',
      key: 'doctor',
      render: doctor => doctor?.name || 'N/A'
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: type => (
        <Tag color={type === 'Emergency' ? 'red' : 'blue'}>
          {type}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        let color = 'default';
        switch (status?.toLowerCase()) {
          case 'completed': color = 'green'; break;
          case 'cancelled': color = 'red'; break;
          case 'pending': color = 'gold'; break;
          default: color = 'blue';
        }
        return <Badge status={color} text={status} />;
      }
    },
    {
      title: 'Diagnosis',
      dataIndex: 'diagnosis',
      key: 'diagnosis'
    }
  ];

  const prescriptionColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: date => moment(date).format('DD-MM-YYYY')
    },
    {
      title: 'Doctor',
      dataIndex: 'doctorId',
      key: 'doctor',
      render: doctor => doctor?.name || 'N/A'
    },
    {
      title: 'Medicines',
      dataIndex: 'medicines',
      key: 'medicines',
      render: medicines => (
        <Space direction="vertical">
          {medicines?.map((med, index) => (
            <Tag key={index} color="blue">
              {med.name} - {med.dosage}
            </Tag>
          ))}
        </Space>
      )
    },
    {
      title: 'Diagnosis',
      dataIndex: 'diagnosis',
      key: 'diagnosis'
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes'
    }
  ];

  const labReportColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: date => moment(date).format('DD-MM-YYYY')
    },
    {
      title: 'Test Type',
      dataIndex: 'testType',
      key: 'testType'
    },
    {
      title: 'Result',
      dataIndex: 'result',
      key: 'result',
      render: result => (
        <Tag color={result === 'Normal' ? 'green' : 'orange'}>
          {result}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        let color = 'default';
        switch (status?.toLowerCase()) {
          case 'completed': color = 'green'; break;
          case 'pending': color = 'gold'; break;
          case 'processing': color = 'blue'; break;
          default: color = 'default';
        }
        return <Badge status={color} text={status} />;
      }
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="patient-history">
      <Card title="Patient History">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* Appointments History */}
          <TabPane 
            tab={
              <span>
                <ClockCircleOutlined />
                Appointments
              </span>
            } 
            key="1"
          >
            <Table
              columns={appointmentColumns}
              dataSource={history?.appointments || []}
              rowKey="_id"
              pagination={false}
              locale={{
                emptyText: <Empty description="No appointment history found" />
              }}
            />
          </TabPane>

          {/* Prescriptions */}
          <TabPane 
            tab={
              <span>
                <MedicineBoxOutlined />
                Prescriptions
              </span>
            } 
            key="2"
          >
            <Table
              columns={prescriptionColumns}
              dataSource={history?.prescriptions || []}
              rowKey="_id"
              pagination={false}
              locale={{
                emptyText: <Empty description="No prescription history found" />
              }}
            />
          </TabPane>

          {/* Lab Reports */}
          <TabPane 
            tab={
              <span>
                <ExperimentOutlined />
                Lab Reports
              </span>
            } 
            key="3"
          >
            <Table
              columns={labReportColumns}
              dataSource={history?.labReports || []}
              rowKey="_id"
              pagination={false}
              locale={{
                emptyText: <Empty description="No lab reports found" />
              }}
            />
          </TabPane>

          {/* Medical History */}
          <TabPane 
            tab={
              <span>
                <FileTextOutlined />
                Medical History
              </span>
            } 
            key="4"
          >
            {history?.medicalHistory?.length > 0 ? (
              <Timeline mode="left">
                {history.medicalHistory.map((record, index) => (
                  <Timeline.Item 
                    key={index}
                    color={record.status === 'active' ? 'green' : 'blue'}
                    label={moment(record.date).format('DD-MM-YYYY')}
                  >
                    <h4>{record.condition}</h4>
                    <p>{record.diagnosis}</p>
                    {record.notes && <p><small>{record.notes}</small></p>}
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Empty description="No medical history found" />
            )}
          </TabPane>

          {/* Allergies */}
          <TabPane 
            tab={
              <span>
                <AlertOutlined />
                Allergies
              </span>
            } 
            key="5"
          >
            {history?.allergies?.length > 0 ? (
              <Space size={[0, 8]} wrap>
                {history.allergies.map((allergy, index) => (
                  <Tag key={index} color="red">
                    {allergy}
                  </Tag>
                ))}
              </Space>
            ) : (
              <Empty description="No allergies recorded" />
            )}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default PatientHistory;