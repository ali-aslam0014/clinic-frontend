import React, { useState } from 'react';
import { Form, Input, Select, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './AddDoctor.css';

const { TextArea } = Input;

const AddDoctor = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const formData = new FormData();

      // Handle image file
      if (values.image?.fileList?.[0]?.originFileObj) {
        const file = values.image.fileList[0].originFileObj;
        console.log('Image file:', file);
        formData.append('image', file);
      }

      // Add other fields
      const fields = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        specialization: values.specialization,
        experience: values.experience,
        qualifications: values.qualifications || '',
        address: values.address,
        consultationFee: values.consultationFee
      };

      // Add fields to formData
      Object.entries(fields).forEach(([key, value]) => {
        console.log(`Adding ${key}:`, value);
        formData.append(key, value);
      });

      // Log all form data
      console.log('FormData entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0], ':', pair[1]);
      }

      const token = localStorage.getItem('token');
      console.log('Using token:', token);

      const response = await axios.post(
        'http://localhost:8080/api/v1/doctors/admin/doctors',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Response:', response.data);

      if (response.data.success) {
        message.success('Doctor added successfully');
        form.resetFields();
        setImageUrl('');
      }
    } catch (error) {
      console.error('Error details:', error.response?.data);
      message.error(error.response?.data?.error || 'Failed to add doctor');
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
    return false; // Return false to prevent auto upload
  };

  return (
    <AdminLayout>
      <div className="add-doctor-container">
        <h2>Add New Doctor</h2>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="add-doctor-form"
        >
          <Form.Item
            name="image"
            label="Profile Photo"
            rules={[{ required: true, message: 'Please upload a photo' }]}
            valuePropName="file"
          >
            <Upload
              maxCount={1}
              listType="picture-card"
              beforeUpload={() => false}
              onChange={({ file, fileList }) => {
                console.log('Upload onChange:', { file, fileList });
                if (fileList.length > 0) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    setImageUrl(e.target.result);
                  };
                  reader.readAsDataURL(fileList[0].originFileObj);
                } else {
                  setImageUrl('');
                }
              }}
            >
              {imageUrl ? (
                <img src={imageUrl} alt="avatar" style={{ width: '100%' }} />
              ) : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter doctor name' }]}
          >
            <Input placeholder="Enter doctor's full name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[{ required: true, message: 'Please enter phone number' }]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>

          <Form.Item
            name="specialization"
            label="Specialization"
            rules={[{ required: true, message: 'Please select specialization' }]}
          >
            <Select placeholder="Select specialization">
              <Select.Option value="cardiologist">Cardiologist</Select.Option>
              <Select.Option value="dermatologist">Dermatologist</Select.Option>
              <Select.Option value="neurologist">Neurologist</Select.Option>
              <Select.Option value="orthopedic">Orthopedic</Select.Option>
              <Select.Option value="pediatrician">Pediatrician</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="experience"
            label="Years of Experience"
            rules={[{ required: true, message: 'Please enter years of experience' }]}
          >
            <Input type="number" min={0} placeholder="Years of experience" />
          </Form.Item>

          <Form.Item
            name="qualifications"
            label="Qualifications"
            rules={[{ required: true, message: 'Please enter qualifications' }]}
          >
            <TextArea rows={4} placeholder="Enter qualifications" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: 'Please enter address' }]}
          >
            <TextArea rows={3} placeholder="Enter clinic address" />
          </Form.Item>

          <Form.Item
            name="consultationFee"
            label="Consultation Fee"
            rules={[{ required: true, message: 'Please enter consultation fee' }]}
          >
            <Input type="number" min={0} placeholder="Enter consultation fee" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Add Doctor
            </Button>
          </Form.Item>
        </Form>
      </div>
    </AdminLayout>
  );
};

export default AddDoctor;