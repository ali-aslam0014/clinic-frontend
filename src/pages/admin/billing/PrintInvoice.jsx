import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Divider,
  Table,
  Button,
  Space,
  Descriptions,
  Tag,
  Spin,
  message
} from 'antd';
import {
  PrinterOutlined,
  DownloadOutlined,
  MailOutlined
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './PrintInvoice.css';

const { Title, Text } = Typography;

const PrintInvoice = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoiceDetails();
  }, [id]);

  const fetchInvoiceDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const response = await axios.get(`/api/v1/admin/invoices/${id}`, config);
      setInvoice(response.data.data);
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Failed to fetch invoice details');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob'
      };

      const response = await axios.get(`/api/v1/admin/invoices/${id}/pdf`, config);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download error:', error);
      message.error('Failed to download PDF');
    }
  };

  const handleEmailInvoice = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      await axios.post(`/api/v1/admin/invoices/${id}/email`, {}, config);
      message.success('Invoice sent successfully');
    } catch (error) {
      console.error('Email error:', error);
      message.error('Failed to send invoice');
    }
  };

  const columns = [
    {
      title: 'Service',
      dataIndex: ['service', 'name'],
      key: 'service'
    },
    {
      title: 'Description',
      dataIndex: ['service', 'description'],
      key: 'description'
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${price.toFixed(2)}`
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${amount.toFixed(2)}`
    }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading-container">
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  if (!invoice) {
    return (
      <AdminLayout>
        <div className="error-container">
          <Text type="danger">Invoice not found</Text>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="print-invoice-container">
        <Card className="invoice-card">
          <div className="no-print">
            <Space className="action-buttons">
              <Button
                type="primary"
                icon={<PrinterOutlined />}
                onClick={handlePrint}
              >
                Print
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleDownloadPDF}
              >
                Download PDF
              </Button>
              <Button
                icon={<MailOutlined />}
                onClick={handleEmailInvoice}
              >
                Email Invoice
              </Button>
            </Space>
            <Divider />
          </div>

          <div className="invoice-header">
            <Row justify="space-between" align="top">
              <Col>
                <Title level={3} className="company-logo">DHQ Clinic</Title>
                <div className="company-info">
                  <Title level={3}>Your Company Name</Title>
                  <Text>123 Business Street</Text>
                  <br />
                  <Text>City, State, ZIP</Text>
                  <br />
                  <Text>Phone: (123) 456-7890</Text>
                </div>
              </Col>
              <Col>
                <div className="invoice-details">
                  <Title level={2}>INVOICE</Title>
                  <Text strong>Invoice #: {invoice.invoiceNumber}</Text>
                  <br />
                  <Text>Date: {moment(invoice.invoiceDate).format('DD/MM/YYYY')}</Text>
                  <br />
                  <Text>Due Date: {moment(invoice.dueDate).format('DD/MM/YYYY')}</Text>
                  <br />
                  <Text>
                    Status: <Tag color={invoice.status === 'paid' ? 'green' : 'red'}>{invoice.status.toUpperCase()}</Tag>
                  </Text>
                </div>
              </Col>
            </Row>
          </div>

          <Divider />

          <div className="patient-details">
            <Title level={4}>Bill To:</Title>
            <Descriptions>
              <Descriptions.Item label="Name">{invoice.patientId.name}</Descriptions.Item>
              <Descriptions.Item label="Email">{invoice.patientId.email}</Descriptions.Item>
              <Descriptions.Item label="Phone">{invoice.patientId.phone}</Descriptions.Item>
            </Descriptions>
          </div>

          <div className="invoice-items">
            <Table
              columns={columns}
              dataSource={invoice.items}
              pagination={false}
              rowKey="_id"
            />
          </div>

          <div className="invoice-summary">
            <Row justify="end">
              <Col span={8}>
                <Descriptions column={1}>
                  <Descriptions.Item label="Subtotal">
                    ${invoice.totalAmount.toFixed(2)}
                  </Descriptions.Item>
                  {invoice.tax && (
                    <Descriptions.Item label="Tax">
                      ${invoice.tax.toFixed(2)}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Total">
                    <Text strong>${invoice.totalAmount.toFixed(2)}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Paid">
                    <Text type="success">${invoice.paidAmount.toFixed(2)}</Text>
                  </Descriptions.Item>
                  {invoice.totalAmount - invoice.paidAmount > 0 && (
                    <Descriptions.Item label="Balance Due">
                      <Text type="danger">
                        ${(invoice.totalAmount - invoice.paidAmount).toFixed(2)}
                      </Text>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Col>
            </Row>
          </div>

          {invoice.notes && (
            <div className="invoice-notes">
              <Divider />
              <Title level={5}>Notes:</Title>
              <Text>{invoice.notes}</Text>
            </div>
          )}

          <div className="invoice-footer">
            <Divider />
            <Text>Thank you for your business!</Text>
            <br />
            <Text type="secondary">
              Please include the invoice number with your payment.
            </Text>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default PrintInvoice;