import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  message,
  Row,
  Col,
  Divider,
  Avatar,
  Typography,
  Select
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  UploadOutlined,
  EditOutlined
} from '@ant-design/icons';
import axios from 'axios';
import DoctorLayout from '../../../components/doctor/Layout';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const DoctorProfile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/doctors/profile');
      setProfile(response.data.data);
      setImageUrl(response.data.data.profileImage);
      form.setFieldsValue({
        ...response.data.data,
        specializations: response.data.data.specializations || []
      });
    } catch (error) {
      message.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const response = await axios.put('/api/doctors/profile', values);
      setProfile(response.data.data);
      message.success('Profile updated successfully');
    } catch (error) {
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      setImageUrl(info.file.response.url);
      setLoading(false);
      message.success('Profile image uploaded successfully');
    }
  };

  return (
    <DoctorLayout>
      <div className="doctor-profile-container">
        <Card>
          <Title level={2}>Doctor Profile</Title>
          <Divider />
          
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={profile}
          >
            <Row gutter={24}>
              <Col span={8} style={{ textAlign: 'center' }}>
                <Form.Item name="profileImage">
                  <Upload
                    name="avatar"
                    listType="picture-card"
                    className="avatar-uploader"
                    showUploadList={false}
                    action="/api/upload"
                    onChange={handleImageUpload}
                  >
                    {imageUrl ? (
                      <Avatar size={150} src={imageUrl} />
                    ) : (
                      <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>Upload Photo</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </Col>

              <Col span={16}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="name"
                      label="Full Name"
                      rules={[{ required: true, message: 'Please enter your name' }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="Dr. John Doe" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: 'Please enter your email' },
                        { type: 'email', message: 'Please enter a valid email' }
                      ]}
                    >
                      <Input prefix={<MailOutlined />} placeholder="doctor@example.com" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="phone"
                      label="Phone Number"
                      rules={[{ required: true, message: 'Please enter your phone number' }]}
                    >
                      <Input prefix={<PhoneOutlined />} placeholder="+1234567890" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="specializations"
                      label="Specializations"
                      rules={[{ required: true, message: 'Please select specializations' }]}
                    >
                      <Select mode="multiple" placeholder="Select specializations">
                        <Option value="Cardiology">Cardiology</Option>
                        <Option value="Neurology">Neurology</Option>
                        <Option value="Pediatrics">Pediatrics</Option>
                        <Option value="Orthopedics">Orthopedics</Option>
                        <Option value="Dermatology">Dermatology</Option>
                        <Option value="General Medicine">General Medicine</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="qualifications"
                  label="Qualifications"
                  rules={[{ required: true, message: 'Please enter your qualifications' }]}
                >
                  <TextArea rows={4} placeholder="MBBS, MD, etc." />
                </Form.Item>

                <Form.Item
                  name="experience"
                  label="Experience"
                  rules={[{ required: true, message: 'Please enter your experience' }]}
                >
                  <TextArea rows={4} placeholder="Your professional experience..." />
                </Form.Item>

                <Form.Item
                  name="about"
                  label="About"
                >
                  <TextArea rows={4} placeholder="Tell us about yourself..." />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Row justify="end">
              <Button type="primary" htmlType="submit" loading={loading} icon={<EditOutlined />}>
                Update Profile
              </Button>
            </Row>
          </Form>
        </Card>
      </div>
    </DoctorLayout>
  );
};

export default DoctorProfile;