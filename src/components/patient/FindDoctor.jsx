import React, { useState, useEffect } from 'react';
import {
  Card,
  Input,
  Select,
  Button,
  List,
  Avatar,
  Tag,
  Rate,
  Space,
  Row,
  Col,
  Divider,
  message,
  Empty
} from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  FilterOutlined
} from '@ant-design/icons';
import axios from 'axios';
import './FindDoctor.css';

const { Option } = Select;
const { Search } = Input;

const FindDoctor = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [specializations, setSpecializations] = useState([]);
  const [filters, setFilters] = useState({
    specialization: '',
    experience: '',
    availability: '',
    gender: '',
    search: ''
  });

  useEffect(() => {
    fetchSpecializations();
    fetchDoctors();
  }, []);

  const fetchSpecializations = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/doctors/specializations', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSpecializations(response.data.data);
    } catch (error) {
      message.error('Failed to fetch specializations');
    }
  };

  const fetchDoctors = async (params = {}) => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/v1/doctors/search', {
        params: { ...filters, ...params },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setDoctors(response.data.data);
    } catch (error) {
      message.error('Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
    fetchDoctors({ search: value });
  };

  const handleFilterChange = (value, type) => {
    setFilters(prev => ({ ...prev, [type]: value }));
    fetchDoctors({ [type]: value });
  };

  const handleBookAppointment = (doctorId) => {
    // Navigate to appointment booking with selected doctor
    window.location.href = `/patient/book-appointment/${doctorId}`;
  };

  const renderDoctorInfo = (doctor) => (
    <List.Item
      key={doctor._id}
      actions={[
        <Button 
          type="primary" 
          onClick={() => handleBookAppointment(doctor._id)}
          icon={<CalendarOutlined />}
        >
          Book Appointment
        </Button>
      ]}
    >
      <List.Item.Meta
        avatar={
          <Avatar 
            size={100} 
            src={doctor.profileImage} 
            icon={<UserOutlined />}
          />
        }
        title={
          <Space direction="vertical" size={0}>
            <Space>
              <span className="doctor-name">Dr. {doctor.name}</span>
              {doctor.isAvailable && (
                <Tag color="success">Available</Tag>
              )}
            </Space>
            <Space>
              {doctor.specializations.map(spec => (
                <Tag color="blue" key={spec}>
                  {spec}
                </Tag>
              ))}
            </Space>
          </Space>
        }
        description={
          <Space direction="vertical">
            <span>
              <strong>Experience:</strong> {doctor.experience} years
            </span>
            <span>
              <strong>Consultation Fee:</strong> ₹{doctor.consultationFee}
            </span>
            <Rate 
              disabled 
              defaultValue={doctor.rating} 
              className="doctor-rating"
            />
            <div className="doctor-description">
              {doctor.description}
            </div>
          </Space>
        }
      />
    </List.Item>
  );

  return (
    <div className="find-doctor-container">
      <Card title="Find Doctor">
        <Row gutter={[16, 16]} className="search-filters">
          <Col xs={24} sm={24} md={8}>
            <Search
              placeholder="Search by name or specialization"
              onSearch={handleSearch}
              enterButton
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Select Specialization"
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange(value, 'specialization')}
              allowClear
            >
              {specializations.map(spec => (
                <Option key={spec} value={spec}>{spec}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder="Experience"
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange(value, 'experience')}
              allowClear
            >
              <Option value="0-5">0-5 years</Option>
              <Option value="5-10">5-10 years</Option>
              <Option value="10+">10+ years</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder="Gender"
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange(value, 'gender')}
              allowClear
            >
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
            </Select>
          </Col>
        </Row>

        <Divider />

        <List
          itemLayout="vertical"
          size="large"
          pagination={{
            onChange: page => {
              fetchDoctors({ page });
            },
            pageSize: 5
          }}
          dataSource={doctors}
          renderItem={renderDoctorInfo}
          loading={loading}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No doctors found"
              />
            )
          }}
        />
      </Card>
    </div>
  );
};

export default FindDoctor;