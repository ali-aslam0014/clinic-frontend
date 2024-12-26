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
  Modal,
  message,
  Descriptions,
  InputNumber,
  Divider,
  Typography
} from 'antd';
import {
  SearchOutlined,
  RollbackOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import paymentAPI from '../../../services/paymentAPI';
import './HandleRefunds.css';

const { Option } = Select;
const { Title, Text } = Typography;
const { confirm } = Modal;

const HandleRefunds = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState(null);
  const [refundModalVisible, setRefundModalVisible] = useState(false);

  const handleSearch = async (values) => {
    try {
      setLoading(true);
      const response = await paymentAPI.getPaymentByReceipt(values.receiptNumber);
      if (response.data.status === 'refunded') {
        message.warning('This payment has already been refunded');
      }
      setPayment(response.data);
    } catch (error) {
      message.error('Error finding payment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const showRefundConfirm = () => {
    confirm({
      title: 'Are you sure you want to process this refund?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: handleRefund
    });
  };

  const handleRefund = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.processRefund({
        paymentId: payment._id,
        reason: form.getFieldValue('reason'),
        amount: form.getFieldValue('refundAmount')
      });
      
      message.success('Refund processed successfully');
      setRefundModalVisible(false);
      setPayment(response.data);
      form.resetFields();
    } catch (error) {
      message.error('Error processing refund: ' + error.message);
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
      title: 'Total',
      dataIndex: ['billId', 'items', 'total'],
      key: 'total',
      render: (total) => `$${total.toFixed(2)}`
    }
  ];

  return (
    <div className="handle-refunds">
      <Card title="Handle Refunds">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSearch}
        >
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

        {payment && (
          <div className="payment-details">
            <Descriptions title="Payment Details" bordered>
              <Descriptions.Item label="Receipt Number">
                {payment.receiptNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Patient Name">
                {`${payment.patientId.firstName} ${payment.patientId.lastName}`}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Date">
                {moment(payment.paymentDate).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Amount Paid">
                ${payment.amount.toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                {payment.paymentMethod.toUpperCase()}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={payment.status === 'completed' ? 'green' : 'red'}>
                  {payment.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Table
              columns={columns}
              dataSource={payment.billId.items}
              pagination={false}
              rowKey="serviceName"
            />

            <div className="refund-actions">
              <Button
                type="primary"
                danger
                icon={<RollbackOutlined />}
                onClick={() => setRefundModalVisible(true)}
                disabled={payment.status !== 'completed'}
              >
                Process Refund
              </Button>
            </div>
          </div>
        )}

        <Modal
          title="Process Refund"
          visible={refundModalVisible}
          onCancel={() => setRefundModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setRefundModalVisible(false)}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              danger
              loading={loading}
              onClick={showRefundConfirm}
            >
              Process Refund
            </Button>
          ]}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="refundAmount"
              label="Refund Amount"
              rules={[
                { required: true, message: 'Please enter refund amount' },
                {
                  type: 'number',
                  max: payment?.amount,
                  message: 'Cannot refund more than original payment'
                }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                max={payment?.amount}
              />
            </Form.Item>
            <Form.Item
              name="reason"
              label="Refund Reason"
              rules={[{ required: true, message: 'Please enter refund reason' }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default HandleRefunds; 