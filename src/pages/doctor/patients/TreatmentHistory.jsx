import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  message,
  Divider,
  Typography,
  Row,
  Col
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  FileTextOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import DoctorLayout from '../../../components/doctor/Layout';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

const TreatmentHistory = () => {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [form] = Form.useForm();

  const patientId = window.location.pathname.split('/')[4];

  useEffect(() => {
    fetchTreatments();
  }, [patientId]);

  const fetchTreatments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/patients/${patientId}/treatments`);
      setTreatments(response.data.data);
    } catch (error) {
      message.error('Failed to fetch treatment history');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const formData = {
        ...values,
        visitDate: values.visitDate.toDate(),
        followUp: {
          ...values.followUp,
          date: values.followUp?.date?.toDate()
        }
      };

      if (selectedTreatment) {
        await axios.put(`/api/patients/${patientId}/treatments/${selectedTreatment._id}`, formData);
        message.success('Treatment record updated successfully');
      } else {
        await axios.post(`/api/patients/${patientId}/treatments`, formData);
        message.success('Treatment record created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setSelectedTreatment(null);
      fetchTreatments();
    } catch (error) {
      message.error('Failed to save treatment record');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/patients/${patientId}/treatments/${id}`);
      message.success('Treatment record deleted successfully');
      fetchTreatments();
    } catch (error) {
      message.error('Failed to delete treatment record');
    }
  };

  const columns = [
    {
      title: 'Visit Date',
      dataIndex: 'visitDate',
      key: 'visitDate',
      render: date => moment(date).format('DD/MM/YYYY')
    },
    {
      title: 'Chief Complaint',
      dataIndex: 'chiefComplaint',
      key: 'chiefComplaint'
    },
    {
      title: 'Diagnosis',
      dataIndex: 'diagnosis',
      key: 'diagnosis'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={
          status === 'Active' ? 'blue' :
          status === 'Completed' ? 'green' :
          status === 'Scheduled' ? 'orange' : 'red'
        }>
          {status}
        </Tag>
      )
    },
    {
      title: 'Follow Up',
      dataIndex: 'followUp',
      key: 'followUp',
      render: followUp => followUp?.required ? (
        <span>{moment(followUp.date).format('DD/MM/YYYY')}</span>
      ) : 'No follow up'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedTreatment(record);
              setViewModalVisible(true);
            }}
          >
            View
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedTreatment(record);
              form.setFieldsValue({
                ...record,
                visitDate: moment(record.visitDate),
                followUp: {
                  ...record.followUp,
                  date: record.followUp?.date ? moment(record.followUp.date) : null
                }
              });
              setModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          >
            Delete
          </Button>
        </Space>
      )
    }
  ];

  return (
    <DoctorLayout>
      <div className="treatment-history-container">
        <Card
          title={
            <Space>
              <MedicineBoxOutlined />
              <span>Treatment History</span>
            </Space>
          }
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedTreatment(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              Add Treatment Record
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={treatments}
            loading={loading}
            rowKey="_id"
          />
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          title={selectedTreatment ? 'Edit Treatment Record' : 'Add Treatment Record'}
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
            setSelectedTreatment(null);
          }}
          footer={null}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="visitDate"
                  label="Visit Date"
                  rules={[{ required: true, message: 'Please select visit date' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: 'Please select status' }]}
                >
                  <Select>
                    <Option value="Active">Active</Option>
                    <Option value="Completed">Completed</Option>
                    <Option value="Scheduled">Scheduled</Option>
                    <Option value="Cancelled">Cancelled</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="chiefComplaint"
              label="Chief Complaint"
              rules={[{ required: true, message: 'Please enter chief complaint' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="diagnosis"
              label="Diagnosis"
              rules={[{ required: true, message: 'Please enter diagnosis' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="symptoms"
              label="Symptoms"
              rules={[{ required: true, message: 'Please enter symptoms' }]}
            >
              <Select mode="tags" placeholder="Add symptoms">
                <Option value="fever">Fever</Option>
                <Option value="cough">Cough</Option>
                <Option value="headache">Headache</Option>
                <Option value="bodyache">Body Ache</Option>
              </Select>
            </Form.Item>

            <Divider>Vital Signs</Divider>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name={['vitalSigns', 'bloodPressure']} label="Blood Pressure">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name={['vitalSigns', 'temperature']} label="Temperature">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name={['vitalSigns', 'pulseRate']} label="Pulse Rate">
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Divider>Treatment</Divider>

            <Form.List name={['treatment', 'medications']}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        rules={[{ required: true, message: 'Missing medication name' }]}
                      >
                        <Input placeholder="Medication Name" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'dosage']}
                        rules={[{ required: true, message: 'Missing dosage' }]}
                      >
                        <Input placeholder="Dosage" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'frequency']}
                        rules={[{ required: true, message: 'Missing frequency' }]}
                      >
                        <Input placeholder="Frequency" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'duration']}
                        rules={[{ required: true, message: 'Missing duration' }]}
                      >
                        <Input placeholder="Duration" />
                      </Form.Item>
                      <DeleteOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Add Medication
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Form.Item
              name={['treatment', 'instructions']}
              label="Treatment Instructions"
            >
              <TextArea rows={4} />
            </Form.Item>

            <Divider>Follow Up</Divider>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name={['followUp', 'required']} valuePropName="checked">
                  <Select>
                    <Option value={true}>Required</Option>
                    <Option value={false}>Not Required</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name={['followUp', 'date']}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name={['followUp', 'notes']} label="Follow Up Notes">
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {selectedTreatment ? 'Update' : 'Create'}
                </Button>
                <Button onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                  setSelectedTreatment(null);
                }}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* View Modal */}
        <Modal
          title="Treatment Details"
          visible={viewModalVisible}
          onCancel={() => {
            setViewModalVisible(false);
            setSelectedTreatment(null);
          }}
          footer={null}
          width={800}
        >
          {selectedTreatment && (
            <div className="treatment-details">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Title level={5}>Visit Information</Title>
                  <p><strong>Date:</strong> {moment(selectedTreatment.visitDate).format('DD/MM/YYYY')}</p>
                  <p><strong>Status:</strong> {selectedTreatment.status}</p>
                  <p><strong>Chief Complaint:</strong> {selectedTreatment.chiefComplaint}</p>
                  <p><strong>Diagnosis:</strong> {selectedTreatment.diagnosis}</p>
                </Col>
                <Col span={12}>
                  <Title level={5}>Vital Signs</Title>
                  <p><strong>Blood Pressure:</strong> {selectedTreatment.vitalSigns?.bloodPressure}</p>
                  <p><strong>Temperature:</strong> {selectedTreatment.vitalSigns?.temperature}</p>
                  <p><strong>Pulse Rate:</strong> {selectedTreatment.vitalSigns?.pulseRate}</p>
                </Col>
              </Row>

              <Divider />

              <Title level={5}>Medications</Title>
              {selectedTreatment.treatment?.medications?.map((med, index) => (
                <div key={index} style={{ marginBottom: '10px' }}>
                  <p><strong>{med.name}</strong> - {med.dosage}</p>
                  <p>Frequency: {med.frequency} | Duration: {med.duration}</p>
                </div>
              ))}

              <Divider />

              <Title level={5}>Follow Up</Title>
              {selectedTreatment.followUp?.required ? (
                <>
                  <p><strong>Date:</strong> {moment(selectedTreatment.followUp.date).format('DD/MM/YYYY')}</p>
                  <p><strong>Notes:</strong> {selectedTreatment.followUp.notes}</p>
                </>
              ) : (
                <p>No follow up required</p>
              )}
            </div>
          )}
        </Modal>
      </div>
    </DoctorLayout>
  );
};

export default TreatmentHistory;