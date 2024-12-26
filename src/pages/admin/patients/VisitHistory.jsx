import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Modal, Descriptions, message } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './VisitHistory.css';

const VisitHistory = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const { patientId } = useParams();

  const fetchVisitHistory = async () => {
    try {
      if (!patientId) {
        message.error('Patient ID is missing');
        return;
      }

      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        message.error('Please login to view visit history');
        return;
      }

      console.log('Fetching visit history for patient:', patientId);

      const response = await axios.get(
        `http://localhost:8080/api/v1/medical-records/${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Visit History Response:', response.data);

      if (response.data.success) {
        setVisits(response.data.data || []);
      } else {
        message.error(response.data.message || 'Failed to fetch visit history');
      }
    } catch (error) {
      console.error('Fetch error details:', error.response || error);
      message.error(
        error.response?.data?.message || 
        'Failed to fetch visit history'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchVisitHistory();
    }
  }, [patientId]);

  const columns = [
    {
      title: 'Visit Date',
      dataIndex: 'visitDate',
      key: 'visitDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A',
      sorter: (a, b) => new Date(a.visitDate) - new Date(b.visitDate),
    },
    {
      title: 'Doctor',
      dataIndex: 'doctorId',
      key: 'doctorId',
      render: (doctor) => doctor?.name || 'N/A',
    },
    {
      title: 'Chief Complaint',
      dataIndex: 'chiefComplaint',
      key: 'chiefComplaint',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Diagnosis',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'active' ? 'blue' :
          status === 'completed' ? 'green' :
          'red'
        }>
          {(status || 'N/A').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => {
            handleViewDetails(record);
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  const handleViewDetails = async (record) => {
    try {
      setModalLoading(true);
      setViewModalVisible(true);
      setSelectedVisit(record);
    } catch (error) {
      message.error('Failed to load visit details');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="visit-history-container">
        <div className="visit-history-header">
          <h2>Visit History</h2>
          <Button type="primary" onClick={() => window.history.back()}>
            Back to Patient
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={visits}
          loading={loading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} visits`
          }}
        />

        <Modal
          title="Visit Details"
          visible={viewModalVisible}
          onCancel={() => {
            setViewModalVisible(false);
            setSelectedVisit(null);
          }}
          footer={[
            <Button key="close" onClick={() => {
              setViewModalVisible(false);
              setSelectedVisit(null);
            }}>
              Close
            </Button>
          ]}
          width={800}
        >
          {selectedVisit ? (
            <div className="visit-details">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Visit Date">
                  {new Date(selectedVisit.visitDate).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="Doctor">
                  {selectedVisit.doctorId?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Chief Complaint">
                  {selectedVisit.chiefComplaint}
                </Descriptions.Item>
                <Descriptions.Item label="Diagnosis">
                  {selectedVisit.diagnosis}
                </Descriptions.Item>
                <Descriptions.Item label="Symptoms" span={2}>
                  {selectedVisit.symptoms?.join(', ') || 'N/A'}
                </Descriptions.Item>
                
                <Descriptions.Item label="Vital Signs" span={2}>
                  <ul>
                    <li>Blood Pressure: {selectedVisit.vitalSigns?.bloodPressure}</li>
                    <li>Temperature: {selectedVisit.vitalSigns?.temperature}</li>
                    <li>Heart Rate: {selectedVisit.vitalSigns?.heartRate}</li>
                    <li>Respiratory Rate: {selectedVisit.vitalSigns?.respiratoryRate}</li>
                    <li>Weight: {selectedVisit.vitalSigns?.weight} kg</li>
                    <li>Height: {selectedVisit.vitalSigns?.height} cm</li>
                    <li>BMI: {selectedVisit.vitalSigns?.bmi}</li>
                  </ul>
                </Descriptions.Item>

                <Descriptions.Item label="Prescriptions" span={2}>
                  {selectedVisit.prescriptions?.map((prescription, index) => (
                    <div key={index} className="prescription-item">
                      <p><strong>Medicine:</strong> {prescription.medicine}</p>
                      <p><strong>Dosage:</strong> {prescription.dosage}</p>
                      <p><strong>Frequency:</strong> {prescription.frequency}</p>
                      <p><strong>Duration:</strong> {prescription.duration}</p>
                      <p><strong>Instructions:</strong> {prescription.instructions}</p>
                    </div>
                  ))}
                </Descriptions.Item>

                <Descriptions.Item label="Lab Tests" span={2}>
                  {selectedVisit.labTests?.map((test, index) => (
                    <div key={index} className="lab-test-item">
                      <p><strong>Test:</strong> {test.testName}</p>
                      <p><strong>Date:</strong> {new Date(test.testDate).toLocaleDateString()}</p>
                      <p><strong>Result:</strong> {test.result || 'Pending'}</p>
                      <p><strong>Status:</strong> {test.status}</p>
                    </div>
                  ))}
                </Descriptions.Item>

                <Descriptions.Item label="Follow-up Date">
                  {selectedVisit.followUpDate ? new Date(selectedVisit.followUpDate).toLocaleDateString() : 'N/A'}
                </Descriptions.Item>
                
                <Descriptions.Item label="Notes" span={2}>
                  {selectedVisit.notes || 'N/A'}
                </Descriptions.Item>
              </Descriptions>
            </div>
          ) : (
            <div>No visit details available</div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default VisitHistory;