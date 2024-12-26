import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  InputNumber,
  Select,
  message,
  Tabs,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Input,
  DatePicker
} from 'antd';
import {
  PlusOutlined,
  MinusOutlined,
  HistoryOutlined,
  WarningOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './StockManagement.css';

const { Option } = Select;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const StockManagement = () => {
  const [loading, setLoading] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [stockHistory, setStockHistory] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState('add'); // 'add' or 'remove'
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [form] = Form.useForm();
  const [statistics, setStatistics] = useState({
    totalStock: 0,
    lowStock: 0,
    outOfStock: 0,
    expiringStock: 0
  });

  useEffect(() => {
    fetchMedicines();
    fetchStockHistory();
    fetchStatistics();
  }, []);

  useEffect(() => {
    console.log('Current medicines:', medicines);
    console.log('Current stock history:', stockHistory);
    console.log('Current statistics:', statistics);
  }, [medicines, stockHistory, statistics]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Fetching medicines with token:', token);
      
      const response = await axios.get('/api/v1/admin/pharmacy/medicines', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Medicines response:', response.data);
      
      if (response.data?.data) {
        setMedicines(response.data.data);
      } else {
        setMedicines([]);
        message.warning('No medicines found');
      }
    } catch (error) {
      console.error('Fetch medicines error:', error);
      message.error('Failed to fetch medicines: ' + (error.response?.data?.message || error.message));
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching stock history with token:', token);
      
      const response = await axios.get('/api/v1/admin/pharmacy/stock/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Stock history response:', response.data);
      
      if (response.data?.data) {
        setStockHistory(response.data.data);
      } else {
        setStockHistory([]);
        message.warning('No stock history found');
      }
    } catch (error) {
      console.error('Fetch stock history error:', error);
      message.error('Failed to fetch stock history');
      setStockHistory([]);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching statistics with token:', token);
      
      const response = await axios.get('/api/v1/admin/pharmacy/stock/statistics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Statistics response:', response.data);
      
      if (response.data?.data) {
        setStatistics(response.data.data);
      } else {
        setStatistics({
          totalStock: 0,
          lowStock: 0,
          outOfStock: 0,
          expiringStock: 0
        });
      }
    } catch (error) {
      console.error('Fetch statistics error:', error);
      message.error('Failed to fetch statistics');
    }
  };

  const handleStockUpdate = async (values) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const payload = {
        medicineId: selectedMedicine._id,
        quantity: values.quantity,
        type: actionType,
        reason: values.reason,
        batchNumber: values.batchNumber,
        expiryDate: values.expiryDate?.toISOString()
      };

      await axios.post('/api/v1/admin/pharmacy/stock/update', payload, config);
      
      message.success('Stock updated successfully');
      setModalVisible(false);
      form.resetFields();
      fetchMedicines();
      fetchStockHistory();
      fetchStatistics();
    } catch (error) {
      message.error('Failed to update stock');
    }
  };

  const columns = {
    medicines: [
      {
        title: 'Medicine',
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: 'Current Stock',
        dataIndex: 'stock',
        key: 'stock',
        render: (stock, record) => (
          <Space>
            {stock}
            {stock <= record.minStockLevel && (
              <Tag color="warning">Low Stock</Tag>
            )}
          </Space>
        )
      },
      {
        title: 'Min Stock Level',
        dataIndex: 'minStockLevel',
        key: 'minStockLevel'
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedMedicine(record);
                setActionType('add');
                setModalVisible(true);
              }}
            >
              Add Stock
            </Button>
            <Button
              icon={<MinusOutlined />}
              onClick={() => {
                setSelectedMedicine(record);
                setActionType('remove');
                setModalVisible(true);
              }}
              disabled={record.stock === 0}
            >
              Remove Stock
            </Button>
          </Space>
        )
      }
    ],
    history: [
      {
        title: 'Date',
        dataIndex: 'createdAt',
        key: 'date',
        render: date => moment(date).format('DD/MM/YYYY HH:mm')
      },
      {
        title: 'Medicine',
        dataIndex: ['medicine', 'name'],
        key: 'medicine'
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        render: type => (
          <Tag color={type === 'add' ? 'success' : 'error'}>
            {type === 'add' ? 'Stock Added' : 'Stock Removed'}
          </Tag>
        )
      },
      {
        title: 'Quantity',
        dataIndex: 'quantity',
        key: 'quantity'
      },
      {
        title: 'Reason',
        dataIndex: 'reason',
        key: 'reason'
      },
      {
        title: 'Updated By',
        dataIndex: ['updatedBy', 'name'],
        key: 'updatedBy'
      }
    ]
  };

  return (
    <AdminLayout>
      <div className="stock-management-container">
        {loading && <div className="loading-message">Loading data...</div>}
        
        {!loading && medicines.length === 0 && (
          <div className="no-data-message">
            No medicines found. Please add medicines first.
          </div>
        )}

        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Stock Items"
                value={statistics.totalStock}
                prefix={<HistoryOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Low Stock Items"
                value={statistics.lowStock}
                valueStyle={{ color: '#faad14' }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Out of Stock"
                value={statistics.outOfStock}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<ArrowDownOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Expiring Soon"
                value={statistics.expiringStock}
                valueStyle={{ color: '#faad14' }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Card style={{ marginTop: 16 }}>
          <Tabs defaultActiveKey="current">
            <TabPane tab="Current Stock" key="current">
              <Table
                columns={columns.medicines}
                dataSource={medicines}
                rowKey="_id"
                loading={loading}
              />
            </TabPane>
            <TabPane tab="Stock History" key="history">
              <Table
                columns={columns.history}
                dataSource={stockHistory}
                rowKey="_id"
                loading={loading}
              />
            </TabPane>
          </Tabs>
        </Card>

        <Modal
          title={`${actionType === 'add' ? 'Add' : 'Remove'} Stock`}
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
            onFinish={handleStockUpdate}
          >
            <Form.Item
              name="quantity"
              label="Quantity"
              rules={[
                { required: true, message: 'Please enter quantity' },
                {
                  validator: (_, value) => {
                    if (actionType === 'remove' && selectedMedicine && value > selectedMedicine.stock) {
                      return Promise.reject('Cannot remove more than current stock');
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>

            {actionType === 'add' && (
              <>
                <Form.Item
                  name="batchNumber"
                  label="Batch Number"
                  rules={[{ required: true, message: 'Please enter batch number' }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name="expiryDate"
                  label="Expiry Date"
                  rules={[{ required: true, message: 'Please select expiry date' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </>
            )}

            <Form.Item
              name="reason"
              label="Reason"
              rules={[{ required: true, message: 'Please enter reason' }]}
            >
              <Select>
                {actionType === 'add' ? (
                  <>
                    <Option value="purchase">Purchase</Option>
                    <Option value="return">Return from patient</Option>
                    <Option value="adjustment">Stock adjustment</Option>
                  </>
                ) : (
                  <>
                    <Option value="sale">Sale</Option>
                    <Option value="expired">Expired</Option>
                    <Option value="damaged">Damaged</Option>
                    <Option value="adjustment">Stock adjustment</Option>
                  </>
                )}
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Submit
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
      </div>
    </AdminLayout>
  );
};

export default StockManagement;