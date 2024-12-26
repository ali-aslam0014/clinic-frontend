import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Tooltip,
  Tag,
  Drawer
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  FilePdfOutlined
} from '@ant-design/icons';
import DoctorLayout from '../../../components/doctor/Layout';
import axios from 'axios';
import moment from 'moment';
import './DoctorMedicalRecords.css';

const { Option } = Select;
const { TextArea } = Input;

const DoctorMedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form] = Form.useForm();
  const [patients, setPatients] = useState([]);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8080/api/v1/doctor/medical-records`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log('Medical records response:', response.data);
      
      if (response.data.success) {
        setRecords(response.data.data);
      } else {
        message.error('Failed to fetch medical records');
      }
    } catch (error) {
      message.error('Failed to fetch medical records');
      console.error('Fetch medical records error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8080/api/v1/doctor/patients',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        setPatients(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      message.error('Failed to fetch patients');
    }
  };

  useEffect(() => {
    fetchMedicalRecords();
    fetchPatients();
  }, []);

  const handleAddRecord = () => {
    setSelectedRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditRecord = (record) => {
    setSelectedRecord(record);
    form.setFieldsValue({
      ...record,
      date: moment(record.date),
      diagnosis: record.diagnosis || {},
      vitals: record.vitals || {},
      treatment: record.treatment || {}
    });
    setModalVisible(true);
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setDrawerVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const url = selectedRecord 
        ? `http://localhost:8080/api/v1/doctor/medical-records/${selectedRecord._id}`
        : `http://localhost:8080/api/v1/doctor/medical-records`;

      const method = selectedRecord ? 'put' : 'post';
      
      await axios({
        method,
        url,
        data: values,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      message.success(`Medical record ${selectedRecord ? 'updated' : 'added'} successfully`);
      setModalVisible(false);
      fetchMedicalRecords();
    } catch (error) {
      message.error('Failed to save medical record');
      console.error('Save medical record error:', error);
    }
  };

  const handleDelete = async (recordId) => {
    try {
      await axios.delete(
        `http://localhost:8080/api/v1/doctor/medical-records/${recordId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      message.success('Medical record deleted successfully');
      fetchMedicalRecords();
    } catch (error) {
      message.error('Failed to delete medical record');
      console.error('Delete medical record error:', error);
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix()
    },
    {
      title: 'Record Type',
      dataIndex: 'recordType',
      key: 'recordType',
      render: (type) => (
        <Tag color={
          type === 'Diagnosis' ? 'blue' :
          type === 'Lab Report' ? 'green' :
          type === 'Prescription' ? 'purple' :
          type === 'Treatment' ? 'orange' : 'default'
        }>
          {type}
        </Tag>
      )
    },
    {
      title: 'Diagnosis',
      dataIndex: ['diagnosis', 'condition'],
      key: 'diagnosis'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'Active' ? 'green' :
          status === 'Completed' ? 'blue' :
          'red'
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
          <Tooltip title="View">
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => handleViewRecord(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              icon={<EditOutlined />} 
              onClick={() => handleEditRecord(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDelete(record._id)}
            />
          </Tooltip>
          <Tooltip title="Generate PDF">
            <Button 
              icon={<FilePdfOutlined />} 
              onClick={() => generatePDF(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <DoctorLayout>
      <Card
        title="Medical Records"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRecord}>
            Add Record
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={records}
          rowKey="_id"
          loading={loading}
        />
      </Card>

      <Modal
        title={selectedRecord ? "Edit Medical Record" : "Add Medical Record"}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="recordType"
            label="Record Type"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="Diagnosis">Diagnosis</Option>
              <Option value="Lab Report">Lab Report</Option>
              <Option value="Prescription">Prescription</Option>
              <Option value="Treatment">Treatment</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Diagnosis">
            <Input.Group compact>
              <Form.Item
                name={['diagnosis', 'condition']}
                noStyle
              >
                <Input placeholder="Condition" style={{ width: '50%' }} />
              </Form.Item>
              <Form.Item
                name={['diagnosis', 'severity']}
                noStyle
              >
                <Select placeholder="Severity" style={{ width: '50%' }}>
                  <Option value="Mild">Mild</Option>
                  <Option value="Moderate">Moderate</Option>
                  <Option value="Severe">Severe</Option>
                </Select>
              </Form.Item>
            </Input.Group>
          </Form.Item>

          <Form.Item
            name={['diagnosis', 'notes']}
            label="Diagnosis Notes"
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item label="Vitals">
            <Input.Group compact>
              <Form.Item
                name={['vitals', 'bloodPressure']}
                noStyle
              >
                <Input placeholder="Blood Pressure" style={{ width: '25%' }} />
              </Form.Item>
              <Form.Item
                name={['vitals', 'temperature']}
                noStyle
              >
                <Input placeholder="Temperature" style={{ width: '25%' }} />
              </Form.Item>
              <Form.Item
                name={['vitals', 'heartRate']}
                noStyle
              >
                <Input placeholder="Heart Rate" style={{ width: '25%' }} />
              </Form.Item>
              <Form.Item
                name={['vitals', 'respiratoryRate']}
                noStyle
              >
                <Input placeholder="Respiratory Rate" style={{ width: '25%' }} />
              </Form.Item>
            </Input.Group>
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="Active">Active</Option>
              <Option value="Completed">Completed</Option>
              <Option value="Cancelled">Cancelled</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {selectedRecord ? 'Update' : 'Add'} Record
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="Medical Record Details"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        width={600}
      >
        {selectedRecord && (
          <div className="record-details">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Record Type">
                {selectedRecord.recordType}
              </Descriptions.Item>
              <Descriptions.Item label="Date">
                {moment(selectedRecord.date).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Diagnosis">
                {selectedRecord.diagnosis?.condition}
              </Descriptions.Item>
              <Descriptions.Item label="Severity">
                {selectedRecord.diagnosis?.severity}
              </Descriptions.Item>
              <Descriptions.Item label="Notes">
                {selectedRecord.diagnosis?.notes}
              </Descriptions.Item>
              <Descriptions.Item label="Vitals">
                <ul>
                  <li>Blood Pressure: {selectedRecord.vitals?.bloodPressure}</li>
                  <li>Temperature: {selectedRecord.vitals?.temperature}</li>
                  <li>Heart Rate: {selectedRecord.vitals?.heartRate}</li>
                  <li>Respiratory Rate: {selectedRecord.vitals?.respiratoryRate}</li>
                </ul>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {selectedRecord.status}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </DoctorLayout>
  );
};

export default DoctorMedicalRecords;