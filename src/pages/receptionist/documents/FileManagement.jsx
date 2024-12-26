import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Modal,
  message,
  Typography,
  Tree,
  Row,
  Col,
  Tooltip,
  Tag,
  Dropdown,
  Menu,
  Upload,
  Form
} from 'antd';
import {
  FolderOutlined,
  FileOutlined,
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
  DownloadOutlined,
  EyeOutlined,
  ShareAltOutlined,
  FolderAddOutlined,
  SearchOutlined,
  MoreOutlined
} from '@ant-design/icons';
import fileManagementAPI from '../../../services/fileManagementAPI';
import './FileManagement.css';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const FileManagement = () => {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [currentPath, setCurrentPath] = useState([]);

  useEffect(() => {
    fetchFolders();
    fetchFiles();
  }, [selectedFolder]);

  const fetchFolders = async () => {
    try {
      const response = await fileManagementAPI.getFolders();
      setFolders(response.data);
    } catch (error) {
      message.error('Failed to fetch folders');
    }
  };

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fileManagementAPI.getFiles(selectedFolder);
      setFiles(response.data);
    } catch (error) {
      message.error('Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (values) => {
    try {
      await fileManagementAPI.createFolder({
        ...values,
        parentId: selectedFolder
      });
      message.success('Folder created successfully');
      fetchFolders();
      setFolderModalVisible(false);
    } catch (error) {
      message.error('Failed to create folder');
    }
  };

  const handleFileUpload = async ({ file, onSuccess, onError }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderId', selectedFolder);

      await fileManagementAPI.uploadFile(formData);
      onSuccess('ok');
      message.success('File uploaded successfully');
      fetchFiles();
    } catch (error) {
      onError(error);
      message.error('Failed to upload file');
    }
  };

  const handleDelete = async (record) => {
    try {
      if (record.type === 'folder') {
        await fileManagementAPI.deleteFolder(record._id);
        fetchFolders();
      } else {
        await fileManagementAPI.deleteFile(record._id);
        fetchFiles();
      }
      message.success('Deleted successfully');
    } catch (error) {
      message.error('Failed to delete');
    }
  };

  const handleDownload = async (file) => {
    try {
      await fileManagementAPI.downloadFile(file._id);
      message.success('File downloaded successfully');
    } catch (error) {
      message.error('Failed to download file');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          {record.type === 'folder' ? <FolderOutlined /> : <FileOutlined />}
          <Text>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'folder' ? 'blue' : 'green'}>
          {type.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size) => size ? `${(size / 1024).toFixed(2)} KB` : '-'
    },
    {
      title: 'Modified',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.type !== 'folder' && (
            <>
              <Tooltip title="Preview">
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => handlePreview(record)}
                />
              </Tooltip>
              <Tooltip title="Download">
                <Button
                  type="text"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload(record)}
                />
              </Tooltip>
            </>
          )}
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const treeData = folders.map(folder => ({
    title: folder.name,
    key: folder._id,
    icon: <FolderOutlined />,
    children: folder.children?.map(child => ({
      title: child.name,
      key: child._id,
      icon: <FolderOutlined />
    }))
  }));

  return (
    <div className="file-management">
      <Card>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Card
              title="Folders"
              extra={
                <Button
                  type="text"
                  icon={<FolderAddOutlined />}
                  onClick={() => setFolderModalVisible(true)}
                />
              }
            >
              <Tree
                treeData={treeData}
                onSelect={(selectedKeys) => setSelectedFolder(selectedKeys[0])}
                showIcon
              />
            </Card>
          </Col>
          
          <Col xs={24} md={18}>
            <Card
              title={
                <Space>
                  <FolderOutlined />
                  <span>Files</span>
                </Space>
              }
              extra={
                <Space>
                  <Search
                    placeholder="Search files"
                    allowClear
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 200 }}
                  />
                  <Upload
                    customRequest={handleFileUpload}
                    showUploadList={false}
                  >
                    <Button icon={<UploadOutlined />}>Upload</Button>
                  </Upload>
                </Space>
              }
            >
              <Table
                columns={columns}
                dataSource={files}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default FileManagement; 