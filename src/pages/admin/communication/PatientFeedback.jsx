import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Row,
  Col,
  Statistic,
  Rate,
  Alert,
  Spin
} from 'antd';
import {
  CommentOutlined,
  StarOutlined,
  UserOutlined,
  LikeOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './PatientFeedback.css';

const { Title } = Typography;

const PatientFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    totalFeedback: 0,
    averageRating: 0,
    positivePercentage: 0,
    responseRate: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('/api/v1/admin/communications/feedback', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('API Response:', response.data);
      
      if (response.data?.data) {
        setFeedback(response.data.data);
        setStatistics(response.data.statistics || {
          totalFeedback: 0,
          averageRating: 0,
          positivePercentage: 0,
          responseRate: 0
        });
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Patient',
      dataIndex: ['patient', 'name'],
      key: 'patient'
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: rating => <Rate disabled defaultValue={rating} />
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: category => (
        <Tag color={
          category === 'service' ? 'blue' :
          category === 'staff' ? 'green' : 'default'
        }>
          {category.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Comment',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: date => moment(date).format('DD/MM/YYYY')
    }
  ];

  return (
    <AdminLayout>
      <div className="patient-feedback-container">
        <Title level={2}>
          <CommentOutlined /> Patient Feedback
        </Title>

        <Row gutter={16} className="statistics-row">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Feedback"
                value={statistics.totalFeedback}
                prefix={<CommentOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Average Rating"
                value={statistics.averageRating}
                precision={1}
                prefix={<StarOutlined />}
                suffix="/5"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Positive Feedback"
                value={statistics.positivePercentage}
                prefix={<LikeOutlined />}
                suffix="%"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Response Rate"
                value={statistics.responseRate}
                prefix={<UserOutlined />}
                suffix="%"
              />
            </Card>
          </Col>
        </Row>

        <Card className="action-card">
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchData}
          >
            Refresh
          </Button>
        </Card>

        {error ? (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
          />
        ) : (
          <Card>
            <Table
              loading={loading}
              columns={columns}
              dataSource={feedback}
              rowKey="_id"
              pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} items`
              }}
            />
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default PatientFeedback;