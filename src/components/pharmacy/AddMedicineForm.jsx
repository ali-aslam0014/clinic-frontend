import React, { useState } from 'react';
import {
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Upload,
  Button,
  Row,
  Col,
  message,
  Space,
  Divider
} from 'antd';
import {
  UploadOutlined,
  SaveOutlined,
  ClearOutlined,
  BarcodeOutlined,
  DollarOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import './AddMedicineForm.css';

const { Option } = Select;
const { TextArea } = Input;

const AddMedicineForm = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  // Categories for medicines
  const categories = [
    'Tablets',
    'Capsules',
    'Syrups',
    'Injections',
    'Ointments',
    'Drops',
    'Inhalers',
    'Others'
  ];

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Format dates
      const formattedValues = {
        ...values,
        manufacturingDate: values.manufacturingDate.format('YYYY-MM-DD'),
        expiryDate: values.expiryDate.format('YYYY-MM-DD'),
        image: imageUrl
      };

      await axios.post('/api/medicines', formattedValues);
      
      message.success('Medicine added successfully');
      form.resetFields();
      setImageUrl('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      message.error('Failed to add medicine');
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (info) => {
    if (info.file.status === 'done') {
      setImageUrl(info.file.response.url);
      message.success('Image uploaded successfully');
    } else if (info.file.status === 'error') {
      message.error('Failed to upload image');
    }
  };

  // Generate random barcode
  const generateBarcode = () => {
    const barcode = Math.floor(Math.random() * 9000000000) + 1000000000;
    form.setFieldsValue({ barcode: barcode.toString() });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      className="add-medicine-form"
    >
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="name"
            label="Medicine Name"
            rules={[{ required: true, message: 'Please enter medicine name' }]}
          >
            <Input prefix={<MedicineBoxOutlined />} placeholder="Enter medicine name" />
          </Form.Item>
        </Col>
        
        <Col xs={24} md={12}>
          <Form.Item
            name="genericName"
            label="Generic Name"
            rules={[{ required: true, message: 'Please enter generic name' }]}
          >
            <Input placeholder="Enter generic name" />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select placeholder="Select category">
              {categories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="manufacturer"
            label="Manufacturer"
            rules={[{ required: true, message: 'Please enter manufacturer' }]}
          >
            <Input placeholder="Enter manufacturer name" />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="barcode"
            label="Barcode"
            rules={[{ required: true, message: 'Please enter barcode' }]}
          >
            <Input
              prefix={<BarcodeOutlined />}
              placeholder="Enter barcode"
              addonAfter={
                <Button type="link" onClick={generateBarcode} size="small">
                  Generate
                </Button>
              }
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Please enter price' }]}
          >
            <InputNumber
              prefix={<DollarOutlined />}
              style={{ width: '100%' }}
              min={0}
              placeholder="Enter price"
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="stock"
            label="Initial Stock"
            rules={[{ required: true, message: 'Please enter initial stock' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="Enter initial stock"
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="minStockLevel"
            label="Minimum Stock Level"
            rules={[{ required: true, message: 'Please enter minimum stock level' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="Enter minimum stock level"
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="manufacturingDate"
            label="Manufacturing Date"
            rules={[{ required: true, message: 'Please select manufacturing date' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              disabledDate={date => date && date > moment()}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="expiryDate"
            label="Expiry Date"
            rules={[
              { required: true, message: 'Please select expiry date' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || !getFieldValue('manufacturingDate')) {
                    return Promise.resolve();
                  }
                  if (value.isBefore(getFieldValue('manufacturingDate'))) {
                    return Promise.reject('Expiry date must be after manufacturing date');
                  }
                  return Promise.resolve();
                }
              })
            ]}
          >
            <DatePicker
              style={{ width: '100%' }}
              disabledDate={date => date && date.isBefore(moment())}
            />
          </Form.Item>
        </Col>

        <Col xs={24}>
          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea
              rows={4}
              placeholder="Enter medicine description"
            />
          </Form.Item>
        </Col>

        <Col xs={24}>
          <Form.Item
            name="image"
            label="Medicine Image"
          >
            <Upload
              name="image"
              action="/api/upload"
              listType="picture-card"
              showUploadList={false}
              onChange={handleImageUpload}
            >
              {imageUrl ? (
                <img src={imageUrl} alt="medicine" style={{ width: '100%' }} />
              ) : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Col>
      </Row>

      <Divider />

      <Form.Item>
        <Space>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={loading}
          >
            Add Medicine
          </Button>
          <Button
            icon={<ClearOutlined />}
            onClick={() => {
              form.resetFields();
              setImageUrl('');
            }}
          >
            Reset
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default AddMedicineForm; 