import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  Select,
  InputNumber,
  DatePicker,
  message,
  Tag,
  Row,
  Col,
  Divider,
  Typography
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  PrinterOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import PharmacyLayout from '../../components/pharmacy/Layout';
import axios from 'axios';
import moment from 'moment';
import './Sales.css';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [form] = Form.useForm();

  // Fetch sales
  const fetchSales = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/v1/pharmacy/sales', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSales(response.data.data);
    } catch (error) {
      message.error('Failed to fetch sales');
    } finally {
      setLoading(false);
    }
  };

  // Fetch medicines
  const fetchMedicines = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/v1/pharmacy/medicines', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMedicines(response.data.data);
    } catch (error) {
      message.error('Failed to fetch medicines');
    }
  };

  useEffect(() => {
    fetchSales();
    fetchMedicines();
  }, []);

  // Handle new sale
  const handleAddSale = () => {
    form.resetFields();
    setSelectedItems([]);
    setModalVisible(true);
  };

  // Handle medicine selection
  const handleMedicineSelect = (value, option) => {
    const medicine = medicines.find(m => m._id === value);
    if (medicine) {
      setSelectedItems([...selectedItems, {
        medicine: medicine._id,
        name: medicine.name,
        price: medicine.price,
        quantity: 1,
        total: medicine.price
      }]);
    }
    form.setFieldsValue({ medicine: undefined });
  };

  // Calculate totals
  const calculateTotals = (items) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = form.getFieldValue('discount') || 0;
    const finalAmount = total - discount;
    return { total, finalAmount };
  };

  // Handle quantity change
  const handleQuantityChange = (value, index) => {
    const newItems = [...selectedItems];
    newItems[index].quantity = value;
    newItems[index].total = value * newItems[index].price;
    setSelectedItems(newItems);
    
    const { total, finalAmount } = calculateTotals(newItems);
    form.setFieldsValue({
      totalAmount: total,
      finalAmount: finalAmount
    });
  };

  // Handle form submit
  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem('token');
      const saleData = {
        ...values,
        items: selectedItems.map(item => ({
          medicine: item.medicine,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        }))
      };

      await axios.post('/api/v1/pharmacy/sales', saleData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      message.success('Sale created successfully');
      setModalVisible(false);
      fetchSales();
    } catch (error) {
      message.error('Failed to create sale');
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Invoice',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber'
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: date => moment(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Patient',
      dataIndex: 'patientName',
      key: 'patientName'
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: items => items.length
    },
    {
      title: 'Total',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
      render: amount => `$${amount.toFixed(2)}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={
          status === 'completed' ? 'green' :
          status === 'cancelled' ? 'red' :
          'orange'
        }>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<PrinterOutlined />}
            onClick={() => handlePrint(record)}
          >
            Print
          </Button>
          {record.status === 'completed' && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleCancel(record)}
            >
              Cancel
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <PharmacyLayout>
      <Card
        title="Sales Management"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddSale}
          >
            New Sale
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={sales}
          rowKey="_id"
          loading={loading}
        />

        <Modal
          title="New Sale"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          width={800}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            {/* Form content continues... */}
          </Form>
        </Modal>
      </Card>
    </PharmacyLayout>
  );
};

export default Sales; 