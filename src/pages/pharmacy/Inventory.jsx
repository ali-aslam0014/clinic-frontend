import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Input,
  Tooltip,
  Badge,
  message,
  Select,
  DatePicker,
  Row,
  Col,
  Statistic
} from 'antd';
import {
  WarningOutlined,
  SearchOutlined,
  ReloadOutlined,
  ExportOutlined,
  FilterOutlined
} from '@ant-design/icons';
import PharmacyLayout from '../../components/pharmacy/Layout';
import axios from 'axios';
import moment from 'moment';
import './Inventory.css';

const { Option } = Select;
const { RangePicker } = DatePicker;

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all'
  });
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    expiringSoon: 0,
    outOfStock: 0
  });

  // Fetch inventory data
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/v1/pharmacy/medicines', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventory(response.data.data);
      calculateStats(response.data.data);
    } catch (error) {
      message.error('Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Calculate inventory statistics
  const calculateStats = (data) => {
    const stats = {
      totalItems: data.length,
      lowStock: data.filter(item => item.stock <= item.minStockLevel).length,
      expiringSoon: data.filter(item => {
        const expiryDate = moment(item.expiryDate);
        return expiryDate.diff(moment(), 'months') <= 3;
      }).length,
      outOfStock: data.filter(item => item.stock === 0).length
    };
    setStats(stats);
  };

  // Handle export
  const handleExport = () => {
    // Implementation for exporting inventory data
    message.success('Exporting inventory data...');
  };

  // Table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <Space>
          {text}
          {record.stock <= record.minStockLevel && (
            <Tooltip title="Low Stock">
              <WarningOutlined style={{ color: '#ff4d4f' }} />
            </Tooltip>
          )}
        </Space>
      )
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
      sorter: (a, b) => a.stock - b.stock,
      render: (stock, record) => (
        <Tag color={
          stock === 0 ? 'red' :
          stock <= record.minStockLevel ? 'orange' :
          'green'
        }>
          {stock}
        </Tag>
      )
    },
    {
      title: 'Min Stock',
      dataIndex: 'minStockLevel',
      key: 'minStockLevel'
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: date => {
        const expiryDate = moment(date);
        const monthsToExpiry = expiryDate.diff(moment(), 'months');
        return (
          <Tag color={
            monthsToExpiry <= 0 ? 'red' :
            monthsToExpiry <= 3 ? 'orange' :
            'green'
          }>
            {expiryDate.format('DD/MM/YYYY')}
          </Tag>
        );
      },
      sorter: (a, b) => moment(a.expiryDate).unix() - moment(b.expiryDate).unix()
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location'
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        let status = 'Active';
        let color = 'green';
        
        if (record.stock === 0) {
          status = 'Out of Stock';
          color = 'red';
        } else if (record.stock <= record.minStockLevel) {
          status = 'Low Stock';
          color = 'orange';
        } else if (moment(record.expiryDate).diff(moment(), 'days') <= 0) {
          status = 'Expired';
          color = 'red';
        }
        
        return <Tag color={color}>{status}</Tag>;
      }
    }
  ];

  return (
    <PharmacyLayout>
      <div className="inventory-container">
        <Row gutter={[16, 16]} className="stats-row">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Items"
                value={stats.totalItems}
                prefix={<Badge status="processing" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Low Stock Items"
                value={stats.lowStock}
                valueStyle={{ color: '#faad14' }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Expiring Soon"
                value={stats.expiringSoon}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Out of Stock"
                value={stats.outOfStock}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Card className="inventory-card">
          <div className="table-header">
            <Space>
              <Input
                placeholder="Search inventory"
                prefix={<SearchOutlined />}
                onChange={e => setSearchText(e.target.value)}
                className="search-input"
              />
              <Select
                defaultValue="all"
                style={{ width: 120 }}
                onChange={value => setFilters({ ...filters, category: value })}
              >
                <Option value="all">All Categories</Option>
                <Option value="Tablets">Tablets</Option>
                <Option value="Capsules">Capsules</Option>
                <Option value="Syrup">Syrup</Option>
                <Option value="Injection">Injection</Option>
              </Select>
              <Select
                defaultValue="all"
                style={{ width: 120 }}
                onChange={value => setFilters({ ...filters, status: value })}
              >
                <Option value="all">All Status</Option>
                <Option value="active">Active</Option>
                <Option value="lowStock">Low Stock</Option>
                <Option value="outOfStock">Out of Stock</Option>
              </Select>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchInventory}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<ExportOutlined />}
                onClick={handleExport}
              >
                Export
              </Button>
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={inventory.filter(item =>
              item.name.toLowerCase().includes(searchText.toLowerCase()) &&
              (filters.category === 'all' || item.category === filters.category)
            )}
            rowKey="_id"
            loading={loading}
          />
        </Card>
      </div>
    </PharmacyLayout>
  );
};

export default Inventory; 