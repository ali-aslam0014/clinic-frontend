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
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import './RecentPayments.css';

const { Text, Title } = Typography;
const { confirm } = Modal;

const RecentPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentPayments();
  }, []);

  const fetchRecentPayments = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8080/api/v1/payments/recent',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setPayments(response.data.data);
    } catch (error) {
      console.error('Error fetching recent payments:', error);
      message.error('Failed to fetch recent payments');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRefund = (paymentId) => {
    confirm({
      title: 'Request Refund',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to request a refund for this payment?',
      okText: 'Yes',
      okType: 'primary',
      cancelText: 'No',
      onOk: async () => {
        try {
          await axios.post(
            `http://localhost:8080/api/v1/payments/${paymentId}/refund-request`,
            {},
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            }
          );
          message.success('Refund request submitted successfully');
          fetchRecentPayments();
        } catch (error) {
          console.error('Error requesting refund:', error);
          message.error('Failed to submit refund request');
        }
      }
    });
  };

  const handleViewInvoice = (paymentId) => {
    window.open(`/patient/payments/${paymentId}/invoice`, '_blank');
  };

  const renderPaymentItem = (item) => (
    <List.Item
      actions={[
        <Button 
          type="link" 
          icon={<FileTextOutlined />}
          onClick={() => handleViewInvoice(item._id)}
        >
          View Invoice
        </Button>,
        item.isRefundable && (
          <Button 
            type="link" 
            onClick={() => handleRequestRefund(item._id)}
          >
            Request Refund
          </Button>
        )
      ]}
    >
      <List.Item.Meta
        avatar={
          <DollarOutlined style={{ 
            fontSize: '24px', 
            color: item.statusColor 
          }} />
        }
        title={
          <Space>
            <Text strong>{item.formattedAmount}</Text>
            <Tag color={item.statusColor}>{item.status}</Tag>
            {item.appointmentId && (
              <Tag color="blue">
                {item.appointmentId.appointmentType}
              </Tag>
            )}
          </Space>
        }
        description={
          <Space direction="vertical" size={1}>
            <Space>
              <CalendarOutlined />
              <Text type="secondary">Paid on: {item.paymentDate}</Text>
              <Text type="secondary">({item.timeAgo})</Text>
            </Space>
            {item.doctorId && (
              <Space>
                <UserOutlined />
                <Text type="secondary">
                  Dr. {item.doctorId.name}
                </Text>
                <Tag color="blue">{item.doctorId.specialization}</Tag>
              </Space>
            )}
            {item.paymentMethod && (
              <Space>
                <Text type="secondary">
                  Payment Method: {item.paymentMethod}
                </Text>
              </Space>
            )}
          </Space>
        }
      />
    </List.Item>
  );

  return (
    <Card
      className="recent-payments-card"
      title={
        <Space>
          <DollarOutlined />
          <span>Recent Payments</span>
        </Space>
      }
      extra={
        <Button type="link" href="/patient/payments">
          View All
        </Button>
      }
    >
      <List
        className="payments-list"
        loading={loading}
        itemLayout="horizontal"
        dataSource={payments}
        renderItem={renderPaymentItem}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No recent payments"
            />
          )
        }}
      />
    </Card>
  );
};

export default RecentPayments;