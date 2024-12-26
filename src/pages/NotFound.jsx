import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Button 
            type="primary" 
            onClick={() => navigate('/')}
          >
            Back Home
          </Button>
        }
      />
    </div>
  );
};

export default NotFound;