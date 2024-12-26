import React, { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Tag, 
  Button, 
  Space, 
  Empty, 
  Tooltip, 
  Typography,
  Modal,
  message 
} from 'antd';
import {
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import './PendingReports.css';

const { Text, Title } = Typography;
const { confirm } = Modal;

const PendingReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingReports();
  }, []);

  const fetchPendingReports = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8080/api/v1/lab-reports/pending',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setReports(response.data.data);
    } catch (error) {
      console.error('Error fetching pending reports:', error);
      message.error('Failed to fetch pending reports');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (id) => {
    window.open(`/patient/lab-reports/${id}`, '_blank');
  };

  const handleCancelReport = (id) => {
    confirm({
      title: 'Are you sure you want to cancel this report request?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await axios.put(
            `http://localhost:8080/api/v1/lab-reports/${id}/cancel`,
            {},
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            }
          );
          message.success('Report request cancelled successfully');
          fetchPendingReports();
        } catch (error) {
          console.error('Error cancelling report:', error);
          message.error('Failed to cancel report request');
        }
      }
    });
  };

  const renderReportItem = (item) => (
    <List.Item
      actions={[
        <Button 
          type="link" 
          onClick={() => handleViewReport(item._id)}
        >
          View Details
        </Button>,
        item.canCancel && (
          <Button 
            type="link" 
            danger
            onClick={() => handleCancelReport(item._id)}
          >
            Cancel Request
          </Button>
        )
      ]}
    >
      <List.Item.Meta
        avatar={
          <Space>
            {item.isUrgent && (
              <Tooltip title="Urgent">
                <WarningOutlined style={{ color: '#ff4d4f' }} />
              </Tooltip>
            )}
            <FileTextOutlined style={{ fontSize: '24px', color: item.statusColor }} />
          </Space>
        }
        title={
          <Space>
            <Text strong>{item.testName}</Text>
            <Tag color={item.statusColor}>{item.status}</Tag>
            {item.isUrgent && <Tag color="error">Urgent</Tag>}
          </Space>
        }
        description={
          <Space direction="vertical" size={1}>
            <Space>
              <CalendarOutlined />
              <Text type="secondary">Requested: {item.requestedOn}</Text>
            </Space>
            <Space>
              <UserOutlined />
              <Text type="secondary">Doctor: Dr. {item.doctorId.name}</Text>
              <Tag color="blue">{item.doctorId.specialization}</Tag>
            </Space>
            {item.technician && (
              <Space>
                <UserOutlined />
                <Text type="secondary">Technician: {item.technician.name}</Text>
              </Space>
            )}
            <Space>
              <ClockCircleOutlined />
              <Text type="secondary">
                In Process: {item.daysInProcess} days
              </Text>
            </Space>
          </Space>
        }
      />
    </List.Item>
  );

  return (
    <Card
      className="pending-reports-card"
      title={
        <Space>
          <FileTextOutlined />
          <span>Pending Reports</span>
        </Space>
      }
      extra={
        <Button type="link" href="/patient/lab-reports">
          View All
        </Button>
      }
    >
      <List
        className="reports-list"
        loading={loading}
        itemLayout="horizontal"
        dataSource={reports}
        renderItem={renderReportItem}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No pending reports"
            />
          )
        }}
      />
    </Card>
  );
};

export default PendingReports;