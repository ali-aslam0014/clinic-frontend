import React, { useState, useEffect } from 'react';
import { Card, List, Tag, Button, Space, Empty, Tooltip, Typography } from 'antd';
import {
  MedicineBoxOutlined,
  CalendarOutlined,
  UserOutlined,
  DownloadOutlined,
  EyeOutlined,
  WarningOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import './ActivePrescriptions.css';

const { Text, Title } = Typography;

const ActivePrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivePrescriptions();
  }, []);

  const fetchActivePrescriptions = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8080/api/v1/prescriptions/active',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setPrescriptions(response.data.data);
    } catch (error) {
      console.error('Error fetching active prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPrescription = (id) => {
    window.open(`/patient/prescriptions/${id}`, '_blank');
  };

  const handleDownloadPDF = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/prescriptions/my-prescriptions/${id}/download`,
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
      link.setAttribute('download', `prescription-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading prescription:', error);
    }
  };

  const renderPrescriptionItem = (item) => (
    <List.Item
      actions={[
        <Button 
          type="link" 
          icon={<EyeOutlined />}
          onClick={() => handleViewPrescription(item._id)}
        >
          View
        </Button>,
        <Button 
          type="link" 
          icon={<DownloadOutlined />}
          onClick={() => handleDownloadPDF(item._id)}
        >
          Download
        </Button>
      ]}
    >
      <List.Item.Meta
        avatar={
          <Space>
            {item.isExpiringSoon && (
              <Tooltip title="Expiring Soon">
                <WarningOutlined style={{ color: '#ff4d4f' }} />
              </Tooltip>
            )}
            <MedicineBoxOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
          </Space>
        }
        title={
          <Space>
            <Text strong>Dr. {item.doctor.name}</Text>
            <Tag color="blue">{item.doctor.specialization}</Tag>
            {item.isExpiringSoon && (
              <Tag color="error">Expires in {item.remainingDays} days</Tag>
            )}
          </Space>
        }
        description={
          <Space direction="vertical" size={1}>
            <Space>
              <CalendarOutlined />
              <Text type="secondary">Issued: {item.issuedOn}</Text>
            </Space>
            <Space>
              <MedicineBoxOutlined />
              <Text type="secondary">Medicines: {item.totalMedicines}</Text>
            </Space>
          </Space>
        }
      />
    </List.Item>
  );

  return (
    <Card
      className="active-prescriptions-card"
      title={
        <Space>
          <MedicineBoxOutlined />
          <span>Active Prescriptions</span>
        </Space>
      }
      extra={
        <Button type="link" href="/patient/prescriptions">
          View All
        </Button>
      }
    >
      <List
        className="prescriptions-list"
        loading={loading}
        itemLayout="horizontal"
        dataSource={prescriptions}
        renderItem={renderPrescriptionItem}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No active prescriptions"
            />
          )
        }}
      />
    </Card>
  );
};

export default ActivePrescriptions;