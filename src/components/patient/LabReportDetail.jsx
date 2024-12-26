import React from 'react';
import { 
  Descriptions, 
  Table, 
  Card, 
  Tag, 
  Divider, 
  Typography,
  Empty 
} from 'antd';
import moment from 'moment';
import './LabReportDetail.css';

const { Title, Text } = Typography;

const LabReportDetail = ({ report }) => {
  if (!report) {
    return <Empty description="No report data available" />;
  }

  const getParameterTag = (flag) => {
    const flagColors = {
      'Normal': 'success',
      'High': 'warning',
      'Low': 'warning',
      'Critical': 'error'
    };
    return <Tag color={flagColors[flag]}>{flag}</Tag>;
  };

  const resultColumns = [
    {
      title: 'Parameter',
      dataIndex: 'parameter',
      key: 'parameter',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: 'Reference Range',
      dataIndex: 'referenceRange',
      key: 'referenceRange',
    },
    {
      title: 'Status',
      dataIndex: 'flag',
      key: 'flag',
      render: (flag) => getParameterTag(flag)
    }
  ];

  return (
    <div className="lab-report-detail">
      <Title level={4}>Test Information</Title>
      <Descriptions bordered>
        <Descriptions.Item label="Test Name">
          {report.testName}
        </Descriptions.Item>
        <Descriptions.Item label="Category">
          <Tag color="blue">{report.testCategory}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Test Date">
          {moment(report.testDate).format('MMMM DD, YYYY')}
        </Descriptions.Item>
        <Descriptions.Item label="Doctor">
          Dr. {report.doctorId?.name || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Lab Technician">
          {report.labTechnician}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={report.status === 'Completed' ? 'success' : 'warning'}>
            {report.status}
          </Tag>
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      <Title level={4}>Test Results</Title>
      <Table 
        columns={resultColumns}
        dataSource={report.results}
        rowKey="parameter"
        pagination={false}
      />

      {report.summary && (
        <>
          <Divider />
          <Card title="Summary">
            <Text>{report.summary}</Text>
          </Card>
        </>
      )}

      {report.interpretation && (
        <Card title="Doctor's Interpretation" className="interpretation-card">
          <Text>{report.interpretation}</Text>
        </Card>
      )}

      {report.notes && (
        <Card title="Additional Notes" className="notes-card">
          <Text>{report.notes}</Text>
        </Card>
      )}
    </div>
  );
};

export default LabReportDetail;