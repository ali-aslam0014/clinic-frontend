import React, { useState } from 'react';
import { Row, Col, Card, Statistic, Table, Button, Space, Modal, message } from 'antd';
import {
  MedicineBoxOutlined,
  WarningOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
  AlertOutlined
} from '@ant-design/icons';
import PharmacyLayout from '../../components/pharmacy/Layout';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import AddMedicineForm from '../../components/pharmacy/AddMedicineForm';

const PharmacyDashboard = () => {
  const navigate = useNavigate();
  const [isNewMedicineModalVisible, setIsNewMedicineModalVisible] = useState(false);

  // Quick Action handlers
  const handleAddNewMedicine = () => {
    // Option 1: Open modal directly on dashboard
    setIsNewMedicineModalVisible(true);
    
    // Option 2: Navigate to medicine page with add mode
    // navigate('/pharmacy/medicines/add');
  };

  const handleNewSale = () => {
    navigate('/pharmacy/sales/new');
  };

  const handleCheckLowStock = () => {
    navigate('/pharmacy/inventory', {
      state: { filterByLowStock: true }
    });
  };

  // Quick Actions section in your existing dashboard
  const quickActions = [
    {
      title: 'Add New Medicine',
      icon: <MedicineBoxOutlined />,
      onClick: handleAddNewMedicine,
      color: '#1890ff'
    },
    {
      title: 'New Sale',
      icon: <ShoppingCartOutlined />,
      onClick: handleNewSale,
      color: '#52c41a'
    },
    {
      title: 'Check Low Stock',
      icon: <WarningOutlined />,
      onClick: handleCheckLowStock,
      color: '#faad14'
    }
  ];

  return (
    <PharmacyLayout>
      <div className="pharmacy-dashboard">
        {/* Statistics Cards */}
        <Row gutter={16}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Medicines"
                value={150}
                prefix={<MedicineBoxOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Low Stock Items"
                value={12}
                valueStyle={{ color: '#faad14' }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Today's Sales"
                value={2500}
                prefix={<DollarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Expiring Soon"
                value={8}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<AlertOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row gutter={[16, 16]} className="quick-actions">
          {quickActions.map((action, index) => (
            <Col xs={24} sm={8} key={index}>
              <Card
                hoverable
                className="quick-action-card"
                onClick={action.onClick}
              >
                <div className="quick-action-content" style={{ color: action.color }}>
                  {action.icon}
                  <h3>{action.title}</h3>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Add Medicine Modal */}
        <Modal
          title="Add New Medicine"
          open={isNewMedicineModalVisible}
          onCancel={() => setIsNewMedicineModalVisible(false)}
          footer={null}
          width={800}
        >
          <AddMedicineForm
            onSuccess={() => {
              setIsNewMedicineModalVisible(false);
              message.success('Medicine added successfully');
            }}
          />
        </Modal>

        {/* Recent Activities and Alerts will be added here */}
      </div>
    </PharmacyLayout>
  );
};

export default PharmacyDashboard;