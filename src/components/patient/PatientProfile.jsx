import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Spin,
  Divider,
  Avatar,
  Upload
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  UploadOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import './PatientProfile.css';

const { Option } = Select;

const PatientProfile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/patients/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProfile(response.data.data);
      setImageUrl(response.data.data.profileImage);
      form.setFieldsValue({
        ...response.data.data,
        dateOfBirth: response.data.data.dateOfBirth ? moment(response.data.data.dateOfBirth) : null
      });
    } catch (error) {
      message.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const response = await axios.put(
        'http://localhost:8080/api/v1/patients/profile',
        {
          ...values,
          dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setProfile(response.data.data);
      message.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      message.error('Failed to update profile');
    }
  };

  const handleImageUpload = async (info) => {
    if (info.file.status === 'uploading') {
      setUploading(true);
      return;
    }
    if (info.file.status === 'done') {
      setImageUrl(info.file.response.url);
      setUploading(false);
      message.success('Profile image updated successfully');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Card
        title={
          <div className="profile-header">
            <span>My Profile</span>
            <Button
              type={editing ? "primary" : "default"}
              icon={editing ? <SaveOutlined /> : <EditOutlined />}
              onClick={() => {
                if (editing) {
                  form.submit();
                } else {
                  setEditing(true);
                }
              }}
            >
              {editing ? 'Save' : 'Edit Profile'}
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={!editing}
        >
          <Row gutter={[24, 24]} align="top">
            <Col xs={24} sm={8}>
              <div className="profile-image-section">
                <Avatar
                  size={200}
                  src={imageUrl}
                  icon={<UserOutlined />}
                />
                {editing && (
                  <Upload
                    name="avatar"
                    action="http://localhost:8080/api/v1/patients/profile/image"
                    headers={{
                      Authorization: `Bearer ${localStorage.getItem('token')}`
                    }}
                    showUploadList={false}
                    onChange={handleImageUpload}
                  >
                    <Button
                      icon={<UploadOutlined />}
                      loading={uploading}
                      className="upload-button"
                    >
                      Change Photo
                    </Button>
                  </Upload>
                )}
              </div>
            </Col>

            <Col xs={24} sm={16}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[{ required: true, message: 'Name is required' }]}
                  >
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Email is required' },
                      { type: 'email', message: 'Invalid email format' }
                    ]}
                  >
                    <Input prefix={<MailOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="phone"
                    label="Phone Number"
                    rules={[{ required: true, message: 'Phone number is required' }]}
                  >
                    <Input prefix={<PhoneOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="dateOfBirth"
                    label="Date of Birth"
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="gender"
                    label="Gender"
                  >
                    <Select>
                      <Option value="male">Male</Option>
                      <Option value="female">Female</Option>
                      <Option value="other">Other</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="bloodGroup"
                    label="Blood Group"
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

              <Divider />

              <Form.Item
                name="address"
                label="Address"
              >
                <Input.TextArea
                  rows={3}
                  prefix={<HomeOutlined />}
                />
              </Form.Item>

              <Form.Item
                name="emergencyContact"
                label="Emergency Contact"
              >
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>

              {/* Medical History Section */}
              <Divider orientation="left">Medical History</Divider>
              <Form.Item
                name="allergies"
                label="Allergies"
              >
                <Input.TextArea rows={2} />
              </Form.Item>

              <Form.Item
                name="chronicConditions"
                label="Chronic Conditions"
              >
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default PatientProfile;