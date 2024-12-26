import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Tag,
  Row,
  Col,
  Tooltip,
  Avatar
} from 'antd';
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  LockOutlined
} from '@ant-design/icons';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './ReceptionistManagement.css';

const { Option } = Select;

const ReceptionistManagement = () => {
  const [receptionists, setReceptionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [form] = Form.useForm();

  // Fetch receptionists
  const fetchReceptionists = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const response = await axios.get('/api/v1/admin/staff/receptionists', config);
      if (response.data?.data) {
        setReceptionists(response.data.data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Failed to fetch receptionists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceptionists();
  }, []);

  const handleAddEdit = async (values) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      if (editingStaff) {
        await axios.put(`/api/v1/admin/staff/receptionists/${editingStaff._id}`, values, config);
        message.success('Receptionist updated successfully');
      } else {
        await axios.post('/api/v1/admin/staff/receptionists', values, config);
        message.success('Receptionist added successfully');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingStaff(null);
      fetchReceptionists();
    } catch (error) {
      console.error('Operation error:', error);
      message.error('Operation failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      await axios.delete(`/api/v1/admin/staff/receptionists/${id}`, config);
      message.success('Receptionist deleted successfully');
      fetchReceptionists();
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Failed to delete receptionist');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      await axios.patch(`/api/v1/admin/staff/receptionists/${id}/status`, { status }, config);
      message.success('Status updated successfully');
      fetchReceptionists();
    } catch (error) {
      console.error('Status update error:', error);
      message.error('Failed to update status');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={record.avatar} />
          {text}
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        <Space>
          <MailOutlined />
          {email}
        </Space>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => (
        <Space>
          <PhoneOutlined />
          {phone}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Select
          value={status}
          onChange={(value) => handleStatusChange(record._id, value)}
          style={{ width: 120 }}
        >
          <Option value="active">
            <Tag color="success">Active</Tag>
          </Option>
          <Option value="inactive">
            <Tag color="error">Inactive</Tag>
          </Option>
        </Select>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setEditingStaff(record);
                form.setFieldsValue({
                  name: record.name,
                  email: record.email,
                  phone: record.phone,
                  status: record.status,
                });
                setModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDelete(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="receptionist-container">
        <Row justify="space-between" align="middle" className="page-header">
          <Col>
            <h2>Receptionist Management</h2>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => {
                setEditingStaff(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              Add Receptionist
            </Button>
          </Col>
        </Row>

        <Card className="table-card">
          <Table
            columns={columns}
            dataSource={receptionists}
            loading={loading}
            rowKey="_id"
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total ${total} receptionists`
            }}
          />
        </Card>

        <Modal
          title={editingStaff ? 'Edit Receptionist' : 'Add Receptionist'}
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingStaff(null);
            form.resetFields();
          }}
          footer={null}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddEdit}
            initialValues={{ status: 'active' }}
          >
            <Form.Item
              name="name"
              label="Full Name"
              rules={[
                { required: true, message: 'Please enter full name' },
                { min: 3, message: 'Name must be at least 3 characters' }
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Enter full name" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Enter email" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Phone"
              rules={[
                { required: true, message: 'Please enter phone number' },
                { pattern: /^[0-9]{11}$/, message: 'Please enter a valid phone number' }
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="Enter phone number" />
            </Form.Item>

            {!editingStaff && (
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: 'Please enter password' },
                  { min: 6, message: 'Password must be at least 6 characters' }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Enter password" />
              </Form.Item>
            )}

            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingStaff ? 'Update' : 'Add'}
                </Button>
                <Button onClick={() => {
                  setModalVisible(false);
                  setEditingStaff(null);
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

export default ReceptionistManagement;