import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Table,
  Space,
  Card,
  Row,
  Col,
  Typography,
  message,
  AutoComplete,
  Tag,
  Divider
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  PrinterOutlined,
  BarcodeOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import './NewSaleForm.css';
import PharmacyLayout from '../pharmacy/Layout';

const { Title, Text } = Typography;
const { Option } = Select;

const NewSaleForm = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [total, setTotal] = useState(0);

  // Fetch medicines for search
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await axios.get('/api/medicines');
        setMedicines(response.data.data);
      } catch (error) {
        message.error('Failed to fetch medicines');
      }
    };
    fetchMedicines();
  }, []);

  // Calculate total
  useEffect(() => {
    const newTotal = selectedItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    setTotal(newTotal);
  }, [selectedItems]);

  // Handle medicine search
  const handleSearch = (value) => {
    const results = medicines.filter(medicine => 
      medicine.name.toLowerCase().includes(value.toLowerCase()) ||
      medicine.barcode.includes(value)
    );
    setSearchResults(results.map(medicine => ({
      value: medicine._id,
      label: medicine.name,
      medicine
    })));
  };

  // Handle medicine selection
  const handleSelect = (value, option) => {
    const medicine = option.medicine;
    if (medicine.stock <= 0) {
      message.warning('This medicine is out of stock');
      return;
    }

    const existingItem = selectedItems.find(item => item._id === medicine._id);
    if (existingItem) {
      message.warning('Medicine already added to sale');
      return;
    }

    setSelectedItems([...selectedItems, {
      _id: medicine._id,
      name: medicine.name,
      price: medicine.price,
      quantity: 1,
      stock: medicine.stock,
      expiryDate: medicine.expiryDate
    }]);
    form.setFieldsValue({ medicineSearch: '' });
  };

  // Handle quantity change
  const handleQuantityChange = (value, record) => {
    if (value > record.stock) {
      message.warning('Quantity cannot exceed available stock');
      return;
    }
    const newItems = selectedItems.map(item => {
      if (item._id === record._id) {
        return { ...item, quantity: value };
      }
      return item;
    });
    setSelectedItems(newItems);
  };

  // Handle item removal
  const handleRemoveItem = (record) => {
    setSelectedItems(selectedItems.filter(item => item._id !== record._id));
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const saleData = {
        items: selectedItems.map(item => ({
          medicine: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        paymentMethod: values.paymentMethod,
        totalAmount: total,
        discount: values.discount || 0
      };

      const response = await axios.post('/api/sales', saleData);
      
      message.success('Sale completed successfully');
      if (onSuccess) {
        onSuccess(response.data.data);
      }

      // Reset form
      form.resetFields();
      setSelectedItems([]);
      setTotal(0);
    } catch (error) {
      message.error('Failed to complete sale');
    } finally {
      setLoading(false);
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Medicine',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: price => `Rs. ${price.toFixed(2)}`
    },
    {
      title: 'Quantity',
      key: 'quantity',
      render: (_, record) => (
        <InputNumber
          min={1}
          max={record.stock}
          value={record.quantity}
          onChange={(value) => handleQuantityChange(value, record)}
        />
      )
    },
    {
      title: 'Subtotal',
      key: 'subtotal',
      render: (_, record) => `Rs. ${(record.price * record.quantity).toFixed(2)}`
    },
    {
      title: 'Stock',
      key: 'stock',
      render: (_, record) => (
        <Tag color={record.stock <= 10 ? 'red' : 'green'}>
          {record.stock} left
        </Tag>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record)}
        />
      )
    }
  ];

  return (
    <PharmacyLayout>
      <div className="new-sale-form">
        <Card>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={16}>
              <Form
                form={form}
                layout="vertical"
              >
                <Form.Item
                  name="medicineSearch"
                  label="Search Medicine"
                >
                  <AutoComplete
                    options={searchResults}
                    onSearch={handleSearch}
                    onSelect={handleSelect}
                    placeholder="Search by name or scan barcode"
                    prefix={<BarcodeOutlined />}
                  />
                </Form.Item>

                <Table
                  columns={columns}
                  dataSource={selectedItems}
                  rowKey="_id"
                  pagination={false}
                  scroll={{ x: true }}
                />

                <Row gutter={16} className="customer-details">
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="customerName"
                      label="Customer Name"
                    >
                      <Input placeholder="Enter customer name" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="customerPhone"
                      label="Customer Phone"
                    >
                      <Input placeholder="Enter customer phone" />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Col>

            <Col xs={24} md={8}>
              <Card className="sale-summary">
                <Title level={4}>Sale Summary</Title>
                <div className="summary-item">
                  <Text>Subtotal:</Text>
                  <Text>Rs. {total.toFixed(2)}</Text>
                </div>
                
                <Form.Item name="discount" label="Discount">
                  <InputNumber
                    min={0}
                    max={total}
                    formatter={value => `Rs. ${value}`}
                    parser={value => value.replace('Rs. ', '')}
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                <Form.Item name="paymentMethod" label="Payment Method">
                  <Select placeholder="Select payment method">
                    <Option value="cash">Cash</Option>
                    <Option value="card">Card</Option>
                    <Option value="other">Other</Option>
                  </Select>
                </Form.Item>

                <Divider />

                <div className="summary-total">
                  <Title level={4}>Total:</Title>
                  <Title level={4}>Rs. {(total - (form.getFieldValue('discount') || 0)).toFixed(2)}</Title>
                </div>

                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    block
                    icon={<SaveOutlined />}
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={selectedItems.length === 0}
                  >
                    Complete Sale
                  </Button>
                  <Button
                    block
                    icon={<PrinterOutlined />}
                    disabled={selectedItems.length === 0}
                  >
                    Print Invoice
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </Card>
      </div>
    </PharmacyLayout>
  );
};

export default NewSaleForm; 