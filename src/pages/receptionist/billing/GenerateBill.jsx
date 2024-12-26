import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Table,
  Tag,
  Space,
  Row,
  Col,
  Typography,
  Divider,
  InputNumber,
  Modal,
  message,
  Descriptions
} from 'antd';
import {
  FileAddOutlined,
  PrinterOutlined,
  SaveOutlined,
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import moment from 'moment';
import billingAPI from '../../../services/billingAPI';
import './GenerateBill.css';

const { Option } = Select;
const { Title, Text } = Typography;

const GenerateBill = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [billPreviewVisible, setBillPreviewVisible] = useState(false);
  const [billData, setBillData] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await billingAPI.getServices();
      setServices(response.data);
    } catch (error) {
      message.error('Error fetching services: ' + error.message);
    }
  };

  const handlePatientSearch = async (value) => {
    if (value.length > 2) {
      try {
        const response = await billingAPI.searchPatients(value);
        setPatients(response.data);
      } catch (error) {
        message.error('Error searching patients: ' + error.message);
      }
    }
  };

  const handlePatientSelect = async (patientId) => {
    try {
      const response = await billingAPI.getPatientDetails(patientId);
      setSelectedPatient(response.data);
      form.setFieldsValue({
        patientName: response.data.firstName + ' ' + response.data.lastName,
        patientId: response.data._id
      });
    } catch (error) {
      message.error('Error fetching patient details: ' + error.message);
    }
  };

  const handleAddService = () => {
    const service = form.getFieldValue('service');
    const quantity = form.getFieldValue('quantity') || 1;
    
    if (!service) {
      message.warning('Please select a service');
      return;
    }

    const selectedService = services.find(s => s._id === service);
    const newService = {
      serviceId: selectedService._id,
      name: selectedService.name,
      quantity,
      unitPrice: selectedService.price,
      amount: selectedService.price * quantity,
      discount: 0
    };

    setSelectedServices([...selectedServices, newService]);
    form.setFieldsValue({ service: undefined, quantity: 1 });
  };

  const handleRemoveService = (index) => {
    const updatedServices = [...selectedServices];
    updatedServices.splice(index, 1);
    setSelectedServices(updatedServices);
  };

  const calculateTotals = () => {
    const subtotal = selectedServices.reduce((sum, service) => sum + service.amount, 0);
    const totalDiscount = selectedServices.reduce((sum, service) => sum + service.discount, 0);
    const tax = subtotal * 0.15; // 15% tax
    const total = subtotal - totalDiscount + tax;

    return { subtotal, totalDiscount, tax, total };
  };

  const handlePreviewBill = () => {
    if (!selectedPatient || selectedServices.length === 0) {
      message.warning('Please select patient and add services');
      return;
    }

    const totals = calculateTotals();
    const billData = {
      patientId: selectedPatient._id,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      billDate: moment().format('YYYY-MM-DD'),
      services: selectedServices,
      ...totals
    };

    setBillData(billData);
    setBillPreviewVisible(true);
  };

  const handleGenerateBill = async () => {
    try {
      setLoading(true);
      const response = await billingAPI.generateBill(billData);
      message.success('Bill generated successfully');
      setBillPreviewVisible(false);
      // Reset form
      form.resetFields();
      setSelectedPatient(null);
      setSelectedServices([]);
    } catch (error) {
      message.error('Error generating bill: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Service',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price) => `$${price.toFixed(2)}`
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${amount.toFixed(2)}`
    },
    {
      title: 'Discount',
      dataIndex: 'discount',
      key: 'discount',
      render: (_, record, index) => (
        <InputNumber
          min={0}
          max={record.amount}
          value={record.discount}
          onChange={(value) => {
            const updated = [...selectedServices];
            updated[index].discount = value || 0;
            setSelectedServices(updated);
          }}
          formatter={value => `$${value}`}
          parser={value => value.replace('$', '')}
        />
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record, index) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveService(index)}
        />
      )
    }
  ];

  return (
    <div className="generate-bill">
      <Card title="Generate Bill">
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="patientSearch"
                label="Search Patient"
                rules={[{ required: true, message: 'Please select a patient' }]}
              >
                <Select
                  showSearch
                  placeholder="Search by name or ID"
                  onSearch={handlePatientSearch}
                  onChange={handlePatientSelect}
                  loading={loading}
                >
                  {patients.map(patient => (
                    <Option key={patient._id} value={patient._id}>
                      {patient.firstName} {patient.lastName} - {patient.contactNumber}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {selectedPatient && (
            <>
              <Divider />
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item name="service" label="Select Service">
                    <Select placeholder="Select service">
                      {services.map(service => (
                        <Option key={service._id} value={service._id}>
                          {service.name} - ${service.price}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="quantity" label="Quantity" initialValue={1}>
                    <InputNumber min={1} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label=" ">
                    <Button
                      type="dashed"
                      onClick={handleAddService}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Service
                    </Button>
                  </Form.Item>
                </Col>
              </Row>

              <Table
                columns={columns}
                dataSource={selectedServices}
                rowKey="serviceId"
                pagination={false}
              />

              <Row justify="end" style={{ marginTop: 16 }}>
                <Space>
                  <Button
                    type="primary"
                    icon={<FileAddOutlined />}
                    onClick={handlePreviewBill}
                    disabled={selectedServices.length === 0}
                  >
                    Preview Bill
                  </Button>
                </Space>
              </Row>
            </>
          )}
        </Form>

        <Modal
          title="Bill Preview"
          visible={billPreviewVisible}
          onOk={handleGenerateBill}
          onCancel={() => setBillPreviewVisible(false)}
          width={800}
          confirmLoading={loading}
        >
          {billData && (
            <div className="bill-preview">
              <Title level={4}>Medical Bill</Title>
              <Descriptions column={2}>
                <Descriptions.Item label="Patient Name">{billData.patientName}</Descriptions.Item>
                <Descriptions.Item label="Date">{billData.billDate}</Descriptions.Item>
                <Descriptions.Item label="Bill No.">{moment().unix()}</Descriptions.Item>
              </Descriptions>

              <Table
                columns={columns.filter(col => col.key !== 'action')}
                dataSource={selectedServices}
                pagination={false}
                summary={() => (
                  <Table.Summary>
                    <Table.Summary.Row>
                      <Table.Summary.Cell colSpan={3}>Subtotal</Table.Summary.Cell>
                      <Table.Summary.Cell>
                        ${billData.subtotal.toFixed(2)}
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row>
                      <Table.Summary.Cell colSpan={3}>Total Discount</Table.Summary.Cell>
                      <Table.Summary.Cell>
                        ${billData.totalDiscount.toFixed(2)}
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row>
                      <Table.Summary.Cell colSpan={3}>Tax (15%)</Table.Summary.Cell>
                      <Table.Summary.Cell>
                        ${billData.tax.toFixed(2)}
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row>
                      <Table.Summary.Cell colSpan={3}>
                        <Text strong>Total Amount</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell>
                        <Text strong>${billData.total.toFixed(2)}</Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default GenerateBill; 