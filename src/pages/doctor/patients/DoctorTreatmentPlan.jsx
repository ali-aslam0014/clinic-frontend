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
  DatePicker,
  Select,
  Tabs,
  Progress,
  Timeline,
  message,
  Drawer,
  Tooltip,
  Descriptions,
  List
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import DoctorLayout from '../../../components/doctor/Layout';
import axios from 'axios';
import moment from 'moment';
import './DoctorTreatmentPlan.css';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const DoctorTreatmentPlan = () => {
  const [treatmentPlans, setTreatmentPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [patients, setPatients] = useState([]);
  const [form] = Form.useForm();

  const fetchPatients = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8080/api/v1/doctor/patients',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        setPatients(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      message.error('Failed to fetch patients');
    }
  };

  const fetchTreatmentPlans = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8080/api/v1/doctor/treatment-plans`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        setTreatmentPlans(response.data.data);
      } else {
        message.error('Failed to fetch treatment plans');
      }
    } catch (error) {
      console.error('Fetch error:', error.response?.data || error.message);
      message.error('Failed to fetch treatment plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchTreatmentPlans();
  }, []);

  const handleAddPlan = () => {
    setSelectedPlan(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    form.setFieldsValue({
      ...plan,
      startDate: moment(plan.startDate),
      endDate: plan.endDate ? moment(plan.endDate) : null,
      goals: plan.goals || [],
      treatments: plan.treatments || [],
      medications: plan.medications || []
    });
    setModalVisible(true);
  };

  const handleViewPlan = (plan) => {
    setSelectedPlan(plan);
    setDrawerVisible(true);
  };

  const handleDeletePlan = async (planId) => {
    try {
      await axios.delete(`/api/patients/${selectedPlan._id}`);
      message.success('Treatment plan deleted successfully');
      fetchTreatmentPlans();
    } catch (error) {
      message.error('Failed to delete treatment plan');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const url = selectedPlan 
        ? `http://localhost:8080/api/v1/doctor/treatment-plans/${selectedPlan._id}`
        : `http://localhost:8080/api/v1/doctor/treatment-plans`;

      const formData = {
        ...values,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate ? values.endDate.toISOString() : undefined
      };

      const method = selectedPlan ? 'put' : 'post';
      
      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        message.success(`Treatment plan ${selectedPlan ? 'updated' : 'created'} successfully`);
        setModalVisible(false);
        fetchTreatmentPlans();
      }
    } catch (error) {
      console.error('Save error:', error.response?.data || error.message);
      message.error('Failed to save treatment plan');
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'Active' ? 'green' :
          status === 'Completed' ? 'blue' :
          status === 'On Hold' ? 'orange' :
          'red'
        }>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (_, record) => (
        <Progress 
          percent={record.progressPercentage} 
          size="small" 
          status={record.status === 'Completed' ? 'success' : 'active'}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => handleViewPlan(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              icon={<EditOutlined />}
              onClick={() => handleEditPlan(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeletePlan(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const renderForm = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Form.Item
        name="patient"
        label="Select Patient"
        rules={[{ required: true, message: 'Please select a patient' }]}
      >
        <Select
          showSearch
          placeholder="Select a patient"
          optionFilterProp="children"
        >
          {patients.map(patient => (
            <Option key={patient._id} value={patient._id}>
              {`${patient.firstName} ${patient.lastName}`}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="title"
        label="Plan Title"
        rules={[{ required: true, message: 'Please enter plan title' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="status"
        label="Status"
        rules={[{ required: true }]}
      >
        <Select>
          <Option value="Active">Active</Option>
          <Option value="Completed">Completed</Option>
          <Option value="On Hold">On Hold</Option>
          <Option value="Cancelled">Cancelled</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="startDate"
        label="Start Date"
        rules={[{ required: true }]}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="endDate"
        label="End Date"
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>

      <Tabs defaultActiveKey="1">
        <TabPane tab="Diagnosis & Goals" key="1">
          <Form.Item
            name={['diagnosis', 'condition']}
            label="Condition"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name={['diagnosis', 'severity']}
            label="Severity"
          >
            <Select>
              <Option value="Mild">Mild</Option>
              <Option value="Moderate">Moderate</Option>
              <Option value="Severe">Severe</Option>
            </Select>
          </Form.Item>

          <Form.List name="goals">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'description']}
                      rules={[{ required: true, message: 'Missing description' }]}
                    >
                      <Input placeholder="Goal description" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'targetDate']}
                    >
                      <DatePicker placeholder="Target date" />
                    </Form.Item>
                    <DeleteOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Goal
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </TabPane>

        <TabPane tab="Treatments" key="2">
          <Form.List name="treatments">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} size="small" style={{ marginBottom: 16 }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'type']}
                      label="Treatment Type"
                      rules={[{ required: true }]}
                    >
                      <Select>
                        <Option value="Medication">Medication</Option>
                        <Option value="Procedure">Procedure</Option>
                        <Option value="Therapy">Therapy</Option>
                        <Option value="Lifestyle">Lifestyle</Option>
                        <Option value="Other">Other</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      label="Treatment Name"
                      rules={[{ required: true }]}
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'instructions']}
                      label="Instructions"
                    >
                      <TextArea rows={2} />
                    </Form.Item>

                    <Button type="link" danger onClick={() => remove(name)}>
                      Remove Treatment
                    </Button>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add Treatment
                </Button>
              </>
            )}
          </Form.List>
        </TabPane>

        <TabPane tab="Medications" key="3">
          <Form.List name="medications">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} size="small" style={{ marginBottom: 16 }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      label="Medication Name"
                      rules={[{ required: true }]}
                    >
                      <Input />
                    </Form.Item>

                    <Space>
                      <Form.Item
                        {...restField}
                        name={[name, 'dosage']}
                        label="Dosage"
                      >
                        <Input />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'frequency']}
                        label="Frequency"
                      >
                        <Input />
                      </Form.Item>
                    </Space>

                    <Form.Item
                      {...restField}
                      name={[name, 'instructions']}
                      label="Special Instructions"
                    >
                      <TextArea rows={2} />
                    </Form.Item>

                    <Button type="link" danger onClick={() => remove(name)}>
                      Remove Medication
                    </Button>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add Medication
                </Button>
              </>
            )}
          </Form.List>
        </TabPane>

        <TabPane tab="Notes" key="4">
          <Form.Item
            name={['notes', 'clinical']}
            label="Clinical Notes"
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name={['notes', 'patientInstructions']}
            label="Patient Instructions"
          >
            <TextArea rows={4} />
          </Form.Item>
        </TabPane>
      </Tabs>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            {selectedPlan ? 'Update' : 'Create'} Plan
          </Button>
          <Button onClick={() => setModalVisible(false)}>
            Cancel
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );

  return (
    <DoctorLayout>
      <Card
        title="Treatment Plans"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddPlan}
          >
            Add Treatment Plan
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={treatmentPlans}
          rowKey="_id"
          loading={loading}
        />
      </Card>

      {/* Add/Edit Treatment Plan Modal */}
      <Modal
        title={selectedPlan ? "Edit Treatment Plan" : "Add Treatment Plan"}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {renderForm()}
      </Modal>

      {/* View Treatment Plan Drawer */}
      <Drawer
        title="Treatment Plan Details"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        width={600}
      >
        {selectedPlan && (
          <>
            <Descriptions title="Basic Information" bordered>
              <Descriptions.Item label="Title" span={3}>{selectedPlan.title}</Descriptions.Item>
              <Descriptions.Item label="Status" span={3}>
                <Tag color={
                  selectedPlan.status === 'Active' ? 'green' :
                  selectedPlan.status === 'Completed' ? 'blue' :
                  selectedPlan.status === 'On Hold' ? 'orange' : 'red'
                }>
                  {selectedPlan.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Duration" span={3}>
                {`${moment(selectedPlan.startDate).format('DD/MM/YYYY')} - 
                  ${selectedPlan.endDate ? moment(selectedPlan.endDate).format('DD/MM/YYYY') : 'Ongoing'}`}
              </Descriptions.Item>
            </Descriptions>

            <Tabs defaultActiveKey="1" style={{ marginTop: 16 }}>
              <TabPane tab="Goals" key="1">
                <Timeline>
                  {selectedPlan.goals?.map((goal, index) => (
                    <Timeline.Item
                      key={index}
                      color={
                        goal.status === 'Achieved' ? 'green' :
                        goal.status === 'In Progress' ? 'blue' :
                        goal.status === 'Cancelled' ? 'red' : 'gray'
                      }
                    >
                      <p>{goal.description}</p>
                      <p><small>Target: {moment(goal.targetDate).format('DD/MM/YYYY')}</small></p>
                      {goal.notes && <p><small>Notes: {goal.notes}</small></p>}
                    </Timeline.Item>
                  ))}
                </Timeline>
              </TabPane>

              <TabPane tab="Treatments" key="2">
                <List
                  dataSource={selectedPlan.treatments}
                  renderItem={treatment => (
                    <List.Item>
                      <List.Item.Meta
                        title={treatment.name}
                        description={
                          <>
                            <Tag>{treatment.type}</Tag>
                            <p>{treatment.instructions}</p>
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              </TabPane>

              <TabPane tab="Medications" key="3">
                <List
                  dataSource={selectedPlan.medications}
                  renderItem={medication => (
                    <List.Item>
                      <List.Item.Meta
                        title={medication.name}
                        description={
                          <>
                            <p>Dosage: {medication.dosage}</p>
                            <p>Frequency: {medication.frequency}</p>
                            {medication.instructions && (
                              <p>Instructions: {medication.instructions}</p>
                            )}
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              </TabPane>

              <TabPane tab="Notes" key="4">
                {selectedPlan.notes?.clinical && (
                  <>
                    <h4>Clinical Notes</h4>
                    <p>{selectedPlan.notes.clinical}</p>
                  </>
                )}
                {selectedPlan.notes?.patientInstructions && (
                  <>
                    <h4>Patient Instructions</h4>
                    <p>{selectedPlan.notes.patientInstructions}</p>
                  </>
                )}
              </TabPane>
            </Tabs>
          </>
        )}
      </Drawer>
    </DoctorLayout>
  );
};

export default DoctorTreatmentPlan;