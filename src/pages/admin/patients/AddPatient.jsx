import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  DatePicker, 
  Upload, 
  message, 
  Card, 
  Row, 
  Col 
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';

const { Option } = Select;

const AddPatient = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      console.log('Form values:', values);

      const formData = new FormData();
      
      // Basic fields
      formData.append('firstName', values.firstName || '');
      formData.append('lastName', values.lastName || '');
      formData.append('patientId', values.patientId || '');
      formData.append('email', values.email || '');
      formData.append('contactNumber', values.contactNumber || '');
      formData.append('dateOfBirth', values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : '');
      formData.append('gender', values.gender || '');
      formData.append('bloodGroup', values.bloodGroup || '');
      formData.append('address', values.address || '');
      formData.append('status', values.status || 'ACTIVE');

      // Image
      if (values.image?.fileList?.[0]?.originFileObj) {
        formData.append('profile', values.image.fileList[0].originFileObj);
      }

      // Emergency Contact
      if (values.emergencyContact) {
        formData.append('emergencyContact', JSON.stringify({
          name: values.emergencyContact.name || '',
          relation: values.emergencyContact.relation || '',
          phone: values.emergencyContact.phone || ''
        }));
      }

      // Debug: Log all form data
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await axios.post('http://localhost:8080/api/v1/patients', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      message.success('Patient added successfully');
      navigate('/admin/patients/list');
    } catch (error) {
      console.error('Error adding patient:', error.response?.data || error);
      message.error(error.response?.data?.error || 'Failed to add patient');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
      }
      return false;
    },
    onChange: (info) => {
      if (info.file) {
        setImageUrl(URL.createObjectURL(info.file));
      }
    }
  };

  return (
    <AdminLayout>
      <Card title="Add New Patient" className="add-patient-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            status: 'Active',
            gender: 'Male'
          }}
        >
          {/* Personal Information */}
          <h3>Personal Information</h3>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true, message: 'First name is required' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: 'Last name is required' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="patientId"
                label="Patient ID"
                rules={[{ required: true, message: 'Patient ID is required' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Email is required' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contactNumber"
                label="Contact Number"
                rules={[{ required: true, message: 'Contact number is required' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dateOfBirth"
                label="Date of Birth"
                rules={[{ required: true, message: 'Date of birth is required' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="gender"
                label="Gender"
                rules={[{ required: true, message: 'Gender is required' }]}
              >
                <Select>
                  <Option value="Male">Male</Option>
                  <Option value="Female">Female</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="bloodGroup"
                label="Blood Group"
                rules={[{ required: true, message: 'Blood group is required' }]}
              >
                <Select>
                  <Option value="A+">A+</Option>
                  <Option value="A-">A-</Option>
                  <Option value="B+">B+</Option>
                  <Option value="B-">B-</Option>
                  <Option value="AB+">AB+</Option>
                  <Option value="AB-">AB-</Option>
                  <Option value="O+">O+</Option>
                  <Option value="O-">O-</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: 'Address is required' }]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="image"
            label="Profile Photo"
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Upload Photo</Button>
            </Upload>
          </Form.Item>

          {/* Emergency Contact */}
          <h3>Emergency Contact</h3>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name={['emergencyContact', 'name']}
                label="Contact Name"
                rules={[{ required: true, message: 'Emergency contact name is required' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={['emergencyContact', 'relation']}
                label="Relation"
                rules={[{ required: true, message: 'Relation is required' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={['emergencyContact', 'phone']}
                label="Contact Phone"
                rules={[{ required: true, message: 'Emergency contact phone is required' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Status is required' }]}
          >
            <Select>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Add Patient
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </AdminLayout>
  );
};

export default AddPatient;