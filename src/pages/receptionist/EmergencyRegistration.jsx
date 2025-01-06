import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  Row,
  Col,
  message,
  Radio,
  Alert,
  Space,
  Tag
} from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  MedicineBoxOutlined,
  AlertOutlined
} from '@ant-design/icons';
import axiosInstance from '../../utils/axiosConfig';
import moment from 'moment';
import './EmergencyRegistration.css';

const { Option } = Select;
const { TextArea } = Input;

const EmergencyRegistration = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [severity, setSeverity] = useState('moderate');

  // Fetch available doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axiosInstance.get('/doctors/available');
        console.log('API Response:', response);
        
        const doctorsList = response?.data?.data || [];
        setDoctors(doctorsList);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        message.error('Error fetching doctors: ' + error.message);
        setDoctors([]);
      }
    };
    fetchDoctors();
  }, []);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      console.log('Form values:', values); // Debug log
      
      const emergencyData = {
        ...values,
        type: 'emergency',
        severity,
        appointmentDate: moment().format('YYYY-MM-DD'),
        timeSlot: {
          start: moment().format('HH:mm'),
          end: moment().add(30, 'minutes').format('HH:mm')
        }
      };

      console.log('Sending emergency data:', emergencyData); // Debug log

      const result = await appointmentAPI.createEmergencyAppointment(emergencyData);
      
      if (result.success) {
        message.success('Emergency registration successful!');
        form.resetFields();
      }
    } catch (error) {
      console.error('Registration error:', error);
      message.error('Registration failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const severityOptions = [
    { label: 'Critical', value: 'critical', color: 'red' },
    { label: 'Severe', value: 'severe', color: 'orange' },
    { label: 'Moderate', value: 'moderate', color: 'yellow' },
    { label: 'Minor', value: 'minor', color: 'green' }
  ];

  return (
    <div className="emergency-registration">
      <Card 
        title={
          <Space>
            <AlertOutlined style={{ color: '#ff4d4f' }} />
            Emergency Registration
          </Space>
        }
        extra={
          <Tag color="red">EMERGENCY</Tag>
        }
      >
        <Alert
          message="Emergency Registration Guidelines"
          description="Please ensure all critical information is filled accurately. Emergency cases will be given priority in the queue."
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            severity: 'moderate'
          }}
        >
          <Row gutter={16}>
            {/* Patient Information */}
            <Col xs={24} md={12}>
              <Form.Item
                name="patientName"
                label="Patient Name"
                rules={[{ required: true, message: 'Please enter patient name' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Enter patient name" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="phone"
                label="Contact Number"
                rules={[
                  { required: true, message: 'Please enter contact number' },
                  { pattern: /^03\d{9}$/, message: 'Please enter valid phone number' }
                ]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="03XXXXXXXXX" />
              </Form.Item>
            </Col>

            {/* Emergency Details */}
            <Col xs={24} md={12}>
              <Form.Item
                name="doctorId"
                label="Assign Doctor"
                rules={[{ required: true, message: 'Please select a doctor' }]}
              >
                <Select
                  placeholder="Select doctor"
                  optionFilterProp="children"
                >
                  {doctors.map(doctor => (
                    <Option key={doctor._id} value={doctor._id}>
                      {doctor.name} - {doctor.specialization}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Emergency Severity"
                required
              >
                <Radio.Group
                  value={severity}
                  onChange={e => setSeverity(e.target.value)}
                  buttonStyle="solid"
                >
                  {severityOptions.map(option => (
                    <Radio.Button 
                      key={option.value} 
                      value={option.value}
                      style={{ 
                        borderColor: option.color,
                        color: severity === option.value ? '#fff' : option.color,
                        backgroundColor: severity === option.value ? option.color : 'transparent'
                      }}
                    >
                      {option.label}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </Form.Item>
            </Col>

            {/* Emergency Details */}
            <Col span={24}>
              <Form.Item
                name="chiefComplaint"
                label="Chief Complaint"
                rules={[{ required: true, message: 'Please enter chief complaint' }]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="Enter chief complaint and symptoms"
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="vitalSigns"
                label="Vital Signs"
              >
                <Input.Group>
                  <Row gutter={8}>
                    <Col span={6}>
                      <Form.Item
                        name={['vitalSigns', 'bp']}
                        rules={[{ required: true, message: 'Required' }]}
                      >
                        <Input placeholder="Blood Pressure" />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        name={['vitalSigns', 'pulse']}
                        rules={[{ required: true, message: 'Required' }]}
                      >
                        <Input placeholder="Pulse Rate" />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        name={['vitalSigns', 'temp']}
                        rules={[{ required: true, message: 'Required' }]}
                      >
                        <Input placeholder="Temperature" />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        name={['vitalSigns', 'oxygen']}
                      >
                        <Input placeholder="Oxygen Saturation" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Input.Group>
              </Form.Item>
            </Col>

            {/* Additional Notes */}
            <Col span={24}>
              <Form.Item
                name="notes"
                label="Additional Notes"
              >
                <TextArea 
                  rows={3} 
                  placeholder="Enter any additional notes or medical history"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Submit Button */}
          <Form.Item>
            <Button 
              type="primary" 
              danger 
              htmlType="submit" 
              loading={loading}
              icon={<MedicineBoxOutlined />}
              block
            >
              Register Emergency
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EmergencyRegistration;