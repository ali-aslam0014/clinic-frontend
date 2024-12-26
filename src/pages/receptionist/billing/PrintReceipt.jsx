import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Typography,
  Descriptions,
  Divider,
  Table,
  message,
  Modal
} from 'antd';
import {
  PrinterOutlined,
  SearchOutlined,
  DownloadOutlined,
  FilePdfOutlined
} from '@ant-design/icons';
import moment from 'moment';
import paymentAPI from '../../../services/paymentAPI';
import './PrintReceipt.css';

const { Title, Text } = Typography;

const PrintReceipt = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  const handleSearch = async (values) => {
    try {
      setLoading(true);
      const response = await paymentAPI.getReceipt(values.receiptNumber);
      setReceipt(response.data);
      setPreviewVisible(true);
    } catch (error) {
      message.error('Error fetching receipt: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.downloadReceiptPDF(receipt._id);
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt-${receipt.receiptNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      message.error('Error downloading PDF: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Service',
      dataIndex: ['billId', 'items', 'serviceName'],
      key: 'service'
    },
    {
      title: 'Quantity',
      dataIndex: ['billId', 'items', 'quantity'],
      key: 'quantity'
    },
    {
      title: 'Unit Price',
      dataIndex: ['billId', 'items', 'unitPrice'],
      key: 'unitPrice',
      render: (price) => `$${price.toFixed(2)}`
    },
    {
      title: 'Amount',
      dataIndex: ['billId', 'items', 'total'],
      key: 'total',
      render: (total) => `$${total.toFixed(2)}`
    }
  ];

  return (
    <div className="print-receipt">
      <Card title="Print Receipt" className="no-print">
        <Form form={form} onFinish={handleSearch} layout="vertical">
          <Form.Item
            name="receiptNumber"
            label="Receipt Number"
            rules={[{ required: true, message: 'Please enter receipt number' }]}
          >
            <Input.Search
              placeholder="Enter receipt number"
              enterButton={<SearchOutlined />}
              loading={loading}
            />
          </Form.Item>
        </Form>
      </Card>

      <Modal
        title="Receipt Preview"
        visible={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        footer={[
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
            Print
          </Button>,
          <Button key="pdf" icon={<FilePdfOutlined />} onClick={handleDownloadPDF}>
            Download PDF
          </Button>
        ]}
        className="no-print"
      >
        {receipt && (
          <div className="receipt-content">
            <div className="receipt-header">
              <Title level={2} className="clinic-name">Medical Clinic</Title>
              <Text>123 Medical Street, City, Country</Text>
              <br />
              <Text>Phone: (123) 456-7890</Text>
              <br />
              <Text>Email: info@medicalclinic.com</Text>
            </div>

            <Divider />

            <Title level={3} className="text-center">Payment Receipt</Title>
            
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Receipt Number">
                {receipt.receiptNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Date">
                {moment(receipt.paymentDate).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Patient Name">
                {receipt.patientId.firstName} {receipt.patientId.lastName}
              </Descriptions.Item>
              <Descriptions.Item label="Contact">
                {receipt.patientId.contactNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Bill Number">
                {receipt.billId.invoiceNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                {receipt.paymentMethod.toUpperCase()}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Table
              columns={columns}
              dataSource={receipt.billId.items}
              pagination={false}
              rowKey="serviceName"
              summary={() => (
                <Table.Summary>
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={3}>Subtotal</Table.Summary.Cell>
                    <Table.Summary.Cell>
                      ${receipt.billId.subtotal.toFixed(2)}
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  {receipt.billId.discount > 0 && (
                    <Table.Summary.Row>
                      <Table.Summary.Cell colSpan={3}>Discount</Table.Summary.Cell>
                      <Table.Summary.Cell>
                        ${receipt.billId.discount.toFixed(2)}
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={3}>Tax (15%)</Table.Summary.Cell>
                    <Table.Summary.Cell>
                      ${receipt.billId.tax.toFixed(2)}
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row className="total-row">
                    <Table.Summary.Cell colSpan={3}>
                      <strong>Amount Paid</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <strong>${receipt.amount.toFixed(2)}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />

            <Divider />

            <div className="receipt-footer">
              <Text>Processed by: {receipt.processedBy.name}</Text>
              <br />
              <Text type="secondary">Thank you for your payment!</Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PrintReceipt; 