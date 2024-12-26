import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tooltip,
  Badge
} from 'antd';
import {
  DollarCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  ExclamationCircleOutlined,
  SendOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './DuePayments.css';

const { Option } = Select;
const { confirm } = Modal;

const DuePayments = () => {
  const [loading, setLoading] = useState(true);
  const [duePayments, setDuePayments] = useState([]);
  const [paymentModal, setPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [form] = Form.useForm();
  const [statistics, setStatistics] = useState({
    totalDue: 0,
    overdueCount: 0,
    upcomingCount: 0
  });

  // Fetch due payments
  const fetchDuePayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const response = await axios.get('/api/v1/admin/invoices/due', config);
      
      if (response.data?.data) {
        setDuePayments(response.data.data);
        calculateStatistics(response.data.data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Failed to fetch due payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuePayments();
  }, []);

  const calculateStatistics = (payments) => {
    const totalDue = payments.reduce((sum, payment) => sum + (payment.totalAmount - payment.paidAmount), 0);
    const overdueCount = payments.filter(payment => moment(payment.dueDate).isBefore(moment())).length;
    const upcomingCount = payments.filter(payment => moment(payment.dueDate).isAfter(moment())).length;

    setStatistics({
      totalDue,
      overdueCount,
      upcomingCount
    });
  };

  const handlePayment = async (values) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      await axios.post(`/api/v1/admin/invoices/${selectedInvoice._id}/payments`, values, config);
      
      message.success('Payment recorded successfully');
      setPaymentModal(false);
      form.resetFields();
      fetchDuePayments();
    } catch (error) {
      console.error('Payment error:', error);
      message.error('Failed to record payment');
    }
  };

  const handleSendReminder = async (invoice) => {
    confirm({
      title: 'Send Payment Reminder',
      icon: <ExclamationCircleOutlined />,
      content: `Send payment reminder to ${invoice.patientId.name}?`,
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          const config = {
            headers: { 'Authorization': `Bearer ${token}` }
          };

          await axios.post(`/api/v1/admin/invoices/${invoice._id}/reminder`, {}, config);
          message.success('Reminder sent successfully');
        } catch (error) {
          console.error('Reminder error:', error);
          message.error('Failed to send reminder');
        }
      }
    });
  };

  const columns = [
    {
      title: 'Invoice #',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text) => <a>{text}</a>
    },
    {
      title: 'Patient',
      dataIndex: ['patientId', 'name'],
      key: 'patientName',
      render: (text, record) => (
        <Space>
          <UserOutlined />
          {text}
          <Tooltip title="Contact Info">
            <Space direction="vertical" size={0}>
              <span><PhoneOutlined /> {record.patientId.phone}</span>
              <span><MailOutlined /> {record.patientId.email}</span>
            </Space>
          </Tooltip>
        </Space>
      )
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `$${amount.toFixed(2)}`
    },
    {
      title: 'Due Amount',
      key: 'dueAmount',
      render: (_, record) => {
        const dueAmount = record.totalAmount - record.paidAmount;
        return <span style={{ color: '#ff4d4f' }}>${dueAmount.toFixed(2)}</span>;
      }
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => {
        const isOverdue = moment(date).isBefore(moment());
        return (
          <Badge 
            status={isOverdue ? 'error' : 'warning'} 
            text={
              <span style={{ color: isOverdue ? '#ff4d4f' : '#faad14' }}>
                {moment(date).format('DD/MM/YYYY')}
              </span>
            }
          />
        );
      },
      sorter: (a, b) => moment(a.dueDate).unix() - moment(b.dueDate).unix()
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const isOverdue = moment(record.dueDate).isBefore(moment());
        return (
          <Tag color={isOverdue ? 'red' : 'orange'}>
            {isOverdue ? 'OVERDUE' : 'PENDING'}
          </Tag>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            onClick={() => {
              setSelectedInvoice(record);
              setPaymentModal(true);
            }}
          >
            Record Payment
          </Button>
          <Button
            icon={<SendOutlined />}
            onClick={() => handleSendReminder(record)}
          >
            Send Reminder
          </Button>
        </Space>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="due-payments-container">
        <Card className="statistics-card">
          <Row gutter={24}>
            <Col span={8}>
              <Statistic
                title="Total Due Amount"
                value={statistics.totalDue}
                precision={2}
                prefix={<DollarCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Overdue Payments"
                value={statistics.overdueCount}
                prefix={<ClockCircleOutlined style={{ color: '#ff4d4f' }} />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Upcoming Payments"
                value={statistics.upcomingCount}
                prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            </Col>
          </Row>
        </Card>

        <Card className="table-card">
          <Table
            columns={columns}
            dataSource={duePayments}
            loading={loading}
            rowKey="_id"
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total ${total} due payments`
            }}
          />
        </Card>

        <Modal
          title="Record Payment"
          visible={paymentModal}
          onCancel={() => {
            setPaymentModal(false);
            setSelectedInvoice(null);
            form.resetFields();
          }}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handlePayment}
          >
            <Form.Item
              name="amount"
              label="Payment Amount"
              rules={[
                { required: true, message: 'Please enter amount' },
                {
                  validator: (_, value) => {
                    if (selectedInvoice && value > (selectedInvoice.totalAmount - selectedInvoice.paidAmount)) {
                      return Promise.reject('Amount cannot exceed due amount');
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input
                type="number"
                prefix={<DollarCircleOutlined />}
                min={0}
                step={0.01}
              />
            </Form.Item>

            <Form.Item
              name="paymentMethod"
              label="Payment Method"
              rules={[{ required: true, message: 'Please select payment method' }]}
            >
              <Select>
                <Option value="cash">Cash</Option>
                <Option value="card">Card</Option>
                <Option value="bank_transfer">Bank Transfer</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="notes"
              label="Notes"
            >
              <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Submit Payment
                </Button>
                <Button onClick={() => {
                  setPaymentModal(false);
                  setSelectedInvoice(null);
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

export default DuePayments;