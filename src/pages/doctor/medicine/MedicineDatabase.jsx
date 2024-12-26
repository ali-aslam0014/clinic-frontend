import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Space,
  Button,
  Tag,
  Input,
  Select,
  Row,
  Col,
  Modal,
  Form,
  InputNumber,
  message,
  Tooltip,
  Popconfirm,
  Typography,
  Drawer,
  Checkbox
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  InfoCircleOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import axios from 'axios';
import DoctorLayout from '../../../components/doctor/Layout';
import './MedicineDatabase.css';

const { Option } = Select;
const { Text } = Typography;

const MedicineDatabase = () => {
  // States
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    status: ''
  });

  // Fetch medicines on component mount
  useEffect(() => {
    fetchMedicines();
  }, []);

  // Fetch medicines
  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/medicines');
      if (response.data?.data) {
        setMedicines(response.data.data);
      }
    } catch (error) {
      message.error('Failed to fetch medicines');
      console.error('Fetch medicines error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submit
  const handleSubmit = async (values) => {
    try {
      if (modalType === 'add') {
        await axios.post('/api/medicines', values);
        message.success('Medicine added successfully');
      } else {
        await axios.put(`/api/medicines/${selectedMedicine._id}`, values);
        message.success('Medicine updated successfully');
      }
      setModalVisible(false);
      form.resetFields();
      fetchMedicines();
    } catch (error) {
      message.error('Operation failed');
      console.error('Submit error:', error);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/medicines/${id}`);
      message.success('Medicine deleted successfully');
      fetchMedicines();
    } catch (error) {
      message.error('Delete failed');
      console.error('Delete error:', error);
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Text strong>{text}</Text>
          {record.prescription_only && (
            <Tooltip title="Prescription Only">
              <Tag color="red">Rx</Tag>
            </Tooltip>
          )}
        </Space>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type'
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock, record) => (
        <Space>
          <Text>{stock}</Text>
          {stock < record.minimum_stock && (
            <Tooltip title="Low Stock">
              <Tag color="warning">Low</Tag>
            </Tooltip>
          )}
        </Space>
      )
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${price.toFixed(2)}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'Active' ? 'green' :
          status === 'Low Stock' ? 'orange' :
          'red'
        }>
          {status}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setModalType('edit');
              setSelectedMedicine(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this medicine?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Render filters
  const renderFilters = () => (
    <Row gutter={[16, 16]} className="filter-row">
      <Col xs={24} sm={12} md={6}>
        <Input
          placeholder="Search medicines"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Select
          style={{ width: '100%' }}
          placeholder="Filter by category"
          allowClear
          onChange={(value) => setFilters({ ...filters, category: value })}
        >
          <Option value="Antibiotics">Antibiotics</Option>
          <Option value="Painkillers">Painkillers</Option>
          <Option value="Antiviral">Antiviral</Option>
          {/* Add more categories */}
        </Select>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Select
          style={{ width: '100%' }}
          placeholder="Filter by status"
          allowClear
          onChange={(value) => setFilters({ ...filters, status: value })}
        >
          <Option value="Active">Active</Option>
          <Option value="Low Stock">Low Stock</Option>
          <Option value="Out of Stock">Out of Stock</Option>
        </Select>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setModalType('add');
            setSelectedMedicine(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Add Medicine
        </Button>
      </Col>
    </Row>
  );

  return (
    <DoctorLayout>
      <div className="medicine-database-container">
        <Card title={
          <Space>
            <MedicineBoxOutlined />
            <span>Medicine Database</span>
          </Space>
        }>
          {renderFilters()}
          
          <Table
            columns={columns}
            dataSource={Array.isArray(medicines) ? medicines : []}
            loading={loading}
            rowKey="_id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} medicines`
            }}
          />

          <Modal
            title={modalType === 'add' ? 'Add Medicine' : 'Edit Medicine'}
            visible={modalVisible}
            onCancel={() => {
              setModalVisible(false);
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
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select>
                  <Option value="Antibiotics">Antibiotics</Option>
                  <Option value="Painkillers">Painkillers</Option>
                  <Option value="Antiviral">Antiviral</Option>
                  {/* Add more categories */}
                </Select>
              </Form.Item>

              <Form.Item
                name="type"
                label="Type"
                rules={[{ required: true, message: 'Please select type' }]}
              >
                <Select>
                  <Option value="Tablet">Tablet</Option>
                  <Option value="Syrup">Syrup</Option>
                  <Option value="Injection">Injection</Option>
                  {/* Add more types */}
                </Select>
              </Form.Item>

              <Form.Item
                name="stock"
                label="Stock"
                rules={[{ required: true, message: 'Please enter stock' }]}
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
                  formatter={value => `$ ${value}`}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                name="minimum_stock"
                label="Minimum Stock Alert"
                rules={[{ required: true, message: 'Please enter minimum stock' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="prescription_only"
                valuePropName="checked"
              >
                <Checkbox>Prescription Required</Checkbox>
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    {modalType === 'add' ? 'Add Medicine' : 'Update Medicine'}
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
        </Card>
      </div>
    </DoctorLayout>
  );
};

export default MedicineDatabase;