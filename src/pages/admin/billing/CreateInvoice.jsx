import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Table,
  InputNumber,
  Space,
  Row,
  Col,
  Typography,
  Divider,
  message,
  DatePicker
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  PrinterOutlined,
  SaveOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './CreateInvoice.css';

const { Option } = Select;
const { Title } = Typography;

const CreateInvoice = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([]);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  // Fetch patients and services
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { 'Authorization': `Bearer ${token}` }
        };

        const [patientsRes, servicesRes] = await Promise.all([
          axios.get('/api/v1/admin/patients', config),
          axios.get('/api/v1/admin/services', config)
        ]);

        if (patientsRes.data?.data) {
          setPatients(patientsRes.data.data);
        }
        
        if (servicesRes.data?.data) {
          setServices(servicesRes.data.data);
        }

      } catch (error) {
        console.error('Fetch error:', error);
        message.error('Failed to fetch data: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate total amount
  useEffect(() => {
    const newTotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    setTotal(newTotal);
    form.setFieldsValue({ totalAmount: newTotal });
  }, [items, form]);

  const handleAddItem = () => {
    setItems([...items, { key: Date.now(), quantity: 1, price: 0, amount: 0 }]);
  };

  const handleRemoveItem = (key) => {
    setItems(items.filter(item => item.key !== key));
  };

  const handleItemChange = (key, field, value) => {
    const newItems = items.map(item => {
      if (item.key === key) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'service') {
          const selectedService = services.find(s => s._id === value);
          updatedItem.price = selectedService?.price || 0;
        }
        updatedItem.amount = updatedItem.quantity * updatedItem.price;
        return updatedItem;
      }
      return item;
    });
    setItems(newItems);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const invoiceData = {
        ...values,
        items: items.map(({ key, ...item }) => item),
        invoiceDate: values.invoiceDate.format('YYYY-MM-DD'),
        dueDate: values.dueDate.format('YYYY-MM-DD')
      };

      await axios.post('/api/v1/admin/invoices', invoiceData, config);
      message.success('Invoice created successfully');
      form.resetFields();
      setItems([]);
    } catch (error) {
      console.error('Submit error:', error);
      message.error('Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Service',
      dataIndex: 'service',
      key: 'service',
      render: (text, record) => (
        <Select
          style={{ width: '100%' }}
          value={text}
          onChange={(value) => handleItemChange(record.key, 'service', value)}
        >
          {services.map(service => (
            <Option key={service._id} value={service._id}>
              {service.name}
            </Option>
          ))}
        </Select>
      )
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (text, record) => (
        <InputNumber
          min={1}
          value={text}
          onChange={(value) => handleItemChange(record.key, 'quantity', value)}
        />
      )
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (text) => `$${text}`
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (text, record) => `$${record.quantity * record.price}`
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.key)}
        />
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="create-invoice-container">
        <Card className="invoice-card">
          <Title level={2}>Create Invoice</Title>
          <Divider />

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              Loading...
            </div>
          ) : (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                invoiceDate: moment(),
                dueDate: moment().add(30, 'days')
              }}
            >
              <Row gutter={24}>
                <Col span={8}>
                  <Form.Item
                    name="patientId"
                    label="Patient"
                    rules={[{ required: true, message: 'Please select patient' }]}
                  >
                    <Select
                      showSearch
                      placeholder="Select patient"
                      optionFilterProp="children"
                    >
                      {patients.map(patient => (
                        <Option key={patient._id} value={patient._id}>
                          {patient.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="invoiceDate"
                    label="Invoice Date"
                    rules={[{ required: true, message: 'Please select date' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="dueDate"
                    label="Due Date"
                    rules={[{ required: true, message: 'Please select due date' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left">Invoice Items</Divider>
              
              <Button
                type="dashed"
                onClick={handleAddItem}
                style={{ marginBottom: 16 }}
                icon={<PlusOutlined />}
              >
                Add Item
              </Button>

              <Table
                columns={columns}
                dataSource={items}
                pagination={false}
                rowKey="key"
              />

              <Row justify="end" style={{ marginTop: 16 }}>
                <Col>
                  <Title level={4}>Total: ${total.toFixed(2)}</Title>
                </Col>
              </Row>

              <Form.Item
                name="notes"
                label="Notes"
              >
                <Input.TextArea rows={4} />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    Save Invoice
                  </Button>
                  <Button
                    icon={<PrinterOutlined />}
                    onClick={() => window.print()}
                  >
                    Print Preview
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default CreateInvoice;