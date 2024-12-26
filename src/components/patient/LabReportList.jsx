import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Tag, 
  Space, 
  message, 
  Modal,
  Badge 
} from 'antd';
import { 
  EyeOutlined, 
  DownloadOutlined, 
  ExperimentOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import LabReportDetail from './LabReportDetail';
import './LabReportList.css';

const LabReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/v1/lab-reports/my-reports', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setReports(response.data.data);
    } catch (error) {
      message.error('Failed to fetch lab reports');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setModalVisible(true);
  };

  const handleDownloadReport = async (reportId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/lab-reports/my-reports/${reportId}/download`,
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
      link.setAttribute('download', `lab-report-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      message.error('Failed to download report');
    }
  };

  const getStatusTag = (status) => {
    const statusColors = {
      'Pending': 'warning',
      'Completed': 'success',
      'Cancelled': 'error'
    };
    return <Tag color={statusColors[status]}>{status}</Tag>;
  };

  const columns = [
    {
      title: 'Test Date',
      dataIndex: 'testDate',
      key: 'testDate',
      render: (date) => moment(date).format('MMMM DD, YYYY')
    },
    {
      title: 'Test Name',
      dataIndex: 'testName',
      key: 'testName'
    },
    {
      title: 'Category',
      dataIndex: 'testCategory',
      key: 'testCategory',
      render: (category) => (
        <Tag color="blue">{category}</Tag>
      )
    },
    {
      title: 'Doctor',
      dataIndex: 'doctorId',
      key: 'doctor',
      render: (doctor) => doctor?.name ? `Dr. ${doctor.name}` : 'N/A'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EyeOutlined />}
            onClick={() => handleViewReport(record)}
          >
            View
          </Button>
          {record.status === 'Completed' && (
            <Button 
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadReport(record._id)}
            >
              Download
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="lab-report-list-container">
      <Card 
        title={
          <Space>
            <ExperimentOutlined />
            <span>My Lab Reports</span>
          </Space>
        }
        className="lab-report-card"
      >
        <Table
          columns={columns}
          dataSource={reports}
          rowKey="_id"
          loading={loading}
        />
      </Card>

      <Modal
        title="Lab Report Details"
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedReport(null);
        }}
        footer={null}
        width={800}
      >
        {selectedReport && (
          <LabReportDetail report={selectedReport} />
        )}
      </Modal>
    </div>
  );
};

export default LabReportList;