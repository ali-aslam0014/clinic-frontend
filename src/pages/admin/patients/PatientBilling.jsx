import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  Space,
  Tag,
  Card,
  Statistic,
  Row,
  Col,
  Descriptions,
  Divider,
  message
} from 'antd';
import {
  PlusOutlined,
  PrinterOutlined,
  EditOutlined,
  DeleteOutlined,
  DollarOutlined,
  CreditCardOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './PatientBilling.css';

const API_URL = 'http://localhost:8080/api/v1';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const PatientBilling = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [statistics, setStatistics] = useState({
    totalBilled: 0,
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0
  });
  const [form] = Form.useForm();
  const { patientId } = useParams();

  // Convert to useCallback
  const fetchBills = useCallback(async () => {
    try {
      if (!patientId) {
        message.error('Patient ID is missing');
        return;
      }

      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        message.error('Please login to view bills');
        return;
      }

      const response = await axios.get(
        `${API_URL}/admin/patients/${patientId}/bills`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setBills(response.data.data || []);
      } else {
        message.error(response.data.message || 'Failed to fetch bills');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  const fetchStatistics = useCallback(async () => {
    try {
      if (!patientId) {
        return; // Don't show error as it's already shown in fetchBills
      }

      const token = localStorage.getItem('token');
      
      if (!token) {
        return; // Don't show error as it's already shown in fetchBills
      }

      const response = await axios.get(
        `${API_URL}/admin/patients/${patientId}/billing-stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setStatistics(response.data.data || {});
      } else {
        message.error(response.data.message || 'Failed to fetch billing statistics');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Failed to fetch billing statistics');
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId) {  // Only fetch if patientId exists
      fetchBills();
      fetchStatistics();
    }
  }, [fetchBills, fetchStatistics, patientId]);

  const columns = [
    {
      title: 'Invoice No',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
    },
    {
      title: 'Date',
      dataIndex: 'billDate',
      key: 'billDate',
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.billDate) - moment(b.billDate),
    },
    {
      title: 'Service',
      dataIndex: 'serviceName',
      key: 'serviceName',
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `$${amount.toFixed(2)}`,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: 'Paid',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      render: (paid) => `$${paid.toFixed(2)}`,
    },
    {
      title: 'Balance',
      key: 'balance',
      render: (_, record) => `$${(record.totalAmount - record.paidAmount).toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status) => (
        <Tag color={
          status === 'paid' ? 'green' :
          status === 'partial' ? 'orange' :
          status === 'overdue' ? 'red' :
          'blue'
        }>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<FileTextOutlined />}
            onClick={() => handleView(record)}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            icon={<PrinterOutlined />}
            onClick={() => handlePrint(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record._id)}
          />
        </Space>
      ),
    },
  ];

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        patientId,
        billDate: values.billDate.format('YYYY-MM-DD'),
        dueDate: values.dueDate.format('YYYY-MM-DD'),
      };

      if (selectedBill) {
        await axios.put(`/api/v1/admin/bills/${selectedBill._id}`, data);
        message.success('Bill updated successfully');
      } else {
        await axios.post(`/api/v1/admin/patients/${patientId}/bills`, data);
        message.success('Bill added successfully');
      }

      setModalVisible(false);
      form.resetFields();
      fetchBills();
    } catch (error) {
      message.error('Failed to save bill');
    }
  };

  // Handle record actions
  const handleView = (bill) => {
    setSelectedBill(bill);
    setViewModalVisible(true);
  };

  const handleEdit = (bill) => {
    setSelectedBill(bill);
    form.setFieldsValue({
      ...bill,
      billDate: moment(bill.billDate),
      dueDate: moment(bill.dueDate),
    });
    setModalVisible(true);
  };

  const handlePrint = (bill) => {
    // Implement print functionality
    window.print();
  };

  const handleDelete = async (billId) => {
    try {
      await axios.delete(`/api/v1/admin/bills/${billId}`);
      message.success('Bill deleted successfully');
      fetchBills();
    } catch (error) {
      message.error('Failed to delete bill');
    }
  };

  return (
    <AdminLayout>
      <div className="patient-billing-container">
        <div className="billing-header">
          <h2>Patient Billing</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedBill(null);
              setModalVisible(true);
              form.resetFields();
            }}
          >
            Add New Bill
          </Button>
        </div>

        {/* Billing Statistics */}
        <Row gutter={16} className="billing-statistics">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Billed"
                value={statistics.totalBilled}
                prefix={<DollarOutlined />}
                precision={2}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Paid"
                value={statistics.totalPaid}
                prefix={<DollarOutlined />}
                precision={2}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Pending Amount"
                value={statistics.totalPending}
                prefix={<DollarOutlined />}
                precision={2}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Overdue Amount"
                value={statistics.totalOverdue}
                prefix={<DollarOutlined />}
                precision={2}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Bills Table */}
        <Table
          columns={columns}
          dataSource={bills}
          loading={loading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} bills`
          }}
        />

        {/* Add/Edit Bill Modal */}
        <Modal
          title={selectedBill ? "Edit Bill" : "Add New Bill"}
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="serviceName"
                  label="Service Name"
                  rules={[{ required: true, message: 'Please enter service name' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="billDate"
                  label="Bill Date"
                  rules={[{ required: true, message: 'Please select bill date' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="totalAmount"
                  label="Total Amount"
                  rules={[{ required: true, message: 'Please enter total amount' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="paidAmount"
                  label="Paid Amount"
                  rules={[{ required: true, message: 'Please enter paid amount' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="paymentMethod"
                  label="Payment Method"
                  rules={[{ required: true, message: 'Please select payment method' }]}
                >
                  <Select>
                    <Option value="cash">Cash</Option>
                    <Option value="card">Card</Option>
                    <Option value="insurance">Insurance</Option>
                    <Option value="bank">Bank Transfer</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="dueDate"
                  label="Due Date"
                  rules={[{ required: true, message: 'Please select due date' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="notes"
              label="Notes"
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {selectedBill ? 'Update Bill' : 'Add Bill'}
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

        {/* View Bill Modal */}
        <Modal
          title="Bill Details"
          visible={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={[
            <Button
              key="print"
              icon={<PrinterOutlined />}
              onClick={() => handlePrint(selectedBill)}
            >
              Print Bill
            </Button>,
            <Button key="close" onClick={() => setViewModalVisible(false)}>
              Close
            </Button>
          ]}
          width={800}
        >
          {selectedBill && (
            <div className="bill-details">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Invoice Number">
                  {selectedBill.invoiceNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Bill Date">
                  {moment(selectedBill.billDate).format('DD/MM/YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Service">
                  {selectedBill.serviceName}
                </Descriptions.Item>
                <Descriptions.Item label="Due Date">
                  {moment(selectedBill.dueDate).format('DD/MM/YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Total Amount">
                  ${selectedBill.totalAmount.toFixed(2)}
                </Descriptions.Item>
                <Descriptions.Item label="Paid Amount">
                  ${selectedBill.paidAmount.toFixed(2)}
                </Descriptions.Item>
                <Descriptions.Item label="Balance">
                  ${(selectedBill.totalAmount - selectedBill.paidAmount).toFixed(2)}
                </Descriptions.Item>
                <Descriptions.Item label="Payment Method">
                  {selectedBill.paymentMethod}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={
                    selectedBill.paymentStatus === 'paid' ? 'green' :
                    selectedBill.paymentStatus === 'partial' ? 'orange' :
                    selectedBill.paymentStatus === 'overdue' ? 'red' :
                    'blue'
                  }>
                    {selectedBill.paymentStatus.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Notes" span={2}>
                  {selectedBill.notes || 'N/A'}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default PatientBilling;