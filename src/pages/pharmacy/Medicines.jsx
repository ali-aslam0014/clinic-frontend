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
  message,
  Tag,
  Tooltip,
  DatePicker,
  Spin,
  Empty
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import PharmacyLayout from '../../components/pharmacy/Layout';
import axios from 'axios';
import moment from 'moment';

const { Option } = Select;
const { confirm } = Modal;

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  // Fetch medicines
  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/v1/pharmacy/medicines', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMedicines(response.data.data);
    } catch (error) {
      message.error('Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // Table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: [
        { text: 'Tablets', value: 'Tablets' },
        { text: 'Capsules', value: 'Capsules' },
        { text: 'Syrup', value: 'Syrup' },
        { text: 'Injection', value: 'Injection' }
      ],
      onFilter: (value, record) => record.category === value
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock, record) => (
        <Tag color={stock <= record.minStockLevel ? 'red' : 'green'}>
          {stock}
        </Tag>
      )
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${price.toFixed(2)}`
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date) => moment(date).format('YYYY-MM-DD'),
      sorter: (a, b) => moment(a.expiryDate).unix() - moment(b.expiryDate).unix()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // Handle form submit
  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      if (editingMedicine) {
        await axios.put(`/api/v1/pharmacy/medicines/${editingMedicine._id}`, values, config);
        message.success('Medicine updated successfully');
      } else {
        await axios.post('/api/v1/pharmacy/medicines', values, config);
        message.success('Medicine added successfully');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingMedicine(null);
      fetchMedicines();
    } catch (error) {
      message.error('Operation failed: ' + error.message);
    }
  };

  // Handle edit
  const handleEdit = (record) => {
    setEditingMedicine(record);
    form.setFieldsValue({
      ...record,
      expiryDate: moment(record.expiryDate)
    });
    setModalVisible(true);
  };

  // Handle delete
  const handleDelete = (record) => {
    confirm({
      title: 'Are you sure you want to delete this medicine?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`/api/v1/pharmacy/medicines/${record._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          message.success('Medicine deleted successfully');
          fetchMedicines();
        } catch (error) {
          message.error('Delete failed: ' + error.message);
        }
      }
    });
  };

  return (
    <PharmacyLayout>
      <Card
        className="medicine-card"
        title="Medicine Management"
        extra={
          <Space className="action-buttons">
            <Input
              className="search-input"
              placeholder="Search medicines"
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button
              className="add-button"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingMedicine(null);
                form.resetFields();
                setModalVisible(true);
              }}
              style={{ 
                backgroundColor: '#1890ff',
                borderColor: '#1890ff'
              }}
            >
              Add Medicine
            </Button>
          </Space>
        }
      >
        {loading ? (
          <div className="loading-spinner">
            <Spin size="large" />
          </div>
        ) : medicines.length === 0 ? (
          <div className="empty-state">
            <Empty description="No medicines found" />
          </div>
        ) : (
          <Table
            className="medicines-table"
            columns={columns}
            dataSource={medicines.filter(medicine =>
              medicine.name.toLowerCase().includes(searchText.toLowerCase())
            )}
            rowKey="_id"
          />
        )}

        <Modal
          className="medicine-modal"
          title={editingMedicine ? 'Edit Medicine' : 'Add Medicine'}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingMedicine(null);
            form.resetFields();
          }}
          footer={null}
        >
          <Form
            className="medicine-form"
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="name"
              label="Medicine Name"
              rules={[{ required: true, message: 'Please enter medicine name' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please enter category' }]}
            >
              <Input placeholder="Enter medicine category" />
            </Form.Item>

            <Form.Item
              name="stock"
              label="Stock"
              rules={[{ required: true, message: 'Please enter stock quantity' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="price"
              label="Price"
              rules={[{ required: true, message: 'Please enter price' }]}
            >
              <InputNumber
                min={0}
                step={0.01}
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="expiryDate"
              label="Expiry Date"
              rules={[{ required: true, message: 'Please select expiry date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="minStockLevel"
              label="Minimum Stock Level"
              rules={[{ required: true, message: 'Please enter minimum stock level' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingMedicine ? 'Update' : 'Add'}
                </Button>
                <Button onClick={() => {
                  setModalVisible(false);
                  setEditingMedicine(null);
                  form.resetFields();
                }}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </PharmacyLayout>
  );
};

export default Medicines; 