import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  Button,
  Row,
  Col,
  Descriptions,
  Space,
  message,
  Spin
} from 'antd';
import {
  PrinterOutlined,
  IdcardOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';
import moment from 'moment';
import patientAPI from '../../services/patientAPI';
import './PrintPatientCard.css';

const PrintPatientCard = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const cardRef = useRef();

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const response = await patientAPI.getPatientDetails(id);
        setPatient(response.data);
      } catch (error) {
        message.error('Error fetching patient details: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Patient not found</h2>
      </div>
    );
  }

  return (
    <div className="print-patient-card">
      <Card
        title={
          <Space>
            <IdcardOutlined />
            Patient Card
          </Space>
        }
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              onClick={handlePrint}
            >
              Print Card
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => message.info('Download feature coming soon')}
            >
              Download PDF
            </Button>
          </Space>
        }
      >
        <div id="patientCard" ref={cardRef}>
          <div className="patient-card">
            <div className="card-header">
              <h1>Patient Card</h1>
            </div>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={18}>
                <Descriptions bordered size="small" column={2}>
                  <Descriptions.Item label="Patient ID" span={2}>
                    {patient?.mrNumber || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Name" span={2}>
                    {`${patient?.firstName || ''} ${patient?.lastName || ''}`}
                  </Descriptions.Item>
                  <Descriptions.Item label="Gender">
                    {patient?.gender || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Blood Group">
                    {patient?.bloodGroup || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Date of Birth">
                    {patient?.dateOfBirth ? moment(patient.dateOfBirth).format('DD-MM-YYYY') : 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Age">
                    {patient?.dateOfBirth ? moment().diff(patient.dateOfBirth, 'years') : 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Contact" span={2}>
                    {patient?.contactNumber || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Emergency Contact" span={2}>
                    {patient?.emergencyContact ? (
                      <>
                        {patient.emergencyContact.name} ({patient.emergencyContact.relationship})
                        <br />
                        {patient.emergencyContact.phone}
                      </>
                    ) : (
                      'N/A'
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col xs={24} sm={6} className="qr-code-section">
                <QRCodeSVG 
                  value={`${window.location.origin}/patients/${patient._id}`}
                  size={120}
                  level="H"
                />
                <small>Scan for digital record</small>
              </Col>
            </Row>

            <div className="card-footer">
              <p>Valid from: {moment(patient?.createdAt).format('DD-MM-YYYY')}</p>
              <p>This card must be presented during hospital visits</p>
              <p className="hospital-name">Your Hospital Name</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PrintPatientCard;