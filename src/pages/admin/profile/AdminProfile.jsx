import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Avatar,
  Typography,
  Button,
  Form,
  Input,
  Tabs,
  message,
  Upload,
  Divider,
  Space,
  Spin
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  EditOutlined,
  UploadOutlined,
  SaveOutlined,
  LoadingOutlined,
  SettingOutlined
} from '@ant-design/icons';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './AdminProfile.css';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const AdminProfile = () => {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/v1/admin/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data?.data) {
        setProfileData(response.data.data);
        setImageUrl(response.data.data.avatar);
        form.setFieldsValue({
          name: response.data.data.name,
          email: response.data.data.email,
          phone: response.data.data.phone
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      message.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (values) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/v1/admin/profile', values, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      message.success('Profile updated successfully');
      fetchProfileData();
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile');
    }
  };

  const handlePasswordChange = async (values) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/v1/admin/profile/password', values, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      message.success('Password changed successfully');
      passwordForm.resetFields();
    } catch (error) {
      console.error('Error changing password:', error);
      message.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleImageUpload = async (info) => {
    if (info.file.status === 'uploading') {
      setUploading(true);
      return;
    }
    
    if (info.file.status === 'done') {
      setImageUrl(info.file.response.data.url);
      setUploading(false);
      message.success('Profile picture updated successfully');
    }
  };

  const uploadButton = (
    <div>
      {uploading ? <LoadingOutlined /> : <UploadOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-profile-container">
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-profile-container">
        <Title level={2}>My Profile</Title>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card className="profile-card">
              <div className="profile-avatar">
                <Upload
                  name="avatar"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  action="/api/v1/admin/profile/avatar"
                  headers={{
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                  }}
                  onChange={handleImageUpload}
                >
                  {imageUrl ? (
                    <Avatar
                      size={200}
                      src={imageUrl}
                      alt="avatar"
                    />
                  ) : (
                    uploadButton
                  )}
                </Upload>
              </div>
              
              <Divider />
              
              <div className="profile-info">
                <Title level={4}>{profileData?.name}</Title>
                <Text type="secondary">{profileData?.role}</Text>
                <Space direction="vertical" className="profile-details">
                  <Text>
                    <MailOutlined /> {profileData?.email}
                  </Text>
                  <Text>
                    <PhoneOutlined /> {profileData?.phone}
                  </Text>
                </Space>
              </div>
            </Card>
          </Col>

          <Col xs={24} md={16}>
            <Card>
              <Tabs defaultActiveKey="1">
                <TabPane
                  tab={
                    <span>
                      <EditOutlined />
                      Edit Profile
                    </span>
                  }
                  key="1"
                >
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleProfileUpdate}
                  >
                    <Form.Item
                      name="name"
                      label="Name"
                      rules={[
                        { required: true, message: 'Please enter your name' }
                      ]}
                    >
                      <Input prefix={<UserOutlined />} />
                    </Form.Item>

                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: 'Please enter your email' },
                        { type: 'email', message: 'Please enter a valid email' }
                      ]}
                    >
                      <Input prefix={<MailOutlined />} />
                    </Form.Item>

                    <Form.Item
                      name="phone"
                      label="Phone"
                      rules={[
                        { required: true, message: 'Please enter your phone number' }
                      ]}
                    >
                      <Input prefix={<PhoneOutlined />} />
                    </Form.Item>

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                      >
                        Save Changes
                      </Button>
                    </Form.Item>
                  </Form>
                </TabPane>

                <TabPane
                  tab={
                    <span>
                      <LockOutlined />
                      Change Password
                    </span>
                  }
                  key="2"
                >
                  <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handlePasswordChange}
                  >
                    <Form.Item
                      name="currentPassword"
                      label="Current Password"
                      rules={[
                        { required: true, message: 'Please enter current password' }
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>

                    <Form.Item
                      name="newPassword"
                      label="New Password"
                      rules={[
                        { required: true, message: 'Please enter new password' },
                        { min: 6, message: 'Password must be at least 6 characters' }
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>

                    <Form.Item
                      name="confirmPassword"
                      label="Confirm Password"
                      dependencies={['newPassword']}
                      rules={[
                        { required: true, message: 'Please confirm your password' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject('Passwords do not match');
                          },
                        }),
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                      >
                        Change Password
                      </Button>
                    </Form.Item>
                  </Form>
                </TabPane>

                <TabPane
                  tab={
                    <span>
                      <SettingOutlined />
                      Profile Settings
                    </span>
                  }
                  key="3"
                >
                  <Link to="/admin/profile/settings">
                    <Button icon={<SettingOutlined />}>
                      Profile Settings
                    </Button>
                  </Link>
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;