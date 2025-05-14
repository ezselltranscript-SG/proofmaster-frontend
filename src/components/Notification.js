import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';

const slideIn = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-100%);
    opacity: 0;
  }
`;

const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1000;
  animation: ${props => props.isClosing 
    ? css`${slideOut} 0.3s ease forwards` 
    : css`${slideIn} 0.3s ease forwards`};
  
  background-color: ${props => {
    switch (props.type) {
      case 'success':
        return '#e6f7ee';
      case 'error':
        return '#ffebee';
      case 'warning':
        return '#fff8e1';
      default:
        return '#e3f2fd';
    }
  }};
  
  border-left: 5px solid ${props => {
    switch (props.type) {
      case 'success':
        return '#4caf50';
      case 'error':
        return '#f44336';
      case 'warning':
        return '#ff9800';
      default:
        return '#2196f3';
    }
  }};
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #666;
  font-size: 18px;
  cursor: pointer;
  margin-left: 10px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #333;
  }
`;

const Icon = styled.span`
  font-size: 20px;
`;

const Message = styled.p`
  margin: 0;
  color: #333;
  font-size: 14px;
`;

const Notification = ({ type = 'info', message, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300); // Match the animation duration
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  if (!isVisible) return null;

  return (
    <NotificationContainer type={type} isClosing={isClosing}>
      <Icon>{getIcon()}</Icon>
      <Message>{message}</Message>
      <CloseButton onClick={handleClose}>×</CloseButton>
    </NotificationContainer>
  );
};

export default Notification;
