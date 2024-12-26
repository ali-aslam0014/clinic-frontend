import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Button,
  Table,
  Space,
  message,
  Statistic,
  Tabs,
  Tag,
  Tooltip
} from 'antd';
import {
  DownloadOutlined,
  ReloadOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import PharmacyLayout from '../../components/pharmacy/Layout';
import './Reports.css';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('inventory');
  const [dateRange, setDateRange] = useState([moment().subtract(30, 'days'), moment()]);
  const [reportData, setReportData] = useState(null);
  const [exportFormat, setExportFormat] = useState('excel');

  // Fetch report data
  const fetchReport = async () => {
    try {
      setLoading(true);
      const [startDate, endDate] = dateRange;
      
      const response = await axios.get(`/api/reports/${reportType}`, {
        params: {
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD'),
          format: 'json'
        }
      });

      setReportData(response.data.data);
    } catch (error) {
      message.error('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportType && dateRange) {
      fetchReport();
    }
  }, [reportType, dateRange]);

  // Handle export
  const handleExport = async () => {
    try {
      const [startDate, endDate] = dateRange;
      
      const response = await axios.get(`/api/reports/${reportType}/export`, {
        params: {
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD'),
          format: exportFormat
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report_${moment().format('YYYY-MM-DD')}.${exportFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      message.error('Failed to export report');
    }
  };

  // Inventory Overview Table Columns
  const inventoryColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Current Stock',
      dataIndex: 'stock',
      key: 'stock',
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
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (_, record) => `$${(record.stock * record.price).toFixed(2)}`
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
        }
        
        return <Tag color={color}>{status}</Tag>;
      }
    }
  ];

  return (
    <PharmacyLayout>
      <Card className="reports-card">
        <Row gutter={[16, 16]} className="report-header">
          <Col xs={24} sm={8}>
            <Select
              value={reportType}
              onChange={setReportType}
              style={{ width: '100%' }}
            >
              <Option value="inventory">Inventory Report</Option>
              <Option value="stock-valuation">Stock Valuation</Option>
              <Option value="expiry">Expiry Report</Option>
              <Option value="movement">Stock Movement</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Space>
              <Select
                value={exportFormat}
                onChange={setExportFormat}
                style={{ width: 120 }}
              >
                <Option value="excel">Excel</Option>
                <Option value="pdf">PDF</Option>
                <Option value="csv">CSV</Option>
              </Select>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExport}
              >
                Export
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchReport}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>

        {reportData && (
          <div className="report-content">
            <Row gutter={[16, 16]} className="stats-row">
              <Col xs={24} sm={6}>
                <Statistic
                  title="Total Products"
                  value={reportData.stats.totalProducts}
                  prefix={<BarChartOutlined />}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Total Stock Value"
                  value={reportData.stats.totalValue}
                  prefix="$"
                  precision={2}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Low Stock Items"
                  value={reportData.stats.lowStockItems}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Stock Movements"
                  value={reportData.stats.stockMovements}
                />
              </Col>
            </Row>

            <Tabs defaultActiveKey="overview" className="report-tabs">
              <TabPane tab="Overview" key="overview">
                <Table
                  columns={inventoryColumns}
                  dataSource={reportData.stockMovements}
                  loading={loading}
                  rowKey="_id"
                />
              </TabPane>
              <TabPane tab="Expiring Products" key="expiring">
                <Table
                  columns={[
                    {
                      title: 'Product',
                      dataIndex: 'name',
                      key: 'name'
                    },
                    {
                      title: 'Expiry Date',
                      dataIndex: 'expiryDate',
                      key: 'expiryDate',
                      render: date => moment(date).format('YYYY-MM-DD')
                    },
                    {
                      title: 'Days Until Expiry',
                      key: 'daysLeft',
                      render: (_, record) => {
                        const days = moment(record.expiryDate).diff(moment(), 'days');
                        return (
                          <Tag color={days <= 30 ? 'red' : days <= 90 ? 'orange' : 'green'}>
                            {days} days
                          </Tag>
                        );
                      }
                    }
                  ]}
                  dataSource={reportData.expiringProducts}
                  rowKey="_id"
                />
              </TabPane>
            </Tabs>
          </div>
        )}
      </Card>
    </PharmacyLayout>
  );
};

export default Reports; 