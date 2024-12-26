import React, { useState } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Radio,
  Button,
  Card,
  Row,
  Col,
  Space,
  Divider,
  Upload,
  message
} from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  IdcardOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { patientAPI } from '../../services/api';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;

const PatientRegistration = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Phone validation rules
  const phoneRules = [
    { required: true, message: 'Phone number is required' },
    {
      pattern: /^03\d{9}$/,
      message: 'Please enter valid phone number (03XXXXXXXXX)'
    },
    {
      min: 11,
      max: 11,
      message: 'Phone number must be 11 digits'
    }
  ];

  // Emergency contact phone validation rules
  const emergencyPhoneRules = [
    { required: true, message: 'Emergency contact phone is required' },
    {
      pattern: /^03\d{9}$/,
      message: 'Please enter valid phone number (03XXXXXXXXX)'
    },
    {
      min: 11,
      max: 11,
      message: 'Phone number must be 11 digits'
    }
  ];

  // CNIC validation rules
  const cnicRules = [
    { required: true, message: 'CNIC is required' },
    {
      pattern: /^\d{5}-\d{7}-\d{1}$/,
      message: 'Please enter valid CNIC format (XXXXX-XXXXXXX-X)'
    }
  ];

  const onFinish = async (values) => {
    try {
      setLoading(true);
      
      const formattedData = {
        firstName: values.firstName,
        lastName: values.lastName,
        dateOfBirth: moment(values.dateOfBirth).format('YYYY-MM-DD'),
        gender: values.gender.charAt(0).toUpperCase() + values.gender.slice(1),
        cnic: values.cnic,
        contactNumber: values.phone,
        email: values.email,
        address: {
          street: values.address,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          country: values.country
        },
        bloodGroup: values.bloodGroup,
        emergencyContact: {
          name: values.emergencyContactName,
          relationship: values.relationship,
          phone: values.emergencyContactPhone
        }
      };

      console.log('Sending data:', formattedData);

      const result = await patientAPI.createPatient(formattedData);
      
      if (result.success) {
        message.success(`Patient registered successfully with ID: ${result.data.patientId}`);
        form.resetFields();
      } else {
        throw new Error(result.message || 'Failed to register patient');
      }
    } catch (error) {
      console.error('Registration error details:', error);
      
      if (error.response?.data) {
        message.error(`Registration failed: ${error.response.data.message}`);
      } else {
        message.error('Error registering patient: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Add address fields
  const addressFields = (
    <Row gutter={16}>
      <Col xs={24} md={12}>
        <Form.Item
          name="city"
          label="City"
          rules={[{ required: true, message: 'Please enter city' }]}
        >
          <Input placeholder="Enter city" />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          name="state"
          label="State/Province"
          rules={[{ required: true, message: 'Please enter state' }]}
        >
          <Input placeholder="Enter state" />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          name="zipCode"
          label="Zip Code"
          rules={[{ required: true, message: 'Please enter zip code' }]}
        >
          <Input placeholder="Enter zip code" />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          name="country"
          label="Country"
          rules={[{ required: true, message: 'Please enter country' }]}
        >
          <Input placeholder="Enter country" />
        </Form.Item>
      </Col>
    </Row>
  );

  return (
    <Card title="Patient Registration" className="patient-registration-card">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          gender: 'male',
          country: 'Pakistan'
        }}
      >
        {/* Personal Information */}
        <div className="section">
          <h3>Personal Information</h3>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true, message: 'Please enter first name' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Enter first name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: 'Please enter last name' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Enter last name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="cnic"
                label="CNIC"
                rules={cnicRules}
              >
                <Input 
                  prefix={<IdcardOutlined />} 
                  placeholder="XXXXX-XXXXXXX-X"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="dateOfBirth"
                label="Date of Birth"
                rules={[{ required: true, message: 'Please select date of birth' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="gender"
                label="Gender"
                rules={[{ required: true, message: 'Please select gender' }]}
              >
                <Radio.Group>
                  <Radio value="male">Male</Radio>
                  <Radio value="female">Female</Radio>
                  <Radio value="other">Other</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
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
        </div>

        <Divider />

        {/* Contact Information */}
        <div className="section">
          <h3>Contact Information</h3>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="phone"
                label="Phone Number"
                rules={phoneRules}
              >
                <Input 
                  prefix={<PhoneOutlined />} 
                  placeholder="03XXXXXXXXX"
                  maxLength={11}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { type: 'email', message: 'Please enter valid email' }
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Enter email address" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Street Address"
            rules={[{ required: true, message: 'Please enter street address' }]}
          >
            <TextArea 
              prefix={<HomeOutlined />} 
              placeholder="Enter street address"
              rows={2}
            />
          </Form.Item>
          {addressFields}
        </div>

        <Divider />

        {/* Emergency Contact */}
        <div className="section">
          <h3>Emergency Contact</h3>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="emergencyContactName"
                label="Contact Name"
                rules={[{ required: true, message: 'Please enter emergency contact name' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Enter contact name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="emergencyContactPhone"
                label="Emergency Contact Phone"
                rules={emergencyPhoneRules}
              >
                <Input 
                  prefix={<PhoneOutlined />} 
                  placeholder="03XXXXXXXXX"
                  maxLength={11}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="relationship"
            label="Relationship"
            rules={[{ required: true, message: 'Please select relationship' }]}
          >
            <Select placeholder="Select relationship">
              <Option value="parent">Parent</Option>
              <Option value="spouse">Spouse</Option>
              <Option value="sibling">Sibling</Option>
              <Option value="child">Child</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>
        </div>

        <Divider />

        {/* Documents Upload */}
        <div className="section">
          <h3>Documents</h3>
          <Form.Item
            name="documents"
            label="Upload Documents"
          >
            <Upload>
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>
        </div>

        {/* Submit Button */}
        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            block
          >
            Register Patient
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default PatientRegistration;