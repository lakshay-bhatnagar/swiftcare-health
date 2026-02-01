import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, hasSeenOnboarding } = useApp();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    } else if (hasSeenOnboarding) {
      navigate('/auth', { replace: true });
    } else {
      navigate('/splash', { replace: true });
    }
  }, [navigate, isAuthenticated, hasSeenOnboarding]);

  return null;
};

export default Index;
