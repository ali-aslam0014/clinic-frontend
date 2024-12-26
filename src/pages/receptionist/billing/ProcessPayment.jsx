import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Table,
  Tag,
  Space,
  Row,
  Col,
  Typography,
  Modal,
  message,
  Descriptions,
  InputNumber,
  Divider
} from 'antd';
import {
  CreditCardOutlined,
  DollarOutlined,
  PrinterOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import paymentAPI from '../../../services/paymentAPI';
import './ProcessPayment.css';

const { Option } = Select;
const { Title, Text } = Typography;

const ProcessPayment = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amount, setAmount] = useState(0);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState(null);

  const handleBillSearch = async (billNumber) => {
    try {
      setLoading(true);
      const response = await paymentAPI.getBillDetails(billNumber);
      setSelectedBill(response.data);
      setAmount(response.data.remainingAmount);
    } catch (error) {
      message.error('Error fetching bill: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodChange = (value) => {
    setPaymentMethod(value);
  };

  const handleAmountChange = (value) => {
    setAmount(value);
  };

  const handleProcessPayment = async () => {
    try {
      setLoading(true);
      const paymentData = {
        billId: selectedBill._id,
        amount,
        paymentMethod,
        transactionDate: new Date()
      };

      const response = await paymentAPI.processPayment(paymentData);
      setPaymentReceipt(response.data);
      setConfirmModalVisible(false);
      setReceiptModalVisible(true);
      message.success('Payment processed successfully');
      
      // Reset form
      form.resetFields();
      setSelectedBill(null);
      setAmount(0);
    } catch (error) {
      message.error('Error processing payment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="process-payment">
      <Card title="Process Payment">
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="billNumber"
                label="Bill Number"
                rules={[{ required: true, message: 'Please enter bill number' }]}
              >
                <Input.Search
                  placeholder="Enter bill number"
                  onSearch={handleBillSearch}
                  loading={loading}
                />
              </Form.Item>
            </Col>
          </Row>

          {selectedBill && (
            <>
              <Descriptions title="Bill Details" bordered>
                <Descriptions.Item label="Patient Name">
                  {selectedBill.patientName}
                </Descriptions.Item>
                <Descriptions.Item label="Bill Date">
                  {moment(selectedBill.billDate).format('DD/MM/YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Total Amount">
                  ${selectedBill.totalAmount}
                </Descriptions.Item>
                <Descriptions.Item label="Paid Amount">
                  ${selectedBill.paidAmount}
                </Descriptions.Item>
                <Descriptions.Item label="Remaining Amount">
                  ${selectedBill.remainingAmount}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={selectedBill.paymentStatus === 'paid' ? 'green' : 'orange'}>
                    {selectedBill.paymentStatus.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="paymentMethod"
                    label="Payment Method"
                    rules={[{ required: true }]}
                  >
                    <Select onChange={handlePaymentMethodChange} value={paymentMethod}>
                      <Option value="cash">Cash</Option>
                      <Option value="card">Card</Option>
                      <Option value="bank">Bank Transfer</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="amount"
                    label="Amount"
                    rules={[{ required: true }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      max={selectedBill.remainingAmount}
                      value={amount}
                      onChange={handleAmountChange}
                      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row justify="end">
                <Space>
                  <Button
                    type="primary"
                    icon={<DollarOutlined />}
                    onClick={() => setConfirmModalVisible(true)}
                    disabled={!amount || amount <= 0}
                  >
                    Process Payment
                  </Button>
                </Space>
              </Row>
            </>
          )}
        </Form>

        <Modal
          title="Confirm Payment"
          visible={confirmModalVisible}
          onOk={handleProcessPayment}
          onCancel={() => setConfirmModalVisible(false)}
          confirmLoading={loading}
        >
          <Descriptions column={1}>
            <Descriptions.Item label="Bill Number">
              {selectedBill?.billNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Amount">
              ${amount}
            </Descriptions.Item>
            <Descriptions.Item label="Payment Method">
              {paymentMethod.toUpperCase()}
            </Descriptions.Item>
          </Descriptions>
        </Modal>

        <Modal
          title="Payment Receipt"
          visible={receiptModalVisible}
          onCancel={() => setReceiptModalVisible(false)}
          footer={[
            <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrintReceipt}>
              Print Receipt
            </Button>
          ]}
          width={600}
        >
          {paymentReceipt && (
            <div className="payment-receipt">
              <Title level={3} className="text-center">Payment Receipt</Title>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Receipt Number">
                  {paymentReceipt.receiptNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Patient Name">
                  {paymentReceipt.patientName}
                </Descriptions.Item>
                <Descriptions.Item label="Amount Paid">
                  ${paymentReceipt.amount}
                </Descriptions.Item>
                <Descriptions.Item label="Payment Method">
                  {paymentReceipt.paymentMethod}
                </Descriptions.Item>
                <Descriptions.Item label="Transaction Date">
                  {moment(paymentReceipt.transactionDate).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color="green">PAID</Tag>
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default ProcessPayment; 