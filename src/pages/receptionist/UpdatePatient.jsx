import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Space,
  Divider,
  message
} from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  IdcardOutlined,
  SaveOutlined,
  RollbackOutlined
} from '@ant-design/icons';
import moment from 'moment';
import patientAPI from '../../services/patientAPI';
import './UpdatePatient.css';

const { Option } = Select;

const UpdatePatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState(null);

  // Fetch patient details
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await patientAPI.getPatientDetails(id);
        const patient = response.data;
        
        // Format the data for form
        const formattedData = {
          ...patient,
          dateOfBirth: moment(patient.dateOfBirth),
          'address.street': patient.address?.street,
          'address.city': patient.address?.city,
          'address.state': patient.address?.state,
          'address.country': patient.address?.country,
          'emergencyContact.name': patient.emergencyContact?.name,
          'emergencyContact.relationship': patient.emergencyContact?.relationship,
          'emergencyContact.phone': patient.emergencyContact?.phone
        };
        
        setInitialValues(formattedData);
        form.setFieldsValue(formattedData);
      } catch (error) {
        message.error('Error fetching patient details: ' + error.message);
      }
    };
    
    fetchPatient();
  }, [id, form]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      
      // Format the data
      const formattedData = {
        ...values,
        dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD'),
        address: {
          street: values['address.street'],
          city: values['address.city'],
          state: values['address.state'],
          country: values['address.country']
        },
        emergencyContact: {
          name: values['emergencyContact.name'],
          relationship: values['emergencyContact.relationship'],
          phone: values['emergencyContact.phone']
        }
      };

      // Remove nested address and emergencyContact fields
      delete formattedData['address.street'];
      delete formattedData['address.city'];
      delete formattedData['address.state'];
      delete formattedData['address.country'];
      delete formattedData['emergencyContact.name'];
      delete formattedData['emergencyContact.relationship'];
      delete formattedData['emergencyContact.phone'];

      await patientAPI.updatePatient(id, formattedData);
      message.success('Patient information updated successfully');
      navigate(`/patients/${id}`);
    } catch (error) {
      message.error('Error updating patient: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!initialValues) {
    return <Card loading={true} />;
  }

  return (
    <div className="update-patient">
      <Card
        title={
          <Space>
            <UserOutlined />
            Update Patient Information
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={initialValues}
        >
          {/* Basic Information */}
          <Divider>Basic Information</Divider>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="dateOfBirth"
                label="Date of Birth"
                rules={[{ required: true, message: 'Required' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="gender"
                label="Gender"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Select>
                  <Option value="Male">Male</Option>
                  <Option value="Female">Female</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="bloodGroup"
                label="Blood Group"
                rules={[{ required: true, message: 'Required' }]}
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

          {/* Contact Information */}
          <Divider>Contact Information</Divider>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="contactNumber"
                label="Contact Number"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { type: 'email', message: 'Invalid email' }
                ]}
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="cnic"
                label="CNIC"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input prefix={<IdcardOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          {/* Address */}
          <Divider>Address</Divider>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="address.street"
                label="Street Address"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="address.city"
                label="City"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="address.state"
                label="State"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="address.country"
                label="Country"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {/* Emergency Contact */}
          <Divider>Emergency Contact</Divider>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="emergencyContact.name"
                label="Contact Name"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="emergencyContact.relationship"
                label="Relationship"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="emergencyContact.phone"
                label="Contact Number"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {/* Form Actions */}
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
              >
                Update Patient
              </Button>
              <Button
                icon={<RollbackOutlined />}
                onClick={() => navigate(`/patients/${id}`)}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UpdatePatient;