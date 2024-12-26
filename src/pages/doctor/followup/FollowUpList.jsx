import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Tooltip,
  Badge,
  Row,
  Col,
  Drawer
} from 'antd';
import {
  CalendarOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import DoctorLayout from '../../../components/doctor/Layout';
import './FollowUpList.css';

const { TextArea } = Input;
const { Option } = Select;

const FollowUpList = () => {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/followups/doctor', {
        params: {
          doctorId: localStorage.getItem('doctorId')
        }
      });
      setFollowUps(response.data.data);
    } catch (error) {
      message.error('Failed to fetch follow-ups');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (selectedFollowUp) {
        await axios.put(`/api/followups/${selectedFollowUp._id}`, values);
        message.success('Follow-up updated successfully');
      } else {
        await axios.post('/api/followups', {
          ...values,
          doctorId: localStorage.getItem('doctorId')
        });
        message.success('Follow-up created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setSelectedFollowUp(null);
      fetchFollowUps();
    } catch (error) {
      message.error('Failed to save follow-up');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/followups/${id}`);
      message.success('Follow-up deleted successfully');
      fetchFollowUps();
    } catch (error) {
      message.error('Failed to delete follow-up');
    }
  };

  const handleMarkCompleted = async (id) => {
    try {
      await axios.put(`/api/followups/${id}/status`, {
        status: 'completed'
      });
      message.success('Follow-up marked as completed');
      fetchFollowUps();
    } catch (error) {
      message.error('Failed to update follow-up status');
    }
  };

  const columns = [
    {
      title: 'Patient',
      dataIndex: ['patientId', 'name'],
      key: 'patientName',
      render: (name, record) => (
        <Space direction="vertical" size={0}>
          <span>{name}</span>
          <small style={{ color: '#8c8c8c' }}>{record.patientId.phone}</small>
        </Space>
      )
    },
    {
      title: 'Follow-up Date',
      dataIndex: 'followUpDate',
      key: 'followUpDate',
      render: (date) => (
        <Tag icon={<CalendarOutlined />} color="blue">
          {moment(date).format('DD MMM YYYY')}
        </Tag>
      ),
      sorter: (a, b) => moment(a.followUpDate).unix() - moment(b.followUpDate).unix()
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          pending: { color: 'warning', text: 'Pending' },
          completed: { color: 'success', text: 'Completed' },
          cancelled: { color: 'error', text: 'Cancelled' }
        };
        return <Tag color={statusConfig[status].color}>{statusConfig[status].text}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedFollowUp(record);
                setDrawerVisible(true);
              }}
            />
          </Tooltip>
          {record.status === 'pending' && (
            <>
              <Tooltip title="Edit">
                <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    setSelectedFollowUp(record);
                    form.setFieldsValue({
                      ...record,
                      followUpDate: moment(record.followUpDate)
                    });
                    setModalVisible(true);
                  }}
                />
              </Tooltip>
              <Tooltip title="Mark as Completed">
                <Button
                  icon={<CheckCircleOutlined />}
                  type="primary"
                  onClick={() => handleMarkCompleted(record._id)}
                />
              </Tooltip>
              <Tooltip title="Delete">
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(record._id)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <DoctorLayout>
      <div className="followup-list-container">
        <Card
          title="Follow-up Management"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedFollowUp(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              Add Follow-up
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={followUps}
            loading={loading}
            rowKey="_id"
          />
        </Card>

        <Modal
          title={`${selectedFollowUp ? 'Edit' : 'Add'} Follow-up`}
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
            setSelectedFollowUp(null);
          }}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="patientId"
              label="Patient"
              rules={[{ required: true }]}
            >
              <Select
                showSearch
                placeholder="Select patient"
                optionFilterProp="children"
              >
                {/* Add patient options here */}
              </Select>
            </Form.Item>

            <Form.Item
              name="followUpDate"
              label="Follow-up Date"
              rules={[{ required: true }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="reason"
              label="Reason"
              rules={[{ required: true }]}
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item
              name="notes"
              label="Additional Notes"
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                {selectedFollowUp ? 'Update' : 'Create'} Follow-up
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        <Drawer
          title="Follow-up Details"
          placement="right"
          width={600}
          onClose={() => {
            setDrawerVisible(false);
            setSelectedFollowUp(null);
          }}
          visible={drawerVisible}
        >
          {selectedFollowUp && (
            <div className="followup-details">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div className="detail-item">
                    <label>Patient Information</label>
                    <p>
                      <UserOutlined /> {selectedFollowUp.patientId.name}
                    </p>
                    <p>
                      <PhoneOutlined /> {selectedFollowUp.patientId.phone}
                    </p>
                    <p>
                      <MailOutlined /> {selectedFollowUp.patientId.email}
                    </p>
                  </div>
                </Col>

                <Col span={24}>
                  <div className="detail-item">
                    <label>Follow-up Date</label>
                    <p>
                      <CalendarOutlined /> {moment(selectedFollowUp.followUpDate).format('DD MMMM YYYY')}
                    </p>
                  </div>
                </Col>

                <Col span={24}>
                  <div className="detail-item">
                    <label>Reason</label>
                    <p>{selectedFollowUp.reason}</p>
                  </div>
                </Col>

                {selectedFollowUp.notes && (
                  <Col span={24}>
                    <div className="detail-item">
                      <label>Additional Notes</label>
                      <p>{selectedFollowUp.notes}</p>
                    </div>
                  </Col>
                )}

                <Col span={24}>
                  <div className="detail-item">
                    <label>Status</label>
                    <p>
                      <Tag color={selectedFollowUp.status === 'completed' ? 'success' : 'warning'}>
                        {selectedFollowUp.status.charAt(0).toUpperCase() + selectedFollowUp.status.slice(1)}
                      </Tag>
                    </p>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Drawer>
      </div>
    </DoctorLayout>
  );
};

export default FollowUpList;