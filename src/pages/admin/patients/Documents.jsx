import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  Select,
  Space,
  Tag,
  message,
  Tooltip,
  Popconfirm,
  Card,
  Typography
} from 'antd';
import {
  UploadOutlined,
  FileOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useLocation, useSearchParams, useParams } from 'react-router-dom';
import moment from 'moment';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './Documents.css';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/v1/admin/patients/${patientId}/documents`);
      setDocuments(response.data.data);
    } catch (error) {
      message.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  // Fetch patient details
  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const response = await axios.get(`/api/v1/admin/patients/${patientId}`);
        if (response.data.success) {
          setPatient(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching patient details:', error);
        message.error('Failed to fetch patient details');
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatientDetails();
    }
  }, [patientId]);

  useEffect(() => {
    if (!patientId) {
      message.error('Patient ID is missing');
      return;
    }
    fetchDocuments();
  }, [patientId]);

  const columns = [
    {
      title: 'Document Name',
      dataIndex: 'documentName',
      key: 'documentName',
      render: (text, record) => (
        <Space>
          <FileOutlined />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color={
          category === 'medical' ? 'blue' :
          category === 'lab' ? 'purple' :
          category === 'insurance' ? 'green' :
          category === 'consent' ? 'orange' :
          'default'
        }>
          {category.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Upload Date',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.uploadDate) - moment(b.uploadDate),
    },
    {
      title: 'Size',
      dataIndex: 'fileSize',
      key: 'fileSize',
      render: (size) => formatFileSize(size),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Preview">
            <Button
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record)}
            />
          </Tooltip>
          <Tooltip title="Download">
            <Button
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this document?"
              onConfirm={() => handleDelete(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button icon={<DeleteOutlined />} danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Utility function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      if (!patientId) {
        message.error('Patient ID is required');
        return;
      }

      const formData = new FormData();
      formData.append('documentName', values.documentName);
      formData.append('category', values.category);
      formData.append('description', values.description);
      formData.append('file', values.file[0].originFileObj);

      // Log for debugging
      console.log('PatientId:', patientId);
      console.log('Form data:', Object.fromEntries(formData));

      const response = await axios.post(
        `/api/v1/admin/patients/${patientId}/documents`,
        formData,
        {
          headers: { 
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        message.success('Document uploaded successfully');
        // Refresh documents list
        fetchDocuments();
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error(error.response?.data?.message || 'Failed to upload document');
    }
  };

  // Handle document actions
  const handlePreview = (document) => {
    setPreviewDocument(document);
    setPreviewVisible(true);
  };

  const handleDownload = async (document) => {
    try {
      const response = await axios.get(
        `/api/v1/admin/documents/${document._id}/download`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.documentName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      message.error('Failed to download document');
    }
  };

  const handleDelete = async (documentId) => {
    try {
      await axios.delete(`/api/v1/admin/documents/${documentId}`);
      message.success('Document deleted successfully');
      fetchDocuments();
    } catch (error) {
      message.error('Failed to delete document');
    }
  };

  return (
    <AdminLayout>
      <div className="documents-container">
        <div className="documents-header">
          <h2>Patient Documents</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            Upload Document
          </Button>
        </div>

        {/* Patient Details Card */}
        <Card className="mb-4">
          <Title level={4}>Patient Details</Title>
          {loading ? (
            <div>Loading patient details...</div>
          ) : patient ? (
            <div>
              <p><strong>Name:</strong> {patient.firstName} {patient.lastName}</p>
              <p><strong>Patient ID:</strong> {patient._id}</p>
              <p><strong>Contact:</strong> {patient.phone}</p>
              {/* Add more patient details as needed */}
            </div>
          ) : (
            <div>No patient details found</div>
          )}
        </Card>

        <Table
          columns={columns}
          dataSource={documents}
          loading={loading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} documents`
          }}
        />

        {/* Upload Document Modal */}
        <Modal
          title="Upload Document"
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="documentName"
              label="Document Name"
              rules={[{ required: true, message: 'Please enter document name' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please select category' }]}
            >
              <Select>
                <Option value="medical">Medical Records</Option>
                <Option value="lab">Lab Reports</Option>
                <Option value="insurance">Insurance</Option>
                <Option value="consent">Consent Forms</Option>
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
              name="file"
              label="File"
              rules={[{ required: true, message: 'Please upload a file' }]}
            >
              <Upload
                maxCount={1}
                beforeUpload={() => false}
                listType="text"
              >
                <Button icon={<UploadOutlined />}>Select File</Button>
              </Upload>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Upload
                </Button>
                <Button onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Preview Document Modal */}
        <Modal
          title="Document Preview"
          visible={previewVisible}
          onCancel={() => setPreviewVisible(false)}
          footer={[
            <Button
              key="download"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(previewDocument)}
            >
              Download
            </Button>,
            <Button
              key="close"
              onClick={() => setPreviewVisible(false)}
            >
              Close
            </Button>
          ]}
          width={800}
        >
          {previewDocument && (
            <div className="document-preview">
              {previewDocument.fileType?.startsWith('image/') ? (
                <img
                  src={`/api/v1/admin/documents/${previewDocument._id}/view`}
                  alt={previewDocument.documentName}
                  style={{ maxWidth: '100%' }}
                />
              ) : (
                <div className="document-info">
                  <p><strong>Name:</strong> {previewDocument.documentName}</p>
                  <p><strong>Category:</strong> {previewDocument.category}</p>
                  <p><strong>Size:</strong> {formatFileSize(previewDocument.fileSize)}</p>
                  <p><strong>Upload Date:</strong> {moment(previewDocument.uploadDate).format('DD/MM/YYYY HH:mm')}</p>
                  {previewDocument.description && (
                    <p><strong>Description:</strong> {previewDocument.description}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default Documents;