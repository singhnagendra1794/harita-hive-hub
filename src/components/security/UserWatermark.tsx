import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UserWatermarkProps {
  className?: string;
}

export const UserWatermark: React.FC<UserWatermarkProps> = ({ className = "" }) => {
  const { user } = useAuth();

  if (!user) return null;

  const currentTime = new Date().toLocaleTimeString();
  const userEmail = user.email || 'Unknown User';

  return (
    <div className={`absolute top-4 right-4 text-xs text-white/60 bg-black/20 px-2 py-1 rounded backdrop-blur-sm pointer-events-none select-none z-50 ${className}`}>
      <div>{userEmail}</div>
      <div>{currentTime}</div>
    </div>
  );
};