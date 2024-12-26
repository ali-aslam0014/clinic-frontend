import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button, Space, Modal, message } from 'antd';
import { SaveOutlined, ClearOutlined } from '@ant-design/icons';
import './DigitalSignature.css';

const DigitalSignature = ({ onSave, width = 500, height = 200 }) => {
  const sigPad = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);

  const clear = () => {
    sigPad.current.clear();
  };

  const save = () => {
    if (sigPad.current.isEmpty()) {
      message.error('Please provide signature first');
      return;
    }

    // Get signature as base64 string
    const signatureData = sigPad.current.toDataURL();
    onSave(signatureData);
    setModalVisible(false);
    message.success('Signature saved successfully');
  };

  return (
    <>
      <Button type="primary" onClick={() => setModalVisible(true)}>
        Add Digital Signature
      </Button>

      <Modal
        title="Digital Signature"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="clear" icon={<ClearOutlined />} onClick={clear}>
            Clear
          </Button>,
          <Button key="save" type="primary" icon={<SaveOutlined />} onClick={save}>
            Save Signature
          </Button>
        ]}
        width={width + 48} // Add padding
      >
        <div className="signature-container">
          <SignatureCanvas
            ref={sigPad}
            canvasProps={{
              width,
              height,
              className: 'signature-canvas'
            }}
            backgroundColor="#f0f2f5"
          />
        </div>
      </Modal>
    </>
  );
};

export default DigitalSignature;