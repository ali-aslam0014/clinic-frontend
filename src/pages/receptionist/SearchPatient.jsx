import React, { useState } from 'react';
import {
  Card,
  Input,
  Button,
  Table,
  Space,
  Tag,
  Row,
  Col,
  Select,
  Modal,
  Descriptions,
  Badge,
  message
} from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  PhoneOutlined,
  IdcardOutlined,
  EditOutlined,
  HistoryOutlined,
  PrinterOutlined
} from '@ant-design/icons';
import { patientAPI } from '../../services/api';
import moment from 'moment'; 
import './SearchPatient.css';

const { Option } = Select;

const SearchPatient = () => {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [searchType, setSearchType] = useState('phone');

  // Search patients
  const handleSearch = async (value) => {
    if (!value) return;

    try {
      setLoading(true);
      const response = await patientAPI.searchPatients({
        type: searchType,
        value: value
      });
      setPatients(response.data);
      
      if (response.data.length === 0) {
        message.info('No patients found');
      }
    } catch (error) {
      message.error('Error searching patients: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // View patient details
  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    setDetailsVisible(true);
  };

  // Print patient card
  const handlePrintCard = async (patientId) => {
    try {
      await patientAPI.generatePatientCard(patientId);
      message.success('Patient card generated successfully');
    } catch (error) {
      message.error('Error generating patient card: ' + error.message);
    }
  };

  const columns = [
    {
      title: 'MR Number',
      dataIndex: 'mrNumber',
      key: 'mrNumber',
    },
    {
      title: 'Name',
      dataIndex: 'firstName',
      key: 'name',
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: 'Phone',
      dataIndex: 'contactNumber',
      key: 'phone',
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender) => (
        <Tag color={gender === 'Male' ? 'blue' : 'pink'}>
          {gender}
        </Tag>
      ),
    },
    {
      title: 'Age',
      key: 'age',
      render: (_, record) => moment().diff(moment(record.dateOfBirth), 'years'),
    },
    {
      title: 'Blood Group',
      dataIndex: 'bloodGroup',
      key: 'bloodGroup',
      render: (bloodGroup) => (
        <Tag color="red">{bloodGroup}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<UserOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            View
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => window.location.href = `/patient/edit/${record._id}`}
          >
            Edit
          </Button>
          <Button
            icon={<HistoryOutlined />}
            onClick={() => window.location.href = `/patient/history/${record._id}`}
          >
            History
          </Button>
          <Button
            icon={<PrinterOutlined />}
            onClick={() => handlePrintCard(record._id)}
          >
            Card
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="search-patient">
      <Card title="Search Patients">
        <Row gutter={16}>
          <Col xs={24} sm={6}>
            <Select
              value={searchType}
              onChange={setSearchType}
              style={{ width: '100%' }}
            >
              <Option value="phone">Phone Number</Option>
              <Option value="mrNumber">MR Number</Option>
              <Option value="name">Patient Name</Option>
              <Option value="cnic">CNIC</Option>
            </Select>
          </Col>
          <Col xs={24} sm={18}>
            <Input.Search
              placeholder={`Search by ${searchType}...`}
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              loading={loading}
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={patients}
          rowKey="_id"
          loading={loading}
          style={{ marginTop: 20 }}
          scroll={{ x: true }}
        />

        {/* Patient Details Modal */}
        <Modal
          title="Patient Details"
          visible={detailsVisible}
          onCancel={() => setDetailsVisible(false)}
          footer={null}
          width={800}
        >
          {selectedPatient && (
            <Descriptions bordered column={2}>
              <Descriptions.Item label="MR Number">
                {selectedPatient.mrNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Registration Date">
                {moment(selectedPatient.createdAt).format('DD-MM-YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Full Name">
                {`${selectedPatient.firstName} ${selectedPatient.lastName}`}
              </Descriptions.Item>
              <Descriptions.Item label="Gender">
                {selectedPatient.gender}
              </Descriptions.Item>
              <Descriptions.Item label="Date of Birth">
                {moment(selectedPatient.dateOfBirth).format('DD-MM-YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Age">
                {moment().diff(moment(selectedPatient.dateOfBirth), 'years')}
              </Descriptions.Item>
              <Descriptions.Item label="Blood Group">
                <Badge status="error" text={selectedPatient.bloodGroup} />
              </Descriptions.Item>
              <Descriptions.Item label="CNIC">
                {selectedPatient.cnic}
              </Descriptions.Item>
              <Descriptions.Item label="Contact" span={2}>
                {selectedPatient.contactNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Email" span={2}>
                {selectedPatient.email}
              </Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>
                {`${selectedPatient.address.street}, ${selectedPatient.address.city}, ${selectedPatient.address.state}, ${selectedPatient.address.country}`}
              </Descriptions.Item>
              <Descriptions.Item label="Emergency Contact" span={2}>
                {`${selectedPatient.emergencyContact.name} (${selectedPatient.emergencyContact.relationship}) - ${selectedPatient.emergencyContact.phone}`}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default SearchPatient;