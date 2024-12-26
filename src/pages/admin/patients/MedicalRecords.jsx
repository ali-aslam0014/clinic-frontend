import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Modal, Form, Input, DatePicker, 
  Select, InputNumber, Upload, message, Space, Tabs 
} from 'antd';
import { 
  PlusOutlined, UploadOutlined, 
  EditOutlined, DeleteOutlined, EyeOutlined 
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './MedicalRecords.css';
import moment from 'moment';
import { useCallback } from 'react';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const { patientId } = useParams();

  // Fetch medical records
  const fetchMedicalRecords = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8080/api/v1/medical-records/${patientId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Medical Records:', response.data);
      setRecords(response.data.data || []);
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Failed to fetch medical records');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  // Fetch doctors
  const fetchDoctors = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/doctors', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Doctors:', response.data);
      setDoctors(response.data.data || []);
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Failed to fetch doctors list');
    }
  }, []);

  useEffect(() => {
    if (patientId) {
      fetchMedicalRecords();
      fetchDoctors();
    }
  }, [fetchMedicalRecords, fetchDoctors, patientId]);

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();
      
      // Basic Information
      formData.append('doctorId', values.doctorId);
      formData.append('visitDate', values.visitDate.format('YYYY-MM-DD'));
      formData.append('chiefComplaint', values.chiefComplaint);
      formData.append('diagnosis', values.diagnosis);
      
      // Vital Signs
      if (values.vitalSigns) {
        const vitalSigns = {
          bloodPressure: values.vitalSigns.bloodPressure,
          temperature: values.vitalSigns.temperature,
          heartRate: values.vitalSigns.heartRate,
          respiratoryRate: values.vitalSigns.respiratoryRate,
          weight: values.vitalSigns.weight,
          height: values.vitalSigns.height
        };
        formData.append('vitalSigns', JSON.stringify(vitalSigns));
      }

      // Attachments
      if (values.attachments) {
        values.attachments.forEach((file, index) => {
          if (file.originFileObj) {
            formData.append(`attachments`, file.originFileObj);
          }
        });
      }

      // Additional fields
      if (values.notes) formData.append('notes', values.notes);
      if (values.followUpDate) {
        formData.append('followUpDate', values.followUpDate.format('YYYY-MM-DD'));
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };

      if (selectedRecord) {
        await axios.put(
          `http://localhost:8080/api/v1/medical-records/${selectedRecord._id}`, 
          formData,
          config
        );
        message.success('Medical record updated successfully');
      } else {
        await axios.post(
          `http://localhost:8080/api/v1/medical-records/${patientId}`, 
          formData,
          config
        );
        message.success('Medical record added successfully');
      }

      setModalVisible(false);
      form.resetFields();
      fetchMedicalRecords();
    } catch (error) {
      console.error('Submit error:', error);
      message.error('Failed to save medical record');
    }
  };

  const columns = [
    {
      title: 'Visit Date',
      dataIndex: 'visitDate',
      key: 'visitDate',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.visitDate) - new Date(b.visitDate),
    },
    {
      title: 'Doctor',
      dataIndex: ['doctorId', 'name'],
      key: 'doctorId',
      render: (_, record) => record.doctorId?.name || 'N/A',
    },
    {
      title: 'Diagnosis',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: 120 }}
          onChange={(value) => handleStatusChange(record._id, value)}
        >
          <Option value="active">Active</Option>
          <Option value="completed">Completed</Option>
          <Option value="cancelled">Cancelled</Option>
        </Select>
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
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          />
          <Button 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record._id)}
            danger
          />
        </Space>
      ),
    },
  ];

  // Handle record status change
  const handleStatusChange = async (recordId, status) => {
    try {
      await axios.patch(
        `http://localhost:8080/api/v1/medical-records/${recordId}/status`, 
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      message.success('Status updated successfully');
      fetchMedicalRecords();
    } catch (error) {
      console.error('Status update error:', error);
      message.error('Failed to update status');
    }
  };

  // Handle record view
  const handleView = (record) => {
    setSelectedRecord(record);
    setModalVisible(true);
    form.setFieldsValue({
      ...record,
      visitDate: moment(record.visitDate),
      followUpDate: record.followUpDate ? moment(record.followUpDate) : null,
    });
  };

  // Handle record edit
  const handleEdit = (record) => {
    setSelectedRecord(record);
    setModalVisible(true);
    form.setFieldsValue({
      ...record,
      visitDate: moment(record.visitDate),
      followUpDate: record.followUpDate ? moment(record.followUpDate) : null,
    });
  };

  // Handle record delete
  const handleDelete = async (recordId) => {
    try {
      await axios.delete(`http://localhost:8080/api/v1/medical-records/${recordId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      message.success('Medical record deleted successfully');
      fetchMedicalRecords();
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Failed to delete medical record');
    }
  };

  return (
    <AdminLayout>
      <div className="medical-records-container">
        <div className="medical-records-header">
          <h2>Medical Records</h2>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedRecord(null);
              setModalVisible(true);
              form.resetFields();
            }}
          >
            Add New Record
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={records}
          loading={loading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} records`
          }}
        />

        <Modal
          title={selectedRecord ? "Edit Medical Record" : "Add Medical Record"}
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Tabs defaultActiveKey="1">
              <TabPane tab="Basic Information" key="1">
                <Form.Item
                  name="doctorId"
                  label="Doctor"
                  rules={[{ required: true, message: 'Please select a doctor' }]}
                >
                  <Select placeholder="Select doctor">
                    {doctors.map(doctor => (
                      <Option key={doctor._id} value={doctor._id}>
                        {doctor.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="visitDate"
                  label="Visit Date"
                  rules={[{ required: true, message: 'Please select visit date' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                  name="chiefComplaint"
                  label="Chief Complaint"
                  rules={[{ required: true, message: 'Please enter chief complaint' }]}
                >
                  <TextArea rows={4} />
                </Form.Item>

                <Form.Item
                  name="diagnosis"
                  label="Diagnosis"
                  rules={[{ required: true, message: 'Please enter diagnosis' }]}
                >
                  <TextArea rows={4} />
                </Form.Item>
              </TabPane>

              <TabPane tab="Vital Signs" key="2">
                <Form.Item 
                  name={['vitalSigns', 'bloodPressure']} 
                  label="Blood Pressure"
                  rules={[{ required: true, message: 'Please enter blood pressure' }]}
                >
                  <Input placeholder="e.g., 120/80" />
                </Form.Item>

                <Form.Item 
                  name={['vitalSigns', 'temperature']} 
                  label="Temperature"
                  rules={[{ required: true, message: 'Please enter temperature' }]}
                >
                  <Input placeholder="e.g., 98.6°F" />
                </Form.Item>

                <Form.Item 
                  name={['vitalSigns', 'heartRate']} 
                  label="Heart Rate"
                  rules={[{ required: true, message: 'Please enter heart rate' }]}
                >
                  <Input placeholder="e.g., 72 bpm" />
                </Form.Item>

                <Form.Item 
                  name={['vitalSigns', 'respiratoryRate']} 
                  label="Respiratory Rate"
                  rules={[{ required: true, message: 'Please enter respiratory rate' }]}
                >
                  <Input placeholder="e.g., 16 breaths/min" />
                </Form.Item>

                <Form.Item 
                  name={['vitalSigns', 'weight']} 
                  label="Weight (kg)"
                  rules={[{ required: true, message: 'Please enter weight' }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item 
                  name={['vitalSigns', 'height']} 
                  label="Height (cm)"
                  rules={[{ required: true, message: 'Please enter height' }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </TabPane>

              <TabPane tab="Attachments" key="3">
                <Form.Item name="attachments" label="Upload Files">
                  <Upload
                    multiple
                    beforeUpload={() => false}
                    listType="picture"
                  >
                    <Button icon={<UploadOutlined />}>Upload</Button>
                  </Upload>
                </Form.Item>

                <Form.Item name="notes" label="Notes">
                  <TextArea rows={4} />
                </Form.Item>

                <Form.Item name="followUpDate" label="Follow-up Date">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </TabPane>
            </Tabs>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {selectedRecord ? 'Update Record' : 'Add Record'}
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
      </div>
    </AdminLayout>
  );
};

export default MedicalRecords;