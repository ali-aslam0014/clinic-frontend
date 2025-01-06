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
  Divider,
  message,
  Skeleton,
  Upload,
  Modal
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  HomeOutlined,
  UploadOutlined,
  SaveOutlined
} from '@ant-design/icons';
import axiosInstance from '../../../utils/axiosConfig';
import './MyProfile.css';

const { Title, Text } = Typography;

const MyProfile = () => {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState(null);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/receptionist/profile');
      const { data } = response.data;
      setProfileData(data);
      setImageUrl(data.profileImage);
      form.setFieldsValue(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      message.error('Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const response = await axiosInstance.put('/receptionist/profile', values);
      message.success('Profile updated successfully');
      setEditing(false);
      setProfileData(response.data.data);
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('profileImage', file);
      
      const response = await axiosInstance.post('/receptionist/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setImageUrl(response.data.data.imageUrl);
      message.success('Profile image updated successfully');
      setUploadModalVisible(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      message.error('Failed to upload image');
    }
  };

  if (loading && !profileData) {
    return <Skeleton active />;
  }

  return (
    <div className="profile-container">
      <Card>
        <Row gutter={[24, 24]}>
          {/* Profile Header */}
          <Col xs={24} md={8} className="profile-header">
            <div className="avatar-section">
              <Avatar 
                size={120} 
                src={imageUrl} 
                icon={<UserOutlined />}
                className="profile-avatar"
              />
              <Button 
                icon={<UploadOutlined />} 
                onClick={() => setUploadModalVisible(true)}
                className="upload-button"
              >
                Change Photo
              </Button>
            </div>
            <div className="profile-info">
              <Title level={3}>{profileData?.name}</Title>
              <Text type="secondary">Receptionist</Text>
            </div>
          </Col>

          {/* Profile Details */}
          <Col xs={24} md={16}>
            <div className="profile-actions">
              <Button 
                type="primary" 
                icon={editing ? <SaveOutlined /> : <EditOutlined />}
                onClick={() => setEditing(!editing)}
              >
                {editing ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              disabled={!editing}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[{ required: true, message: 'Please enter your name' }]}
                  >
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
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
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="phone"
                    label="Phone Number"
                    rules={[{ required: true, message: 'Please enter your phone number' }]}
                  >
                    <Input prefix={<PhoneOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="employeeId"
                    label="Employee ID"
                  >
                    <Input prefix={<IdcardOutlined />} disabled />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="address"
                    label="Address"
                  >
                    <Input.TextArea prefix={<HomeOutlined />} rows={3} />
                  </Form.Item>
                </Col>
              </Row>

              {editing && (
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Save Changes
                  </Button>
                </Form.Item>
              )}
            </Form>
          </Col>
        </Row>
      </Card>

      {/* Image Upload Modal */}
      <Modal
        title="Update Profile Picture"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
      >
        <Upload
          beforeUpload={(file) => {
            handleImageUpload(file);
            return false;
          }}
          maxCount={1}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>Select Image</Button>
        </Upload>
      </Modal>
    </div>
  );
};

export default MyProfile; 