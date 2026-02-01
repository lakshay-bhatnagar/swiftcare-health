import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pill } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const Splash: React.FC = () => {
  const navigate = useNavigate();
  const { hasSeenOnboarding, isAuthenticated } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigate('/', { replace: true });
      } else if (hasSeenOnboarding) {
        navigate('/auth', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate, hasSeenOnboarding, isAuthenticated]);

  return (
    <div className="min-h-screen gradient-primary flex flex-col items-center justify-center">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-24 h-24 bg-primary-foreground rounded-3xl flex items-center justify-center shadow-xl mb-6"
      >
        <Pill size={48} className="text-primary" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold text-primary-foreground mb-2"
      >
        SwiftCare
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-primary-foreground/80 text-sm"
      >
        Medicines in Minutes
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12"
      >
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.1,
              }}
              className="w-2 h-2 bg-primary-foreground rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Splash;
