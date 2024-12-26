import React, { useState, useEffect } from 'react';
import {
  Card,
  Upload,
  Button,
  Space,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tooltip,
  Typography,
  Row,
  Col
} from 'antd';
import {
  UploadOutlined,
  ScanOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  CloudUploadOutlined
} from '@ant-design/icons';
import documentsAPI from '../../../services/documentsAPI';
import './ScanAndUpload.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ScanAndUpload = () => {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [editingDocument, setEditingDocument] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentsAPI.getDocuments();
      setDocuments(response.data);
    } catch (error) {
      message.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = () => {
    // Implement scanner integration here
    // This will depend on your scanner hardware and API
    message.info('Scanning functionality to be implemented based on hardware');
  };

  const handleUpload = async ({ file, onSuccess, onError }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await documentsAPI.uploadDocument(formData);
      onSuccess(response, file);
      
      message.success('Document uploaded successfully');
      fetchDocuments();
    } catch (error) {
      onError(error);
      message.error('Failed to upload document');
    }
  };

  const handleDelete = async (id) => {
    try {
      await documentsAPI.deleteDocument(id);
      message.success('Document deleted successfully');
      fetchDocuments();
    } catch (error) {
      message.error('Failed to delete document');
    }
  };

  const handleEdit = (record) => {
    setEditingDocument(record);
    form.setFieldsValue({
      name: record.name,
      type: record.type,
      category: record.category,
      description: record.description,
      tags: record.tags
    });
    setModalVisible(true);
  };

  const handlePreview = (url) => {
    setPreviewImage(url);
    setPreviewVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingDocument) {
        await documentsAPI.updateDocument(editingDocument._id, values);
        message.success('Document updated successfully');
      }
      setModalVisible(false);
      fetchDocuments();
    } catch (error) {
      message.error('Failed to update document');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          {record.type === 'image' ? <FileImageOutlined /> : <FilePdfOutlined />}
          <Text>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size) => `${(size / 1024).toFixed(2)} KB`
    },
    {
      title: 'Uploaded',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags) => (
        <Space>
          {tags.map(tag => (
            <Tag key={tag} color="green">{tag}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Preview">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record.url)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record._id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="scan-and-upload">
      <Card
        title={
          <Space>
            <ScanOutlined />
            <span>Scan & Upload Documents</span>
          </Space>
        }
      >
        <Row gutter={[16, 16]} className="action-buttons">
          <Col xs={24} sm={12} md={6}>
            <Button
              type="primary"
              icon={<ScanOutlined />}
              onClick={handleScan}
              block
            >
              Scan Document
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Upload
              customRequest={handleUpload}
              showUploadList={false}
              accept=".pdf,.jpg,.jpeg,.png"
            >
              <Button icon={<UploadOutlined />} block>
                Upload File
              </Button>
            </Upload>
          </Col>
        </Row>

        <Table
          loading={loading}
          columns={columns}
          dataSource={documents}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} documents`
          }}
        />

        <Modal
          title="Edit Document"
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="name"
              label="Document Name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="medical">Medical Records</Option>
                <Option value="lab">Lab Reports</Option>
                <Option value="prescription">Prescriptions</Option>
                <Option value="insurance">Insurance</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item
              name="tags"
              label="Tags"
            >
              <Select mode="tags" />
            </Form.Item>

            <Form.Item>
              <Space className="form-buttons">
                <Button onClick={() => setModalVisible(false)}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  Save
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          visible={previewVisible}
          footer={null}
          onCancel={() => setPreviewVisible(false)}
          width={800}
        >
          <img
            alt="Preview"
            style={{ width: '100%' }}
            src={previewImage}
          />
        </Modal>
      </Card>
    </div>
  );
};

export default ScanAndUpload; 