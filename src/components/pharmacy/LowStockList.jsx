import React, { useState, useEffect } from 'react';
import {
  Table,
  Tag,
  Button,
  Card,
  message,
  Typography,
  Space,
  Input,
  Tooltip,
  Badge
} from 'antd';
import {
  ReloadOutlined,
  WarningOutlined,
  SearchOutlined,
  PlusOutlined
} from '@ant-design/icons';
import axios from 'axios';
import PharmacyLayout from './Layout';
import moment from 'moment';
import './LowStockList.css';

const { Title } = Typography;

const LowStockList = () => {
  const [loading, setLoading] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [searchText, setSearchText] = useState('');

  // Fetch low stock medicines
  const fetchLowStockMedicines = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/medicines/low-stock');
      setMedicines(response.data.data);
    } catch (error) {
      message.error('Failed to fetch low stock medicines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStockMedicines();
  }, []);

  // Handle search
  const handleSearch = (value) => {
    setSearchText(value);
  };

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchText.toLowerCase()) ||
    medicine.genericName.toLowerCase().includes(searchText.toLowerCase())
  );

  // Table columns
  const columns = [
    {
      title: 'Medicine Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <span>{text}</span>
          <small style={{ color: '#666' }}>{record.genericName}</small>
        </Space>
      )
    },
    {
      title: 'Current Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock, record) => (
        <Tag color={stock <= record.minStockLevel ? 'red' : 'orange'}>
          {stock} units
        </Tag>
      )
    },
    {
      title: 'Minimum Level',
      dataIndex: 'minStockLevel',
      key: 'minStockLevel',
      render: level => `${level} units`
    },
    {
      title: 'Required',
      key: 'required',
      render: (_, record) => (
        <Tag color="blue">
          {Math.max(record.minStockLevel - record.stock, 0)} units
        </Tag>
      )
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: date => moment(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="Add Stock">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleAddStock(record)}
            >
              Add Stock
            </Button>
          </Tooltip>
        </Space>
      )
    }
  ];

  // Handle add stock
  const handleAddStock = (medicine) => {
    // Navigate to add stock form or open modal
    message.info('Add Stock functionality will be implemented here');
  };

  return (
    <PharmacyLayout>
      <div className="low-stock-list">
        <Card>
          <div className="list-header">
            <div>
              <Title level={2}>
                <WarningOutlined style={{ color: '#ff4d4f' }} /> Low Stock Medicines
              </Title>
              <p>Medicines that need to be restocked</p>
            </div>
            <Space>
              <Input
                placeholder="Search medicines"
                prefix={<SearchOutlined />}
                onChange={e => handleSearch(e.target.value)}
                style={{ width: 200 }}
              />
              <Button
                type="default"
                icon={<ReloadOutlined />}
                onClick={fetchLowStockMedicines}
              >
                Refresh
              </Button>
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={filteredMedicines}
            rowKey="_id"
            loading={loading}
            pagination={{
              total: filteredMedicines.length,
              pageSize: 10,
              showTotal: (total) => `Total ${total} items`
            }}
          />

          <div className="list-footer">
            <Space>
              <Badge status="red" text="Critical" />
              <Badge status="orange" text="Low" />
              <Badge status="blue" text="Required" />
            </Space>
          </div>
        </Card>
      </div>
    </PharmacyLayout>
  );
};

export default LowStockList; 