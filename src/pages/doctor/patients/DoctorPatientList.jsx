import React, { useState, useEffect } from 'react';
import {
  Table,
  Space,
  Button,
  Input,
  Card,
  Tag,
  Tooltip,
  Modal,
  message
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined
} from '@ant-design/icons';
import DoctorLayout from '../../../components/doctor/Layout';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DoctorPatientList.css';

const { Search } = Input;

const DoctorPatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const navigate = useNavigate();

  // Fetch patients
  const fetchPatients = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8080/api/v1/doctor/patients?page=${page}&search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log('Patients data:', response.data);
      
      if (response.data.success) {
        setPatients(response.data.data);
        setPagination({
          ...pagination,
          current: page,
          total: response.data.total || response.data.data.length
        });
      }
    } catch (error) {
      message.error('Failed to fetch patients');
      console.error('Fetch patients error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Handle search
  const handleSearch = (value) => {
    setSearchText(value);
    fetchPatients(1, value);
  };

  // Handle table change
  const handleTableChange = (pagination, filters, sorter) => {
    fetchPatients(pagination.current, searchText);
  };

  // Delete patient (if needed)
  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this patient?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:8080/api/v1/doctor/patients/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          message.success('Patient deleted successfully');
          fetchPatients(pagination.current, searchText);
        } catch (error) {
          message.error('Failed to delete patient');
          console.error('Delete patient error:', error);
        }
      }
    });
  };

  const columns = [
    {
      title: 'Patient ID',
      dataIndex: 'patientId',
      key: 'patientId',
      width: 120,
    },
    {
      title: 'Name',
      key: 'name',
      render: (text, record) => `${record.firstName} ${record.lastName}`,
      sorter: true,
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      width: 100,
    },
    {
      title: 'Contact',
      dataIndex: 'contactNumber',
      key: 'contactNumber',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (text, record) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <Button 
              type="primary" 
              icon={<EyeOutlined />}
              onClick={() => navigate(`/doctor/patient-details/${record._id}`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <DoctorLayout>
      <Card 
        title="Patient List" 
        extra={
          <Space>
            <Search
              placeholder="Search patients..."
              allowClear
              onSearch={handleSearch}
              style={{ width: 250 }}
            />
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={patients}
          rowKey="_id"
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>
    </DoctorLayout>
  );
};

export default DoctorPatientList;