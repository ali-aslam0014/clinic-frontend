import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  InputNumber,
  Select,
  Tag,
  message,
  Tooltip,
  Badge,
  DatePicker
} from 'antd';
import moment from 'moment';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './MedicineInventory.css';

const { Option } = Select;
const { confirm } = Modal;

const MedicineInventory = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  // Fetch medicines
  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/v1/admin/pharmacy/medicines', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('API Response:', response.data);
      
      if (response.data?.data) {
        setMedicines(response.data.data);
      } else {
        setMedicines([]);
        message.warning('No medicines found');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Failed to fetch medicines: ' + (error.response?.data?.message || error.message));
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // Handle form submit
  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const formData = {
        ...values,
        expiryDate: values.expiryDate.toISOString()
      };

      if (editingMedicine) {
        await axios.put(`/api/v1/admin/pharmacy/medicines/${editingMedicine._id}`, formData, config);
        message.success('Medicine updated successfully');
      } else {
        await axios.post('/api/v1/admin/pharmacy/medicines', formData, config);
        message.success('Medicine added successfully');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingMedicine(null);
      fetchMedicines();
    } catch (error) {
      console.error('Submit error:', error);
      message.error('Operation failed: ' + (error.response?.data?.message || error.message));
    }
  };

  // Handle delete
  const handleDelete = (record) => {
    confirm({
      title: 'Are you sure you want to delete this medicine?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`/api/v1/admin/pharmacy/medicines/${record._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          message.success('Medicine deleted successfully');
          fetchMedicines();
        } catch (error) {
          message.error('Delete failed');
        }
      }
    });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      filteredValue: [searchText],
      onFilter: (value, record) => {
        return record.name.toLowerCase().includes(value.toLowerCase()) ||
               record.genericName.toLowerCase().includes(value.toLowerCase());
      }
    },
    {
      title: 'Generic Name',
      dataIndex: 'genericName',
      key: 'genericName'
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color="blue">{category}</Tag>
      )
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock, record) => (
        <Space>
          {stock}
          {stock <= record.minStockLevel && (
            <Tooltip title="Low stock">
              <WarningOutlined style={{ color: '#faad14' }} />
            </Tooltip>
          )}
        </Space>
      )
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price) => `$${price.toFixed(2)}`
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date) => {
        const expiry = moment(date);
        const now = moment();
        const months = expiry.diff(now, 'months');
        
        return (
          <span style={{ 
            color: months <= 3 ? '#f5222d' : 
                   months <= 6 ? '#faad14' : 
                   '#52c41a'
          }}>
            {expiry.format('DD/MM/YYYY')}
          </span>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingMedicine(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      )
    }
  ];

  useEffect(() => {
    console.log('Current medicines:', medicines);
  }, [medicines]);

  return (
    <AdminLayout>
      <div className="medicine-inventory-container">
        <Card title="Medicine Inventory">
          <div className="table-header">
            <Input
              placeholder="Search medicines..."
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingMedicine(null);
                form.resetFields();
                setModalVisible(true);
              }}
              style={{ 
                backgroundColor: '#1890ff',  // ya aap koi aur color use kar sakte hain
                borderColor: '#1890ff'
              }}
            >
              Add Medicine
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={medicines}
            rowKey="_id"
            loading={loading}
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} medicines`
            }}
          />
        </Card>

        <Modal
          title={editingMedicine ? 'Edit Medicine' : 'Add Medicine'}
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingMedicine(null);
            form.resetFields();
          }}
          footer={null}
        >
          <Form
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
              name="genericName"
              label="Generic Name"
              rules={[{ required: true, message: 'Please enter generic name' }]}
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
              name="minStockLevel"
              label="Minimum Stock Level"
              rules={[{ required: true, message: 'Please enter minimum stock level' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="unitPrice"
              label="Unit Price"
              rules={[{ required: true, message: 'Please enter unit price' }]}
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
              name="manufacturer"
              label="Manufacturer"
              rules={[{ required: true, message: 'Please enter manufacturer' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
            >
              <Input.TextArea rows={4} />
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
      </div>
    </AdminLayout>
  );
};

export default MedicineInventory;