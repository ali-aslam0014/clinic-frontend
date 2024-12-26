import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Tag, 
  Space, 
  message, 
  Modal 
} from 'antd';
import { 
  EyeOutlined, 
  DownloadOutlined, 
  MedicineBoxOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import PrescriptionDetail from './PrescriptionDetail';
import './PrescriptionList.css';

const PrescriptionList = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/v1/prescriptions/my-prescriptions', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Prescriptions:', response.data);
      setPrescriptions(response.data.data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      message.error('Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPrescription = (prescription) => {
    console.log('Selected Prescription:', prescription);
    setSelectedPrescription(prescription);
    setModalVisible(true);
  };

  const handleDownloadPrescription = async (prescriptionId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/prescriptions/${prescriptionId}/download`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription-${prescriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      message.error('Failed to download prescription');
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => moment(date).format('MMMM DD, YYYY')
    },
    {
      title: 'Doctor',
      dataIndex: 'doctorId',
      key: 'doctor',
      render: (doctor) => `Dr. ${doctor.name}`
    },
    {
      title: 'Diagnosis',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
      ellipsis: true
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.active ? 'green' : 'red'}>
          {record.active ? 'Active' : 'Completed'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EyeOutlined />}
            onClick={() => handleViewPrescription(record)}
          >
            View
          </Button>
          <Button 
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadPrescription(record._id)}
          >
            Download
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="prescription-list-container">
      <Card 
        title={
          <Space>
            <MedicineBoxOutlined />
            <span>My Prescriptions</span>
          </Space>
        }
        className="prescription-card"
      >
        <Table
          columns={columns}
          dataSource={prescriptions}
          rowKey="_id"
          loading={loading}
        />
      </Card>

      {modalVisible && selectedPrescription && (
        <Modal
          title="Prescription Details"
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setSelectedPrescription(null);
          }}
          footer={null}
          width={800}
        >
          <PrescriptionDetail prescription={selectedPrescription} />
        </Modal>
      )}
    </div>
  );
};

export default PrescriptionList;