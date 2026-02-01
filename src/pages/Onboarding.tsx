import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, Ambulance, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';

const slides = [
  {
    icon: Zap,
    title: 'Ultra-Fast Delivery',
    description: 'Get your medicines delivered in just 10-15 minutes from nearby trusted pharmacies.',
    gradient: 'from-primary to-primary/60',
    bg: 'bg-primary-light',
  },
  {
    icon: Ambulance,
    title: 'Emergency Support',
    description: 'One-tap access to emergency medical vehicles. We route you to the nearest hospital.',
    gradient: 'from-destructive to-destructive/60',
    bg: 'bg-destructive-light',
  },
  {
    icon: Stethoscope,
    title: 'Doctor Consultations',
    description: 'Book online consultations with verified doctors. Chat or video call anytime.',
    gradient: 'from-accent to-accent/60',
    bg: 'bg-accent-light',
  },
];

export const Onboarding: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const { completeOnboarding } = useApp();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      completeOnboarding();
      navigate('/auth');
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    navigate('/auth');
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col safe-top safe-bottom">
      {/* Skip Button */}
      <div className="p-4 flex justify-end">
        <button
          onClick={handleSkip}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center max-w-sm"
          >
            {/* Icon Container */}
            <div
              className={`w-32 h-32 rounded-3xl ${slide.bg} flex items-center justify-center mb-8`}
            >
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${slide.gradient} flex items-center justify-center shadow-lg`}>
                <Icon size={40} className="text-white" />
              </div>
            </div>

            {/* Text */}
            <h1 className="text-2xl font-bold mb-3">{slide.title}</h1>
            <p className="text-muted-foreground leading-relaxed">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress & Actions */}
      <div className="p-6 space-y-6">
        {/* Progress Dots */}
        <div className="flex justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-6 bg-primary'
                  : 'w-2 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        <Button
          onClick={handleNext}
          size="xl"
          className="w-full"
        >
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          <ArrowRight size={20} />
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
