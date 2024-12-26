import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Tag, message, Space } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import './Specialization.css';
import AdminLayout from '../../../components/admin/Layout';

const Specialization = () => {
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // Fetch specializations
  const fetchSpecializations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/v1/specializations', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSpecializations(response.data.data);
    } catch (error) {
      console.error('Error fetching specializations:', error);
      message.error('Failed to fetch specializations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecializations();
  }, []);

  // Handle form submit
  const handleSubmit = async (values) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };

      if (editingId) {
        await axios.put(
          `http://localhost:8080/api/v1/specializations/${editingId}`,
          values,
          config
        );
        message.success('Specialization updated successfully');
      } else {
        await axios.post(
          'http://localhost:8080/api/v1/specializations',
          values,
          config
        );
        message.success('Specialization added successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
      fetchSpecializations();
    } catch (error) {
      console.error('Operation failed:', error);
      message.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/v1/specializations/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      message.success('Specialization deleted successfully');
      fetchSpecializations();
    } catch (error) {
      console.error('Error deleting specialization:', error);
      message.error('Failed to delete specialization');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Doctors Count',
      dataIndex: 'doctorsCount',
      key: 'doctorsCount',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
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
            icon={<EditOutlined />} 
            onClick={() => {
              setEditingId(record._id);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
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

  return (
    <AdminLayout>
      <div className="specialization-container">
        <div className="specialization-header">
          <h2>Specializations</h2>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingId(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            Add Specialization
          </Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={specializations}
          loading={loading}
          rowKey="_id"
        />

        <Modal
          title={editingId ? "Edit Specialization" : "Add Specialization"}
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
            setEditingId(null);
          }}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="name"
              label="Specialization Name"
              rules={[{ required: true, message: 'Please enter specialization name' }]}
            >
              <Input placeholder="Enter specialization name" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <Input.TextArea rows={4} placeholder="Enter description" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                {editingId ? 'Update' : 'Add'}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default Specialization;