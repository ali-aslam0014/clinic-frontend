import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Tag,
  Tooltip,
  Drawer,
  Divider,
  InputNumber,
  Row,
  Col
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PrinterOutlined,
  EyeOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import DoctorLayout from '../../../components/doctor/Layout';
import axios from 'axios';
import moment from 'moment';
import './DoctorPrescription.css';

const { Option } = Select;
const { TextArea } = Input;

const DoctorPrescription = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [form] = Form.useForm();
  const { patientId } = useParams();

  useEffect(() => {
    fetchPrescriptions();
    fetchMedicines();
  }, [patientId]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8080/api/v1/doctor/prescriptions`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        setPrescriptions(response.data.data);
      } else {
        message.error('Failed to fetch prescriptions');
      }
    } catch (error) {
      console.error('Fetch error:', error.response?.data || error.message);
      message.error('Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8080/api/v1/medicines',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        setMedicines(response.data.data);
      } else {
        message.error('Failed to fetch medicines');
      }
    } catch (error) {
      console.error('Fetch medicines error:', error);
      message.error('Failed to fetch medicines');
    }
  };

  const handleAddPrescription = () => {
    setSelectedPrescription(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    form.setFieldsValue({
      ...prescription,
      prescriptionDate: moment(prescription.prescriptionDate),
      medicines: prescription.medicines.map(med => ({
        ...med,
        medicine: med.medicine._id
      }))
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const url = selectedPrescription 
        ? `http://localhost:8080/api/v1/doctor/prescriptions/${selectedPrescription._id}`
        : `http://localhost:8080/api/v1/doctor/prescriptions`;

      const method = selectedPrescription ? 'put' : 'post';
      
      const formData = {
        ...values,
        prescriptionDate: new Date(),
        patientId: patientId // Make sure this matches your form data
      };

      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        message.success(`Prescription ${selectedPrescription ? 'updated' : 'created'} successfully`);
        setModalVisible(false);
        fetchPrescriptions();
      }
    } catch (error) {
      console.error('Save error:', error.response?.data || error.message);
      message.error('Failed to save prescription');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:8080/api/v1/doctor/prescriptions/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      message.success('Prescription deleted successfully');
      fetchPrescriptions();
    } catch (error) {
      console.error('Delete error:', error.response?.data || error.message);
      message.error('Failed to delete prescription');
    }
  };

  const handlePrint = (prescription) => {
    // Implement print functionality
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'prescriptionDate',
      key: 'prescriptionDate',
      render: date => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Diagnosis',
      dataIndex: ['diagnosis', 'condition'],
      key: 'diagnosis',
    },
    {
      title: 'Medicines',
      dataIndex: 'medicines',
      key: 'medicines',
      render: medicines => (
        <span>
          {medicines.slice(0, 2).map(med => (
            <Tag key={med._id}>{med.medicine.name}</Tag>
          ))}
          {medicines.length > 2 && <Tag>+{medicines.length - 2} more</Tag>}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={
          status === 'Active' ? 'green' :
          status === 'Dispensed' ? 'blue' :
          'red'
        }>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View">
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => {
                setSelectedPrescription(record);
                setDrawerVisible(true);
              }}
            />
          </Tooltip>
          {record.status !== 'Dispensed' && (
            <>
              <Tooltip title="Edit">
                <Button 
                  icon={<EditOutlined />}
                  onClick={() => handleEditPrescription(record)}
                />
              </Tooltip>
              <Tooltip title="Delete">
                <Button 
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(record._id)}
                />
              </Tooltip>
            </>
          )}
          <Tooltip title="Print">
            <Button 
              icon={<PrinterOutlined />}
              onClick={() => handlePrint(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <DoctorLayout>
      <Card
        title="Prescriptions"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddPrescription}
          >
            New Prescription
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={prescriptions}
          rowKey="_id"
          loading={loading}
        />
      </Card>

      {/* Add/Edit Prescription Modal */}
      <Modal
        title={selectedPrescription ? "Edit Prescription" : "New Prescription"}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="prescriptionDate"
            label="Date"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name={['diagnosis', 'condition']}
            label="Diagnosis"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.List name="medicines">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'medicine']}
                      rules={[{ required: true, message: 'Missing medicine' }]}
                    >
                      <Select
                        showSearch
                        placeholder="Select medicine"
                        optionFilterProp="children"
                        style={{ width: 200 }}
                      >
                        {medicines.map(med => (
                          <Option key={med._id} value={med._id}>
                            {med.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'dosage']}
                      rules={[{ required: true, message: 'Missing dosage' }]}
                    >
                      <Input placeholder="Dosage" style={{ width: 150 }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'frequency']}
                      rules={[{ required: true, message: 'Missing frequency' }]}
                    >
                      <Select style={{ width: 150 }}>
                        <Option value="Once daily">Once daily</Option>
                        <Option value="Twice daily">Twice daily</Option>
                        <Option value="Thrice daily">Thrice daily</Option>
                        <Option value="Four times daily">Four times daily</Option>
                        <Option value="As needed">As needed</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'duration']}
                    >
                      <Input placeholder="Duration" style={{ width: 150 }} />
                    </Form.Item>
                    <DeleteOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Medicine
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item name="notes" label="Notes">
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {selectedPrescription ? 'Update' : 'Create'} Prescription
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Prescription Drawer */}
      <Drawer
        title="Prescription Details"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        width={600}
        extra={
          <Button icon={<PrinterOutlined />} onClick={() => handlePrint(selectedPrescription)}>
            Print
          </Button>
        }
      >
        {selectedPrescription && (
          <div className="prescription-details">
            <div className="prescription-header">
              <h2>Prescription #{selectedPrescription.prescriptionId}</h2>
              <Tag color={
                selectedPrescription.status === 'Active' ? 'green' :
                selectedPrescription.status === 'Dispensed' ? 'blue' : 'red'
              }>
                {selectedPrescription.status}
              </Tag>
            </div>

            <Divider />

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="info-group">
                  <label>Patient Name</label>
                  <p>{selectedPrescription.patientId?.name}</p>
                </div>
              </Col>
              <Col span={12}>
                <div className="info-group">
                  <label>Date</label>
                  <p>{moment(selectedPrescription.prescriptionDate).format('DD/MM/YYYY')}</p>
                </div>
              </Col>
              <Col span={12}>
                <div className="info-group">
                  <label>Age</label>
                  <p>{selectedPrescription.patientId?.age} years</p>
                </div>
              </Col>
              <Col span={12}>
                <div className="info-group">
                  <label>Gender</label>
                  <p>{selectedPrescription.patientId?.gender}</p>
                </div>
              </Col>
            </Row>

            <Divider />

            <div className="diagnosis-section">
              <h3>Diagnosis</h3>
              <p>{selectedPrescription.diagnosis?.condition}</p>
            </div>

            <Divider />

            <div className="medicines-section">
              <h3>Medicines</h3>
              {selectedPrescription.medicines.map((med, index) => (
                <Card key={index} className="medicine-card">
                  <Row gutter={[16, 8]}>
                    <Col span={24}>
                      <strong>{med.medicine.name}</strong>
                      {med.medicine.strength && (
                        <Tag color="blue" style={{ marginLeft: 8 }}>
                          {med.medicine.strength}
                        </Tag>
                      )}
                    </Col>
                    <Col span={12}>
                      <label>Dosage:</label>
                      <span>{med.dosage}</span>
                    </Col>
                    <Col span={12}>
                      <label>Frequency:</label>
                      <span>{med.frequency}</span>
                    </Col>
                    {med.duration && (
                      <Col span={12}>
                        <label>Duration:</label>
                        <span>{med.duration}</span>
                      </Col>
                    )}
                    {med.instructions && (
                      <Col span={24}>
                        <label>Instructions:</label>
                        <span>{med.instructions}</span>
                      </Col>
                    )}
                  </Row>
                </Card>
              ))}
            </div>

            {selectedPrescription.notes && (
              <>
                <Divider />
                <div className="notes-section">
                  <h3>Notes</h3>
                  <p>{selectedPrescription.notes}</p>
                </div>
              </>
            )}

            {selectedPrescription.status === 'Dispensed' && (
              <>
                <Divider />
                <div className="dispensing-info">
                  <h3>Dispensing Information</h3>
                  <Row gutter={[16, 8]}>
                    <Col span={12}>
                      <label>Dispensed By:</label>
                      <p>{selectedPrescription.dispensedBy?.name}</p>
                    </Col>
                    <Col span={12}>
                      <label>Dispensed Date:</label>
                      <p>{moment(selectedPrescription.dispensedAt).format('DD/MM/YYYY HH:mm')}</p>
                    </Col>
                  </Row>
                </div>
              </>
            )}
          </div>
        )}
      </Drawer>
    </DoctorLayout>
  );
};

export default DoctorPrescription;