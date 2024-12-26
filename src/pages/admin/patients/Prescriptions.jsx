import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Space,
  message,
  Descriptions,
  Tag,
  Divider
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PrinterOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './Prescriptions.css';

const API_URL = 'http://localhost:8080/api/v1';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [form] = Form.useForm();
  const { patientId } = useParams();

  // Fetch prescriptions
  const fetchPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!patientId) {
        message.error('Patient ID is missing');
        return;
      }

      const response = await axios.get(
        `${API_URL}/admin/patients/${patientId}/prescriptions`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setPrescriptions(response.data.data || []);
      } else {
        message.error('Failed to fetch prescriptions');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  // Fetch doctors and medicines
  const fetchDoctorsAndMedicines = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [doctorsRes, medicinesRes] = await Promise.all([
        axios.get(`${API_URL}/admin/doctors`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/admin/medicines`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (doctorsRes.data.success) {
        setDoctors(doctorsRes.data.data || []);
      }
      
      if (medicinesRes.data.success) {
        setMedicines(medicinesRes.data.data || []);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Failed to fetch doctors or medicines');
    }
  }, []);

  useEffect(() => {
    if (patientId) {
      fetchPrescriptions();
      fetchDoctorsAndMedicines();
    }
  }, [fetchPrescriptions, fetchDoctorsAndMedicines, patientId]);

  const columns = [
    {
      title: 'Date',
      dataIndex: 'prescriptionDate',
      key: 'prescriptionDate',
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.prescriptionDate) - moment(b.prescriptionDate),
    },
    {
      title: 'Doctor',
      dataIndex: 'doctorId',
      key: 'doctorId',
      render: (doctor) => doctor?.name || 'N/A',
    },
    {
      title: 'Diagnosis',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'active' ? 'green' :
          status === 'completed' ? 'blue' :
          'red'
        }>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            icon={<PrinterOutlined />}
            onClick={() => handlePrint(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record._id)}
          />
        </Space>
      ),
    },
  ];

  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        patientId,
        prescriptionDate: values.prescriptionDate.format('YYYY-MM-DD'),
        medicines: values.medicines.map(medicine => ({
          ...medicine,
          startDate: medicine.duration[0].format('YYYY-MM-DD'),
          endDate: medicine.duration[1].format('YYYY-MM-DD'),
        })),
      };

      if (selectedPrescription) {
        await axios.put(`/api/v1/admin/prescriptions/${selectedPrescription._id}`, data);
        message.success('Prescription updated successfully');
      } else {
        await axios.post(`/api/v1/admin/patients/${patientId}/prescriptions`, data);
        message.success('Prescription added successfully');
      }

      setModalVisible(false);
      form.resetFields();
      fetchPrescriptions();
    } catch (error) {
      message.error('Failed to save prescription');
    }
  };

  const handleView = (prescription) => {
    setSelectedPrescription(prescription);
    setViewModalVisible(true);
  };

  const handleEdit = (prescription) => {
    setSelectedPrescription(prescription);
    form.setFieldsValue({
      ...prescription,
      prescriptionDate: moment(prescription.prescriptionDate),
      medicines: prescription.medicines.map(medicine => ({
        ...medicine,
        duration: [moment(medicine.startDate), moment(medicine.endDate)],
      })),
    });
    setModalVisible(true);
  };

  const handleDelete = async (prescriptionId) => {
    try {
      await axios.delete(`/api/v1/admin/prescriptions/${prescriptionId}`);
      message.success('Prescription deleted successfully');
      fetchPrescriptions();
    } catch (error) {
      message.error('Failed to delete prescription');
    }
  };

  const handlePrint = (prescription) => {
    // Implement print functionality
    window.print();
  };

  return (
    <AdminLayout>
      <div className="prescriptions-container">
        <div className="prescriptions-header">
          <h2>Prescriptions</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedPrescription(null);
              setModalVisible(true);
              form.resetFields();
            }}
          >
            Add New Prescription
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={prescriptions}
          loading={loading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} prescriptions`
          }}
        />

        {/* Add/Edit Prescription Modal */}
        <Modal
          title={selectedPrescription ? "Edit Prescription" : "Add Prescription"}
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="doctorId"
              label="Doctor"
              rules={[{ required: true, message: 'Please select a doctor' }]}
            >
              <Select placeholder="Select doctor">
                {doctors.map(doctor => (
                  <Option key={doctor._id} value={doctor._id}>
                    {doctor.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="prescriptionDate"
              label="Prescription Date"
              rules={[{ required: true, message: 'Please select date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="diagnosis"
              label="Diagnosis"
              rules={[{ required: true, message: 'Please enter diagnosis' }]}
            >
              <TextArea rows={4} />
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
                        <Select placeholder="Select medicine" style={{ width: 200 }}>
                          {medicines.map(medicine => (
                            <Option key={medicine._id} value={medicine._id}>
                              {medicine.name}
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
                        <Input placeholder="Frequency" style={{ width: 150 }} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'duration']}
                        rules={[{ required: true, message: 'Missing duration' }]}
                      >
                        <RangePicker style={{ width: 200 }} />
                      </Form.Item>
                      <Button onClick={() => remove(name)} danger>Delete</Button>
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

            <Form.Item
              name="instructions"
              label="Special Instructions"
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {selectedPrescription ? 'Update Prescription' : 'Add Prescription'}
                </Button>
                <Button onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* View Prescription Modal */}
        <Modal
          title="Prescription Details"
          visible={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={[
            <Button key="print" icon={<PrinterOutlined />} onClick={() => handlePrint(selectedPrescription)}>
              Print
            </Button>,
            <Button key="close" onClick={() => setViewModalVisible(false)}>
              Close
            </Button>
          ]}
          width={800}
        >
          {selectedPrescription && (
            <div className="prescription-details">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Date">
                  {moment(selectedPrescription.prescriptionDate).format('DD/MM/YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Doctor">
                  {selectedPrescription.doctorId?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Diagnosis" span={2}>
                  {selectedPrescription.diagnosis}
                </Descriptions.Item>
              </Descriptions>

              <Divider>Medicines</Divider>

              {selectedPrescription.medicines.map((medicine, index) => (
                <div key={index} className="medicine-item">
                  <Descriptions bordered size="small">
                    <Descriptions.Item label="Medicine">
                      {medicine.medicine?.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Dosage">
                      {medicine.dosage}
                    </Descriptions.Item>
                    <Descriptions.Item label="Frequency">
                      {medicine.frequency}
                    </Descriptions.Item>
                    <Descriptions.Item label="Duration" span={3}>
                      {moment(medicine.startDate).format('DD/MM/YYYY')} - {moment(medicine.endDate).format('DD/MM/YYYY')}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              ))}

              {selectedPrescription.instructions && (
                <>
                  <Divider>Special Instructions</Divider>
                  <p>{selectedPrescription.instructions}</p>
                </>
              )}
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default Prescriptions;