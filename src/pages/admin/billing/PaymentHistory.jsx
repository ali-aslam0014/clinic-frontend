import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  DatePicker,
  Select,
  Input,
  Row,
  Col,
  Statistic,
  Button,
  Tooltip,
  message
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  DollarCircleOutlined,
  CalendarOutlined,
  FileExcelOutlined,
  PrinterOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './PaymentHistory.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateRange: [moment().subtract(30, 'days'), moment()],
    paymentMethod: 'all',
    searchText: ''
  });
  const [statistics, setStatistics] = useState({
    totalAmount: 0,
    totalPayments: 0,
    averagePayment: 0
  });

  // Fetch payment history
  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const params = {
        startDate: filters.dateRange[0].format('YYYY-MM-DD'),
        endDate: filters.dateRange[1].format('YYYY-MM-DD'),
        paymentMethod: filters.paymentMethod !== 'all' ? filters.paymentMethod : undefined,
        search: filters.searchText || undefined
      };

      const response = await axios.get('/api/v1/admin/payments/history', { ...config, params });
      
      setPayments(response.data.data);
      updateStatistics(response.data.data);
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Failed to fetch payment history');
    } finally {
      setLoading(false);
    }
  };

  const updateStatistics = (paymentData) => {
    const totalAmount = paymentData.reduce((sum, payment) => sum + payment.amount, 0);
    setStatistics({
      totalAmount,
      totalPayments: paymentData.length,
      averagePayment: paymentData.length ? totalAmount / paymentData.length : 0
    });
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob'
      };

      const response = await axios.get('/api/v1/admin/payments/export', config);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payment_history_${moment().format('YYYY-MM-DD')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export error:', error);
      message.error('Failed to export payment history');
    }
  };

  const columns = [
    {
      title: 'Invoice #',
      dataIndex: ['invoice', 'invoiceNumber'],
      key: 'invoiceNumber',
      render: (text) => <a>{text}</a>
    },
    {
      title: 'Patient',
      dataIndex: ['invoice', 'patientId'],
      key: 'patient',
      render: (patient) => patient?.name
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${amount.toFixed(2)}`,
      sorter: (a, b) => a.amount - b.amount
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => (
        <Tag color={
          method === 'cash' ? 'green' :
          method === 'card' ? 'blue' :
          'purple'
        }>
          {method.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Payment Date',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => moment(a.paymentDate).unix() - moment(b.paymentDate).unix()
    },
    {
      title: 'Transaction ID',
      dataIndex: 'transactionId',
      key: 'transactionId'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              onClick={() => window.location.href = `/admin/invoices/${record.invoice._id}`}
            />
          </Tooltip>
          <Tooltip title="Print Receipt">
            <Button
              icon={<PrinterOutlined />}
              onClick={() => handlePrintReceipt(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="payment-history-container">
        <Card className="statistics-card">
          <Row gutter={24}>
            <Col span={8}>
              <Statistic
                title="Total Payments"
                value={statistics.totalPayments}
                prefix={<CalendarOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Total Amount"
                value={statistics.totalAmount}
                precision={2}
                prefix={<DollarCircleOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Average Payment"
                value={statistics.averagePayment}
                precision={2}
                prefix={<DollarCircleOutlined />}
              />
            </Col>
          </Row>
        </Card>

        <Card className="filter-card">
          <Row gutter={24} align="middle">
            <Col span={8}>
              <RangePicker
                value={filters.dateRange}
                onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={6}>
              <Select
                value={filters.paymentMethod}
                onChange={(value) => setFilters({ ...filters, paymentMethod: value })}
                style={{ width: '100%' }}
              >
                <Option value="all">All Payment Methods</Option>
                <Option value="cash">Cash</Option>
                <Option value="card">Card</Option>
                <Option value="bank_transfer">Bank Transfer</Option>
              </Select>
            </Col>
            <Col span={6}>
              <Input
                placeholder="Search by invoice or patient"
                prefix={<SearchOutlined />}
                onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
                value={filters.searchText}
              />
            </Col>
            <Col span={4}>
              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                onClick={handleExport}
              >
                Export
              </Button>
            </Col>
          </Row>
        </Card>

        <Card className="table-card">
          <Table
            columns={columns}
            dataSource={payments}
            loading={loading}
            rowKey="_id"
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total ${total} payments`
            }}
          />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default PaymentHistory;