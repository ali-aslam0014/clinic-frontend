import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  Space,
  Typography,
  Row,
  Col,
  message,
  Divider,
  TimePicker,
  Select
} from 'antd';
import {
  UploadOutlined,
  SaveOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './ClinicDetails.css';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ClinicDetails = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [clinicData, setClinicData] = useState(null);

  useEffect(() => {
    fetchClinicDetails();
  }, []);

  const fetchClinicDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/v1/admin/settings/clinic', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data?.data) {
        setClinicData(response.data.data);
        form.setFieldsValue(response.data.data);
        setImageUrl(response.data.data.logo);
      }
    } catch (error) {
      console.error('Error fetching clinic details:', error);
      message.error('Failed to load clinic details');
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined) {
          formData.append(key, values[key]);
        }
      });

      await axios.put('/api/v1/admin/settings/clinic', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      message.success('Clinic details updated successfully');
      fetchClinicDetails();
    } catch (error) {
      console.error('Error updating clinic details:', error);
      message.error('Failed to update clinic details');
    } finally {
      setLoading(false);
    }
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
    }
    return isImage && isLt2M;
  };

  const handleChange = (info) => {
    if (info.file.status === 'done') {
      setImageUrl(info.file.response.url);
      message.success('Logo uploaded successfully');
    }
  };

  return (
    <AdminLayout>
      <div className="clinic-details-container">
        <Title level={2}>Clinic Details</Title>
        <Text type="secondary">
          Manage your clinic's basic information and settings
        </Text>

        <Card className="clinic-form-card">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={clinicData}
          >
            <Row gutter={24}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="name"
                  label="Clinic Name"
                  rules={[{ required: true, message: 'Please enter clinic name' }]}
                >
                  <Input prefix={<HomeOutlined />} placeholder="Enter clinic name" />
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter valid email' }
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="Enter email address" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="phone"
                  label="Phone Number"
                  rules={[{ required: true, message: 'Please enter phone number' }]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="Enter phone number" />
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="website"
                  label="Website"
                >
                  <Input prefix={<GlobalOutlined />} placeholder="Enter website URL" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="address"
              label="Address"
              rules={[{ required: true, message: 'Please enter address' }]}
            >
              <TextArea rows={3} placeholder="Enter complete address" />
            </Form.Item>

            <Divider>Working Hours</Divider>

            <Row gutter={24}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="openingTime"
                  label="Opening Time"
                  rules={[{ required: true, message: 'Please select opening time' }]}
                >
                  <TimePicker 
                    format="HH:mm"
                    className="full-width"
                    placeholder="Select opening time"
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="closingTime"
                  label="Closing Time"
                  rules={[{ required: true, message: 'Please select closing time' }]}
                >
                  <TimePicker 
                    format="HH:mm"
                    className="full-width"
                    placeholder="Select closing time"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="workingDays"
              label="Working Days"
              rules={[{ required: true, message: 'Please select working days' }]}
            >
              <Select
                mode="multiple"
                placeholder="Select working days"
              >
                <Option value="monday">Monday</Option>
                <Option value="tuesday">Tuesday</Option>
                <Option value="wednesday">Wednesday</Option>
                <Option value="thursday">Thursday</Option>
                <Option value="friday">Friday</Option>
                <Option value="saturday">Saturday</Option>
                <Option value="sunday">Sunday</Option>
              </Select>
            </Form.Item>

            <Divider>Clinic Logo</Divider>

            <Form.Item
              name="logo"
              label="Logo"
            >
              <Upload
                name="logo"
                listType="picture-card"
                className="logo-uploader"
                showUploadList={false}
                action="/api/v1/admin/settings/upload-logo"
                beforeUpload={beforeUpload}
                onChange={handleChange}
                headers={{
                  Authorization: `Bearer ${localStorage.getItem('token')}`
                }}
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="logo" style={{ width: '100%' }} />
                ) : (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                block
              >
                Save Changes
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ClinicDetails;