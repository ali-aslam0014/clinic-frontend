import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  TimePicker,
  message,
  Card,
  Row,
  Col,
  Space
} from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import AdminLayout from '../../../components/admin/Layout';
import { getDoctorById, updateDoctor } from '../../../redux/actions/doctorActions';

const { Option } = Select;
const { TextArea } = Input;

const EditDoctor = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const { doctor, specializations } = useSelector((state) => ({
    doctor: state.doctor.selectedDoctor,
    specializations: state.doctor.specializations,
  }));

  useEffect(() => {
    dispatch(getDoctorById(doctorId));
  }, [dispatch, doctorId]);

  useEffect(() => {
    if (doctor) {
      form.setFieldsValue({
        ...doctor,
        dateOfBirth: doctor.dateOfBirth ? moment(doctor.dateOfBirth) : null,
        joiningDate: doctor.joiningDate ? moment(doctor.joiningDate) : null,
        workingHours: doctor.workingHours ? {
          start: moment(doctor.workingHours.start, 'HH:mm'),
          end: moment(doctor.workingHours.end, 'HH:mm'),
        } : null,
      });
    }
  }, [doctor, form]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const formData = {
        ...values,
        dateOfBirth: values.dateOfBirth?.format('YYYY-MM-DD'),
        joiningDate: values.joiningDate?.format('YYYY-MM-DD'),
        workingHours: {
          start: values.workingHours?.start?.format('HH:mm'),
          end: values.workingHours?.end?.format('HH:mm'),
        },
      };

      await dispatch(updateDoctor(doctorId, formData));
      message.success('Doctor updated successfully');
      navigate('/admin/doctors');
    } catch (error) {
      message.error('Failed to update doctor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <Card title="Edit Doctor" className="edit-doctor-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter name' }]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter valid email' }
                ]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="specialization"
                label="Specialization"
                rules={[{ required: true, message: 'Please select specialization' }]}
              >
                <Select placeholder="Select specialization">
                  {specializations.map((spec) => (
                    <Option key={spec._id} value={spec._id}>
                      {spec.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dateOfBirth"
                label="Date of Birth"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="joiningDate"
                label="Joining Date"
                rules={[{ required: true, message: 'Please select joining date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Working Hours"
                required
              >
                <Input.Group compact>
                  <Form.Item
                    name={['workingHours', 'start']}
                    noStyle
                    rules={[{ required: true, message: 'Start time required' }]}
                  >
                    <TimePicker format="HH:mm" placeholder="Start time" />
                  </Form.Item>
                  <span style={{ padding: '0 8px' }}>to</span>
                  <Form.Item
                    name={['workingHours', 'end']}
                    noStyle
                    rules={[{ required: true, message: 'End time required' }]}
                  >
                    <TimePicker format="HH:mm" placeholder="End time" />
                  </Form.Item>
                </Input.Group>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="qualifications"
            label="Qualifications"
            rules={[{ required: true, message: 'Please enter qualifications' }]}
          >
            <TextArea rows={4} placeholder="Enter qualifications" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Update Doctor
              </Button>
              <Button onClick={() => navigate('/admin/doctors')}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </AdminLayout>
  );
};

export default EditDoctor;