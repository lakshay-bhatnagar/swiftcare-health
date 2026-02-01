import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { api } from '@/services/api';
import { toast } from 'sonner';

type AuthStep = 'email' | 'otp' | 'profile';

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useApp();
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first OTP input when entering OTP step
  useEffect(() => {
    if (step === 'otp') {
      otpRefs.current[0]?.focus();
    }
  }, [step]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }

    setIsLoading(true);
    try {
      await api.sendOTP(email);
      toast.success('OTP sent to your email!');
      setStep('otp');
    } catch (error) {
      toast.error('Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (i + index < 6) newOtp[i + index] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      otpRefs.current[nextIndex]?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = value.replace(/\D/g, '');
      setOtp(newOtp);

      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    setIsLoading(true);
    try {
      const result = await api.verifyOTP(email, otpString);
      if (result.isNewUser) {
        setStep('profile');
      } else {
        // Returning user - mock login
        login({
          id: 'user-1',
          email,
          name: 'User',
          phone: '',
          address: { line1: '', city: '', state: '', pincode: '' },
        });
        navigate('/');
      }
    } catch (error) {
      toast.error('Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    login({
      id: 'user-' + Date.now(),
      email,
      name,
      phone,
      address: { line1: '', city: '', state: '', pincode: '' },
    });
    toast.success('Welcome to SwiftCare!');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col safe-top safe-bottom">
      {/* Header */}
      <div className="p-4 flex items-center gap-4">
        {step !== 'email' && (
          <button
            onClick={() => setStep(step === 'otp' ? 'email' : 'otp')}
            className="p-2 -ml-2 hover:bg-muted rounded-xl transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
        )}
        <h1 className="text-lg font-semibold">
          {step === 'email' && 'Sign In'}
          {step === 'otp' && 'Verify Email'}
          {step === 'profile' && 'Complete Profile'}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-4">
        <AnimatePresence mode="wait">
          {step === 'email' && (
            <motion.form
              key="email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSendOTP}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Welcome to SwiftCare</h2>
                <p className="text-muted-foreground">
                  Enter your email to receive a verification code
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="swift-input pl-11"
                    autoFocus
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="xl"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  'Send OTP'
                )}
              </Button>
            </motion.form>
          )}

          {step === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Enter OTP</h2>
                <p className="text-muted-foreground">
                  We sent a 6-digit code to{' '}
                  <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>

              {/* OTP Inputs */}
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleOTPKeyDown(index, e)}
                    className="w-12 h-14 text-center text-xl font-bold swift-input"
                  />
                ))}
              </div>

              <Button
                onClick={handleVerifyOTP}
                size="xl"
                className="w-full"
                disabled={isLoading || otp.join('').length !== 6}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Verify OTP
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Didn't receive code?{' '}
                <button
                  onClick={() => api.sendOTP(email)}
                  className="text-primary font-medium hover:underline"
                >
                  Resend
                </button>
              </p>
            </motion.div>
          )}

          {step === 'profile' && (
            <motion.form
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleCompleteProfile}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Almost There!</h2>
                <p className="text-muted-foreground">
                  Complete your profile to start ordering
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="swift-input"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="swift-input"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="xl"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  'Complete Setup'
                )}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Auth;
