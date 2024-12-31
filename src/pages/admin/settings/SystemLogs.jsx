import React, { useState, useEffect } from 'react';
import { Table, Card, Tabs, DatePicker, Space, Select, Button, Tag } from 'antd';
import { ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import axiosInstance from '../../../utils/axiosConfig';
import AdminLayout from '../../../components/admin/Layout';
import './SystemLogs.css';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({
    type: 'all',
    dateRange: [],
    user: 'all'
  });

  // Fetch logs
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/v1/admin/system-logs', {
        params: filter
      });
      setLogs(response.data.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  // Columns for different log types
  const userActivityColumns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text) => new Date(text).toLocaleString()
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user'
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action'
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'success' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      )
    }
  ];

  const securityLogsColumns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text) => new Date(text).toLocaleString()
    },
    {
      title: 'Event Type',
      dataIndex: 'eventType',
      key: 'eventType'
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => (
        <Tag color={
          severity === 'high' ? 'red' : 
          severity === 'medium' ? 'orange' : 
          'green'
        }>
          {severity.toUpperCase()}
        </Tag>
      )
    }
  ];

  const auditTrailColumns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text) => new Date(text).toLocaleString()
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user'
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action'
    },
    {
      title: 'Changes',
      dataIndex: 'changes',
      key: 'changes',
      render: (changes) => (
        <div>
          <div>Previous: {changes.previous}</div>
          <div>New: {changes.new}</div>
        </div>
      )
    }
  ];

  // Handle filter changes
  const handleFilterChange = (type, value) => {
    setFilter(prev => ({ ...prev, [type]: value }));
  };

  // Export logs
  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting logs...');
  };

  return (
    <AdminLayout>
      <div className="system-logs-container">
        <Card title="System Logs" extra={
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => fetchLogs()}
            >
              Refresh
            </Button>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={handleExport}
            >
              Export
            </Button>
          </Space>
        }>
          <div className="filters-section">
            <Space size="large">
              <Select
                defaultValue="all"
                style={{ width: 120 }}
                onChange={(value) => handleFilterChange('type', value)}
              >
                <Select.Option value="all">All Types</Select.Option>
                <Select.Option value="user">User Activity</Select.Option>
                <Select.Option value="security">Security</Select.Option>
                <Select.Option value="audit">Audit Trail</Select.Option>
              </Select>

              <RangePicker
                onChange={(dates) => handleFilterChange('dateRange', dates)}
              />
            </Space>
          </div>

          <Tabs defaultActiveKey="user">
            <TabPane tab="User Activity" key="user">
              <Table
                columns={userActivityColumns}
                dataSource={logs.filter(log => log.type === 'user')}
                loading={loading}
                rowKey="id"
              />
            </TabPane>

            <TabPane tab="Security Logs" key="security">
              <Table
                columns={securityLogsColumns}
                dataSource={logs.filter(log => log.type === 'security')}
                loading={loading}
                rowKey="id"
              />
            </TabPane>

            <TabPane tab="Audit Trail" key="audit">
              <Table
                columns={auditTrailColumns}
                dataSource={logs.filter(log => log.type === 'audit')}
                loading={loading}
                rowKey="id"
              />
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default SystemLogs; 