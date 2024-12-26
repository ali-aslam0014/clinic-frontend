import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Button,
  Input,
  Typography,
  Avatar,
  Badge,
  Space,
  Divider,
  Modal,
  Form,
  Select,
  Alert,
  Spin,
  Tag,
  Tooltip,
  Empty
} from 'antd';
import {
  SendOutlined,
  UserOutlined,
  MessageOutlined,
  SearchOutlined,
  PlusOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import AdminLayout from '../../../components/admin/Layout';
import './InternalMessaging.css';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const InternalMessaging = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [newMessageModal, setNewMessageModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchConversations();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    console.log('Current conversations:', conversations);
    console.log('Current users:', users);
    console.log('Selected conversation:', selectedConversation);
    console.log('Current messages:', messages);
  }, [conversations, users, selectedConversation, messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      console.log('Fetching conversations...');
      
      const response = await axios.get('/api/v1/admin/communications/messages/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Conversations response:', response.data);
      
      if (response.data?.data) {
        setConversations(response.data.data);
      } else {
        setConversations([]);
      }
    } catch (err) {
      console.error('Fetch conversations error:', err);
      setError('Failed to load conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/v1/admin/communications/messages/${conversationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessages(response.data.data);
    } catch (err) {
      setError('Failed to load messages');
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('Fetching users...');
      
      const response = await axios.get('/api/v1/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Users response:', response.data);
      
      if (response.data?.data) {
        setUsers(response.data.data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error('Fetch users error:', err);
      setUsers([]);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const token = localStorage.getItem('token');
      await axios.post(`/api/v1/admin/communications/messages/${selectedConversation._id}`, {
        content: messageInput
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setMessageInput('');
      fetchMessages(selectedConversation._id);
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleNewConversation = async (values) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/v1/admin/communications/messages/conversations', values, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setNewMessageModal(false);
      form.resetFields();
      fetchConversations();
      setSelectedConversation(response.data.data);
    } catch (err) {
      setError('Failed to create conversation');
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.participants.some(p => 
      p.name.toLowerCase().includes(searchText.toLowerCase())
    )
  );

  return (
    <AdminLayout>
      <div className="internal-messaging-container">
        <Title level={2}>
          <MessageOutlined /> Internal Messaging
        </Title>

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <div className="messaging-layout">
          <Card className="conversations-list">
            <div className="conversations-header">
              <Input
                prefix={<SearchOutlined />}
                placeholder="Search conversations"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setNewMessageModal(true)}
                style={{ marginTop: '10px' }}
              >
                New Message
              </Button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin />
              </div>
            ) : conversations.length === 0 ? (
              <Empty
                description="No conversations found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <List
                dataSource={filteredConversations}
                renderItem={item => (
                  <List.Item
                    className={`conversation-item ${selectedConversation?._id === item._id ? 'selected' : ''}`}
                    onClick={() => setSelectedConversation(item)}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge count={item.unreadCount || 0}>
                          <Avatar icon={<TeamOutlined />} />
                        </Badge>
                      }
                      title={item.participants.map(p => p.name).join(', ')}
                      description={
                        <Text type="secondary">
                          {item.lastMessage?.content?.substring(0, 30)}
                          {item.lastMessage?.content?.length > 30 ? '...' : ''}
                        </Text>
                      }
                    />
                    <Text type="secondary">
                      {moment(item.updatedAt).fromNow()}
                    </Text>
                  </List.Item>
                )}
              />
            )}
          </Card>

          <Card className="messages-container">
            {selectedConversation ? (
              <>
                <div className="messages-header">
                  <Space>
                    <Avatar.Group>
                      {selectedConversation.participants.map(p => (
                        <Tooltip title={p.name} key={p._id}>
                          <Avatar icon={<UserOutlined />} />
                        </Tooltip>
                      ))}
                    </Avatar.Group>
                    <Text strong>
                      {selectedConversation.participants.map(p => p.name).join(', ')}
                    </Text>
                  </Space>
                </div>

                <Divider />

                <div className="messages-list">
                  {messages.map(message => (
                    <div
                      key={message._id}
                      className={`message-item ${message.sender._id === localStorage.getItem('userId') ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">
                        <Text>{message.content}</Text>
                        <div className="message-meta">
                          <Text type="secondary" className="message-time">
                            {moment(message.createdAt).format('HH:mm')}
                          </Text>
                          {message.read && (
                            <CheckCircleOutlined className="read-indicator" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="message-input">
                  <Input.TextArea
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    onPressEnter={e => {
                      if (!e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    loading={sending}
                  />
                </div>
              </>
            ) : (
              <div className="no-conversation">
                <MessageOutlined style={{ fontSize: 48 }} />
                <Text>Select a conversation or start a new one</Text>
              </div>
            )}
          </Card>
        </div>

        <Modal
          title="New Message"
          open={newMessageModal}
          onCancel={() => {
            setNewMessageModal(false);
            form.resetFields();
          }}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleNewConversation}
          >
            <Form.Item
              name="participants"
              label="Recipients"
              rules={[{ required: true, message: 'Please select recipients' }]}
            >
              <Select
                mode="multiple"
                placeholder="Select users"
                optionFilterProp="children"
              >
                {users.map(user => (
                  <Option key={user._id} value={user._id}>
                    {user.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="message"
              label="Message"
              rules={[{ required: true, message: 'Please enter a message' }]}
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Send
                </Button>
                <Button onClick={() => {
                  setNewMessageModal(false);
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

export default InternalMessaging;