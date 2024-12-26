import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Typography,
  Tag,
  Tooltip,
  Popconfirm,
  message,
  Row,
  Col,
  Checkbox,
  Divider,
  Tree
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  KeyOutlined
} from '@ant-design/icons';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './RolesPermissions.css';

const { Title, Text } = Typography;

const RolesPermissions = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form] = Form.useForm();
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // Define permission tree structure
  const permissionTree = [
    {
      title: 'Dashboard',
      key: 'dashboard',
      children: [
        { title: 'View Dashboard', key: 'dashboard.view' }
      ]
    },
    {
      title: 'Patients',
      key: 'patients',
      children: [
        { title: 'View Patients', key: 'patients.view' },
        { title: 'Add Patient', key: 'patients.add' },
        { title: 'Edit Patient', key: 'patients.edit' },
        { title: 'Delete Patient', key: 'patients.delete' }
      ]
    },
    {
      title: 'Appointments',
      key: 'appointments',
      children: [
        { title: 'View Appointments', key: 'appointments.view' },
        { title: 'Schedule Appointment', key: 'appointments.schedule' },
        { title: 'Edit Appointment', key: 'appointments.edit' },
        { title: 'Cancel Appointment', key: 'appointments.cancel' }
      ]
    },
    {
      title: 'Users',
      key: 'users',
      children: [
        { title: 'View Users', key: 'users.view' },
        { title: 'Add User', key: 'users.add' },
        { title: 'Edit User', key: 'users.edit' },
        { title: 'Delete User', key: 'users.delete' }
      ]
    },
    {
      title: 'Settings',
      key: 'settings',
      children: [
        { title: 'View Settings', key: 'settings.view' },
        { title: 'Manage Settings', key: 'settings.manage' }
      ]
    }
  ];

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/v1/admin/roles', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data?.data) {
        setRoles(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      message.error('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = () => {
    setEditingRole(null);
    setSelectedPermissions([]);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setSelectedPermissions(role.permissions || []);
    form.setFieldsValue({
      name: role.name,
      description: role.description
    });
    setModalVisible(true);
  };

  const handleDeleteRole = async (roleId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/v1/admin/roles/${roleId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      message.success('Role deleted successfully');
      fetchRoles();
    } catch (error) {
      message.error('Failed to delete role');
      console.error('Error deleting role:', error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem('token');
      const data = {
        ...values,
        permissions: selectedPermissions
      };

      if (editingRole) {
        await axios.put(`/api/v1/admin/roles/${editingRole._id}`, data, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        message.success('Role updated successfully');
      } else {
        await axios.post('/api/v1/admin/roles', data, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        message.success('Role created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      fetchRoles();
    } catch (error) {
      message.error(error.response?.data?.message || 'Operation failed');
      console.error('Error submitting form:', error);
    }
  };

  const columns = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions = []) => (
        <Space wrap>
          {permissions.slice(0, 3).map(permission => (
            <Tag color="blue" key={permission}>
              {permission}
            </Tag>
          ))}
          {permissions.length > 3 && (
            <Tooltip title={permissions.slice(3).join(', ')}>
              <Tag>+{permissions.length - 3} more</Tag>
            </Tooltip>
          )}
        </Space>
      )
    },
    {
      title: 'Users',
      dataIndex: 'userCount',
      key: 'userCount',
      render: (count) => <Tag color="green">{count || 0} users</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEditRole(record)}
              size="small"
            />
          </Tooltip>
          {record.name !== 'admin' && (
            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure you want to delete this role?"
                onConfirm={() => handleDeleteRole(record._id)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="roles-permissions-container">
        <Row justify="space-between" align="middle" className="page-header">
          <Col>
            <Title level={2}>
              <SafetyCertificateOutlined /> Roles & Permissions
            </Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddRole}
            >
              Add Role
            </Button>
          </Col>
        </Row>

        <Card>
          <Table
            columns={columns}
            dataSource={roles}
            rowKey="_id"
            loading={loading}
            pagination={false}
          />
        </Card>

        <Modal
          title={
            <Space>
              <LockOutlined />
              {editingRole ? 'Edit Role' : 'Add New Role'}
            </Space>
          }
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
            setEditingRole(null);
            setSelectedPermissions([]);
          }}
          footer={null}
          width={720}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="name"
              label="Role Name"
              rules={[
                { required: true, message: 'Please enter role name' },
                { min: 3, message: 'Role name must be at least 3 characters' }
              ]}
            >
              <Input prefix={<KeyOutlined />} placeholder="Enter role name" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <Input.TextArea rows={3} placeholder="Enter role description" />
            </Form.Item>

            <Divider>Permissions</Divider>

            <Tree
              checkable
              checkedKeys={selectedPermissions}
              onCheck={setSelectedPermissions}
              treeData={permissionTree}
              defaultExpandAll
            />

            <Divider />

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingRole ? 'Update Role' : 'Create Role'}
                </Button>
                <Button onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                  setEditingRole(null);
                  setSelectedPermissions([]);
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

export default RolesPermissions;