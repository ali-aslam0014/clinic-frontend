import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  DatePicker,
  Select,
  message,
  Typography,
  Row,
  Col,
  Statistic,
  Alert,
  Modal,
  Form,
  Input,
  Empty,
  Spin
} from 'antd';
import {
  WarningOutlined,
  CalendarOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  PrinterOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './ExpiryTracking.css';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { confirm } = Modal;

const ExpiryTracking = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateRange: [moment(), moment().add(3, 'months')],
    status: 'all'
  });
  const [statistics, setStatistics] = useState({
    expiringSoon: 0,
    expired: 0,
    totalValue: 0
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    console.log('Component mounted');
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('Fetching data with token:', token);
      
      const response = await axios.get('/api/v1/admin/pharmacy/medicines/expiry', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: {
          startDate: filters.dateRange[0].toISOString(),
          endDate: filters.dateRange[1].toISOString(),
          status: filters.status
        }
      });

      console.log('API Response:', response.data);
      
      if (response.data?.data) {
        setMedicines(response.data.data);
        setStatistics(response.data.statistics);
      } else {
        setMedicines([]);
        setStatistics({
          expiringSoon: 0,
          expired: 0,
          totalValue: 0
        });
      }
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Failed to fetch expiry data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDispose = async (record) => {
    confirm({
      title: 'Are you sure you want to mark this medicine as disposed?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.put(`/api/v1/admin/pharmacy/medicines/${record._id}/dispose`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          message.success('Medicine marked as disposed');
          fetchData();
        } catch (error) {
          message.error('Failed to dispose medicine');
        }
      }
    });
  };

  const handleExtendExpiry = (record) => {
    setSelectedMedicine(record);
    setModalVisible(true);
    form.setFieldsValue({
      newExpiryDate: moment(record.expiryDate)
    });
  };

  const handleExpiryExtension = async (values) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/v1/admin/pharmacy/medicines/${selectedMedicine._id}/extend-expiry`, {
        newExpiryDate: values.newExpiryDate.toISOString(),
        reason: values.reason
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      message.success('Expiry date updated successfully');
      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error('Failed to update expiry date');
    }
  };

  const columns = [
    {
      title: 'Medicine Name',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: 'Batch Number',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 120
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.expiryDate).unix() - moment(b.expiryDate).unix()
    },
    {
      title: 'Days Until Expiry',
      key: 'daysUntilExpiry',
      width: 150,
      render: (record) => {
        const days = moment(record.expiryDate).diff(moment(), 'days');
        let color = 'green';
        if (days < 0) color = 'red';
        else if (days < 30) color = 'orange';
        else if (days < 90) color = 'gold';
        return <Tag color={color}>{days} days</Tag>;
      },
      sorter: (a, b) => moment(a.expiryDate).diff(moment()) - moment(b.expiryDate).diff(moment())
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      width: 100
    },
    {
      title: 'Value',
      key: 'value',
      width: 120,
      render: (record) => `$${(record.stock * record.unitPrice).toFixed(2)}`
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (record) => {
        const days = moment(record.expiryDate).diff(moment(), 'days');
        let status = 'Valid';
        let color = 'green';
        if (days < 0) {
          status = 'Expired';
          color = 'red';
        } else if (days < 30) {
          status = 'Critical';
          color = 'orange';
        } else if (days < 90) {
          status = 'Warning';
          color = 'gold';
        }
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDispose(record)}
            disabled={moment(record.expiryDate).isAfter(moment())}
          >
            Dispose
          </Button>
          <Button
            type="default"
            icon={<CalendarOutlined />}
            onClick={() => handleExtendExpiry(record)}
          >
            Extend
          </Button>
        </Space>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="expiry-tracking-container">
        <Title level={2}>
          <WarningOutlined /> Expiry Tracking
        </Title>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '20px' }}>Loading expiry data...</div>
          </div>
        ) : (
          <>
            <Row gutter={16} className="statistics-row">
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Expiring Soon"
                    value={statistics.expiringSoon}
                    valueStyle={{ color: '#faad14' }}
                    prefix={<WarningOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Expired"
                    value={statistics.expired}
                    valueStyle={{ color: '#f5222d' }}
                    prefix={<ExclamationCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Total Value at Risk"
                    value={statistics.totalValue}
                    precision={2}
                    valueStyle={{ color: '#cf1322' }}
                    prefix="$"
                  />
                </Card>
              </Col>
            </Row>

            <Card className="filter-card">
              <Space wrap>
                <RangePicker
                  value={filters.dateRange}
                  onChange={(dates) => {
                    console.log('Date range changed:', dates);
                    setFilters({ ...filters, dateRange: dates });
                  }}
                />
                <Select
                  value={filters.status}
                  onChange={(value) => {
                    console.log('Status changed:', value);
                    setFilters({ ...filters, status: value });
                  }}
                  style={{ width: 120 }}
                >
                  <Option value="all">All</Option>
                  <Option value="expired">Expired</Option>
                  <Option value="critical">Critical</Option>
                  <Option value="warning">Warning</Option>
                  <Option value="valid">Valid</Option>
                </Select>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    console.log('Refresh clicked');
                    fetchData();
                  }}
                >
                  Refresh
                </Button>
                <Button
                  icon={<PrinterOutlined />}
                  onClick={() => window.print()}
                >
                  Print Report
                </Button>
              </Space>
            </Card>

            {medicines.length > 0 ? (
              <>
                <Alert
                  message="Expiry Warning"
                  description={`You have ${statistics.expiringSoon} medicines expiring within the next 3 months.`}
                  type="warning"
                  showIcon
                  className="warning-alert"
                />

                <Card>
                  <Table
                    columns={columns}
                    dataSource={medicines}
                    rowKey="_id"
                    loading={loading}
                    scroll={{ x: 1300 }}
                    pagination={{
                      defaultPageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total) => `Total ${total} items`
                    }}
                  />
                </Card>
              </>
            ) : (
              <Empty
                description="No expiring medicines found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </>
        )}

        <Modal
          title="Extend Expiry Date"
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleExpiryExtension}
          >
            <Form.Item
              name="newExpiryDate"
              label="New Expiry Date"
              rules={[
                { required: true, message: 'Please select new expiry date' },
                {
                  validator: (_, value) => {
                    if (value && value.isBefore(moment(), 'day')) {
                      return Promise.reject('Expiry date cannot be in the past');
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="reason"
              label="Reason for Extension"
              rules={[{ required: true, message: 'Please provide reason' }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Update
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
      </div>
    </AdminLayout>
  );
};

export default ExpiryTracking;