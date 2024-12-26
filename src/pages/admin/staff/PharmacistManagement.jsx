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
  Avatar,
  Badge
} from 'antd';
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  LockOutlined,
  MedicineBoxOutlined,
  IdcardOutlined
} from '@ant-design/icons';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './PharmacistManagement.css';

const { Option } = Select;
const { TextArea } = Input;

const PharmacistManagement = () => {
  const [pharmacists, setPharmacists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [form] = Form.useForm();

  // Fetch pharmacists
  const fetchPharmacists = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const response = await axios.get('/api/v1/admin/staff/pharmacists', config);
      if (response.data?.data) {
        setPharmacists(response.data.data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Failed to fetch pharmacists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacists();
  }, []);

  const handleAddEdit = async (values) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      if (editingStaff) {
        await axios.put(`/api/v1/admin/staff/pharmacists/${editingStaff._id}`, values, config);
        message.success('Pharmacist updated successfully');
      } else {
        await axios.post('/api/v1/admin/staff/pharmacists', values, config);
        message.success('Pharmacist added successfully');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingStaff(null);
      fetchPharmacists();
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

      await axios.delete(`/api/v1/admin/staff/pharmacists/${id}`, config);
      message.success('Pharmacist deleted successfully');
      fetchPharmacists();
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Failed to delete pharmacist');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      await axios.patch(`/api/v1/admin/staff/pharmacists/${id}/status`, { status }, config);
      message.success('Status updated successfully');
      fetchPharmacists();
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
          {record.isOnDuty && <Badge status="success" text="On Duty" />}
        </Space>
      ),
    },
    {
      title: 'License Number',
      dataIndex: 'licenseNumber',
      key: 'licenseNumber',
      render: (text) => (
        <Space>
          <IdcardOutlined />
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
      title: 'Experience',
      dataIndex: 'experience',
      key: 'experience',
      render: (years) => `${years} years`,
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
                  licenseNumber: record.licenseNumber,
                  experience: record.experience,
                  specialization: record.specialization,
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
      <div className="pharmacist-container">
        <Row justify="space-between" align="middle" className="page-header">
          <Col>
            <h2>Pharmacist Management</h2>
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
              Add Pharmacist
            </Button>
          </Col>
        </Row>

        <Card className="table-card">
          <Table
            columns={columns}
            dataSource={pharmacists}
            loading={loading}
            rowKey="_id"
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total ${total} pharmacists`
            }}
          />
        </Card>

        <Modal
          title={editingStaff ? 'Edit Pharmacist' : 'Add Pharmacist'}
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
              name="licenseNumber"
              label="License Number"
              rules={[
                { required: true, message: 'Please enter license number' },
                { pattern: /^[A-Z0-9-]+$/, message: 'Please enter a valid license number' }
              ]}
            >
              <Input prefix={<IdcardOutlined />} placeholder="Enter license number" />
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

            <Form.Item
              name="experience"
              label="Years of Experience"
              rules={[
                { required: true, message: 'Please enter years of experience' },
                { type: 'number', min: 0, message: 'Experience must be a positive number' }
              ]}
            >
              <Input type="number" prefix={<MedicineBoxOutlined />} placeholder="Enter years of experience" />
            </Form.Item>

            <Form.Item
              name="specialization"
              label="Specialization"
              rules={[{ required: true, message: 'Please enter specialization' }]}
            >
              <TextArea rows={2} placeholder="Enter specialization details" />
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

export default PharmacistManagement;