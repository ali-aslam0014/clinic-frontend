import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Card,
  Row,
  Col,
  message,
  Space,
  Upload
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './EditPatient.css';

const { Option } = Select;
const { TextArea } = Input;

const EditPatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        console.log('Fetching patient with ID:', id);
        
        const response = await axios.get(`http://localhost:8080/api/v1/patients/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        console.log('Patient data received:', response.data);
        const patientData = response.data.data;
        
        // Set form values with actual data
        form.setFieldsValue({
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          patientId: patientData.patientId,
          email: patientData.email,
          contactNumber: patientData.contactNumber,
          dateOfBirth: patientData.dateOfBirth ? moment(patientData.dateOfBirth) : null,
          gender: patientData.gender,
          bloodGroup: patientData.bloodGroup,
          address: patientData.address,
          status: patientData.status,
          emergencyContact: patientData.emergencyContact
        });

        if (patientData.profile) {
          setImageUrl(`http://localhost:8080/uploads/profile-images/${patientData.profile}`);
        }
      } catch (error) {
        console.error('Error details:', error.response?.data);
        message.error('Failed to fetch patient details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPatient();
    }
  }, [id, form]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const formData = new FormData();

      // Append all form fields
      formData.append('firstName', values.firstName);
      formData.append('lastName', values.lastName);
      formData.append('patientId', values.patientId);
      formData.append('email', values.email);
      formData.append('contactNumber', values.contactNumber);
      formData.append('dateOfBirth', values.dateOfBirth.format('YYYY-MM-DD'));
      formData.append('gender', values.gender);
      formData.append('bloodGroup', values.bloodGroup);
      formData.append('address', values.address);
      formData.append('status', values.status || 'Active');

      // Handle image upload
      if (values.image?.fileList?.[0]?.originFileObj) {
        formData.append('profile', values.image.fileList[0].originFileObj);
      }

      // Handle emergency contact
      if (values.emergencyContact) {
        formData.append('emergencyContact', JSON.stringify(values.emergencyContact));
      }

      await axios.put(`http://localhost:8080/api/v1/patients/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      message.success('Patient updated successfully');
      navigate('/admin/patients/list');
    } catch (error) {
      console.error('Error updating patient:', error);
      message.error('Failed to update patient');
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
      <div className="edit-patient-container">
        <Card title="Edit Patient" loading={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="firstName"
                  label="First Name"
                  rules={[{ required: true, message: 'Please enter first name' }]}
                >
                  <Input placeholder="Enter first name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="lastName"
                  label="Last Name"
                  rules={[{ required: true, message: 'Please enter last name' }]}
                >
                  <Input placeholder="Enter last name" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="patientId"
                  label="Patient ID"
                  rules={[{ required: true, message: 'Please enter patient ID' }]}
                >
                  <Input placeholder="Enter patient ID" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter valid email' }
                  ]}
                >
                  <Input placeholder="Enter email" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="contactNumber"
                  label="Contact Number"
                  rules={[{ required: true, message: 'Please enter contact number' }]}
                >
                  <Input placeholder="Enter contact number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="dateOfBirth"
                  label="Date of Birth"
                  rules={[{ required: true, message: 'Please select date of birth' }]}
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
                  rules={[{ required: true, message: 'Please select gender' }]}
                >
                  <Select placeholder="Select gender">
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
                >
                  <Select placeholder="Select blood group">
                    <Option value="A+">A+</Option>
                    <Option value="A-">A-</Option>
                    <Option value="B+">B+</Option>
                    <Option value="B-">B-</Option>
                    <Option value="O+">O+</Option>
                    <Option value="O-">O-</Option>
                    <Option value="AB+">AB+</Option>
                    <Option value="AB-">AB-</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="address"
              label="Address"
              rules={[{ required: true, message: 'Please enter address' }]}
            >
              <TextArea rows={3} placeholder="Enter address" />
            </Form.Item>

            <Form.Item
              name="image"
              label="Profile Photo"
            >
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Upload Photo</Button>
              </Upload>
              {imageUrl && <img src={imageUrl} alt="Profile" style={{ width: 100, marginTop: 10 }} />}
            </Form.Item>

            {/* Emergency Contact */}
            <h3>Emergency Contact</h3>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name={['emergencyContact', 'name']}
                  label="Contact Name"
                  rules={[{ required: true, message: 'Please enter emergency contact name' }]}
                >
                  <Input placeholder="Enter contact name" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name={['emergencyContact', 'relation']}
                  label="Relation"
                  rules={[{ required: true, message: 'Please enter relation' }]}
                >
                  <Input placeholder="Enter relation" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name={['emergencyContact', 'phone']}
                  label="Contact Phone"
                  rules={[{ required: true, message: 'Please enter emergency contact phone' }]}
                >
                  <Input placeholder="Enter contact phone" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select placeholder="Select status">
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Update Patient
                </Button>
                <Button onClick={() => navigate('/admin/patients')}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default EditPatient;