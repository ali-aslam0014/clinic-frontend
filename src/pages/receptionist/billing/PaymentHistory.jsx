import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  DatePicker,
  Select,
  Input,
  Button,
  Space,
  Tag,
  Row,
  Col,
  Statistic,
  Tooltip,
  Modal,
  message
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
  PrinterOutlined,
  DollarOutlined
} from '@ant-design/icons';
import moment from 'moment';
import paymentAPI from '../../../services/paymentAPI';
import './PaymentHistory.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const PaymentHistory = () => {
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: [moment().startOf('month'), moment().endOf('month')],
    paymentMethod: 'all',
    search: ''
  });
  const [stats, setStats] = useState({
    totalAmount: 0,
    totalPayments: 0,
    cashPayments: 0,
    cardPayments: 0
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getPaymentHistory({
        startDate: filters.dateRange[0].format('YYYY-MM-DD'),
        endDate: filters.dateRange[1].format('YYYY-MM-DD'),
        paymentMethod: filters.paymentMethod,
        search: filters.search
      });
      setPayments(response.data);
      calculateStats(response.data);
    } catch (error) {
      message.error('Error fetching payments: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (paymentData) => {
    const stats = paymentData.reduce((acc, payment) => {
      acc.totalAmount += payment.amount;
      acc.totalPayments++;
      if (payment.paymentMethod === 'cash') acc.cashPayments++;
      if (payment.paymentMethod === 'card') acc.cardPayments++;
      return acc;
    }, {
      totalAmount: 0,
      totalPayments: 0,
      cashPayments: 0,
      cardPayments: 0
    });
    setStats(stats);
  };

  const handleDateRangeChange = (dates) => {
    setFilters({ ...filters, dateRange: dates });
  };

  const handlePaymentMethodChange = (value) => {
    setFilters({ ...filters, paymentMethod: value });
  };

  const handleSearch = (value) => {
    setFilters({ ...filters, search: value });
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      await paymentAPI.exportPayments(filters);
      message.success('Payment history exported successfully');
    } catch (error) {
      message.error('Error exporting payments: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReceipt = (payment) => {
    setSelectedPayment(payment);
    setReceiptModalVisible(true);
  };

  const columns = [
    {
      title: 'Receipt No',
      dataIndex: 'receiptNumber',
      key: 'receiptNumber',
      render: (text) => <a>{text}</a>
    },
    {
      title: 'Patient',
      dataIndex: ['patientId', 'firstName'],
      key: 'patientName',
      render: (_, record) => (
        `${record.patientId.firstName} ${record.patientId.lastName}`
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${amount.toFixed(2)}`
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => (
        <Tag color={method === 'cash' ? 'green' : 'blue'}>
          {method.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Date',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'completed' ? 'green' :
          status === 'pending' ? 'orange' :
          status === 'failed' ? 'red' : 'default'
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
          <Tooltip title="View Receipt">
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleViewReceipt(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Print Receipt">
            <Button
              icon={<PrinterOutlined />}
              onClick={() => window.open(`/receipt/${record._id}/print`, '_blank')}
              size="small"
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="payment-history">
      <Card title="Payment History">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Total Payments"
              value={stats.totalPayments}
              prefix={<DollarOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Total Amount"
              value={stats.totalAmount}
              precision={2}
              prefix="$"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Cash Payments"
              value={stats.cashPayments}
              suffix={`/ ${stats.totalPayments}`}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Card Payments"
              value={stats.cardPayments}
              suffix={`/ ${stats.totalPayments}`}
            />
          </Col>
        </Row>

        <div className="filters">
          <Space wrap>
            <RangePicker
              value={filters.dateRange}
              onChange={handleDateRangeChange}
            />
            <Select
              value={filters.paymentMethod}
              onChange={handlePaymentMethodChange}
              style={{ width: 120 }}
            >
              <Option value="all">All Methods</Option>
              <Option value="cash">Cash</Option>
              <Option value="card">Card</Option>
              <Option value="bank">Bank Transfer</Option>
            </Select>
            <Input.Search
              placeholder="Search receipts..."
              onSearch={handleSearch}
              style={{ width: 200 }}
            />
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExport}
              loading={loading}
            >
              Export
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={payments}
          loading={loading}
          rowKey="_id"
          pagination={{
            total: payments.length,
            pageSize: 10,
            showTotal: (total) => `Total ${total} payments`
          }}
        />

        <Modal
          title="Receipt Details"
          visible={receiptModalVisible}
          onCancel={() => setReceiptModalVisible(false)}
          footer={[
            <Button
              key="print"
              type="primary"
              icon={<PrinterOutlined />}
              onClick={() => window.open(`/receipt/${selectedPayment?._id}/print`, '_blank')}
            >
              Print Receipt
            </Button>
          ]}
          width={800}
        >
          {selectedPayment && (
            <div className="receipt-preview">
              {/* Receipt preview content */}
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default PaymentHistory; 