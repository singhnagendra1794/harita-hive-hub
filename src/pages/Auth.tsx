
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { MultiAuthForm } from '../components/auth/MultiAuthForm';
import { useAuth } from '@/contexts/AuthContext';


const Auth = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
  };

  return (
    <div className="container max-w-md py-12 mx-auto">
      <MultiAuthForm mode={mode} onToggleMode={toggleMode} />
    </div>
  );
};

export default Auth;
