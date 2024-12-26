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
  message
} from 'antd';
import {
  PlusOutlined,
  FileTextOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import DoctorLayout from '../../../components/doctor/Layout';

const { TextArea } = Input;
const { Option } = Select;

const DiagnosisRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingRecord, setEditingRecord] = useState(null);

  const patientId = window.location.pathname.split('/')[3];

  useEffect(() => {
    fetchRecords();
  }, [patientId]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/patients/${patientId}/diagnosis`);
      setRecords(response.data.data);
    } catch (error) {
      message.error('Failed to fetch diagnosis records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRecord) {
        await axios.put(`/api/patients/${patientId}/diagnosis/${editingRecord._id}`, values);
        message.success('Diagnosis record updated successfully');
      } else {
        await axios.post(`/api/patients/${patientId}/diagnosis`, values);
        message.success('Diagnosis record created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingRecord(null);
      fetchRecords();
    } catch (error) {
      message.error('Failed to save diagnosis record');
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'diagnosisDate',
      key: 'diagnosisDate',
      render: date => moment(date).format('DD/MM/YYYY')
    },
    {
      title: 'Diagnosis',
      dataIndex: 'diagnosis',
      key: 'diagnosis'
    },
    {
      title: 'Type',
      dataIndex: 'diagnosisType',
      key: 'diagnosisType',
      render: type => (
        <Tag color={type === 'Final' ? 'green' : type === 'Working' ? 'orange' : 'blue'}>
          {type}
        </Tag>
      )
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: severity => (
        <Tag color={
          severity === 'Critical' ? 'red' : 
          severity === 'Severe' ? 'volcano' :
          severity === 'Moderate' ? 'orange' : 'green'
        }>
          {severity}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={
          status === 'Active' ? 'processing' :
          status === 'Resolved' ? 'success' :
          status === 'Chronic' ? 'warning' : 'default'
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
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => {
              setEditingRecord(record);
              form.setFieldsValue({
                ...record,
                diagnosisDate: moment(record.diagnosisDate)
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
      <div className="diagnosis-records-container">
        <Card
          title="Diagnosis Records"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingRecord(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              Add Diagnosis
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={records}
            loading={loading}
            rowKey="_id"
          />
        </Card>

        <Modal
          title={editingRecord ? 'Edit Diagnosis Record' : 'Add Diagnosis Record'}
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
            setEditingRecord(null);
          }}
          footer={null}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            {/* Form fields */}
            <Form.Item
              name="diagnosis"
              label="Diagnosis"
              rules={[{ required: true, message: 'Please enter diagnosis' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="symptoms"
              label="Symptoms"
              rules={[{ required: true, message: 'Please enter symptoms' }]}
            >
              <Select mode="tags" placeholder="Add symptoms">
                <Option value="fever">Fever</Option>
                <Option value="cough">Cough</Option>
                <Option value="headache">Headache</Option>
                {/* Add more common symptoms */}
              </Select>
            </Form.Item>

            <Form.Item
              name="findings"
              label="Clinical Findings"
              rules={[{ required: true, message: 'Please enter clinical findings' }]}
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item
              name="diagnosisType"
              label="Diagnosis Type"
              rules={[{ required: true, message: 'Please select diagnosis type' }]}
            >
              <Select>
                <Option value="Preliminary">Preliminary</Option>
                <Option value="Final">Final</Option>
                <Option value="Working">Working</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="severity"
              label="Severity"
              rules={[{ required: true, message: 'Please select severity' }]}
            >
              <Select>
                <Option value="Mild">Mild</Option>
                <Option value="Moderate">Moderate</Option>
                <Option value="Severe">Severe</Option>
                <Option value="Critical">Critical</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select>
                <Option value="Active">Active</Option>
                <Option value="Resolved">Resolved</Option>
                <Option value="Chronic">Chronic</Option>
                <Option value="In Treatment">In Treatment</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingRecord ? 'Update' : 'Create'}
                </Button>
                <Button onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                  setEditingRecord(null);
                }}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </DoctorLayout>
  );
};

export default DiagnosisRecords;