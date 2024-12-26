import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Row,
  Col,
  Typography,
  Divider,
  Tag,
  AutoComplete
} from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  PrinterOutlined,
  SaveOutlined,
  DeleteOutlined,
  PlusOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './MedicineSales.css';

const { Option } = Select;
const { Title, Text } = Typography;

const MedicineSales = () => {
  const [medicines, setMedicines] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/v1/admin/pharmacy/medicines', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMedicines(response.data.data);
    } catch (error) {
      message.error('Failed to fetch medicines');
    }
  };

  const handleSearch = (value) => {
    const results = medicines.filter(medicine => 
      medicine.name.toLowerCase().includes(value.toLowerCase()) ||
      medicine.genericName.toLowerCase().includes(value.toLowerCase())
    );
    setSearchResults(results);
  };

  const addToCart = (values) => {
    if (!selectedMedicine) {
      message.error('Please select a medicine');
      return;
    }

    if (values.quantity > selectedMedicine.stock) {
      message.error('Quantity exceeds available stock');
      return;
    }

    const existingItem = cartItems.find(item => item.medicine._id === selectedMedicine._id);
    if (existingItem) {
      const newQuantity = existingItem.quantity + values.quantity;
      if (newQuantity > selectedMedicine.stock) {
        message.error('Total quantity exceeds available stock');
        return;
      }
      setCartItems(cartItems.map(item =>
        item.medicine._id === selectedMedicine._id
          ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
          : item
      ));
    } else {
      setCartItems([...cartItems, {
        medicine: selectedMedicine,
        quantity: values.quantity,
        price: selectedMedicine.unitPrice,
        total: values.quantity * selectedMedicine.unitPrice
      }]);
    }

    setModalVisible(false);
    form.resetFields();
    setSelectedMedicine(null);
  };

  const removeFromCart = (medicineId) => {
    setCartItems(cartItems.filter(item => item.medicine._id !== medicineId));
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSale = async () => {
    try {
      if (cartItems.length === 0) {
        message.error('Cart is empty');
        return;
      }

      const token = localStorage.getItem('token');
      const payload = {
        items: cartItems.map(item => ({
          medicine: item.medicine._id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: calculateTotal(),
        paymentMethod: 'cash', // You can add payment method selection
        patientName: form.getFieldValue('patientName'),
        patientPhone: form.getFieldValue('patientPhone')
      };

      await axios.post('/api/v1/admin/pharmacy/sales', payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      message.success('Sale completed successfully');
      setCartItems([]);
      form.resetFields();
      fetchMedicines(); // Refresh medicines to update stock
    } catch (error) {
      message.error('Failed to complete sale');
    }
  };

  const cartColumns = [
    {
      title: 'Medicine',
      dataIndex: ['medicine', 'name'],
      key: 'name'
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: price => `$${price.toFixed(2)}`
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: total => `$${total.toFixed(2)}`
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeFromCart(record.medicine._id)}
        />
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="medicine-sales-container">
        <Row gutter={16}>
          <Col span={16}>
            <Card title="New Sale">
              <Space className="full-width" direction="vertical" size="large">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setModalVisible(true)}
                >
                  Add Medicine
                </Button>

                <Table
                  columns={cartColumns}
                  dataSource={cartItems}
                  rowKey={record => record.medicine._id}
                  pagination={false}
                  summary={() => (
                    <Table.Summary>
                      <Table.Summary.Row>
                        <Table.Summary.Cell colSpan={3}>
                          <Text strong>Total</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell>
                          <Text strong>${calculateTotal().toFixed(2)}</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell />
                      </Table.Summary.Row>
                    </Table.Summary>
                  )}
                />

                <Form layout="vertical">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="patientName"
                        label="Patient Name"
                      >
                        <Input prefix={<UserOutlined />} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="patientPhone"
                        label="Patient Phone"
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>

                <Space>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSale}
                    disabled={cartItems.length === 0}
                  >
                    Complete Sale
                  </Button>
                  <Button
                    icon={<PrinterOutlined />}
                    disabled={cartItems.length === 0}
                  >
                    Print Invoice
                  </Button>
                </Space>
              </Space>
            </Card>
          </Col>

          <Col span={8}>
            <Card title="Recent Sales">
              {/* Add recent sales component here */}
            </Card>
          </Col>
        </Row>

        <Modal
          title="Add Medicine to Cart"
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
            setSelectedMedicine(null);
          }}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={addToCart}
          >
            <Form.Item
              name="medicine"
              label="Medicine"
              rules={[{ required: true, message: 'Please select medicine' }]}
            >
              <AutoComplete
                options={searchResults.map(medicine => ({
                  value: medicine.name,
                  medicine: medicine
                }))}
                onSearch={handleSearch}
                onSelect={(value, option) => {
                  setSelectedMedicine(option.medicine);
                }}
                placeholder="Search medicine..."
              />
            </Form.Item>

            {selectedMedicine && (
              <>
                <div className="medicine-details">
                  <Text>Available Stock: {selectedMedicine.stock}</Text>
                  <br />
                  <Text>Unit Price: ${selectedMedicine.unitPrice}</Text>
                </div>

                <Form.Item
                  name="quantity"
                  label="Quantity"
                  rules={[
                    { required: true, message: 'Please enter quantity' },
                    {
                      validator: (_, value) => {
                        if (value > selectedMedicine.stock) {
                          return Promise.reject('Quantity exceeds available stock');
                        }
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
                  <InputNumber min={1} max={selectedMedicine.stock} />
                </Form.Item>
              </>
            )}

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Add to Cart
                </Button>
                <Button onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                  setSelectedMedicine(null);
                }}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default MedicineSales;