import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Space,
  Table,
  Tag,
  message,
  Drawer,
  Timeline,
  Typography,
  Divider
} from 'antd';
import {
  MedicineBoxOutlined,
  AlertOutlined,
  HistoryOutlined,
  UserOutlined,
  CalendarOutlined,
  SaveOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import DoctorLayout from '../../../components/doctor/Layout';
import './PatientHistory.css';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const PatientHistory = () => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState(null);
  const [form] = Form.useForm();

  // Get patientId from URL params
  const patientId = window.location.pathname.split('/')[3];

  useEffect(() => {
    fetchPatientHistory();
  }, [patientId]);

  const fetchPatientHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/patients/${patientId}/history`);
      setHistory(response.data.data);
    } catch (error) {
      message.error('Failed to fetch patient history');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (history) {
        await axios.put(`/api/patients/${patientId}/history`, values);
        message.success('Patient history updated successfully');
      } else {
        await axios.post(`/api/patients/${patientId}/history`, values);
        message.success('Patient history created successfully');
      }
      fetchPatientHistory();
    } catch (error) {
      message.error('Failed to save patient history');
    }
  };

  return (
    <DoctorLayout>
      <div className="patient-history-container">
        <Card 
          title={
            <Space>
              <HistoryOutlined />
              <span>Patient Medical History</span>
            </Space>
          }
          loading={loading}
        >
          <Tabs defaultActiveKey="1">
            <TabPane
              tab={
                <span>
                  <HistoryOutlined />
                  Medical History
                </span>
              }
              key="1"
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={history}
                className="history-form"
              >
                <Form.Item
                  name="chiefComplaint"
                  label="Chief Complaint"
                  rules={[{ required: true, message: 'Please enter chief complaint' }]}
                >
                  <TextArea rows={4} />
                </Form.Item>

                <Form.Item
                  name="historyOfPresentIllness"
                  label="History of Present Illness"
                  rules={[{ required: true, message: 'Please enter present illness history' }]}
                >
                  <TextArea rows={4} />
                </Form.Item>

                {/* Past Medical History */}
                <div className="form-section">
                  <Title level={5} className="form-section-title">Past Medical History</Title>
                  <Form.List name="pastMedicalHistory">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                            <Form.Item
                              {...restField}
                              name={[name, 'condition']}
                              rules={[{ required: true, message: 'Missing condition' }]}
                            >
                              <Input placeholder="Condition" />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'diagnosisDate']}
                            >
                              <DatePicker />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'status']}
                            >
                              <Select style={{ width: 120 }}>
                                <Option value="Active">Active</Option>
                                <Option value="Resolved">Resolved</Option>
                                <Option value="Ongoing">Ongoing</Option>
                              </Select>
                            </Form.Item>
                            <Button onClick={() => remove(name)} type="link" danger>
                              Delete
                            </Button>
                          </Space>
                        ))}
                        <Form.Item>
                          <Button type="dashed" onClick={() => add()} block icon={<UserOutlined />}>
                            Add Past Medical History
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </div>

                <Form.Item>
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                    Save History
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <AlertOutlined />
                  Allergies
                </span>
              }
              key="2"
            >
              {/* Allergies content */}
            </TabPane>

            <TabPane
              tab={
                <span>
                  <MedicineBoxOutlined />
                  Medications
                </span>
              }
              key="3"
            >
              {/* Medications content */}
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </DoctorLayout>
  );
};

export default PatientHistory;