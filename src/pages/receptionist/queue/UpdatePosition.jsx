import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  message,
  Select,
  Row,
  Col,
  Badge,
  Modal,
  InputNumber,
  Tooltip
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  SwapOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import queueAPI from '../../../services/queueAPI';
import './UpdatePosition.css';

const { Option } = Select;
const { confirm } = Modal;

const UpdatePosition = () => {
  const [loading, setLoading] = useState(false);
  const [queueData, setQueueData] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [newPosition, setNewPosition] = useState(1);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      fetchQueueData();
    }
  }, [selectedDoctor]);

  const fetchDoctors = async () => {
    try {
      const response = await queueAPI.getDoctors();
      setDoctors(response.data);
    } catch (error) {
      message.error('Error fetching doctors: ' + error.message);
    }
  };

  const fetchQueueData = async () => {
    try {
      setLoading(true);
      const response = await queueAPI.getDoctorQueue(selectedDoctor);
      setQueueData(response.data);
    } catch (error) {
      message.error('Error fetching queue data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePosition = (record) => {
    setSelectedQueue(record);
    setNewPosition(record.tokenNumber);
    setUpdateModalVisible(true);
  };

  const handlePositionUpdate = async () => {
    try {
      setLoading(true);
      await queueAPI.updatePosition(selectedQueue._id, { newPosition });
      message.success('Queue position updated successfully');
      setUpdateModalVisible(false);
      fetchQueueData();
    } catch (error) {
      message.error('Error updating position: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const showMoveConfirm = (record, direction) => {
    const newPos = direction === 'up' ? record.tokenNumber - 1 : record.tokenNumber + 1;
    
    confirm({
      title: `Move patient ${direction}?`,
      icon: <ExclamationCircleOutlined />,
      content: `This will move ${record.patientId.firstName} ${record.patientId.lastName} to position ${newPos}`,
      onOk: async () => {
        try {
          setLoading(true);
          await queueAPI.updatePosition(record._id, { newPosition: newPos });
          message.success('Position updated successfully');
          fetchQueueData();
        } catch (error) {
          message.error('Error updating position: ' + error.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const columns = [
    {
      title: 'Position',
      dataIndex: 'tokenNumber',
      key: 'position',
      render: (token) => (
        <Badge count={token} style={{ backgroundColor: '#108ee9' }} />
      )
    },
    {
      title: 'Patient',
      dataIndex: 'patientId',
      key: 'patient',
      render: (patient) => (
        <Space direction="vertical" size="small">
          <span>{patient.firstName} {patient.lastName}</span>
          <small>{patient.contactNumber}</small>
        </Space>
      )
    },
    {
      title: 'Appointment Time',
      dataIndex: 'appointmentTime',
      key: 'time',
      render: (time) => moment(time, 'HH:mm').format('hh:mm A')
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const colors = {
          High: 'red',
          Medium: 'orange',
          Low: 'green'
        };
        return <Tag color={colors[priority]}>{priority}</Tag>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          waiting: 'orange',
          'in-consultation': 'blue',
          completed: 'green',
          cancelled: 'red'
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Move Up">
            <Button
              icon={<ArrowUpOutlined />}
              disabled={record.tokenNumber === 1 || record.status !== 'waiting'}
              onClick={() => showMoveConfirm(record, 'up')}
            />
          </Tooltip>
          <Tooltip title="Move Down">
            <Button
              icon={<ArrowDownOutlined />}
              disabled={record.tokenNumber === queueData.length || record.status !== 'waiting'}
              onClick={() => showMoveConfirm(record, 'down')}
            />
          </Tooltip>
          <Tooltip title="Change Position">
            <Button
              icon={<SwapOutlined />}
              onClick={() => handleUpdatePosition(record)}
              disabled={record.status !== 'waiting'}
            >
              Update
            </Button>
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="update-position">
      <Card title="Update Queue Position">
        <Row gutter={[16, 16]} className="filters">
          <Col xs={24} md={8}>
            <Select
              placeholder="Select Doctor"
              style={{ width: '100%' }}
              onChange={setSelectedDoctor}
              loading={loading}
            >
              {doctors.map(doctor => (
                <Option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.name} - {doctor.specialization}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={queueData}
          rowKey="_id"
          loading={loading}
          pagination={false}
          className="queue-table"
        />

        <Modal
          title="Update Queue Position"
          visible={updateModalVisible}
          onOk={handlePositionUpdate}
          onCancel={() => setUpdateModalVisible(false)}
          confirmLoading={loading}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              Current Position: {selectedQueue?.tokenNumber}
            </div>
            <div>
              New Position:
              <InputNumber
                min={1}
                max={queueData.length}
                value={newPosition}
                onChange={setNewPosition}
                style={{ marginLeft: 8 }}
              />
            </div>
          </Space>
        </Modal>
      </Card>
    </div>
  );
};

export default UpdatePosition;