import React from 'react';
import { Card, Descriptions, Table, Divider, Tag, Empty } from 'antd';
import moment from 'moment';
import './PrescriptionDetail.css';

const PrescriptionDetail = ({ prescription }) => {
  if (!prescription) {
    return <Empty description="No prescription data available" />;
  }

  const medicineColumns = [
    {
      title: 'Medicine',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Dosage',
      dataIndex: 'dosage',
      key: 'dosage',
    },
    {
      title: 'Frequency',
      dataIndex: 'frequency',
      key: 'frequency',
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Instructions',
      dataIndex: 'instructions',
      key: 'instructions',
      ellipsis: true,
    }
  ];

  const testColumns = [
    {
      title: 'Test Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Instructions',
      dataIndex: 'instructions',
      key: 'instructions',
      ellipsis: true,
    }
  ];

  return (
    <div className="prescription-detail">
      <Descriptions title="Prescription Information" bordered>
        <Descriptions.Item label="Doctor">
          Dr. {prescription.doctorId?.name || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Date">
          {prescription.createdAt ? moment(prescription.createdAt).format('MMMM DD, YYYY') : 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={prescription.active ? 'green' : 'red'}>
            {prescription.active ? 'Active' : 'Completed'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Diagnosis" span={3}>
          {prescription.diagnosis || 'No diagnosis provided'}
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">Prescribed Medicines</Divider>
      {prescription.medicines && prescription.medicines.length > 0 ? (
        <Table 
          columns={medicineColumns}
          dataSource={prescription.medicines}
          rowKey={(record, index) => `medicine-${index}`}
          pagination={false}
        />
      ) : (
        <Empty description="No medicines prescribed" />
      )}

      {prescription.tests && prescription.tests.length > 0 && (
        <>
          <Divider orientation="left">Recommended Tests</Divider>
          <Table 
            columns={testColumns}
            dataSource={prescription.tests}
            rowKey={(record, index) => `test-${index}`}
            pagination={false}
          />
        </>
      )}

      {prescription.instructions && (
        <>
          <Divider orientation="left">General Instructions</Divider>
          <Card className="instructions-card">
            {prescription.instructions}
          </Card>
        </>
      )}

      {prescription.nextVisitDate && (
        <Card className="next-visit-card">
          <strong>Next Visit:</strong> {moment(prescription.nextVisitDate).format('MMMM DD, YYYY')}
        </Card>
      )}
    </div>
  );
};

export default PrescriptionDetail;