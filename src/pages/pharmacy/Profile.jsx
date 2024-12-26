import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Button,
  Upload,
  message,
  Avatar,
  Divider,
  Typography,
  Descriptions,
  Space,
  Statistic
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EditOutlined,
  UploadOutlined,
  SaveOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import PharmacyLayout from '../../components/pharmacy/Layout';
import axios from 'axios';
import moment from 'moment';
import './Profile.css';

const { Title, Text } = Typography;

const Profile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [profileData, setProfileData] = useState(null);

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/pharmacy/profile');
      setProfileData(response.data.data);
      setImageUrl(response.data.data.image);
      form.setFieldsValue(response.data.data);
    } catch (error) {
      message.error('Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const response = await axios.put('/api/pharmacy/profile', values);
      setProfileData(response.data.data);
      message.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      setImageUrl(info.file.response.url);
      setLoading(false);
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <UploadOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <PharmacyLayout>
      <div className="profile-container">
        <Card className="profile-card">
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <div className="profile-image-section">
                <Upload
                  name="avatar"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  action="/api/upload"
                  onChange={handleImageUpload}
                >
                  {imageUrl ? (
                    <Avatar
                      size={200}
                      src={imageUrl}
                      alt="profile"
                    />
                  ) : (
                    uploadButton
                  )}
                </Upload>
                <Title level={4} className="profile-name">
                  {profileData?.name}
                </Title>
                <Text type="secondary">Pharmacist</Text>
              </div>
            </Col>
            
            <Col xs={24} md={16}>
              <div className="profile-details">
                <div className="section-header">
                  <Title level={4}>Profile Details</Title>
                  <Button
                    type="link"
                    icon={editing ? <SaveOutlined /> : <EditOutlined />}
                    onClick={() => setEditing(!editing)}
                  >
                    {editing ? 'Save' : 'Edit'}
                  </Button>
                </div>

                {editing ? (
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    className="profile-form"
                  >
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="name"
                          label="Full Name"
                          rules={[{ required: true, message: 'Name is required' }]}
                        >
                          <Input prefix={<UserOutlined />} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
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
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="phone"
                          label="Phone"
                          rules={[{ required: true, message: 'Phone is required' }]}
                        >
                          <Input prefix={<PhoneOutlined />} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="licenseNumber"
                          label="License Number"
                          rules={[{ required: true, message: 'License number is required' }]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24}>
                        <Form.Item
                          name="address"
                          label="Address"
                        >
                          <Input.TextArea rows={3} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item>
                      <Space>
                        <Button type="primary" htmlType="submit" loading={loading}>
                          Save Changes
                        </Button>
                        <Button onClick={() => setEditing(false)}>
                          Cancel
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                ) : (
                  <Descriptions column={1} bordered>
                    <Descriptions.Item label="Full Name">
                      {profileData?.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      {profileData?.email}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone">
                      {profileData?.phone}
                    </Descriptions.Item>
                    <Descriptions.Item label="License Number">
                      {profileData?.licenseNumber}
                    </Descriptions.Item>
                    <Descriptions.Item label="Address">
                      {profileData?.address}
                    </Descriptions.Item>
                  </Descriptions>
                )}

                <Divider />

                <div className="additional-info">
                  <Title level={5}>Additional Information</Title>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                      <Card size="small">
                        <Statistic
                          title="Total Sales"
                          value={profileData?.stats?.totalSales || 0}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} md={8}>
                      <Card size="small">
                        <Statistic
                          title="Products Managed"
                          value={profileData?.stats?.productsManaged || 0}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} md={8}>
                      <Card size="small">
                        <Statistic
                          title="Active Since"
                          value={profileData?.createdAt ? 
                            moment(profileData.createdAt).format('MMM YYYY') : '-'
                          }
                        />
                      </Card>
                    </Col>
                  </Row>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </PharmacyLayout>
  );
};

export default Profile; 