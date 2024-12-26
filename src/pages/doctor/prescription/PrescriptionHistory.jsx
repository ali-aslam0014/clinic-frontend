import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Space,
  Button,
  Tag,
  Input,
  DatePicker,
  Select,
  Row,
  Col,
  Drawer,
  Tooltip,
  Badge,
  Typography,
  Divider,
  Timeline,
  message,
  Spin
} from 'antd';
import {
  EyeOutlined,
  PrinterOutlined,
  HistoryOutlined,
  SearchOutlined,
  FilterOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import DoctorLayout from '../../../components/doctor/Layout';
import './PrescriptionHistory.css';
import { pharmacyService } from '../../../services/pharmacyIntegration';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

const PrescriptionHistory = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: null,
    status: '',
    search: '',
    patient: ''
  });
  const [patients, setPatients] = useState([]);
  const [versionHistory, setVersionHistory] = useState([]);
  const [historyDrawerVisible, setHistoryDrawerVisible] = useState(false);
  const [pharmacyStatus, setPharmacyStatus] = useState({});

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
  }, [filters]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const params = {
        ...(filters.dateRange && {
          startDate: filters.dateRange[0].format('YYYY-MM-DD'),
          endDate: filters.dateRange[1].format('YYYY-MM-DD')
        }),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        ...(filters.patient && { patientId: filters.patient })
      };

      const response = await axios.get('/api/prescriptions', { params });
      setPrescriptions(response.data.data);
    } catch (error) {
      message.error('Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/api/patients');
      setPatients(response.data.data);
    } catch (error) {
      message.error('Failed to fetch patients');
    }
  };

  const fetchVersionHistory = async (id) => {
    try {
      const response = await axios.get(`/api/prescriptions/${id}/history`);
      setVersionHistory(response.data.data);
      setHistoryDrawerVisible(true);
    } catch (error) {
      message.error('Failed to fetch version history');
    }
  };

  const handlePrint = async (id) => {
    try {
      const response = await axios.get(`/api/prescriptions/${id}/pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      message.error('Failed to generate PDF');
    }
  };

  const getPharmacyStatus = async (prescriptionId) => {
    try {
      const result = await pharmacyService.getOrderStatus(prescriptionId);
      setPharmacyStatus(prev => ({
        ...prev,
        [prescriptionId]: result.data
      }));
    } catch (error) {
      console.error('Failed to get pharmacy status:', error);
    }
  };

  const columns = [
    {
      title: 'Prescription ID',
      dataIndex: 'prescriptionId',
      key: 'prescriptionId',
      render: (text) => <Badge status="processing" text={text} />
    },
    {
      title: 'Patient',
      dataIndex: ['patient', 'name'],
      key: 'patientName',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary">{record.patient.phone}</Text>
        </Space>
      )
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('DD MMM YYYY')
    },
    {
      title: 'Diagnosis',
      dataIndex: ['diagnosis', 'condition'],
      key: 'diagnosis'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'Active' ? 'green' :
          status === 'Completed' ? 'blue' :
          'red'
        }>
          {status}
        </Tag>
      )
    },
    {
      title: 'Pharmacy Status',
      dataIndex: '_id',
      render: (prescriptionId) => {
        const status = pharmacyStatus[prescriptionId];
        if (!status) return 'Not sent to pharmacy';

        return (
          <Tag color={getStatusColor(status.status)}>
            {status.status.toUpperCase()}
          </Tag>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedPrescription(record);
                setDrawerVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Print">
            <Button
              icon={<PrinterOutlined />}
              onClick={() => handlePrint(record._id)}
            />
          </Tooltip>
          <Tooltip title="Version History">
            <Button
              icon={<HistoryOutlined />}
              onClick={() => fetchVersionHistory(record._id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending: 'gold',
      processing: 'blue',
      ready: 'cyan',
      completed: 'green',
      cancelled: 'red'
    };
    return colors[status] || 'default';
  };

  const renderFilters = () => {
    return (
      <Row gutter={[16, 16]} className="filter-row">
        <Col xs={24} sm={12} md={6}>
          <RangePicker
            style={{ width: '100%' }}
            onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            style={{ width: '100%' }}
            placeholder="Filter by status"
            allowClear
            onChange={(value) => setFilters({ ...filters, status: value })}
          >
            <Option value="Active">Active</Option>
            <Option value="Completed">Completed</Option>
            <Option value="Cancelled">Cancelled</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            style={{ width: '100%' }}
            placeholder="Select patient"
            allowClear
            showSearch
            optionFilterProp="children"
            onChange={(value) => setFilters({ ...filters, patient: value })}
          >
            {Array.isArray(patients) && patients.length > 0 ? (
              patients.map(patient => (
                <Option key={patient._id} value={patient._id}>
                  {patient.name}
                </Option>
              ))
            ) : (
              <Option disabled>No patients found</Option>
            )}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Input
            placeholder="Search prescriptions"
            prefix={<SearchOutlined />}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </Col>
      </Row>
    );
  };

  const renderPrescriptionTable = () => {
    return (
      <Table
        columns={columns}
        dataSource={prescriptions}
        loading={loading}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} prescriptions`
        }}
      />
    );
  };

  const renderVersionHistory = () => {
    return (
      <Drawer
        title="Version History"
        placement="right"
        width={600}
        onClose={() => {
          setHistoryDrawerVisible(false);
          setVersionHistory([]);
        }}
        visible={historyDrawerVisible}
      >
        <Timeline>
          {Array.isArray(versionHistory) && versionHistory.length > 0 ? (
            versionHistory.map((version, index) => (
              <Timeline.Item key={index}>
                <Text strong>
                  Version {version.version} - {moment(version.modifiedAt).format('DD MMM YYYY HH:mm')}
                </Text>
                <br />
                <Text type="secondary">Modified by: {version.modifiedBy?.name}</Text>
                <div className="version-changes">
                  {Object.entries(version.changes || {}).map(([field, change]) => (
                    <div key={field} className="change-item">
                      <Text type="secondary">{field}:</Text>
                      <br />
                      <Text delete className="old-value">{change.old}</Text>
                      <Text className="new-value">{change.new}</Text>
                    </div>
                  ))}
                </div>
              </Timeline.Item>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              No version history available
            </div>
          )}
        </Timeline>
      </Drawer>
    );
  };

  const renderPrescriptionDetails = () => {
    return (
      <Drawer
        title="Prescription Details"
        placement="right"
        width={720}
        onClose={() => {
          setDrawerVisible(false);
          setSelectedPrescription(null);
        }}
        visible={drawerVisible}
      >
        {selectedPrescription ? (
          <div className="prescription-details">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Title level={4}>Patient Information</Title>
                <Space direction="vertical">
                  <Text><UserOutlined /> {selectedPrescription.patient.name}</Text>
                  <Text><CalendarOutlined /> Age: {selectedPrescription.patient.age}</Text>
                </Space>
              </Col>

              <Divider />

              <Col span={24}>
                <Title level={4}>Diagnosis</Title>
                <Text>{selectedPrescription.diagnosis.condition}</Text>
                {selectedPrescription.diagnosis.notes && (
                  <Text type="secondary" className="diagnosis-notes">
                    Notes: {selectedPrescription.diagnosis.notes}
                  </Text>
                )}
              </Col>

              <Divider />

              <Col span={24}>
                <Title level={4}>Medications</Title>
                {selectedPrescription.medications.map((med, index) => (
                  <Card key={index} size="small" className="medication-card">
                    <Text strong>{med.name}</Text>
                    <br />
                    <Text>Dosage: {med.dosage}</Text>
                    <br />
                    <Text>Frequency: {med.frequency}</Text>
                    <br />
                    {med.instructions && <Text>Instructions: {med.instructions}</Text>}
                  </Card>
                ))}
              </Col>

              {selectedPrescription.tests && selectedPrescription.tests.length > 0 && (
                <>
                  <Divider />
                  <Col span={24}>
                    <Title level={4}>Tests</Title>
                    {selectedPrescription.tests.map((test, index) => (
                      <Card key={index} size="small" className="test-card">
                        <Text strong>{test.name}</Text>
                        {test.instructions && (
                          <Text type="secondary" className="test-instructions">
                            Instructions: {test.instructions}
                          </Text>
                        )}
                      </Card>
                    ))}
                  </Col>
                </>
              )}

              {selectedPrescription.followUp && selectedPrescription.followUp.required && (
                <>
                  <Divider />
                  <Col span={24}>
                    <Title level={4}>Follow Up</Title>
                    <Text>Date: {moment(selectedPrescription.followUp.date).format('DD MMM YYYY')}</Text>
                    {selectedPrescription.followUp.notes && (
                      <Text type="secondary" className="followup-notes">
                        Notes: {selectedPrescription.followUp.notes}
                      </Text>
                    )}
                  </Col>
                </>
              )}
            </Row>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
          </div>
        )}
      </Drawer>
    );
  };

  return (
    <DoctorLayout>
      <div className="prescription-history-container">
        <Card title="Prescription History">
          {renderFilters()}
          {renderPrescriptionTable()}
          {renderPrescriptionDetails()}
          {renderVersionHistory()}
        </Card>
      </div>
    </DoctorLayout>
  );
};

export default PrescriptionHistory;