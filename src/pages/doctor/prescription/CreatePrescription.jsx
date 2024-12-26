import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Table,
  Space,
  InputNumber,
  Divider,
  Row,
  Col,
  message,
  AutoComplete,
  Spin,
  Checkbox,
  Tag,
  Tooltip,
  Modal
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  PrinterOutlined,
  SaveOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import DoctorLayout from '../../../components/doctor/Layout';
import './CreatePrescription.css';
import { pharmacyService } from '../../../services/pharmacyIntegration';
import DigitalSignature from '../../../components/common/DigitalSignature';

const { TextArea } = Input;
const { Option } = Select;

const CreatePrescription = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const [medicineAvailability, setMedicineAvailability] = useState({});
  const [sendToPharmacy, setSendToPharmacy] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [signature, setSignature] = useState(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        const [patientsRes, medicinesRes] = await Promise.all([
          axios.get('/api/patients'),
          axios.get('/api/medicines')
        ]);
        
        if (patientsRes.data?.data) {
          setPatients(patientsRes.data.data);
        }
        if (medicinesRes.data?.data) {
          setMedicines(medicinesRes.data.data);
        }
        setInitialized(true);
      } catch (error) {
        console.error('Initialization error:', error);
        message.error('Failed to initialize data');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    const checkAvailability = async () => {
      if (selectedMedicines.length > 0) {
        try {
          setCheckingAvailability(true);
          const result = await pharmacyService.checkAvailability(selectedMedicines);
          setMedicineAvailability(result.data);
        } catch (error) {
          message.error('Failed to check medicine availability');
        } finally {
          setCheckingAvailability(false);
        }
      }
    };

    checkAvailability();
  }, [selectedMedicines]);

  const handleMedicineSearch = (value) => {
    const filtered = medicines.filter(medicine => 
      medicine.name.toLowerCase().includes(value.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const addMedicine = () => {
    setSelectedMedicines([
      ...selectedMedicines,
      {
        key: Date.now(),
        medicine: null,
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      }
    ]);
  };

  const removeMedicine = (key) => {
    setSelectedMedicines(selectedMedicines.filter(med => med.key !== key));
  };

  const handleSignatureSave = (signatureData) => {
    setSignature(signatureData);
  };

  const handleSubmit = async (values) => {
    try {
      if (!signature) {
        message.error('Please add your digital signature');
        return;
      }

      const prescriptionData = {
        ...values,
        doctorSignature: signature
      };

      setSubmitting(true);
      
      const prescriptionResponse = await axios.post('/api/prescriptions', prescriptionData);
      const prescriptionId = prescriptionResponse.data.data._id;

      if (sendToPharmacy) {
        try {
          await pharmacyService.createOrder(prescriptionId);
          message.success('Prescription sent to pharmacy successfully');
        } catch (error) {
          message.warning('Prescription created but failed to send to pharmacy');
        }
      }

      message.success('Prescription created successfully');
      form.resetFields();
      setSelectedMedicines([]);
      setSignature(null);
    } catch (error) {
      message.error('Failed to create prescription');
    } finally {
      setSubmitting(false);
    }
  };

  const renderAvailabilityStatus = (medicineId) => {
    const availability = medicineAvailability[medicineId];
    if (!availability) return null;

    return (
      <Tooltip title={`Current stock: ${availability.currentStock}`}>
        <Tag color={availability.available ? 'green' : 'red'}>
          {availability.available ? 'In Stock' : 'Out of Stock'}
        </Tag>
      </Tooltip>
    );
  };

  const medicineColumns = [
    {
      title: 'Medicine',
      dataIndex: 'medicine',
      key: 'medicine',
      render: (_, record, index) => (
        <AutoComplete
          style={{ width: '100%' }}
          options={searchResults.map(med => ({ value: med._id, label: med.name }))}
          onSearch={handleMedicineSearch}
          onChange={(value) => {
            const updatedMedicines = [...selectedMedicines];
            updatedMedicines[index].medicine = value;
            setSelectedMedicines(updatedMedicines);
          }}
          placeholder="Search medicine"
        />
      )
    },
    {
      title: 'Dosage',
      dataIndex: 'dosage',
      key: 'dosage',
      render: (_, record, index) => (
        <Input
          placeholder="e.g., 1 tablet"
          onChange={(e) => {
            const updatedMedicines = [...selectedMedicines];
            updatedMedicines[index].dosage = e.target.value;
            setSelectedMedicines(updatedMedicines);
          }}
        />
      )
    },
    {
      title: 'Frequency',
      dataIndex: 'frequency',
      key: 'frequency',
      render: (_, record, index) => (
        <Select
          style={{ width: '100%' }}
          placeholder="Select frequency"
          onChange={(value) => {
            const updatedMedicines = [...selectedMedicines];
            updatedMedicines[index].frequency = value;
            setSelectedMedicines(updatedMedicines);
          }}
        >
          <Option value="Once daily">Once daily</Option>
          <Option value="Twice daily">Twice daily</Option>
          <Option value="Thrice daily">Thrice daily</Option>
          <Option value="Four times daily">Four times daily</Option>
          <Option value="As needed">As needed</Option>
        </Select>
      )
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (_, record, index) => (
        <Input
          placeholder="e.g., 7 days"
          onChange={(e) => {
            const updatedMedicines = [...selectedMedicines];
            updatedMedicines[index].duration = e.target.value;
            setSelectedMedicines(updatedMedicines);
          }}
        />
      )
    },
    {
      title: 'Instructions',
      dataIndex: 'instructions',
      key: 'instructions',
      render: (_, record, index) => (
        <Input
          placeholder="e.g., After meals"
          onChange={(e) => {
            const updatedMedicines = [...selectedMedicines];
            updatedMedicines[index].instructions = e.target.value;
            setSelectedMedicines(updatedMedicines);
          }}
        />
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeMedicine(record.key)}
        />
      )
    },
    {
      title: 'Availability',
      dataIndex: 'medicineId',
      render: (medicineId) => renderAvailabilityStatus(medicineId)
    }
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <Card>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <p style={{ marginTop: '20px' }}>Loading prescription form...</p>
          </div>
        </Card>
      );
    }

    return (
      <Card title="Create Prescription" className="prescription-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="patientId"
                label="Patient"
                rules={[{ required: true, message: 'Please select patient' }]}
              >
                <Select
                  showSearch
                  placeholder="Select patient"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {Array.isArray(patients) && patients.length > 0 ? (
                    patients.map(patient => (
                      <Option key={patient._id} value={patient._id}>
                        {patient.name} - {patient.phone}
                      </Option>
                    ))
                  ) : (
                    <Option disabled>No patients found</Option>
                  )}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="diagnosis"
                label="Diagnosis"
                rules={[{ required: true, message: 'Please enter diagnosis' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Medicines</Divider>

          <Button
            type="dashed"
            onClick={addMedicine}
            style={{ marginBottom: 16 }}
            icon={<PlusOutlined />}
          >
            Add Medicine
          </Button>

          <Table
            columns={medicineColumns}
            dataSource={selectedMedicines}
            pagination={false}
            rowKey="key"
            loading={checkingAvailability}
          />

          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={24}>
              <Form.Item
                name="notes"
                label="Additional Notes"
              >
                <TextArea rows={4} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Checkbox
              checked={sendToPharmacy}
              onChange={(e) => setSendToPharmacy(e.target.checked)}
              disabled={selectedMedicines.some(med => 
                medicineAvailability[med.medicineId]?.available === false
              )}
            >
              Send to Pharmacy
            </Checkbox>
            {selectedMedicines.some(med => 
              medicineAvailability[med.medicineId]?.available === false
            ) && (
              <Tag color="red" style={{ marginLeft: 8 }}>
                Some medicines are out of stock
              </Tag>
            )}
          </Form.Item>

          <Form.Item
            label="Doctor's Signature"
            required
            tooltip="Digital signature is required for prescription validity"
          >
            <div className="signature-preview">
              {signature && (
                <img 
                  src={signature} 
                  alt="Doctor's Signature" 
                  style={{ maxWidth: 200, marginBottom: 16 }}
                />
              )}
            </div>
            <DigitalSignature onSave={handleSignatureSave} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                icon={<SaveOutlined />}
              >
                Save Prescription
              </Button>
              <Button
                icon={<PrinterOutlined />}
                onClick={() => window.print()}
              >
                Print
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    );
  };

  return (
    <DoctorLayout>
      <div className="create-prescription-container">
        {renderContent()}
      </div>
    </DoctorLayout>
  );
};

export default CreatePrescription;