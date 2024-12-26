import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Upload,
  message,
  Space,
  Tag,
  Descriptions
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  FileOutlined,
  EyeOutlined,
  DeleteOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './LabReports.css';

const API_URL = 'http://localhost:8080/api/v1';
const { TextArea } = Input;
const { Option } = Select;

const LabReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [form] = Form.useForm();
  const { patientId } = useParams();

  // Fetch lab reports
  const fetchLabReports = async () => {
    try {
      if (!patientId) {
        message.error('Patient ID is missing');
        return;
      }

      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        message.error('Please login to view lab reports');
        return;
      }

      const response = await axios.get(
        `${API_URL}/patients/${patientId}/lab-reports`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setReports(response.data.data);
      } else {
        message.error(response.data.message || 'Failed to fetch lab reports');
      }
    } catch (error) {
      console.error('Failed to fetch lab reports:', error);
      message.error('Failed to fetch lab reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {  // Only fetch if patientId exists
      fetchLabReports();
    }
  }, [patientId]);

  const columns = [
    {
      title: 'Test Date',
      dataIndex: 'testDate',
      key: 'testDate',
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.testDate) - moment(b.testDate),
    },
    {
      title: 'Test Name',
      dataIndex: 'testName',
      key: 'testName',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'completed' ? 'green' :
          status === 'pending' ? 'orange' :
          'red'
        }>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          />
          <Button
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record)}
            disabled={!record.reportFile}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record._id)}
          />
        </Space>
      ),
    },
  ];

  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Please login to add lab report');
        return;
      }

      const formData = new FormData();
      
      Object.keys(values).forEach(key => {
        if (key === 'reportFile' && values.reportFile?.[0]?.originFileObj) {
          formData.append('reportFile', values.reportFile[0].originFileObj);
        } else if (key === 'testDate') {
          formData.append(key, values[key].format('YYYY-MM-DD'));
        } else {
          formData.append(key, values[key]);
        }
      });

      formData.append('patientId', patientId);

      await axios.post(
        `${API_URL}/lab-reports`, 
        formData,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      message.success('Lab report added successfully');
      setModalVisible(false);
      form.resetFields();
      fetchLabReports();
    } catch (error) {
      console.error('Failed to add lab report:', error);
      message.error('Failed to add lab report');
    }
  };

  const handleView = (report) => {
    setSelectedReport(report);
    setViewModalVisible(true);
  };

  const handleDownload = async (report) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Please login to download report');
        return;
      }

      const response = await axios.get(
        `${API_URL}/lab-reports/${report._id}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.testName}_${moment(report.testDate).format('YYYY-MM-DD')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download report:', error);
      message.error('Failed to download report');
    }
  };

  const handleDelete = async (reportId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Please login to delete report');
        return;
      }

      await axios.delete(
        `${API_URL}/lab-reports/${reportId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      message.success('Lab report deleted successfully');
      fetchLabReports();
    } catch (error) {
      console.error('Failed to delete report:', error);
      message.error('Failed to delete report');
    }
  };

  return (
    <AdminLayout>
      <div className="lab-reports-container">
        <div className="lab-reports-header">
          <h2>Lab Reports</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setModalVisible(true);
              form.resetFields();
            }}
          >
            Add New Report
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={reports}
          loading={loading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} reports`
          }}
        />

        {/* Add Report Modal */}
        <Modal
          title="Add Lab Report"
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="testName"
              label="Test Name"
              rules={[{ required: true, message: 'Please enter test name' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please select category' }]}
            >
              <Select placeholder="Select category">
                <Option value="blood">Blood Test</Option>
                <Option value="urine">Urine Test</Option>
                <Option value="imaging">Imaging</Option>
                <Option value="pathology">Pathology</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="testDate"
              label="Test Date"
              rules={[{ required: true, message: 'Please select test date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="reportFile"
              label="Report File"
            >
              <Upload
                maxCount={1}
                beforeUpload={() => false}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              >
                <Button icon={<UploadOutlined />}>Upload Report</Button>
              </Upload>
            </Form.Item>

            <Form.Item
              name="results"
              label="Results/Findings"
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select placeholder="Select status">
                <Option value="pending">Pending</Option>
                <Option value="completed">Completed</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="notes"
              label="Additional Notes"
            >
              <TextArea rows={3} />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Add Report
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

        {/* View Report Modal */}
        <Modal
          title="Report Details"
          visible={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={[
            <Button
              key="download"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(selectedReport)}
              disabled={!selectedReport?.reportFile}
            >
              Download Report
            </Button>,
            <Button key="close" onClick={() => setViewModalVisible(false)}>
              Close
            </Button>
          ]}
          width={700}
        >
          {selectedReport && (
            <div className="report-details">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Test Name">
                  {selectedReport.testName}
                </Descriptions.Item>
                <Descriptions.Item label="Category">
                  {selectedReport.category}
                </Descriptions.Item>
                <Descriptions.Item label="Test Date">
                  {moment(selectedReport.testDate).format('DD/MM/YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={
                    selectedReport.status === 'completed' ? 'green' :
                    selectedReport.status === 'pending' ? 'orange' :
                    'red'
                  }>
                    {selectedReport.status.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Results/Findings" span={2}>
                  {selectedReport.results || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Additional Notes" span={2}>
                  {selectedReport.notes || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Report File" span={2}>
                  {selectedReport.reportFile ? (
                    <Button
                      icon={<FileOutlined />}
                      onClick={() => handleDownload(selectedReport)}
                    >
                      View Report File
                    </Button>
                  ) : (
                    'No file attached'
                  )}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default LabReports;