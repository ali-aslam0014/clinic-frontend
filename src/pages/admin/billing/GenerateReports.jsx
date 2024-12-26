import React, { useState } from 'react';
import {
  Card,
  Form,
  Select,
  DatePicker,
  Button,
  Table,
  Space,
  Row,
  Col,
  Statistic,
  Divider,
  message,
  Spin
} from 'antd';
import {
  BarChartOutlined,
  DownloadOutlined,
  PrinterOutlined,
  PieChartOutlined,
  DollarCircleOutlined,
  FileExcelOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import { Bar, Pie } from '@ant-design/plots';
import AdminLayout from '../../../components/admin/Layout';
import './GenerateReports.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const GenerateReports = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState(null);

  const handleGenerateReport = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const { dateRange, type } = values;
      const params = {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        type
      };

      const response = await axios.get('/api/v1/admin/reports/generate', { ...config, params });
      setReportData(response.data.data);
      setReportType(type);
    } catch (error) {
      console.error('Report generation error:', error);
      message.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob'
      };

      const values = form.getFieldsValue();
      const params = {
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        type: values.type,
        format: 'excel'
      };

      const response = await axios.get('/api/v1/admin/reports/export', { ...config, params });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${moment().format('YYYY-MM-DD')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export error:', error);
      message.error('Failed to export report');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderRevenueChart = () => {
    if (!reportData?.revenueData) return null;

    const config = {
      data: reportData.revenueData,
      xField: 'date',
      yField: 'amount',
      color: '#1890ff',
      label: {
        position: 'middle',
        style: {
          fill: '#FFFFFF',
          opacity: 0.6,
        },
      },
      meta: {
        date: { alias: 'Date' },
        amount: { alias: 'Revenue' },
      },
    };

    return <Bar {...config} />;
  };

  const renderPaymentMethodChart = () => {
    if (!reportData?.paymentMethodData) return null;

    const config = {
      data: reportData.paymentMethodData,
      angleField: 'value',
      colorField: 'type',
      radius: 0.8,
      label: {
        type: 'outer',
        content: '{name} {percentage}',
      },
    };

    return <Pie {...config} />;
  };

  const columns = {
    revenue: [
      {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
        render: (date) => moment(date).format('DD/MM/YYYY')
      },
      {
        title: 'Total Revenue',
        dataIndex: 'amount',
        key: 'amount',
        render: (amount) => `$${amount.toFixed(2)}`
      },
      {
        title: 'Invoices',
        dataIndex: 'invoiceCount',
        key: 'invoiceCount'
      },
      {
        title: 'Average Invoice Value',
        dataIndex: 'averageValue',
        key: 'averageValue',
        render: (value) => `$${value.toFixed(2)}`
      }
    ],
    payments: [
      {
        title: 'Payment Method',
        dataIndex: 'method',
        key: 'method'
      },
      {
        title: 'Total Amount',
        dataIndex: 'amount',
        key: 'amount',
        render: (amount) => `$${amount.toFixed(2)}`
      },
      {
        title: 'Transaction Count',
        dataIndex: 'count',
        key: 'count'
      },
      {
        title: 'Percentage',
        dataIndex: 'percentage',
        key: 'percentage',
        render: (value) => `${value.toFixed(2)}%`
      }
    ]
  };

  return (
    <AdminLayout>
      <div className="generate-reports-container">
        <Card className="report-form-card">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleGenerateReport}
            initialValues={{
              dateRange: [moment().subtract(30, 'days'), moment()],
              type: 'revenue'
            }}
          >
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="dateRange"
                  label="Date Range"
                  rules={[{ required: true, message: 'Please select date range' }]}
                >
                  <RangePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="Report Type"
                  rules={[{ required: true, message: 'Please select report type' }]}
                >
                  <Select>
                    <Option value="revenue">Revenue Report</Option>
                    <Option value="payments">Payment Methods Report</Option>
                    <Option value="outstanding">Outstanding Payments Report</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row justify="end">
              <Space>
                <Button
                  type="primary"
                  icon={<BarChartOutlined />}
                  htmlType="submit"
                  loading={loading}
                >
                  Generate Report
                </Button>
                <Button
                  icon={<FileExcelOutlined />}
                  onClick={handleExportExcel}
                  disabled={!reportData}
                >
                  Export to Excel
                </Button>
                <Button
                  icon={<PrinterOutlined />}
                  onClick={handlePrint}
                  disabled={!reportData}
                >
                  Print Report
                </Button>
              </Space>
            </Row>
          </Form>
        </Card>

        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : reportData && (
          <>
            <Card className="statistics-card">
              <Row gutter={24}>
                <Col span={8}>
                  <Statistic
                    title="Total Revenue"
                    value={reportData.totalRevenue}
                    precision={2}
                    prefix={<DollarCircleOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Total Transactions"
                    value={reportData.totalTransactions}
                    prefix={<PieChartOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Average Transaction Value"
                    value={reportData.averageTransactionValue}
                    precision={2}
                    prefix={<DollarCircleOutlined />}
                  />
                </Col>
              </Row>
            </Card>

            <Card className="chart-card">
              {reportType === 'revenue' && (
                <>
                  <h3>Revenue Trend</h3>
                  {renderRevenueChart()}
                </>
              )}
              {reportType === 'payments' && (
                <>
                  <h3>Payment Methods Distribution</h3>
                  {renderPaymentMethodChart()}
                </>
              )}
            </Card>

            <Card className="table-card">
              <Table
                columns={columns[reportType] || columns.revenue}
                dataSource={reportData.tableData}
                rowKey="id"
                pagination={false}
              />
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default GenerateReports;