import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  message,
  Tag,
  Tooltip,
  Row,
  Col,
  Typography,
  Divider,
  AutoComplete,
  Empty,
  Spin
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  PrinterOutlined,
  FileSearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './PurchaseOrders.css';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const PurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPO, setEditingPO] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const [purchaseOrdersRes, suppliersRes, medicinesRes] = await Promise.all([
        axios.get('/api/v1/admin/pharmacy/purchase-orders', config),
        axios.get('/api/v1/admin/pharmacy/suppliers', config),
        axios.get('/api/v1/admin/pharmacy/medicines', config)
      ]);

      setPurchaseOrders(purchaseOrdersRes.data.data || []);
      setSuppliers(suppliersRes.data.data || []);
      setMedicines(medicinesRes.data.data || []);

    } catch (err) {
      console.error('Data fetching error:', err);
      setError(err.message);
      message.error('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const formData = {
        ...values,
        items: selectedItems.map(item => ({
          medicine: item.medicine._id,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })),
        expectedDeliveryDate: values.expectedDeliveryDate.toISOString(),
        totalAmount: selectedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
      };

      if (editingPO) {
        await axios.put(`/api/v1/admin/pharmacy/purchase-orders/${editingPO._id}`, formData, config);
        message.success('Purchase order updated successfully');
      } else {
        await axios.post('/api/v1/admin/pharmacy/purchase-orders', formData, config);
        message.success('Purchase order created successfully');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingPO(null);
      setSelectedItems([]);
      fetchData();
    } catch (error) {
      message.error('Operation failed');
    }
  };

  const handleReceive = async (record) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/v1/admin/pharmacy/purchase-orders/${record._id}/receive`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      message.success('Purchase order received successfully');
      fetchData();
    } catch (error) {
      message.error('Failed to receive purchase order');
    }
  };

  const handleCancel = async (record) => {
    Modal.confirm({
      title: 'Are you sure you want to cancel this purchase order?',
      content: 'This action cannot be undone',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.put(`/api/v1/admin/pharmacy/purchase-orders/${record._id}/cancel`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          message.success('Purchase order cancelled successfully');
          fetchData();
        } catch (error) {
          message.error('Failed to cancel purchase order');
        }
      }
    });
  };

  const addItem = (values) => {
    const medicine = medicines.find(m => m._id === values.medicine);
    setSelectedItems([...selectedItems, {
      medicine,
      quantity: values.quantity,
      unitPrice: values.unitPrice
    }]);
    form.setFieldsValue({ medicine: undefined, quantity: undefined, unitPrice: undefined });
  };

  const removeItem = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const columns = [
    {
      title: 'PO Number',
      dataIndex: 'poNumber',
      key: 'poNumber',
      width: 120
    },
    {
      title: 'Supplier',
      dataIndex: ['supplier', 'name'],
      key: 'supplier',
      width: 150
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: amount => `$${Number(amount).toFixed(2)}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: status => {
        const statusColors = {
          pending: 'gold',
          approved: 'blue',
          received: 'green',
          cancelled: 'red'
        };
        return <Tag color={statusColors[status]}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Expected Delivery',
      dataIndex: 'expectedDeliveryDate',
      key: 'expectedDeliveryDate',
      render: date => moment(date).format('DD/MM/YYYY')
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<FileSearchOutlined />}
              onClick={() => {
                setEditingPO(record);
                setSelectedItems(record.items);
                form.setFieldsValue({
                  ...record,
                  supplier: record.supplier._id,
                  expectedDeliveryDate: moment(record.expectedDeliveryDate)
                });
                setModalVisible(true);
              }}
            />
          </Tooltip>
          {record.status === 'pending' && (
            <>
              <Tooltip title="Edit">
                <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditingPO(record);
                    setSelectedItems(record.items);
                    form.setFieldsValue({
                      ...record,
                      supplier: record.supplier._id,
                      expectedDeliveryDate: moment(record.expectedDeliveryDate)
                    });
                    setModalVisible(true);
                  }}
                />
              </Tooltip>
              <Tooltip title="Cancel">
                <Button
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => handleCancel(record)}
                />
              </Tooltip>
            </>
          )}
          {record.status === 'approved' && (
            <Tooltip title="Receive">
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleReceive(record)}
              />
            </Tooltip>
          )}
          <Tooltip title="Print">
            <Button icon={<PrinterOutlined />} />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="purchase-orders-container">
        <Card 
          title={
            <Space>
              <span>Purchase Orders</span>
              {!loading && (
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchData}
                  size="small"
                >
                  Refresh
                </Button>
              )}
            </Space>
          }
        >
          <div className="table-header">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingPO(null);
                form.resetFields();
                setSelectedItems([]);
                setModalVisible(true);
              }}
              disabled={loading}
            >
              Create Purchase Order
            </Button>
          </div>

          {error ? (
            <div className="error-message">
              <Text type="danger">{error}</Text>
              <Button onClick={fetchData} type="primary" style={{ marginLeft: 16 }}>
                Try Again
              </Button>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={purchaseOrders}
              rowKey="_id"
              loading={loading}
              scroll={{ x: 1300 }}
              pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} items`
              }}
            />
          )}
        </Card>

        <Modal
          title={editingPO ? 'Edit Purchase Order' : 'Create Purchase Order'}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
            setEditingPO(null);
            setSelectedItems([]);
          }}
          width={800}
          footer={null}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="supplier"
                  label="Supplier"
                  rules={[{ required: true, message: 'Please select supplier' }]}
                >
                  <Select>
                    {suppliers.map(supplier => (
                      <Option key={supplier._id} value={supplier._id}>
                        {supplier.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="expectedDeliveryDate"
                  label="Expected Delivery Date"
                  rules={[{ required: true, message: 'Please select date' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Divider>Items</Divider>

            <Form.List name="items">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <Space key={field.key} align="baseline">
                      <Form.Item
                        {...field}
                        label="Medicine"
                        rules={[{ required: true, message: 'Missing medicine' }]}
                      >
                        <Select style={{ width: 200 }}>
                          {medicines.map(medicine => (
                            <Option key={medicine._id} value={medicine._id}>
                              {medicine.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        {...field}
                        label="Quantity"
                        rules={[{ required: true, message: 'Missing quantity' }]}
                      >
                        <InputNumber min={1} />
                      </Form.Item>

                      <Form.Item
                        {...field}
                        label="Unit Price"
                        rules={[{ required: true, message: 'Missing price' }]}
                      >
                        <InputNumber
                          min={0}
                          step={0.01}
                          formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        />
                      </Form.Item>

                      <Button type="link" danger onClick={() => remove(field.name)}>
                        Delete
                      </Button>
                    </Space>
                  ))}

                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Add Item
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Form.Item
              name="notes"
              label="Notes"
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingPO ? 'Update' : 'Create'}
                </Button>
                <Button onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                  setEditingPO(null);
                  setSelectedItems([]);
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

export default PurchaseOrders;