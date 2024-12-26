import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Table,
  Tag,
  Tooltip,
  Popconfirm,
  message,
  Row,
  Col,
  Modal,
  Progress,
  Alert,
  Upload
} from 'antd';
import {
  CloudUploadOutlined,
  CloudDownloadOutlined,
  DeleteOutlined,
  CloudSyncOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './BackupRestore.css';

const { Title, Text } = Typography;
const { confirm } = Modal;

const BackupRestore = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [restoreInProgress, setRestoreInProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastBackup, setLastBackup] = useState(null);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/v1/admin/settings/backups', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data?.data) {
        setBackups(response.data.data);
        const lastBackupFile = response.data.data[0];
        if (lastBackupFile) {
          setLastBackup(lastBackupFile.createdAt);
        }
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
      message.error('Failed to fetch backups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setBackupInProgress(true);
      setProgress(0);
      
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/v1/admin/settings/backups', {}, {
        headers: { 'Authorization': `Bearer ${token}` },
        onUploadProgress: (progressEvent) => {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentage);
        }
      });

      message.success('Backup created successfully');
      fetchBackups();
    } catch (error) {
      console.error('Error creating backup:', error);
      message.error('Failed to create backup');
    } finally {
      setBackupInProgress(false);
      setProgress(0);
    }
  };

  const handleRestoreBackup = async (backupId) => {
    confirm({
      title: 'Are you sure you want to restore this backup?',
      icon: <ExclamationCircleOutlined />,
      content: 'This will replace all current data with the backup data. This action cannot be undone.',
      okText: 'Yes, Restore',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          setRestoreInProgress(true);
          setProgress(0);
          
          const token = localStorage.getItem('token');
          await axios.post(`/api/v1/admin/settings/backups/${backupId}/restore`, {}, {
            headers: { 'Authorization': `Bearer ${token}` },
            onDownloadProgress: (progressEvent) => {
              const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgress(percentage);
            }
          });

          message.success('Backup restored successfully');
          window.location.reload(); // Reload page after restore
        } catch (error) {
          console.error('Error restoring backup:', error);
          message.error('Failed to restore backup');
        } finally {
          setRestoreInProgress(false);
          setProgress(0);
        }
      }
    });
  };

  const handleDeleteBackup = async (backupId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/v1/admin/settings/backups/${backupId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      message.success('Backup deleted successfully');
      fetchBackups();
    } catch (error) {
      console.error('Error deleting backup:', error);
      message.error('Failed to delete backup');
    }
  };

  const handleDownloadBackup = async (backupId, fileName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/v1/admin/settings/backups/${backupId}/download`, {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading backup:', error);
      message.error('Failed to download backup');
    }
  };

  const columns = [
    {
      title: 'Backup Name',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size) => `${(size / (1024 * 1024)).toFixed(2)} MB`
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'success' : 'processing'}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Download">
            <Button
              type="primary"
              icon={<CloudDownloadOutlined />}
              onClick={() => handleDownloadBackup(record._id, record.fileName)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Restore">
            <Button
              icon={<CloudSyncOutlined />}
              onClick={() => handleRestoreBackup(record._id)}
              size="small"
              disabled={restoreInProgress}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this backup?"
              onConfirm={() => handleDeleteBackup(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="backup-restore-container">
        <Row justify="space-between" align="middle" className="page-header">
          <Col>
            <Title level={2}>
              <CloudUploadOutlined /> Backup & Restore
            </Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<CloudUploadOutlined />}
              onClick={handleCreateBackup}
              loading={backupInProgress}
            >
              Create Backup
            </Button>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card title="Backup History">
              <Table
                columns={columns}
                dataSource={backups}
                rowKey="_id"
                loading={loading}
                pagination={{
                  defaultPageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} backups`
                }}
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Backup Information">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Alert
                  message="Last Backup"
                  description={
                    lastBackup
                      ? `Last backup was created on ${moment(lastBackup).format('YYYY-MM-DD HH:mm:ss')}`
                      : 'No backups found'
                  }
                  type="info"
                  showIcon
                />

                {(backupInProgress || restoreInProgress) && (
                  <Card>
                    <Progress
                      percent={progress}
                      status="active"
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                      }}
                    />
                    <Text>
                      {backupInProgress ? 'Creating backup...' : 'Restoring backup...'}
                    </Text>
                  </Card>
                )}

                <Alert
                  message="Important Note"
                  description="Regular backups help protect your data. We recommend creating backups before making major changes to your system."
                  type="warning"
                  showIcon
                />

                <Upload
                  accept=".zip,.sql"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    confirm({
                      title: 'Upload and Restore Backup',
                      icon: <ExclamationCircleOutlined />,
                      content: 'Are you sure you want to upload and restore this backup file? This will replace all current data.',
                      okText: 'Yes',
                      okType: 'danger',
                      cancelText: 'No',
                      onOk: () => {
                        // Handle file upload and restore
                        return false; // Prevent default upload behavior
                      }
                    });
                    return false;
                  }}
                >
                  <Button icon={<UploadOutlined />}>Upload Backup File</Button>
                </Upload>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
};

export default BackupRestore;