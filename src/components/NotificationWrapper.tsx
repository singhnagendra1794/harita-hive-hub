import React from 'react';
import { useMissingQueryNotifications } from '@/hooks/useMissingQueryNotifications';

interface NotificationWrapperProps {
  children: React.ReactNode;
}

const NotificationWrapper: React.FC<NotificationWrapperProps> = ({ children }) => {
  useMissingQueryNotifications();
  
  return <>{children}</>;
};

export default NotificationWrapper;