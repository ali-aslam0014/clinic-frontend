import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Select,
  message,
  Typography,
  Row,
  Col,
  Statistic,
  Alert,
  Modal,
  Form,
  InputNumber,
  Tooltip,
  Badge,
  Spin
} from 'antd';
import {
  WarningOutlined,
  ShoppingCartOutlined,
  ReloadOutlined,
  BellOutlined,
  ExclamationCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PrinterOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './LowStockAlert.css';

const { Option } = Select;
const { Title, Text } = Typography;
const { confirm } = Modal;

const LowStockAlert = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all'
  });
  const [statistics, setStatistics] = useState({
    outOfStock: 0,
    lowStock: 0,
    totalValue: 0
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form] = Form.useForm();
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Component mounted');
    const initializePage = async () => {
      try {
        await Promise.all([fetchData(), fetchCategories()]);
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };
    initializePage();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching data with token:', token);
      
      const response = await axios.get('/api/v1/admin/pharmacy/medicines/stock-alerts', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: filters
      });

      console.log('API Response:', response.data);
      
      if (response.data?.data) {
        setMedicines(response.data.data);
        setStatistics(response.data.statistics || {
          outOfStock: 0,
          lowStock: 0,
          totalValue: 0
        });
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message);
      message.error('Failed to fetch stock data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('/api/v1/admin/pharmacy/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data?.data) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Categories fetch error:', error);
      message.error('Failed to fetch categories');
    }
  };

  const handleUpdateMinStock = async (values) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/v1/admin/pharmacy/medicines/${selectedMedicine._id}/min-stock`, {
        minStockLevel: values.minStockLevel
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      message.success('Minimum stock level updated successfully');
      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error('Failed to update minimum stock level');
    }
  };

  const createPurchaseOrder = (record) => {
    confirm({
      title: 'Create Purchase Order',
      icon: <ShoppingCartOutlined />,
      content: `Do you want to create a purchase order for ${record.name}?`,
      onOk() {
        // Navigate to purchase order creation with pre-filled data
        // Implementation depends on your routing setup
      }
    });
  };

  const getStockStatus = (record) => {
    if (record.stock === 0) {
      return { color: 'red', text: 'Out of Stock' };
    }
    if (record.stock <= record.minStockLevel) {
      return { color: 'orange', text: 'Low Stock' };
    }
    return { color: 'green', text: 'Sufficient' };
  };

  const handleFilterChange = async (newFilters) => {
    setFilters(newFilters);
    await fetchData();
  };

  const columns = [
    {
      title: 'Medicine Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text, record) => (
        <Space>
          {text}
          {record.stock === 0 && (
            <Badge status="error" text="" />
          )}
        </Space>
      )
    },
    {
      title: 'Category',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 150
    },
    {
      title: 'Current Stock',
      dataIndex: 'stock',
      key: 'stock',
      width: 120,
      sorter: (a, b) => a.stock - b.stock
    },
    {
      title: 'Min Stock Level',
      dataIndex: 'minStockLevel',
      key: 'minStockLevel',
      width: 120
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (_, record) => {
        const status = getStockStatus(record);
        return <Tag color={status.color}>{status.text}</Tag>;
      }
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150,
      render: date => moment(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="Create Purchase Order">
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              onClick={() => createPurchaseOrder(record)}
            />
          </Tooltip>
          <Tooltip title="Update Min Stock Level">
            <Button
              icon={<ArrowUpOutlined />}
              onClick={() => {
                setSelectedMedicine(record);
                form.setFieldsValue({ minStockLevel: record.minStockLevel });
                setModalVisible(true);
              }}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="low-stock-alert-container">
        <Title level={2}>
          <BellOutlined /> Low Stock Alerts
        </Title>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '20px' }}>Loading stock data...</div>
          </div>
        ) : error ? (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" type="primary" onClick={fetchData}>
                Retry
              </Button>
            }
          />
        ) : (
          <>
            <Row gutter={16} className="statistics-row">
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Out of Stock"
                    value={statistics.outOfStock}
                    valueStyle={{ color: '#cf1322' }}
                    prefix={<ExclamationCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Low Stock"
                    value={statistics.lowStock}
                    valueStyle={{ color: '#faad14' }}
                    prefix={<WarningOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Required Stock Value"
                    value={statistics.totalValue}
                    precision={2}
                    valueStyle={{ color: '#096dd9' }}
                    prefix="$"
                  />
                </Card>
              </Col>
            </Row>

            <Card className="filter-card">
              <Space wrap>
                <Select
                  value={filters.status}
                  onChange={(value) => handleFilterChange({ ...filters, status: value })}
                  style={{ width: 150 }}
                >
                  <Option value="all">All Status</Option>
                  <Option value="out">Out of Stock</Option>
                  <Option value="low">Low Stock</Option>
                  <Option value="sufficient">Sufficient</Option>
                </Select>
                
                <Select
                  value={filters.category}
                  onChange={(value) => handleFilterChange({ ...filters, category: value })}
                  style={{ width: 150 }}
                >
                  <Option value="all">All Categories</Option>
                  {categories.map(category => (
                    <Option key={category._id} value={category._id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>

                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={fetchData}
                >
                  Refresh
                </Button>

                <Button
                  icon={<PrinterOutlined />}
                  onClick={() => window.print()}
                >
                  Print Report
                </Button>
              </Space>
            </Card>

            {(statistics.outOfStock > 0 || statistics.lowStock > 0) && (
              <Alert
                message="Stock Warning"
                description={
                  <Space direction="vertical">
                    {statistics.outOfStock > 0 && (
                      <Text type="danger">{statistics.outOfStock} medicines are out of stock</Text>
                    )}
                    {statistics.lowStock > 0 && (
                      <Text type="warning">{statistics.lowStock} medicines are running low</Text>
                    )}
                  </Space>
                }
                type="warning"
                showIcon
                className="warning-alert"
              />
            )}

            <Card>
              <Table
                columns={columns}
                dataSource={medicines}
                rowKey="_id"
                loading={loading}
                scroll={{ x: 1300 }}
                pagination={{
                  defaultPageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} items`
                }}
              />
            </Card>

            <Modal
              title="Update Minimum Stock Level"
              open={modalVisible}
              onCancel={() => {
                setModalVisible(false);
                form.resetFields();
              }}
              footer={null}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleUpdateMinStock}
              >
                <Form.Item
                  name="minStockLevel"
                  label="Minimum Stock Level"
                  rules={[
                    { required: true, message: 'Please enter minimum stock level' },
                    { type: 'number', min: 0, message: 'Must be greater than or equal to 0' }
                  ]}
                >
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit">
                      Update
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
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default LowStockAlert;