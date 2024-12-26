import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  message,
  Divider,
  Typography
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  FileTextOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import DoctorLayout from '../../../components/doctor/Layout';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

const LabReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [form] = Form.useForm();

  const patientId = window.location.pathname.split('/')[3];

  useEffect(() => {
    fetchReports();
  }, [patientId]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/patients/${patientId}/lab-reports`);
      setReports(response.data.data);
    } catch (error) {
      message.error('Failed to fetch lab reports');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const formData = {
        ...values,
        testDate: values.testDate.toDate(),
        reportDate: values.reportDate.toDate()
      };

      if (selectedReport) {
        await axios.put(`/api/patients/${patientId}/lab-reports/${selectedReport._id}`, formData);
        message.success('Lab report updated successfully');
      } else {
        await axios.post(`/api/patients/${patientId}/lab-reports`, formData);
        message.success('Lab report created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setSelectedReport(null);
      fetchReports();
    } catch (error) {
      message.error('Failed to save lab report');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/patients/${patientId}/lab-reports/${id}`);
      message.success('Lab report deleted successfully');
      fetchReports();
    } catch (error) {
      message.error('Failed to delete lab report');
    }
  };

  const columns = [
    {
      title: 'Test Name',
      dataIndex: 'testName',
      key: 'testName'
    },
    {
      title: 'Category',
      dataIndex: 'testCategory',
      key: 'testCategory',
      render: category => (
        <Tag color="blue">{category}</Tag>
      )
    },
    {
      title: 'Test Date',
      dataIndex: 'testDate',
      key: 'testDate',
      render: date => moment(date).format('DD/MM/YYYY')
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={
          status === 'Completed' ? 'success' :
          status === 'Pending' ? 'processing' :
          'error'
        }>
          {status}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedReport(record);
              setViewModalVisible(true);
            }}
          >
            View
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedReport(record);
              form.setFieldsValue({
                ...record,
                testDate: moment(record.testDate),
                reportDate: moment(record.reportDate)
              });
              setModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          >
            Delete
          </Button>
        </Space>
      )
    }
  ];

  return (
    <DoctorLayout>
      <div className="lab-reports-container">
        <Card
          title={
            <Space>
              <FileTextOutlined />
              <span>Lab Reports</span>
            </Space>
          }
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedReport(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              Add Lab Report
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={reports}
            loading={loading}
            rowKey="_id"
          />
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          title={selectedReport ? 'Edit Lab Report' : 'Add Lab Report'}
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
            setSelectedReport(null);
          }}
          footer={null}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            {/* Form fields here */}
          </Form>
        </Modal>

        {/* View Modal */}
        <Modal
          title="Lab Report Details"
          visible={viewModalVisible}
          onCancel={() => {
            setViewModalVisible(false);
            setSelectedReport(null);
          }}
          footer={null}
          width={800}
        >
          {selectedReport && (
            <div className="lab-report-details">
              {/* Report details here */}
            </div>
          )}
        </Modal>
      </div>
    </DoctorLayout>
  );
};

export default LabReports;